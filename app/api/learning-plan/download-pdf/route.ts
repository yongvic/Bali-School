import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { generatePlanPDF, createPlanHTML } from '@/lib/pdf-generator';

export async function GET(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || !session.user.name) {
      return Response.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get onboarding data
    const onboarding = await prisma.onboarding.findUnique({
      where: { userId: session.user.id },
    });

    if (!onboarding) {
      return Response.json(
        { message: 'Onboarding not completed' },
        { status: 400 }
      );
    }

    // Get learning plan with modules
    const plan = await prisma.learningPlan.findUnique({
      where: { userId: session.user.id },
      include: {
        modules: {
          orderBy: { week: 'asc' },
        },
      },
    });

    if (!plan) {
      return Response.json(
        { message: 'No learning plan found' },
        { status: 404 }
      );
    }

    // Transform modules for PDF
    const weeks = plan.modules.map(module => ({
      week: module.week,
      title: module.title,
      focus: [
        'Learn vocabulary and basic phrases',
        'Practice pronunciation',
        'Complete interactive exercises',
        'Earn Kiki Points',
      ],
      targetPoints: module.targetPoints,
    }));

    // Generate HTML
    const htmlContent = createPlanHTML({
      name: session.user.name,
      level: onboarding.englishLevel,
      airport: onboarding.airportName,
      professionGoal: onboarding.professionGoal,
      dailyMinutes: onboarding.dailyMinutes,
      weeklyGoal: onboarding.weeklyGoal,
      weeks,
    });

    // Generate PDF
    const pdf = await generatePlanPDF(htmlContent);

    // Return PDF
    return new Response(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="learning-plan.pdf"',
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
