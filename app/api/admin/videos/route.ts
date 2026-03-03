import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return Response.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const videos = await prisma.video.findMany({
      include: {
        user: {
          select: { name: true },
        },
        exercise: {
          select: { title: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return Response.json(
      videos.map(v => ({
        id: v.id,
        userId: v.userId,
        userName: v.user.name || 'Unknown',
        status: v.status,
        submittedAt: v.submittedAt,
        videoUrl: v.blobUrl,
        exerciseTitle: v.exercise.title,
      }))
    );
  } catch (error) {
    console.error('Admin videos error:', error);
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
