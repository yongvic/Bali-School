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
      const oralExercises = module.exercises.filter((exercise) =>
        exercise.title.toLowerCase().includes('soumission orale')
      );
      const hasApprovedOral = oralExercises.every((exercise) =>
        exercise.videoSubmissions.some((video) => video.status === 'APPROVED')
      );
      const allExercisesCompleted = module.exercises.length > 0 && module.exercises.every((exercise) => exercise.completed);
      const moduleValidated = allExercisesCompleted && hasApprovedOral && !hasRefusedVideo;

      const locked = !previousModuleValidated || !withinLearnerRange;
      const blockedReason = !withinLearnerRange
        ? `Ce module est au niveau ${cefrLevel}, au-dessus du niveau configuré.`
        : !previousModuleValidated
          ? 'Validez complètement le module précédent (exercices + vidéo orale approuvée).'
          : null;

      previousModuleValidated = previousModuleValidated && moduleValidated;

      return {
        ...module,
        cefrLevel,
        locked,
        moduleValidated,
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

