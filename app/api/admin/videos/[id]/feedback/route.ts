import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
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
    const { decision, textFeedback, grade, strengths, improvements } = await req.json();

    // Get the video and its owner
    const video = await prisma.video.findUnique({
      where: { id },
      select: { userId: true, status: true },
    });

    if (!video) {
      return Response.json(
        { message: 'Vidéo introuvable' },
        { status: 404 }
      );
    }

    // Create or update feedback record
    const feedback = await prisma.adminFeedback.upsert({
      where: { videoId: id },
      create: {
        videoId: id,
        adminId: session.user.id,
        decision,
        textFeedback,
        grade,
        strengths: strengths || [],
        improvements: improvements || [],
      },
      update: {
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
      where: { id },
      data: {
        status: decision,
        validatedAt: new Date(),
      },
    });

    // If approved, award bonus points
    if (decision === 'APPROVED') {
      const { approveVideo } = await import('@/lib/gamification');
      await approveVideo(video.userId, id);
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
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

