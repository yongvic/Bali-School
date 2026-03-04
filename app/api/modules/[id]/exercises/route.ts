import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return Response.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const exercises = await prisma.exercise.findMany({
      where: {
        moduleId: id,
        userId: session.user.id,
      },
      select: {
        id: true,
        mode: true,
        exerciseType: true,
        skill: true,
        phase: true,
        title: true,
        description: true,
        pointsValue: true,
        content: true,
      },
    });

    return Response.json(exercises);
  } catch (error) {
    console.error('Exercises fetch error:', error);
    return Response.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

