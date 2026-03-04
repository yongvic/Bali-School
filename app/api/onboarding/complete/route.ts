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

  const plan = await prisma.learningPlan.upsert({
    where: { userId },
    create: {
      userId,
      weeklyFocus: weeklyFocuses,
      estimatedCompletion: new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000), // 12 weeks
    },
    update: {
      weeklyFocus: weeklyFocuses,
      estimatedCompletion: new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000),
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
  const baseModules: string[] = [
    'A1 Foundations: Greetings & Seat Guidance',
    'A1 Foundations: Basic Passenger Requests',
    'A2 Cabin Service: Food, Beverage, Polite Requests',
    'A2 Cabin Service: Clarification and Directions',
    'B1 Operations: In-flight Announcements',
    'B1 Operations: Listening and Passenger Assistance',
    'B1 Operations: Lost Passenger & Re-routing',
    'B2 Professional: Conflict and Complaint Handling',
    'B2 Professional: Interview Company Readiness',
    'B2 Professional: Urgence and Safety Precision',
    'C1 Performance: Secret Challenge Scenarios',
    'C1 Performance: Capstone Video Assessment',
  ];

  // Adjust based on level
  if (data.englishLevel === 'A1' || data.englishLevel === 'A2') {
    return [
      'Alphabet & Numbers',
      'Common Words',
      'Basic Greetings',
      'Simple Questions',
      'Food & Beverages',
      'Toilets & Comfort Items',
      'Safety Basics',
      'Common Phrases',
      'Listening Practice',
      'Speaking Confidence',
      'Review & Practice',
      'Final Assessment',
    ];
  }

  return baseModules;
}

async function createModules(planId: string, englishLevel: string, userId: string) {
  const normalizedLevel = normalizeCefrLevel(englishLevel);
  const levelPointTarget = normalizedLevel.startsWith('A') ? 220 : normalizedLevel.startsWith('B') ? 280 : 340;
  const modeRotation: Array<{
    mode: any;
    title: string;
    description: string;
    points: number;
    topic: string;
  }> = [
    { mode: 'PASSENGER', title: 'Passenger Mode', description: 'Passenger requests in context.', points: 60, topic: 'passenger service' },
    { mode: 'ACCENT_TRAINING', title: 'Accent Training Mode', description: 'Pronunciation and rhythm refinement.', points: 65, topic: 'pronunciation' },
    { mode: 'SECRET_CHALLENGE', title: 'Secret Challenge Mode', description: 'Unexpected scenario response.', points: 75, topic: 'unexpected service events' },
    { mode: 'WHEEL_OF_ENGLISH', title: 'Wheel of English', description: 'Random topic with timed speaking.', points: 60, topic: 'fluency and reaction' },
    { mode: 'LOVE_AND_ENGLISH', title: 'Love & English Mode', description: 'Warm and premium customer language.', points: 55, topic: 'empathy and tone' },
    { mode: 'EMERGENCY', title: 'Mode Urgence', description: 'Critical safety communication.', points: 80, topic: 'emergency communication' },
    { mode: 'INTERVIEW_COMPANY', title: 'Mode Interview Compagnie', description: 'Interview readiness drills.', points: 70, topic: 'airline interview communication' },
    { mode: 'LOST_PASSENGER', title: 'Lost Passenger Mode', description: 'Helping disoriented passengers.', points: 65, topic: 'airport guidance' },
  ];

  for (let week = 1; week <= 12; week++) {
    const cefrLevel = levelByWeek(week);
    const module = await prisma.module.create({
      data: {
        planId,
        week,
        title: `Semaine ${week} - Niveau ${cefrLevel}`,
        description: `Module ${cefrLevel} centré sur les compétences écoute, vocabulaire, grammaire et production orale.`,
        targetPoints: levelPointTarget,
      },
    });

    const picks = [
      modeRotation[(week - 1) % modeRotation.length],
      modeRotation[week % modeRotation.length],
    ];

    // Add a mandatory end-of-module video exercise for oral validation.
    picks.push({
      mode: 'ROLE_PLAY',
      title: 'Soumission orale de fin de module',
      description: 'Vidéo finale obligatoire pour valider le module et le niveau.',
      points: 90,
      topic: 'final oral assessment',
    });

    for (const template of picks) {
      const blueprint = createModuleBlueprint(cefrLevel, template.topic);
      await prisma.exercise.create({
        data: {
          userId,
          moduleId: module.id,
          mode: template.mode,
          title: template.title,
          description: template.description,
          content: JSON.stringify(blueprint),
          pointsValue: template.points,
        },
      });
    }
  }
}

