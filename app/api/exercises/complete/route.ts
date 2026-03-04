import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { awardPoints, checkAndUnlockBadges } from '@/lib/gamification';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const {
      exerciseId,
      content,
      transcript,
      expectedPhrase,
      oralScore,
      oralFeedback,
      achievedScore,
    } = await request.json();

    if (!exerciseId) {
      return NextResponse.json(
        { error: 'Missing required field: exerciseId' },
        { status: 400 }
      );
    }

    const exercise = await prisma.exercise.findFirst({
      where: { id: exerciseId, userId: session.user.id },
      select: {
        id: true,
        moduleId: true,
        completed: true,
        pointsValue: true,
        exerciseType: true,
      },
    });

    if (!exercise) {
      return NextResponse.json({ error: 'Exercice introuvable' }, { status: 404 });
    }

    const effectiveScoreRaw =
      typeof achievedScore === 'number' ? achievedScore : typeof oralScore === 'number' ? oralScore : 75;
    const effectiveScore = Math.max(0, Math.min(100, effectiveScoreRaw));
    const pronunciationBonus =
      exercise.exerciseType === 'SPEAKING' && typeof oralScore === 'number'
        ? oralScore >= 85
          ? 15
          : oralScore >= 70
            ? 8
            : 0
        : 0;
    const finalPoints = exercise.pointsValue + pronunciationBonus;

    const completion = await prisma.exercise.updateMany({
      where: { id: exercise.id, userId: session.user.id, completed: false },
      data: {
        completed: true,
        completedAt: new Date(),
        achievedScore: effectiveScore,
        content:
          transcript || oralFeedback
            ? JSON.stringify({
                prompt: content || '',
                transcript: transcript || '',
                expectedPhrase: expectedPhrase || '',
                oralScore: typeof oralScore === 'number' ? oralScore : null,
                oralFeedback: oralFeedback || '',
              })
            : undefined,
      },
    });

    if (completion.count === 0) {
      const kikiPointsSnapshot = await prisma.kikiPoints.findUnique({
        where: { userId: session.user.id },
        select: { totalPoints: true },
      });
      return NextResponse.json({
        success: true,
        duplicate: true,
        pointsAwarded: 0,
        achievedScore: effectiveScore,
        totalPoints: kikiPointsSnapshot?.totalPoints || 0,
        newBadges: [],
      });
    }

    if (effectiveScore < 60) {
      await scheduleSpacedRepetition(session.user.id, exerciseId);
    }

    await awardPoints(session.user.id, finalPoints, 'exercise_complete');
    const badges = await checkAndUnlockBadges(session.user.id);
    await refreshAirportMap(session.user.id);

    const kikiPoints = await prisma.kikiPoints.findUnique({
      where: { userId: session.user.id },
      select: { totalPoints: true },
    });

    return NextResponse.json({
      success: true,
      pointsAwarded: finalPoints,
      pronunciationBonus,
      achievedScore: effectiveScore,
      oralScore: oralScore ?? null,
      oralFeedback: oralFeedback ?? null,
      totalPoints: kikiPoints?.totalPoints || 0,
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

async function scheduleSpacedRepetition(userId: string, exerciseId: string) {
  const source = await prisma.exercise.findFirst({
    where: { id: exerciseId, userId },
    include: { module: true },
  });
  if (!source) return;

  const nextModule = await prisma.module.findFirst({
    where: { planId: source.module.planId, week: { gt: source.module.week } },
    orderBy: { week: 'asc' },
    select: { id: true },
  });
  if (!nextModule) return;

  await prisma.exercise.create({
    data: {
      userId,
      moduleId: nextModule.id,
      mode: 'CUSTOM',
      exerciseType: source.exerciseType,
      skill: source.skill,
      phase: 'PRACTICE_CONTROLLED',
      orderIndex: 900,
      title: `Révision espacée - ${source.title}`,
      description: 'Réintroduction ciblée après difficulté détectée.',
      content: source.content,
      pointsValue: Math.max(5, Math.round(source.pointsValue * 0.8)),
      isSrsReview: true,
      dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
  });
}

async function refreshAirportMap(userId: string) {
  const [completedExercises, totalExercises] = await Promise.all([
    prisma.exercise.count({ where: { userId, completed: true } }),
    prisma.exercise.count({ where: { userId } }),
  ]);

  const progressPercentage = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;
  const currentTerminal = Math.min(5, Math.max(1, Math.ceil(progressPercentage / 20)));

  await prisma.airportMap.upsert({
    where: { userId },
    create: {
      userId,
      progressPercentage,
      currentTerminal,
      completedAreas: [],
    },
    update: {
      progressPercentage,
      currentTerminal,
      lastProgressAt: new Date(),
    },
  });
}

