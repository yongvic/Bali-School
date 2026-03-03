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

    const [kikiPoints, exercises, videos, plan] = await Promise.all([
      prisma.kikiPoints.findUnique({
        where: { userId: session.user.id },
      }),
      prisma.exercise.count({
        where: { userId: session.user.id },
      }),
      prisma.video.count({
        where: { userId: session.user.id },
      }),
      prisma.learningPlan.findUnique({
        where: { userId: session.user.id },
        include: {
          modules: {
            include: {
              exercises: true,
            },
          },
        },
      }),
    ]);

    let completionPercentage = 0;
    if (plan) {
      const totalExercises = plan.modules.reduce((acc, m) => acc + m.exercises.length, 0);
      completionPercentage = totalExercises > 0 ? (exercises / totalExercises) * 100 : 0;
    }

    const currentLevel = Math.floor((kikiPoints?.totalPoints || 0) / 1000) + 1;

    return Response.json({
      totalPoints: kikiPoints?.totalPoints || 0,
      weeklyPoints: kikiPoints?.weeklyPoints || 0,
      monthlyPoints: kikiPoints?.monthlyPoints || 0,
      exercisesCompleted: exercises,
      videosSubmitted: videos,
      currentLevel,
      completionPercentage: Math.round(completionPercentage),
    });
  } catch (error) {
    console.error('User progress error:', error);
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
