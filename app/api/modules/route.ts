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

    const modules = await prisma.module.findMany({
      where: {
        plan: {
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

    return Response.json(modules);
  } catch (error) {
    console.error('Modules fetch error:', error);
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
