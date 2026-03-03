import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [kikiPoints, badges, completedExercises] = await Promise.all([
      prisma.kikiPoints.findUnique({
        where: { userId: session.user.id },
      }),
      prisma.badge.findMany({
        where: { userId: session.user.id },
        select: { badgeType: true },
      }),
      prisma.exercise.count({
        where: { userId: session.user.id, completed: true },
      }),
    ]);

    return NextResponse.json({
      totalPoints: kikiPoints?.totalPoints || 0,
      weeklyPoints: kikiPoints?.weeklyPoints || 0,
      unlockedBadges: badges.map(b => b.badgeType),
      exercisesCompleted: completedExercises,
      nextBadgeProgress: calculateProgress(completedExercises),
    });
  } catch (error) {
    console.error('Gamification badges error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch badges' },
      { status: 500 }
    );
  }
}

function calculateProgress(exercisesCompleted: number): number {
  // Progress toward next badge
  if (exercisesCompleted < 1) return 0;
  if (exercisesCompleted < 5) return (exercisesCompleted / 5) * 100;
  if (exercisesCompleted < 10) return ((exercisesCompleted - 5) / 5) * 100;
  return 100;
}
