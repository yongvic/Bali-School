import { prisma } from '@/lib/prisma';
import { createModuleBlueprint, levelByWeek, normalizeCefrLevel, type StructuredExercise } from '@/lib/learning-content';

const TOPICS_BY_LEVEL: Record<string, string[]> = {
  A1: ['passenger service basics', 'boarding and seating', 'simple cabin requests'],
  A2: ['inflight assistance', 'service clarifications', 'routine announcements'],
  B1: ['professional cabin communication', 'handling objections', 'comfort and care requests'],
  B2: ['complex passenger situations', 'safety explanations', 'delay and disruption communication'],
  C1: ['advanced service diplomacy', 'conflict de-escalation', 'premium passenger communication'],
};

export async function rebuildPlanModules(planId: string, userId: string, englishLevel: string) {
  await prisma.exercise.deleteMany({
    where: { module: { planId } },
  });
  await prisma.module.deleteMany({
    where: { planId },
  });

  await createModulesForPlan(planId, userId, englishLevel);
}

export async function createModulesForPlan(planId: string, userId: string, englishLevel: string, weekCount = 12) {
  const normalizedLevel = normalizeCefrLevel(englishLevel);
  const levelPointTarget = normalizedLevel.startsWith('A') ? 220 : normalizedLevel.startsWith('B') ? 280 : 340;

  for (let week = 1; week <= weekCount; week++) {
    const cefrLevel = levelByWeek(week);
    const topics = TOPICS_BY_LEVEL[cefrLevel] || TOPICS_BY_LEVEL.A1;
    const topic = topics[(week - 1) % topics.length];
    const blueprint = createModuleBlueprint(cefrLevel, topic);

    const moduleRecord = await prisma.module.create({
      data: {
        planId,
        week,
        title: `Semaine ${week} - ${cefrLevel} - ${toTitleCase(topic)}`,
        description: `${cefrLevel}: sequence guidee immersion, vocabulaire, grammaire, pratique, oral final et evaluation.`,
        targetPoints: levelPointTarget,
      },
    });

    let orderIndex = 1;
    for (const ex of blueprint.exercises) {
      await prisma.exercise.create({
        data: {
          userId,
          moduleId: moduleRecord.id,
          mode: resolveExerciseMode(ex),
          exerciseType: mapExerciseType(ex.exerciseType),
          skill: ex.skill || 'READING',
          phase: ex.phase || 'PRACTICE_CONTROLLED',
          orderIndex,
          title:
            ex.phase === 'ORAL_PRODUCTION'
              ? `Speaking Simulation - ${cefrLevel}`
              : `${(ex.exerciseType || 'multiple_choice').replace('_', ' ')} - ${toTitleCase(topic)}`,
          description: ex.explanation || `Exercice ${ex.exerciseType || 'multiple_choice'} pour ${topic}.`,
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

function resolveExerciseMode(exercise: StructuredExercise) {
  if (exercise.phase === 'ORAL_PRODUCTION' || exercise.exerciseType === 'speaking') return 'ROLE_PLAY' as const;
  if (exercise.exerciseType === 'listening' || exercise.kind === 'audio_to_word') return 'LISTENING' as const;
  if (exercise.kind === 'match_pairs') return 'VOCABULARY' as const;
  if (exercise.kind === 'qcm') return 'PASSENGER' as const;
  return 'CUSTOM' as const;
}

export function mapExerciseType(type?: string) {
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

function toTitleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
