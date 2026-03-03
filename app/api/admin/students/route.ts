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

    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get exercise and video counts
    const studentsWithStats = await Promise.all(
      students.map(async (student) => {
        const exerciseCount = await prisma.exercise.count({
          where: { userId: student.id, completed: true },
        });

        const videoCount = await prisma.video.count({
          where: { userId: student.id },
        });

        return {
          ...student,
          exercisesCompleted: exerciseCount,
          videosSubmitted: videoCount,
        };
      })
    );

    return Response.json(studentsWithStats);
  } catch (error) {
    console.error('Students list error:', error);
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
