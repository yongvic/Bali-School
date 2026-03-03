import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
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
        { message: 'Unauthorized' },
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
        { message: 'Invalid input', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Onboarding error:', error);
    return Response.json(
      { message: 'Internal server error' },
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

  // Create modules for each week
  await createModules(plan.id, data.englishLevel, currentUserId);

  return plan;
}

function generateWeeklyFocus(data: z.infer<typeof onboardingSchema>): string[] {
  const baseModules = [
    'Basic Greetings & Introductions',
    'Passenger Service Requests',
    'Safety Procedures',
    'In-flight Announcements',
    'Emergency Phrases',
    'Customs & Immigration',
    'Complaint Handling',
    'Special Requests',
    'Cabin Crew Coordination',
    'Professional Communication',
    'Advanced Scenarios',
    'Comprehensive Review',
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
  const weeks = 12;
  const levelPointTarget = englishLevel.startsWith('A') ? 200 : englishLevel.startsWith('B') ? 250 : 300;

  const exerciseTemplates = [
    {
      mode: 'PASSENGER',
      title: 'Passenger Service Request',
      description: 'A passenger asks for a specific beverage. Respond professionally.',
      content: 'Passenger: "Can I get a glass of water with ice, please?"',
      points: 60,
    },
    {
      mode: 'ACCENT_TRAINING',
      title: 'Pronunciation: Coffee vs Tea',
      description: 'Practice pronouncing these common beverage words.',
      content: 'Pronounce clearly: "coffee", "tea", "juice", "water"',
      points: 50,
    },
    {
      mode: 'EMERGENCY',
      title: 'Emergency Phrases',
      description: 'Learn and practice critical safety announcements.',
      content: 'Practice: "This is an emergency descent. Put on your oxygen mask."',
      points: 70,
    },
    {
      mode: 'ROLE_PLAY',
      title: 'Handling Complaints',
      description: 'A passenger is unhappy with their meal. Resolve professionally.',
      content: 'Passenger: "This meal is cold! What are you going to do about it?"',
      points: 75,
    },
    {
      mode: 'LISTENING',
      title: 'Listening Comprehension',
      description: 'Listen and answer questions about in-flight announcements.',
      content: 'Listen to the announcement and answer: What is the flight duration?',
      points: 55,
    },
    {
      mode: 'WHEEL_OF_ENGLISH',
      title: 'Random Topic Challenge',
      description: 'Spin the wheel and speak about your topic for 2 minutes.',
      content: 'Topic will be randomly selected from aviation-related subjects.',
      points: 65,
    },
    {
      mode: 'SECRET_CHALLENGE',
      title: 'Unexpected Scenario',
      description: 'Handle an unexpected passenger situation with grace.',
      content: 'A passenger suddenly becomes ill. What do you do?',
      points: 80,
    },
    {
      mode: 'CUSTOM',
      title: 'Your Own Scenario',
      description: 'Share a scenario you\'d like to practice. Be creative!',
      content: 'Create or describe an aviation scenario you want to practice.',
      points: 40,
    },
  ];

  for (let week = 1; week <= weeks; week++) {
    const focus = ['Basic', 'Intermediate', 'Advanced'][Math.min(Math.floor(week / 4), 2)];
    
    const module = await prisma.module.create({
      data: {
        planId,
        week,
        title: `Week ${week}: ${focus} English for Aviation (${week <= 4 ? '30-day' : week <= 8 ? '60-day' : '90-day'} plan)`,
        description: `Focus on aviation-specific English with practical exercises and real-world scenarios.`,
        targetPoints: levelPointTarget,
      },
    });

    // Create 2-3 exercises per module
    const exercisesThisWeek = exerciseTemplates.slice(0, week % 3 === 0 ? 3 : 2);
    
    for (const template of exercisesThisWeek) {
      await prisma.exercise.create({
        data: {
          userId,
          moduleId: module.id,
          mode: template.mode as any,
          title: template.title,
          description: template.description,
          content: template.content,
          pointsValue: template.points,
        },
      });
    }
  }
}
