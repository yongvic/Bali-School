export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export type ExerciseKind =
  | 'qcm'
  | 'fill_blank'
  | 'match_pairs'
  | 'audio_to_word'
  | 'drag_drop'
  | 'sentence_order'
  | 'oral';

export interface StructuredExercise {
  id: string;
  kind: ExerciseKind;
  exerciseType?:
    | 'multiple_choice'
    | 'fill_blank'
    | 'drag_drop'
    | 'matching'
    | 'listening'
    | 'writing'
    | 'speaking';
  skill?: 'READING' | 'LISTENING' | 'WRITING' | 'SPEAKING';
  phase?:
    | 'INTRODUCTION'
    | 'DISCOVERY'
    | 'PRACTICE_CONTROLLED'
    | 'PRACTICE_SEMI_GUIDED'
    | 'ORAL_PRODUCTION'
    | 'FINAL_EVALUATION';
  difficulty?: 'easy' | 'medium' | 'hard';
  prompt: string;
  options?: string[];
  answer?: string | string[] | Record<string, string>;
  explanation?: string;
  expectedPhrase?: string;
}

export interface ModuleBlueprint {
  cefrLevel: CefrLevel;
  introduction: {
    objective: string;
    skill: string;
    prerequisites: string;
  };
  vocabulary: {
    word: string;
    translation: string;
    example: string;
    audioText: string;
  }[];
  grammar: {
    rule: string;
    examples: string[];
    miniExercise: string;
  };
  listening: {
    dialogue: string;
    questions: string[];
  };
  exercises: StructuredExercise[];
}

const LEVEL_PATH: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

export function normalizeCefrLevel(level?: string | null): CefrLevel {
  if (!level) return 'A1';
  if (LEVEL_PATH.includes(level as CefrLevel)) return level as CefrLevel;
  if (level === 'C2') return 'C1';
  return 'A1';
}

export function getAllowedLevelsForLearner(level?: string | null): CefrLevel[] {
  const normalized = normalizeCefrLevel(level);
  const idx = LEVEL_PATH.indexOf(normalized);
  return LEVEL_PATH.slice(0, idx + 1);
}

export function levelByWeek(week: number): CefrLevel {
  if (week <= 2) return 'A1';
  if (week <= 4) return 'A2';
  if (week <= 7) return 'B1';
  if (week <= 10) return 'B2';
  return 'C1';
}

export function parseStructuredContent(content: string): ModuleBlueprint | null {
  try {
    const parsed = JSON.parse(content);
    if (parsed && parsed.introduction && parsed.vocabulary && parsed.grammar && parsed.listening) {
      return parsed as ModuleBlueprint;
    }
    return null;
  } catch {
    return null;
  }
}

export function createModuleBlueprint(cefrLevel: CefrLevel, topic: string): ModuleBlueprint {
  return {
    cefrLevel,
    introduction: {
      objective: `Develop practical English for ${topic}.`,
      skill: `Listening, speaking, grammar and professional vocabulary at ${cefrLevel}.`,
      prerequisites: `Validated ${cefrLevel === 'A1' ? 'onboarding profile' : `previous level before ${cefrLevel}`}.`,
    },
    vocabulary: [
      {
        word: 'boarding pass',
        translation: "carte d'embarquement",
        example: 'Please show me your boarding pass.',
        audioText: 'boarding pass',
      },
      {
        word: 'overhead compartment',
        translation: 'compartiment à bagages cabine',
        example: 'Your bag goes in the overhead compartment.',
        audioText: 'overhead compartment',
      },
      {
        word: 'aisle',
        translation: 'allée',
        example: 'Please keep the aisle clear.',
        audioText: 'aisle',
      },
    ],
    grammar: {
      rule: 'Use polite modal verbs for requests: can, could, would.',
      examples: [
        'Could you fasten your seat belt, please?',
        'Would you like water or juice?',
      ],
      miniExercise: 'Rewrite this sentence politely: "Sit down now."',
    },
    listening: {
      dialogue:
        'Crew: Good evening. We are ready for departure. Passenger: Can I change my seat? Crew: Let me check what is available.',
      questions: [
        'What is the passenger request?',
        'What professional phrase does the crew use?',
      ],
    },
    exercises: createProfessionalExerciseSet(cefrLevel, topic),
  };
}

function createProfessionalExerciseSet(cefrLevel: CefrLevel, topic: string): StructuredExercise[] {
  return [
      {
        id: 'mcq-1',
        kind: 'qcm',
        exerciseType: 'multiple_choice',
        skill: 'READING',
        phase: 'PRACTICE_CONTROLLED',
        difficulty: 'easy',
        prompt: `Choose the best sentence for ${topic}.`,
        options: ['Sit now.', 'Please take your seat for takeoff.', 'Go there quickly.'],
        answer: 'Please take your seat for takeoff.',
        explanation: 'Use polite and precise language in professional situations.',
      },
      {
        id: 'fill-1',
        kind: 'fill_blank',
        exerciseType: 'fill_blank',
        skill: 'WRITING',
        phase: 'PRACTICE_CONTROLLED',
        difficulty: 'easy',
        prompt: 'Complete: "Please ____ your seat belt."',
        answer: 'fasten',
        explanation: '"Fasten your seat belt" is the standard aviation phrase.',
      },
      {
        id: 'match-1',
        kind: 'match_pairs',
        exerciseType: 'matching',
        skill: 'READING',
        phase: 'PRACTICE_CONTROLLED',
        difficulty: 'medium',
        prompt: 'Match words with French translations.',
        answer: {
          aisle: 'allée',
          tray: 'tablette',
          gate: "porte d'embarquement",
        },
      },
      {
        id: 'order-1',
        kind: 'sentence_order',
        exerciseType: 'drag_drop',
        skill: 'WRITING',
        phase: 'PRACTICE_CONTROLLED',
        difficulty: 'medium',
        prompt: 'Order the sentence.',
        options: ['please', 'your', 'boarding', 'show', 'pass'],
        answer: ['please', 'show', 'your', 'boarding', 'pass'],
      },
      {
        id: 'read-1',
        kind: 'qcm',
        exerciseType: 'multiple_choice',
        skill: 'READING',
        phase: 'PRACTICE_CONTROLLED',
        difficulty: 'medium',
        prompt: 'Read the short text and answer the key detail question.',
        answer: 'The passenger asks for seat assistance.',
        explanation: 'Reading comprehension checks detail extraction.',
      },
      {
        id: 'listen-1',
        kind: 'audio_to_word',
        exerciseType: 'listening',
        skill: 'LISTENING',
        phase: 'PRACTICE_CONTROLLED',
        difficulty: 'medium',
        prompt: 'Listen to the short dialogue and identify the request.',
        answer: 'water with ice',
        explanation: 'Listening requires capturing exact service intent.',
      },
      {
        id: 'write-1',
        kind: 'fill_blank',
        exerciseType: 'writing',
        skill: 'WRITING',
        phase: 'PRACTICE_SEMI_GUIDED',
        difficulty: 'hard',
        prompt: 'Translate to English: "Veuillez patienter quelques minutes."',
        answer: 'Please wait a few minutes.',
        explanation: 'Use polite imperative and natural wording.',
      },
      {
        id: 'oral-1',
        kind: 'oral',
        exerciseType: 'speaking',
        skill: 'SPEAKING',
        phase: 'ORAL_PRODUCTION',
        difficulty: 'hard',
        prompt: 'Say this sentence clearly.',
        expectedPhrase: 'Please fasten your seat belt now.',
        answer: 'Please fasten your seat belt now.',
      },
      {
        id: 'final-1',
        kind: 'qcm',
        exerciseType: 'multiple_choice',
        skill: 'READING',
        phase: 'FINAL_EVALUATION',
        difficulty: 'hard',
        prompt: 'Final check: choose the most suitable complete response.',
        answer: 'Good evening, I can help you find your seat right away.',
      },
    ];
}

export function computeOralScore(transcript: string, expected: string) {
  const norm = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(Boolean);

  const spoken = norm(transcript);
  const target = norm(expected);
  if (!target.length) {
    return { score: 0, feedback: 'Phrase cible manquante.' };
  }

  let matches = 0;
  for (const token of target) {
    if (spoken.includes(token)) matches += 1;
  }

  const score = Math.round((matches / target.length) * 100);
  let feedback = 'Très bonne production orale.';
  if (score < 60) feedback = 'Prononciation à renforcer: plusieurs mots clés manquent.';
  else if (score < 85) feedback = 'Bon niveau, améliorez la fluidité et la précision.';

  return { score, feedback };
}
