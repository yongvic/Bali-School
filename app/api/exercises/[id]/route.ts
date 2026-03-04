import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const { id: exerciseId } = await params;
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
      select: {
        id: true,
        mode: true,
        exerciseType: true,
        skill: true,
        phase: true,
        title: true,
        description: true,
        content: true,
        pointsValue: true,
        completed: true,
        achievedScore: true,
      },
    });

    if (!exercise) {
      return Response.json({ message: 'Exercice introuvable' }, { status: 404 });
    }

    const ownership = await prisma.exercise.findFirst({
      where: {
        id: exerciseId,
        userId: session.user.id,
      },
    });

    if (!ownership) {
      return Response.json({ message: 'Non autorisé' }, { status: 403 });
    }

    return Response.json(exercise);
  } catch (error) {
    console.error('Exercise fetch error:', error);
    return Response.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

