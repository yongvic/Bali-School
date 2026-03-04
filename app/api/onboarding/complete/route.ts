import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { createModuleBlueprint, levelByWeek, normalizeCefrLevel } from '@/lib/learning-content';
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
  await prisma.exercise.deleteMany({
    where: { module: { planId: plan.id } },
  });
  await prisma.module.deleteMany({
    where: { planId: plan.id },
  });

  // Create modules for each week
  await createModules(plan.id, data.englishLevel, currentUserId);

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

async function createModules(planId: string, englishLevel: string, userId: string) {
  const normalizedLevel = normalizeCefrLevel(englishLevel);
  const levelPointTarget = normalizedLevel.startsWith('A') ? 220 : normalizedLevel.startsWith('B') ? 280 : 340;
  const topics = [
    'passenger service',
    'accent clarity',
    'unexpected situations',
    'professional communication',
    'safety and urgency',
    'interview preparation',
    'lost passenger assistance',
  ];

  for (let week = 1; week <= 12; week++) {
    const cefrLevel = levelByWeek(week);
    const topic = topics[(week - 1) % topics.length];
    const blueprint = createModuleBlueprint(cefrLevel, topic);
    const module = await prisma.module.create({
      data: {
        planId,
        week,
        title: `Semaine ${week} - Niveau ${cefrLevel}`,
        description: `Module ${cefrLevel} structuré: découverte, pratique contrôlée, semi-guidée, oral final et évaluation.`,
        targetPoints: levelPointTarget,
      },
    });

    let orderIndex = 1;
    for (const ex of blueprint.exercises) {
      await prisma.exercise.create({
        data: {
          userId,
          moduleId: module.id,
          mode: ex.exerciseType === 'speaking' ? 'ROLE_PLAY' : 'CUSTOM',
          exerciseType: mapExerciseType(ex.exerciseType),
          skill: ex.skill || 'READING',
          phase: ex.phase || 'PRACTICE_CONTROLLED',
          orderIndex,
          title:
            ex.exerciseType === 'speaking'
              ? 'Production orale de fin de module'
              : `${(ex.exerciseType || 'multiple_choice').replace('_', ' ')} - ${topic}`,
          description: ex.explanation || `Exercice ${ex.exerciseType || 'multiple_choice'} pour ${topic}`,
          content: JSON.stringify({
            ...blueprint,
            currentExercise: ex,
          }),
          pointsValue: ex.phase === 'ORAL_PRODUCTION' ? 20 : ex.phase === 'FINAL_EVALUATION' ? 5 : 10,
        },
      });
      orderIndex += 1;
    }
  }
}

function mapExerciseType(type?: string) {
  switch (type) {
    case 'multiple_choice':
      return 'MULTIPLE_CHOICE' as const;
    case 'fill_blank':
      return 'FILL_BLANK' as const;
    case 'drag_drop':
      return 'DRAG_DROP' as const;
    case 'matching':
      return 'MATCHING' as const;
    case 'listening':
      return 'LISTENING' as const;
    case 'writing':
      return 'WRITING' as const;
    case 'speaking':
      return 'SPEAKING' as const;
    default:
      return 'MULTIPLE_CHOICE' as const;
  }
}

