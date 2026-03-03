import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [kikiPoints, badges, exercises, learningPlan] = await Promise.all([
      prisma.kikiPoints.findUnique({
        where: { userId: session.user.id },
      }),
      prisma.badge.findMany({
        where: { userId: session.user.id },
        select: { badgeType: true },
      }),
      prisma.exercise.findMany({
        where: { userId: session.user.id, completed: true },
      }),
      prisma.learningPlan.findUnique({
        where: { userId: session.user.id },
        select: { weeklyFocus: true },
      }),
    ]);

    const airportMap = await prisma.airportMap.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      totalPoints: kikiPoints?.totalPoints || 0,
      weeklyPoints: kikiPoints?.weeklyPoints || 0,
      exercisesCompleted: exercises.length,
      badgesUnlocked: badges.length,
      badges: badges.map(b => b.badgeType),
      weeklyFocus: learningPlan?.weeklyFocus?.[0] || 'English Foundations',
      progressPercentage: airportMap?.progressPercentage || 0,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
