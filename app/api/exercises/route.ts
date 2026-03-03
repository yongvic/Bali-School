import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return Response.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const exercises = await prisma.exercise.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        mode: true,
        description: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return Response.json(exercises);
  } catch (error) {
    console.error('Exercises fetch error:', error);
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
