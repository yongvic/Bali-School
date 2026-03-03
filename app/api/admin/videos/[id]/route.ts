import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return Response.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const video = await prisma.video.findUnique({
      where: { id: params.id },
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
        { message: 'Video not found' },
        { status: 404 }
      );
    }

    return Response.json({
      id: video.id,
      studentName: video.user.name,
      exerciseTitle: video.exercise.title,
      blobUrl: video.blobUrl,
      submittedAt: video.createdAt.toISOString(),
      status: video.status,
    });
  } catch (error) {
    console.error('Video fetch error:', error);
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return Response.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { status, feedback } = await req.json();

    if (!['APPROVED', 'REJECTED', 'REVISION_NEEDED'].includes(status)) {
      return Response.json(
        { message: 'Invalid status' },
        { status: 400 }
      );
    }

    // Update video status
    const video = await prisma.video.update({
      where: { id: params.id },
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
    }

    // Create admin feedback
    if (feedback || status !== 'APPROVED') {
      await prisma.adminFeedback.upsert({
        where: { videoId: params.id },
        create: {
          videoId: params.id,
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
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
