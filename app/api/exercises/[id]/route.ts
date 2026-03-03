import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return Response.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const exercise = await prisma.exercise.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        mode: true,
        title: true,
        description: true,
        content: true,
        pointsValue: true,
        completed: true,
      },
    });

    if (!exercise) {
      return Response.json(
        { message: 'Exercise not found' },
        { status: 404 }
      );
    }

    // Check if user owns this exercise
    const ownership = await prisma.exercise.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!ownership) {
      return Response.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }

    return Response.json(exercise);
  } catch (error) {
    console.error('Exercise fetch error:', error);
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
