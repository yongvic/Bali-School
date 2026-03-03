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

    const module = await prisma.module.findUnique({
      where: { id: params.id },
      include: {
        learningPlan: {
          select: { userId: true },
        },
        exercises: {
          select: {
            id: true,
            mode: true,
            title: true,
            description: true,
            pointsValue: true,
            completed: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!module) {
      return Response.json(
        { message: 'Module not found' },
        { status: 404 }
      );
    }

    // Check if user owns this module
    if (module.learningPlan.userId !== session.user.id) {
      return Response.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { learningPlan, ...moduleData } = module;

    return Response.json(moduleData);
  } catch (error) {
    console.error('Module fetch error:', error);
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
