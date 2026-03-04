import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createWishSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().max(500).optional(),
  category: z.string().min(2).max(60),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const [wishes, points] = await Promise.all([
      prisma.wish.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.kikiPoints.findUnique({
        where: { userId: session.user.id },
        select: { weeklyPoints: true, monthlyObjective: true },
      }),
    ]);

    const objective = points?.monthlyObjective ?? 300;
    const current = points?.weeklyPoints ?? 0;
    const canCreateWish = current >= objective;

    return Response.json({
      wishes,
      canCreateWish,
      weeklyPoints: current,
      weeklyObjective: objective,
      remainingToUnlock: Math.max(objective - current, 0),
    });
  } catch (error) {
    console.error('Wishes fetch error:', error);
    return Response.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const points = await prisma.kikiPoints.findUnique({
      where: { userId: session.user.id },
      select: { weeklyPoints: true, monthlyObjective: true },
    });

    const objective = points?.monthlyObjective ?? 300;
    const current = points?.weeklyPoints ?? 0;
    if (current < objective) {
      return Response.json(
        {
          message: "Objectif hebdomadaire non atteint. Les souhaits se débloquent après l'objectif.",
          weeklyPoints: current,
          weeklyObjective: objective,
          remainingToUnlock: objective - current,
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const data = createWishSchema.parse(body);

    const wish = await prisma.wish.create({
      data: {
        userId: session.user.id,
        title: data.title,
        description: data.description,
        category: data.category,
      },
    });

    return Response.json(wish, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ message: 'Données invalides', errors: error.errors }, { status: 400 });
    }

    console.error('Wish create error:', error);
    return Response.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}

