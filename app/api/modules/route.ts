import { auth } from '@/auth';
import { levelByWeek } from '@/lib/learning-content';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return Response.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const modules = await prisma.module.findMany({
      where: {
        learningPlan: {
          userId: session.user.id,
        },
      },
      orderBy: { week: 'asc' },
      select: {
        id: true,
        week: true,
        title: true,
        targetPoints: true,
      },
    });

    return Response.json(
      modules.map((module) => ({
        ...module,
        cefrLevel: levelByWeek(module.week),
      }))
    );
  } catch (error) {
    console.error('Modules fetch error:', error);
    return Response.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

