import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { generatePlanPDF, generateFallbackPlanPDF, createPlanHTML, type PlanPDFData } from '@/lib/pdf-generator';

export const runtime = 'nodejs';
export const maxDuration = 180;

export async function GET(_req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return Response.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Get onboarding data
    const onboarding = await prisma.onboarding.findUnique({
      where: { userId: session.user.id },
    });

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
        { message: "Aucun plan d'apprentissage trouvé" },
        { status: 404 }
      );
    }

    // Transform modules for PDF
    const planData: PlanPDFData = {
      name: session.user.name || 'Apprenant Ravi',
      level: onboarding?.englishLevel || 'Non défini',
      airport: onboarding?.airportName || onboarding?.airportCode || 'Non défini',
      professionGoal: onboarding?.professionGoal || 'Objectif professionnel à définir',
      dailyMinutes: onboarding?.dailyMinutes || 30,
      weeklyGoal: onboarding?.weeklyGoal || 5,
      goals30: plan.goals30 || [],
      goals60: plan.goals60 || [],
      goals90: plan.goals90 || [],
      weeklyObjectives: plan.weeklyObjectives || [],
      skillFocuses: plan.skillFocuses || [],
      exerciseSuggestions: plan.exerciseSuggestions || [],
      weeks: plan.modules.map(module => ({
        week: module.week,
        title: module.title,
        focus: [
          plan.weeklyObjectives?.[module.week - 1],
          plan.weeklyFocus?.[module.week - 1],
          plan.exerciseSuggestions?.[0],
          plan.skillFocuses?.[0],
        ].filter((item): item is string => Boolean(item && item.trim())),
        targetPoints: module.targetPoints,
      })),
    };

    for (const week of planData.weeks) {
      if (!week.focus.length) {
        week.focus = [
          'Apprendre le vocabulaire et les phrases clés',
          'Travailler la prononciation',
          'Réaliser les exercices interactifs',
          'Gagner des points Kiki',
        ];
      }
    }

    const htmlContent = createPlanHTML(planData);

    try {
      const pdf = await generatePlanPDF(htmlContent);
      return new Response(pdf, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="plan-apprentissage-ravis.pdf"',
          'Cache-Control': 'no-store',
        },
      });
    } catch (pdfError) {
      console.error('PDF generation failed, using fallback:', pdfError);
      const fallbackPdf = generateFallbackPlanPDF(planData);
      return new Response(fallbackPdf, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="plan-apprentissage-ravis.pdf"',
          'Cache-Control': 'no-store',
        },
      });
    }
  } catch (error) {
    console.error('PDF generation error:', error);
    return Response.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

