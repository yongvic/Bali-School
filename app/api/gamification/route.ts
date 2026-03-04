import { auth } from '@/auth';
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

    // Get or create Kiki Points record
    let kikiPoints = await prisma.kikiPoints.findUnique({
      where: { userId: session.user.id },
    });

    if (!kikiPoints) {
      kikiPoints = await prisma.kikiPoints.create({
        data: {
          userId: session.user.id,
          totalPoints: 0,
          weeklyPoints: 0,
        },
      });
    }

    // Get badges
    const badges = await prisma.badge.findMany({
      where: { userId: session.user.id },
      select: { badgeType: true },
    });

    // Get milestones
    const exercises = await prisma.exercise.findMany({
      where: { userId: session.user.id },
      select: { completed: true },
    });

    const videos = await prisma.video.findMany({
      where: { userId: session.user.id },
      select: { id: true },
    });

    const feedback = await prisma.adminFeedback.findMany({
      where: { video: { userId: session.user.id } },
      select: { id: true },
    });

    const history = await prisma.pointsHistory.findMany({
      where: { kikiPointsId: kikiPoints.id },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
      take: 200,
    });

    const dayKeys = Array.from(
      new Set(
        history.map((h) => {
          const d = new Date(h.createdAt);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        })
      )
    ).sort((a, b) => b - a);

    let consecutiveDays = 0;
    if (dayKeys.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Streak can start today or yesterday.
      let cursor =
        dayKeys[0] === today.getTime()
          ? today
          : dayKeys[0] === yesterday.getTime()
          ? yesterday
          : null;

      if (cursor) {
        for (const day of dayKeys) {
          if (day === cursor.getTime()) {
            consecutiveDays += 1;
            cursor = new Date(cursor);
            cursor.setDate(cursor.getDate() - 1);
          } else if (day < cursor.getTime()) {
            break;
          }
        }
      }
    }

    return Response.json({
      totalPoints: kikiPoints.totalPoints,
      weeklyPoints: kikiPoints.weeklyPoints,
      weeklyGoal: 300,
      badges: [
        'FIRST_EXERCISE',
        'PRONUNCIATION_STAR',
        'CABIN_MASTER',
        'SAFETY_GURU',
        'CONSISTENCY_KING',
        'GRAMMAR_CHAMPION',
        'LISTENING_LEGEND',
        'WHEEL_WINNER',
        'LEVEL_A1',
        'LEVEL_A2',
        'LEVEL_B1',
        'LEVEL_B2',
        'LEVEL_C1',
      ],
      unlockedBadges: badges.map(b => b.badgeType),
      consecutiveDays,
      milestones: {
        exercisesCompleted: exercises.filter(e => e.completed).length,
        videosSubmitted: videos.length,
        feedbackReceived: feedback.length,
      },
    });
  } catch (error) {
    console.error('Gamification error:', error);
    return Response.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

