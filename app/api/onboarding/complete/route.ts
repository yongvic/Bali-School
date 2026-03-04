import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { rebuildPlanModules } from '@/lib/module-generation';
import { z } from 'zod';

const onboardingSchema = z.object({
  professionGoal: z.string().min(1),
  englishLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  dailyMinutes: z.string().transform(Number).pipe(z.number().min(5).max(480)),
  weeklyGoal: z.string().transform(Number).pipe(z.number().min(1).max(40)),
  airportCode: z.string().length(3),
  airportName: z.string().min(1),
  challenges: z.array(z.string()),
  motivation: z.string().min(10),
  readyInWeeks: z.string().transform(Number).pipe(z.number().min(4).max(52)),
  comfortableOnCamera: z.boolean(),
  biggestDifficulty: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return Response.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const data = onboardingSchema.parse(body);

    // Create onboarding record
    const onboarding = await prisma.onboarding.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        professionGoal: data.professionGoal,
        englishLevel: data.englishLevel,
        dailyMinutes: data.dailyMinutes,
        weeklyGoal: data.weeklyGoal,
        airportCode: data.airportCode,
        airportName: data.airportName,
        challenges: data.challenges,
        motivation: data.motivation,
        readyInWeeks: data.readyInWeeks,
        comfortableOnCamera: data.comfortableOnCamera,
        biggestDifficulty: data.biggestDifficulty,
      },
      update: {
        professionGoal: data.professionGoal,
        englishLevel: data.englishLevel,
        dailyMinutes: data.dailyMinutes,
        weeklyGoal: data.weeklyGoal,
        airportCode: data.airportCode,
        airportName: data.airportName,
        challenges: data.challenges,
        motivation: data.motivation,
        readyInWeeks: data.readyInWeeks,
        comfortableOnCamera: data.comfortableOnCamera,
        biggestDifficulty: data.biggestDifficulty,
      },
    });

    // Generate learning plan
    const learningPlan = await generateLearningPlan(session.user.id, data, session.user.id);

    return Response.json(
      { 
        message: 'Onboarding completed',
        learningPlanId: learningPlan.id
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { message: 'Données invalides', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Onboarding error:', error);
    return Response.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

async function generateLearningPlan(userId: string, data: z.infer<typeof onboardingSchema>, currentUserId: string) {
  // Create learning plan with week-by-week focus
  const weeklyFocuses = generateWeeklyFocus(data);
  const planDetails = buildPlanDetails(data, weeklyFocuses);

  const plan = await prisma.learningPlan.upsert({
    where: { userId },
    create: {
      userId,
      weeklyFocus: weeklyFocuses,
      weeklyObjectives: planDetails.weeklyObjectives,
      goals30: planDetails.goals30,
      goals60: planDetails.goals60,
      goals90: planDetails.goals90,
      skillFocuses: planDetails.skillFocuses,
      exerciseSuggestions: planDetails.exerciseSuggestions,
      estimatedCompletion: new Date(Date.now() + data.readyInWeeks * 7 * 24 * 60 * 60 * 1000),
    },
    update: {
      weeklyFocus: weeklyFocuses,
      weeklyObjectives: planDetails.weeklyObjectives,
      goals30: planDetails.goals30,
      goals60: planDetails.goals60,
      goals90: planDetails.goals90,
      skillFocuses: planDetails.skillFocuses,
      exerciseSuggestions: planDetails.exerciseSuggestions,
      estimatedCompletion: new Date(Date.now() + data.readyInWeeks * 7 * 24 * 60 * 60 * 1000),
    },
  });

  // Rebuild modules each time onboarding is updated to keep plan consistent and reusable.
  await rebuildPlanModules(plan.id, currentUserId, data.englishLevel);

  return plan;
}

function generateWeeklyFocus(data: z.infer<typeof onboardingSchema>): string[] {
  const focusThemes = [
    'Structured Foundations & Greetings',
    'Listening & Passenger Requests',
    'Customer Service Fluency',
    'Pronunciation & Confidence',
    'Safety Announcements & Clarity',
    'Emergency Readiness & Scripts',
    'Interview Preparation & Stories',
    'Accent Neutralization',
    'Advanced Passenger Scenarios',
    'Role Play & Soft Skills',
    'Review & Consolidation',
    'Performance & Capstone',
  ];

  const personalizedGap = data.biggestDifficulty ? `Focus sur "${data.biggestDifficulty}"` : 'Focus sur les priorités identifiées';
  const goals = [...focusThemes];
  goals[2] = `${goals[2]} – ${data.challenges[0] || data.professionGoal}`;
  goals[3] = `${goals[3]} – ${data.comfortableOnCamera ? 'exercices caméras' : 'micro et audio'}`;
  goals[4] = `${goals[4]} • Être prête dans ${data.readyInWeeks} semaines`;
  goals[5] = personalizedGap;
  return goals;
}

function buildPlanDetails(
  data: z.infer<typeof onboardingSchema>,
  weeklyFocuses: string[]
): {
  weeklyObjectives: string[];
  goals30: string[];
  goals60: string[];
  goals90: string[];
  skillFocuses: string[];
  exerciseSuggestions: string[];
} {
  const weeklyObjectives = weeklyFocuses.map((focus, index) => {
    return `Semaine ${index + 1} · ${focus.replace(/&/g, 'et')}`;
  });

  const cameraGoal = data.comfortableOnCamera
    ? 'Préparer des vidéos de feedback régulières pour gagner en aisance devant la caméra.'
    : 'Commencer par des enregistrements audio puis faire une transition vers la caméra.';

  const goals30 = [
    `30 jours – Consolider les bases, améliorer ${data.biggestDifficulty} et valider les routines quotidiennes.`,
    `30 jours – Accent sur les expressions passagers et ${data.challenges[0] || 'les fondamentaux'} pour gagner en fluidité.`,
    cameraGoal,
  ];

  const goals60 = [
    `60 jours – Renforcer les scripts complexes et les réponses spontanées (mise en situation cabine).`,
    `60 jours – Approfondir les skills listés : ${data.challenges.slice(0, 3).join(', ') || 'communication professionnelle'}.`,
    `60 jours – Commencer les simulations filmées (feedback + révision) et suivre la préparation vers ${data.professionGoal}.`,
  ];

  const goals90 = [
    `90 jours – Finaliser les routines, maîtriser la vidéo capstone et se sentir prête ${data.readyInWeeks} semaines après.`,
    `90 jours – Réponses claires sur les situations complexes (${data.biggestDifficulty}).`,
    `90 jours – Valider les 3 piliers : service passager, sécurité et confiance en soi.`,
  ];

  const skillFocuses = [
    ...new Set([
      'Prononciation & Intonation',
      'Fluidité expression orale',
      ...data.challenges.slice(0, 4),
      data.biggestDifficulty,
    ]),
  ].filter(Boolean);

  const exerciseSuggestions = [
    data.comfortableOnCamera
      ? 'Production vidéo hebdomadaire avec scénarios cabine'
      : 'Enregistrements audio guidés puis playback avec auto-feedback',
    'Scénarios de service client (annonces, guidages, réclamations)',
    'Micro-sessions de questions spontanées pour renforcer la confiance',
  ];

  return { weeklyObjectives, goals30, goals60, goals90, skillFocuses, exerciseSuggestions };
}


