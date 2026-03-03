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

    const kikiPoints = await prisma.kikiPoints.findUnique({
      where: { userId: session.user.id },
      select: {
        totalPoints: true,
        weeklyPoints: true,
        monthlyPoints: true,
      },
    });

    // Count completed exercises (for now, we'll count all exercises submitted)
    const completedExercises = await prisma.exercise.count({
      where: {
        userId: session.user.id,
      },
    });

    return Response.json({
      totalPoints: kikiPoints?.totalPoints || 0,
      weeklyPoints: kikiPoints?.weeklyPoints || 0,
      monthlyPoints: kikiPoints?.monthlyPoints || 0,
      completedExercises,
    });
  } catch (error) {
    console.error('User stats fetch error:', error);
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
