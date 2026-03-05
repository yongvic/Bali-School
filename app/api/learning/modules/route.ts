import { auth } from '@/auth';
import { getAllowedLevelsForLearner, levelByWeek } from '@/lib/learning-content';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const [learningPlan, onboarding] = await Promise.all([
      prisma.learningPlan.findUnique({
        where: { userId: session.user.id },
        include: {
          modules: {
            orderBy: { week: 'asc' },
            include: {
              exercises: {
                where: { userId: session.user.id },
                include: {
                  videoSubmissions: {
                    select: { status: true },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.onboarding.findUnique({
        where: { userId: session.user.id },
        select: { englishLevel: true },
      }),
    ]);

    if (!learningPlan) {
      return NextResponse.json({ error: "Aucun plan d'apprentissage trouvé" }, { status: 404 });
    }

    const allowedLevels = getAllowedLevelsForLearner(onboarding?.englishLevel);
    let previousModuleValidated = true;
    const modules = learningPlan.modules.map((module) => {
      const cefrLevel = levelByWeek(module.week);
      const withinLearnerRange = allowedLevels.includes(cefrLevel);
      const hasRefusedVideo = module.exercises.some((exercise) =>
        exercise.videoSubmissions.some((video) => ['REJECTED', 'REVISION_NEEDED'].includes(video.status))
      );
      const oralExercises = module.exercises.filter((exercise) => exercise.exerciseType === 'SPEAKING');
      const hasValidatedOral = oralExercises.every((exercise) =>
        exercise.completed || exercise.videoSubmissions.some((video) => video.status === 'APPROVED')
      );
      const allExercisesCompleted = module.exercises.length > 0 && module.exercises.every((exercise) => exercise.completed);
      const reading = averageSkill(module.exercises, 'READING');
      const listening = averageSkill(module.exercises, 'LISTENING');
      const writing = averageSkill(module.exercises, 'WRITING');
      const speaking = averageSkill(module.exercises, 'SPEAKING');
      const globalScore = Math.round((reading + listening + writing + speaking) / 4);

      const moduleValidated =
        allExercisesCompleted &&
        hasValidatedOral &&
        !hasRefusedVideo &&
        globalScore >= 70 &&
        speaking >= 60;

      const locked = !previousModuleValidated || !withinLearnerRange;
      const blockedReason = !withinLearnerRange
        ? `Ce module est au niveau ${cefrLevel}, au-dessus du niveau configuré.`
        : !previousModuleValidated
          ? 'Validez complètement le module précédent (exercices + production orale validée).'
          : null;

      previousModuleValidated = previousModuleValidated && moduleValidated;

      return {
        ...module,
        cefrLevel,
        locked,
        moduleValidated,
        competencyScores: { reading, listening, writing, speaking, global: globalScore },
        blockedReason,
      };
    });

    const currentIndex = modules.findIndex((m) => !m.locked && !m.moduleValidated);
    const focusIndex = currentIndex >= 0 ? Math.min(currentIndex, learningPlan.weeklyFocus.length - 1) : 0;
    const recommendedModule = currentIndex >= 0 ? modules[currentIndex] : modules[modules.length - 1];

    return NextResponse.json({
      weeklyFocus: learningPlan.weeklyFocus[focusIndex] || 'English Foundations',
      modules,
      recommendedModuleId: recommendedModule?.id || null,
      totalModules: modules.length,
    });
  } catch (error) {
    console.error('Learning modules error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch modules' },
      { status: 500 }
    );
  }
}

function averageSkill(
  exercises: Array<{ skill: string; achievedScore: number }>,
  skill: 'READING' | 'LISTENING' | 'WRITING' | 'SPEAKING'
) {
  const selected = exercises.filter((exercise) => exercise.skill === skill);
  if (!selected.length) return 0;
  return Math.round(selected.reduce((sum, exercise) => sum + (exercise.achievedScore || 0), 0) / selected.length);
}

