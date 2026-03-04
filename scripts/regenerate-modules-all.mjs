import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const LEVEL_BY_WEEK = (week) => {
  if (week <= 2) return 'A1';
  if (week <= 4) return 'A2';
  if (week <= 7) return 'B1';
  if (week <= 10) return 'B2';
  return 'C1';
};

function createExercisesForTopic(topic) {
  return [
    {
      exerciseType: 'MULTIPLE_CHOICE',
      skill: 'READING',
      phase: 'PRACTICE_CONTROLLED',
      title: `QCM - ${topic}`,
      description: 'Choisir la bonne réponse.',
      pointsValue: 10,
      content: JSON.stringify({
        currentExercise: {
          exerciseType: 'multiple_choice',
          prompt: `Choose the best answer for ${topic}.`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          answer: 'Option B',
          explanation: 'Choose the most professional sentence.',
        },
      }),
    },
    {
      exerciseType: 'FILL_BLANK',
      skill: 'WRITING',
      phase: 'PRACTICE_CONTROLLED',
      title: `Phrase à compléter - ${topic}`,
      description: 'Compléter la phrase avec le mot attendu.',
      pointsValue: 10,
      content: JSON.stringify({
        currentExercise: {
          exerciseType: 'fill_blank',
          prompt: 'Complete the sentence with the missing word.',
          answer: 'fasten',
          explanation: 'Use the standard cabin expression.',
        },
      }),
    },
    {
      exerciseType: 'DRAG_DROP',
      skill: 'WRITING',
      phase: 'PRACTICE_CONTROLLED',
      title: `Drag & Drop - ${topic}`,
      description: 'Réorganiser les mots dans le bon ordre.',
      pointsValue: 10,
      content: JSON.stringify({
        currentExercise: {
          exerciseType: 'drag_drop',
          prompt: 'Reorder the sentence.',
          options: ['please', 'show', 'your', 'boarding', 'pass'],
          answer: ['please', 'show', 'your', 'boarding', 'pass'],
        },
      }),
    },
    {
      exerciseType: 'MATCHING',
      skill: 'READING',
      phase: 'PRACTICE_CONTROLLED',
      title: `Association - ${topic}`,
      description: 'Associer mot et traduction.',
      pointsValue: 10,
      content: JSON.stringify({
        currentExercise: {
          exerciseType: 'matching',
          prompt: 'Match terms and meanings.',
          answer: { aisle: 'allée', gate: "porte d'embarquement" },
        },
      }),
    },
    {
      exerciseType: 'LISTENING',
      skill: 'LISTENING',
      phase: 'PRACTICE_CONTROLLED',
      title: `Compréhension orale - ${topic}`,
      description: 'Écouter puis répondre.',
      pointsValue: 10,
      content: JSON.stringify({
        currentExercise: {
          exerciseType: 'listening',
          prompt: 'Listen and identify the key request.',
          answer: 'water with ice',
          explanation: 'Capture the passenger intent.',
        },
      }),
    },
    {
      exerciseType: 'WRITING',
      skill: 'WRITING',
      phase: 'PRACTICE_SEMI_GUIDED',
      title: `Pratique semi-guidée - ${topic}`,
      description: 'Traduction et reformulation.',
      pointsValue: 10,
      content: JSON.stringify({
        currentExercise: {
          exerciseType: 'writing',
          prompt: 'Translate FR -> EN and reformulate politely.',
          answer: 'Please wait a few minutes.',
          explanation: 'Use polite and clear phrasing.',
        },
      }),
    },
    {
      exerciseType: 'SPEAKING',
      skill: 'SPEAKING',
      phase: 'ORAL_PRODUCTION',
      title: 'Production orale de fin de module',
      description: 'Soumission orale finale (micro + transcription).',
      pointsValue: 20,
      content: JSON.stringify({
        currentExercise: {
          exerciseType: 'speaking',
          prompt: 'Introduce yourself as cabin crew in English.',
          expectedPhrase: 'Good evening, welcome onboard.',
          answer: 'Good evening, welcome onboard.',
        },
      }),
    },
    {
      exerciseType: 'MULTIPLE_CHOICE',
      skill: 'READING',
      phase: 'FINAL_EVALUATION',
      title: `Évaluation finale - ${topic}`,
      description: 'Validation finale du module.',
      pointsValue: 5,
      content: JSON.stringify({
        currentExercise: {
          exerciseType: 'multiple_choice',
          prompt: 'Final assessment question.',
          answer: 'Best professional answer',
        },
      }),
    },
  ];
}

async function regenerateForUser(userId, englishLevel) {
  const plan = await prisma.learningPlan.upsert({
    where: { userId },
    create: {
      userId,
      weeklyFocus: [
        'A1 Foundations',
        'A2 Cabin Service',
        'B1 Professional Scenarios',
        'B2 Communication Precision',
        'C1 Advanced Performance',
      ],
      estimatedCompletion: new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000),
    },
    update: {
      estimatedCompletion: new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.exercise.deleteMany({ where: { module: { planId: plan.id } } });
  await prisma.module.deleteMany({ where: { planId: plan.id } });

  const topics = ['passenger service', 'safety', 'listening drills', 'service recovery', 'interview prep', 'airport guidance'];
  const levelTarget = englishLevel?.startsWith('A') ? 220 : englishLevel?.startsWith('B') ? 280 : 340;

  for (let week = 1; week <= 12; week += 1) {
    const level = LEVEL_BY_WEEK(week);
    const topic = topics[(week - 1) % topics.length];
    const module = await prisma.module.create({
      data: {
        planId: plan.id,
        week,
        title: `Semaine ${week} - Niveau ${level}`,
        description: `Module ${level} multi-compétences avec progression pédagogique complète.`,
        targetPoints: levelTarget,
      },
    });

    const exercises = createExercisesForTopic(topic);
    let orderIndex = 1;
    for (const exercise of exercises) {
      await prisma.exercise.create({
        data: {
          userId,
          moduleId: module.id,
          mode: exercise.exerciseType === 'SPEAKING' ? 'ROLE_PLAY' : 'CUSTOM',
          exerciseType: exercise.exerciseType,
          skill: exercise.skill,
          phase: exercise.phase,
          orderIndex,
          title: exercise.title,
          description: exercise.description,
          content: exercise.content,
          pointsValue: exercise.pointsValue,
        },
      });
      orderIndex += 1;
    }
  }
}

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      onboarding: { select: { englishLevel: true } },
    },
  });

  console.log(`Regeneration start for ${users.length} users`);
  for (const user of users) {
    await regenerateForUser(user.id, user.onboarding?.englishLevel || 'A1');
    console.log(`Regenerated modules for user ${user.id}`);
  }
  console.log('Regeneration completed');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
