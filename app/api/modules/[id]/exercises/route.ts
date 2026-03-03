import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
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
        moduleId: params.id,
        userId: session.user.id,
      },
      select: {
        id: true,
        mode: true,
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
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
