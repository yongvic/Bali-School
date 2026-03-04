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
      points,
      mode,
      title,
      content,
      transcript,
      expectedPhrase,
      oralScore,
      oralFeedback,
      exerciseType,
      skill,
      achievedScore,
    } = await request.json();

    if (!exerciseId || !points) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const effectiveScore = typeof achievedScore === 'number' ? achievedScore : typeof oralScore === 'number' ? oralScore : 75;
    const pronunciationBonus =
      typeof oralScore === 'number' && oralScore >= 85 ? 15 : typeof oralScore === 'number' && oralScore >= 70 ? 8 : 0;
    const finalPoints = points + pronunciationBonus;

    // Update existing exercise or create a lightweight standalone exercise entry.
    // This keeps legacy free-mode pages functional even without a pre-generated exercise row.
    const existingExercise = await prisma.exercise.findFirst({
      where: { id: exerciseId, userId: session.user.id },
      select: { id: true, moduleId: true },
    });

    if (existingExercise) {
      await prisma.exercise.update({
        where: { id: existingExercise.id },
        data: {
          completed: true,
          completedAt: new Date(),
          achievedScore: Math.max(0, Math.min(100, effectiveScore)),
          content:
            transcript || oralFeedback
              ? JSON.stringify({
                  prompt: content || '',
                  transcript: transcript || '',
                  expectedPhrase: expectedPhrase || '',
                  oralScore: oralScore ?? null,
                  oralFeedback: oralFeedback || '',
                })
              : undefined,
        },
      });
    } else {
      let moduleId: string | null = null;
      const firstModule = await prisma.module.findFirst({
        where: { learningPlan: { userId: session.user.id } },
        orderBy: { week: 'asc' },
        select: { id: true },
      });

      if (firstModule) {
        moduleId = firstModule.id;
      } else {
        const plan = await prisma.learningPlan.create({
          data: {
            userId: session.user.id,
            weeklyFocus: ['English Foundations'],
            estimatedCompletion: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          },
          select: { id: true },
        });

        const module = await prisma.module.create({
          data: {
            planId: plan.id,
            week: 1,
            title: 'Week 1: Foundations',
            description: 'Auto-generated module for ad-hoc exercises',
            targetPoints: 300,
          },
          select: { id: true },
        });

        moduleId = module.id;
      }

      await prisma.exercise.create({
        data: {
          id: exerciseId,
          userId: session.user.id,
          moduleId: moduleId!,
          mode: normalizeMode(mode),
          exerciseType: normalizeExerciseType(exerciseType, mode),
          skill: normalizeSkill(skill, mode),
          phase: normalizePhase(exerciseType, mode),
          orderIndex: 999,
          title: title || `Exercise ${exerciseId}`,
          content:
            transcript || oralFeedback
              ? JSON.stringify({
                  prompt: content || '',
                  transcript: transcript || '',
                  expectedPhrase: expectedPhrase || '',
                  oralScore: oralScore ?? null,
                  oralFeedback: oralFeedback || '',
                })
              : content || 'Ad-hoc exercise response',
          pointsValue: finalPoints,
          achievedScore: Math.max(0, Math.min(100, effectiveScore)),
          completed: true,
          completedAt: new Date(),
        },
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

function normalizeMode(mode?: string) {
  switch (mode) {
    case 'passenger':
    case 'lost-passenger':
      return 'PASSENGER' as const;
    case 'accent':
      return 'ACCENT_TRAINING' as const;
    case 'secret':
      return 'SECRET_CHALLENGE' as const;
    case 'wheel':
      return 'WHEEL_OF_ENGLISH' as const;
    case 'cabin-simulation':
      return 'CABIN_SIMULATION' as const;
    case 'company-interview':
      return 'INTERVIEW_COMPANY' as const;
    case 'love-english':
      return 'LOVE_AND_ENGLISH' as const;
    case 'reading':
    case 'quiz':
    case 'vocabulary':
    case 'speaking':
      // Keep ad-hoc completion compatible with older DB enum states.
      return 'CUSTOM' as const;
    case 'emergency':
      return 'EMERGENCY' as const;
    case 'listening':
      return 'LISTENING' as const;
    case 'role_play':
      return 'ROLE_PLAY' as const;
    default:
      return 'CUSTOM' as const;
  }
}

function normalizeExerciseType(exerciseType?: string, mode?: string) {
  switch (exerciseType) {
    case 'multiple_choice':
      return 'MULTIPLE_CHOICE' as const;
    case 'fill_blank':
      return 'FILL_BLANK' as const;
    case 'drag_drop':
      return 'DRAG_DROP' as const;
    case 'matching':
      return 'MATCHING' as const;
    case 'listening':
      return 'LISTENING' as const;
    case 'writing':
      return 'WRITING' as const;
    case 'speaking':
      return 'SPEAKING' as const;
    default:
      return mode === 'listening' ? ('LISTENING' as const) : ('MULTIPLE_CHOICE' as const);
  }
}

function normalizeSkill(skill?: string, mode?: string) {
  if (skill === 'READING' || skill === 'LISTENING' || skill === 'WRITING' || skill === 'SPEAKING') {
    return skill;
  }
  if (mode === 'listening') return 'LISTENING' as const;
  if (mode === 'speaking' || mode === 'accent') return 'SPEAKING' as const;
  if (mode === 'vocabulary' || mode === 'quiz') return 'READING' as const;
  return 'WRITING' as const;
}

function normalizePhase(exerciseType?: string, mode?: string) {
  if (exerciseType === 'speaking' || mode === 'speaking' || mode === 'accent') return 'ORAL_PRODUCTION' as const;
  if (exerciseType === 'writing') return 'PRACTICE_SEMI_GUIDED' as const;
  if (exerciseType === 'listening') return 'PRACTICE_CONTROLLED' as const;
  return 'PRACTICE_CONTROLLED' as const;
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

