import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return Response.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get all stats in parallel
    const [totalStudents, pendingVideos, approvedVideos, totalExercises] = await Promise.all([
      prisma.user.count({
        where: { role: 'STUDENT' },
      }),
      prisma.video.count({
        where: { status: 'PENDING' },
      }),
      prisma.video.count({
        where: { status: 'APPROVED' },
      }),
      prisma.exercise.count({
        where: { completed: true },
      }),
    ]);

    // Calculate average completion rate
    const users = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: { id: true },
    });

    let totalCompletion = 0;
    if (users.length > 0) {
      const completionRates = await Promise.all(
        users.map(async (user) => {
          const completed = await prisma.exercise.count({
            where: { userId: user.id, completed: true },
          });
          return completed > 0 ? Math.min((completed / 50) * 100, 100) : 0;
        })
      );
      totalCompletion = completionRates.reduce((a, b) => a + b, 0) / users.length;
    }

    return Response.json({
      totalStudents,
      pendingVideos,
      totalVideosReviewed: approvedVideos,
      averageCompletionRate: Math.round(totalCompletion),
      totalExercises,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
