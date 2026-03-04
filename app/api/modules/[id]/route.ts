import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return Response.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const module = await prisma.module.findUnique({
      where: { id: params.id },
      include: {
        learningPlan: {
          select: { userId: true },
        },
        exercises: {
          select: {
            id: true,
            mode: true,
            title: true,
            description: true,
            content: true,
            pointsValue: true,
            completed: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!module) {
      return Response.json(
        { message: 'Module introuvable' },
        { status: 404 }
      );
    }

    // Check if user owns this module
    if (module.learningPlan.userId !== session.user.id) {
      return Response.json(
        { message: 'Non autorisé' },
        { status: 403 }
      );
    }

    // Block access unless all previous modules are fully validated.
    const previousModules = await prisma.module.findMany({
      where: {
        planId: module.planId,
        week: { lt: module.week },
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
        .filter((e) => e.title.toLowerCase().includes('soumission orale'))
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

    const { learningPlan, ...moduleData } = module;

    return Response.json(moduleData);
  } catch (error) {
    console.error('Module fetch error:', error);
    return Response.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

