import { auth } from '@/auth';
import { getAllowedLevelsForLearner, levelByWeek } from '@/lib/learning-content';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return Response.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id: moduleId } = await params;
    const moduleRecord = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        learningPlan: {
          select: { userId: true },
        },
        exercises: {
          select: {
            id: true,
            mode: true,
            exerciseType: true,
            skill: true,
            phase: true,
            orderIndex: true,
            title: true,
            description: true,
            content: true,
            pointsValue: true,
            completed: true,
            achievedScore: true,
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!moduleRecord) {
      return Response.json(
        { message: 'Module introuvable' },
        { status: 404 }
      );
    }

    // Check if user owns this module
    if (moduleRecord.learningPlan.userId !== session.user.id) {
      return Response.json(
        { message: 'Non autorisé' },
        { status: 403 }
      );
    }

    const onboarding = await prisma.onboarding.findUnique({
      where: { userId: session.user.id },
      select: { englishLevel: true },
    });
    const allowedLevels = getAllowedLevelsForLearner(onboarding?.englishLevel);
    const cefrLevel = levelByWeek(moduleRecord.week);
    if (!allowedLevels.includes(cefrLevel)) {
      return Response.json(
        {
          message: `Module bloqué: niveau ${cefrLevel} supérieur au niveau autorisé.`,
        },
        { status: 423 }
      );
    }

    // Block access unless all previous modules are fully validated.
    const previousModules = await prisma.module.findMany({
      where: {
        planId: moduleRecord.planId,
        week: { lt: moduleRecord.week },
      },
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
    });

    const blocked = previousModules.some((m) => {
      const allCompleted = m.exercises.length > 0 && m.exercises.every((e) => e.completed);
      const oralApproved = m.exercises
        .filter((e) => e.exerciseType === 'SPEAKING')
        .every((e) => e.videoSubmissions.some((v) => v.status === 'APPROVED'));
      const hasRejected = m.exercises.some((e) =>
        e.videoSubmissions.some((v) => ['REJECTED', 'REVISION_NEEDED'].includes(v.status))
      );
      return !allCompleted || !oralApproved || hasRejected;
    });

    if (blocked) {
      return Response.json(
        {
          message:
            'Module bloqué: validez complètement le module précédent (exercices terminés + vidéo orale approuvée).',
        },
        { status: 423 }
      );
    }

    const { learningPlan, ...moduleData } = moduleRecord;

    return Response.json({ ...moduleData, cefrLevel });
  } catch (error) {
    console.error('Module fetch error:', error);
    return Response.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

