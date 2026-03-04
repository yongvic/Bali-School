import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return Response.json(
        { message: 'Non autorisé' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true },
        },
        exercise: {
          select: { title: true },
        },
      },
    });

    if (!video) {
      return Response.json(
        { message: 'Vidéo introuvable' },
        { status: 404 }
      );
    }

    return Response.json({
      id: video.id,
      studentName: video.user.name,
      exerciseTitle: video.exercise.title,
      blobUrl: video.blobUrl,
      submittedAt: video.submittedAt.toISOString(),
      status: video.status,
    });
  } catch (error) {
    console.error('Video fetch error:', error);
    return Response.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return Response.json(
        { message: 'Non autorisé' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { status, feedback } = await req.json();

    if (!['APPROVED', 'REJECTED', 'REVISION_NEEDED'].includes(status)) {
      return Response.json(
        { message: 'Statut invalide' },
        { status: 400 }
      );
    }

    // Update video status
    const video = await prisma.video.update({
      where: { id },
      data: { status },
    });

    // If approved, award points
    if (status === 'APPROVED') {
      const kikiPoints = await prisma.kikiPoints.findUnique({
        where: { userId: video.userId },
      });

      if (kikiPoints) {
        await prisma.kikiPoints.update({
          where: { userId: video.userId },
          data: {
            totalPoints: { increment: 20 },
            weeklyPoints: { increment: 20 },
          },
        });

        // Log points history
        await prisma.pointsHistory.create({
          data: {
            kikiPointsId: kikiPoints.id,
            points: 20,
            reason: 'video_approved',
          },
        });
      }

      const [completedExercises, totalExercises] = await Promise.all([
        prisma.exercise.count({ where: { userId: video.userId, completed: true } }),
        prisma.exercise.count({ where: { userId: video.userId } }),
      ]);
      const progressPercentage =
        totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;
      const currentTerminal = Math.min(5, Math.max(1, Math.ceil(progressPercentage / 20)));

      await prisma.airportMap.upsert({
        where: { userId: video.userId },
        create: {
          userId: video.userId,
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

    // Create admin feedback
    if (feedback || status !== 'APPROVED') {
      await prisma.adminFeedback.upsert({
        where: { videoId: id },
        create: {
          videoId: id,
          adminId: session.user.id,
          decision: status,
          textFeedback: feedback,
        },
        update: {
          decision: status,
          textFeedback: feedback,
          updatedAt: new Date(),
        },
      });
    }

    return Response.json(
      { message: 'Video updated successfully', video },
      { status: 200 }
    );
  } catch (error) {
    console.error('Video update error:', error);
    return Response.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

