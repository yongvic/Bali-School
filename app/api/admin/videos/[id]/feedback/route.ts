import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
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

    const { decision, textFeedback, grade, strengths, improvements } = await req.json();

    // Get the video and its owner
    const video = await prisma.video.findUnique({
      where: { id: params.id },
      select: { userId: true, status: true },
    });

    if (!video) {
      return Response.json(
        { message: 'Video not found' },
        { status: 404 }
      );
    }

    // Create feedback record
    const feedback = await prisma.adminFeedback.create({
      data: {
        videoId: params.id,
        adminId: session.user.id,
        decision,
        textFeedback,
        grade,
        strengths: strengths || [],
        improvements: improvements || [],
      },
    });

    // Update video status
    await prisma.video.update({
      where: { id: params.id },
      data: {
        status: decision,
        validatedAt: new Date(),
      },
    });

    // If approved, award bonus points
    if (decision === 'APPROVED') {
      const { approveVideo } = await import('@/lib/gamification');
      await approveVideo(video.userId, params.id);
    }

    return Response.json(
      {
        message: 'Feedback submitted successfully',
        feedbackId: feedback.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Feedback submission error:', error);
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
