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

    const plan = await prisma.learningPlan.findUnique({
      where: { userId: session.user.id },
      include: {
        modules: {
          orderBy: { week: 'asc' },
        },
      },
    });

    if (!plan) {
      return Response.json(
        { message: 'No learning plan found' },
        { status: 404 }
      );
    }

    return Response.json(plan);
  } catch (error) {
    console.error('Learning plan error:', error);
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
