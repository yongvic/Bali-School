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

    // Calculate consecutive days
    // For now, return a placeholder
    const consecutiveDays = Math.floor(kikiPoints.totalPoints / 300) || 0;

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
      ],
      unlockedBadges: badges.map(b => b.badgeType),
      consecutiveDays: Math.max(consecutiveDays, 1),
      milestones: {
        exercisesCompleted: exercises.filter(e => e.completed).length,
        videosSubmitted: videos.length,
        feedbackReceived: feedback.length,
      },
    });
  } catch (error) {
    console.error('Gamification error:', error);
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
