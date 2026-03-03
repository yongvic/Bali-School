import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { exerciseId, points } = await request.json();

    if (!exerciseId || !points) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update exercise as completed
    const exercise = await prisma.exercise.update({
      where: {
        id: exerciseId,
        userId: session.user.id,
      },
      data: {
        completed: true,
        completedAt: new Date(),
      },
    });

    // Award Kiki Points
    const kikiPoints = await prisma.kikiPoints.update({
      where: { userId: session.user.id },
      data: {
        totalPoints: {
          increment: points,
        },
        weeklyPoints: {
          increment: points,
        },
        lastEarned: new Date(),
      },
    });

    // Log points history
    await prisma.pointsHistory.create({
      data: {
        kikiPointsId: kikiPoints.id,
        points,
        reason: 'exercise_complete',
      },
    });

    // Check for badge unlocks
    const badges = await checkBadgeConditions(session.user.id);

    return NextResponse.json({
      success: true,
      pointsAwarded: points,
      totalPoints: kikiPoints.totalPoints,
      newBadges: badges,
    });
  } catch (error) {
    console.error('Exercise completion error:', error);
    return NextResponse.json(
      { error: 'Failed to complete exercise' },
      { status: 500 }
    );
  }
}

async function checkBadgeConditions(userId: string) {
  const newBadges: string[] = [];
  const completedExercises = await prisma.exercise.count({
    where: { userId, completed: true },
  });

  // Check FIRST_EXERCISE
  if (completedExercises === 1) {
    await prisma.badge.upsert({
      where: { userId_badgeType: { userId, badgeType: 'FIRST_EXERCISE' } },
      create: { userId, badgeType: 'FIRST_EXERCISE' },
      update: {},
    });
    newBadges.push('FIRST_EXERCISE');
  }

  // Check other badges
  if (completedExercises >= 5) {
    const existing = await prisma.badge.findUnique({
      where: { userId_badgeType: { userId, badgeType: 'PRONUNCIATION_STAR' } },
    });
    if (!existing) {
      await prisma.badge.create({
        data: { userId, badgeType: 'PRONUNCIATION_STAR' },
      });
      newBadges.push('PRONUNCIATION_STAR');
    }
  }

  return newBadges;
}
