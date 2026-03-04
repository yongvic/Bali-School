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

    const [kikiPoints, exercises, videos, plan] = await Promise.all([
      prisma.kikiPoints.findUnique({
        where: { userId: session.user.id },
      }),
      prisma.exercise.count({
        where: { userId: session.user.id, completed: true },
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
    let currentCefr = 'A1';
    if (plan) {
      const totalExercises = plan.modules.reduce((acc, m) => acc + m.exercises.length, 0);
      completionPercentage = totalExercises > 0 ? (exercises / totalExercises) * 100 : 0;
      const validatedModuleWeeks = plan.modules
        .filter((m) => m.exercises.length > 0 && m.exercises.every((exercise) => exercise.completed))
        .map((m) => m.week);
      const furthestWeek = validatedModuleWeeks.length ? Math.max(...validatedModuleWeeks) : 1;
      currentCefr = levelByWeek(furthestWeek);
    }

    const currentLevel = Math.floor((kikiPoints?.totalPoints || 0) / 1000) + 1;
    const weeklyObjective = kikiPoints?.monthlyObjective || 300;
    const weeklyPoints = kikiPoints?.weeklyPoints || 0;

    return Response.json({
      totalPoints: kikiPoints?.totalPoints || 0,
      weeklyPoints,
      monthlyPoints: kikiPoints?.monthlyPoints || 0,
      exercisesCompleted: exercises,
      videosSubmitted: videos,
      currentLevel,
      currentCefr,
      weeklyObjective,
      weeklyObjectiveReached: weeklyPoints >= weeklyObjective,
      completionPercentage: Math.round(completionPercentage),
    });
  } catch (error) {
    console.error('User progress error:', error);
    return Response.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

