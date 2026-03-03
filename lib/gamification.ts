import { prisma } from '@/lib/prisma';

/**
 * Award Kiki Points to a user
 */
export async function awardPoints(
  userId: string,
  points: number,
  reason: string
): Promise<void> {
  const kikiPoints = await prisma.kikiPoints.upsert({
    where: { userId },
    create: {
      userId,
      totalPoints: points,
      weeklyPoints: points,
      weekStartDate: new Date(),
    },
    update: {
      totalPoints: { increment: points },
      weeklyPoints: { increment: points },
      lastEarned: new Date(),
    },
  });

  console.log(`[Gamification] Awarded ${points} points to ${userId} (${reason})`);
}

/**
 * Reset weekly points if the week has changed
 */
export async function resetWeeklyPointsIfNeeded(userId: string): Promise<void> {
  const kikiPoints = await prisma.kikiPoints.findUnique({
    where: { userId },
  });

  if (!kikiPoints) return;

  const now = new Date();
  const lastEarnedDate = kikiPoints.weekStartDate || kikiPoints.lastEarned || new Date();
  
  // Check if a week has passed
  const daysSince = Math.floor(
    (now.getTime() - lastEarnedDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSince >= 7) {
    await prisma.kikiPoints.update({
      where: { userId },
      data: {
        weeklyPoints: 0,
        weekStartDate: now,
      },
    });

    console.log(`[Gamification] Reset weekly points for ${userId}`);
  }
}

/**
 * Unlock a badge for a user
 */
export async function unlockBadge(userId: string, badgeType: string): Promise<boolean> {
  try {
    await prisma.badge.create({
      data: {
        userId,
        badgeType,
      },
    });

    // Award bonus points for unlocking badge
    await awardPoints(userId, 100, `Badge unlocked: ${badgeType}`);

    console.log(`[Gamification] Unlocked badge ${badgeType} for ${userId}`);
    return true;
  } catch (error) {
    // Badge already unlocked
    return false;
  }
}

/**
 * Check and unlock badges based on user progress
 */
export async function checkAndUnlockBadges(userId: string): Promise<string[]> {
  const unlockedBadges: string[] = [];

  // Get user's existing badges
  const existingBadges = await prisma.badge.findMany({
    where: { userId },
    select: { badgeType: true },
  });

  const unlockedBadgeTypes = existingBadges.map(b => b.badgeType);

  // FIRST_EXERCISE - Complete first exercise
  if (!unlockedBadgeTypes.includes('FIRST_EXERCISE')) {
    const exerciseCount = await prisma.exercise.count({
      where: { userId, completed: true },
    });
    if (exerciseCount >= 1) {
      if (await unlockBadge(userId, 'FIRST_EXERCISE')) {
        unlockedBadges.push('FIRST_EXERCISE');
      }
    }
  }

  // PRONUNCIATION_STAR - 5 accent training exercises
  if (!unlockedBadgeTypes.includes('PRONUNCIATION_STAR')) {
    const accentCount = await prisma.exercise.count({
      where: { userId, completed: true, mode: 'ACCENT_TRAINING' },
    });
    if (accentCount >= 5) {
      if (await unlockBadge(userId, 'PRONUNCIATION_STAR')) {
        unlockedBadges.push('PRONUNCIATION_STAR');
      }
    }
  }

  // CABIN_MASTER - 10 passenger service exercises
  if (!unlockedBadgeTypes.includes('CABIN_MASTER')) {
    const passengerCount = await prisma.exercise.count({
      where: { userId, completed: true, mode: 'PASSENGER' },
    });
    if (passengerCount >= 10) {
      if (await unlockBadge(userId, 'CABIN_MASTER')) {
        unlockedBadges.push('CABIN_MASTER');
      }
    }
  }

  // SAFETY_GURU - 5 emergency exercises
  if (!unlockedBadgeTypes.includes('SAFETY_GURU')) {
    const emergencyCount = await prisma.exercise.count({
      where: { userId, completed: true, mode: 'EMERGENCY' },
    });
    if (emergencyCount >= 5) {
      if (await unlockBadge(userId, 'SAFETY_GURU')) {
        unlockedBadges.push('SAFETY_GURU');
      }
    }
  }

  // GRAMMAR_CHAMPION - 3 role-play exercises
  if (!unlockedBadgeTypes.includes('GRAMMAR_CHAMPION')) {
    const rolePlayCount = await prisma.exercise.count({
      where: { userId, completed: true, mode: 'ROLE_PLAY' },
    });
    if (rolePlayCount >= 3) {
      if (await unlockBadge(userId, 'GRAMMAR_CHAMPION')) {
        unlockedBadges.push('GRAMMAR_CHAMPION');
      }
    }
  }

  // LISTENING_LEGEND - 3 listening exercises
  if (!unlockedBadgeTypes.includes('LISTENING_LEGEND')) {
    const listeningCount = await prisma.exercise.count({
      where: { userId, completed: true, mode: 'LISTENING' },
    });
    if (listeningCount >= 3) {
      if (await unlockBadge(userId, 'LISTENING_LEGEND')) {
        unlockedBadges.push('LISTENING_LEGEND');
      }
    }
  }

  // WHEEL_WINNER - 5 wheel of English exercises
  if (!unlockedBadgeTypes.includes('WHEEL_WINNER')) {
    const wheelCount = await prisma.exercise.count({
      where: { userId, completed: true, mode: 'WHEEL_OF_ENGLISH' },
    });
    if (wheelCount >= 5) {
      if (await unlockBadge(userId, 'WHEEL_WINNER')) {
        unlockedBadges.push('WHEEL_WINNER');
      }
    }
  }

  // CONSISTENCY_KING - 20 days in a row (simplified: 20+ total exercises)
  if (!unlockedBadgeTypes.includes('CONSISTENCY_KING')) {
    const totalExercises = await prisma.exercise.count({
      where: { userId, completed: true },
    });
    if (totalExercises >= 20) {
      if (await unlockBadge(userId, 'CONSISTENCY_KING')) {
        unlockedBadges.push('CONSISTENCY_KING');
      }
    }
  }

  return unlockedBadges;
}

/**
 * Complete an exercise and award points
 */
export async function completeExercise(
  userId: string,
  exerciseId: string
): Promise<{ pointsAwarded: number; newBadges: string[] }> {
  // Mark exercise as completed
  const exercise = await prisma.exercise.update({
    where: { id: exerciseId },
    data: { completed: true, completedAt: new Date() },
  });

  // Award points
  await awardPoints(userId, exercise.pointsValue, `Exercise completed: ${exercise.title}`);

  // Check for new badges
  const newBadges = await checkAndUnlockBadges(userId);

  return {
    pointsAwarded: exercise.pointsValue,
    newBadges,
  };
}

/**
 * Mark a video as approved and award bonus points
 */
export async function approveVideo(userId: string, videoId: string): Promise<void> {
  // Update video status
  await prisma.video.update({
    where: { id: videoId },
    data: { status: 'APPROVED', validatedAt: new Date() },
  });

  // Award bonus points for video approval
  await awardPoints(userId, 25, `Video approved: ${videoId}`);

  // Check for new badges
  await checkAndUnlockBadges(userId);
}
