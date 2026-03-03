import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const learningPlan = await prisma.learningPlan.findUnique({
      where: { userId: session.user.id },
      include: {
        modules: {
          orderBy: { week: 'asc' },
          include: {
            exercises: {
              where: { userId: session.user.id },
            },
          },
        },
      },
    });

    if (!learningPlan) {
      return NextResponse.json({ error: 'No learning plan found' }, { status: 404 });
    }

    return NextResponse.json({
      weeklyFocus: learningPlan.weeklyFocus[0] || 'English Foundations',
      modules: learningPlan.modules,
      totalModules: learningPlan.modules.length,
    });
  } catch (error) {
    console.error('Learning modules error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch modules' },
      { status: 500 }
    );
  }
}
