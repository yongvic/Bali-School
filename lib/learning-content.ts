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

const LEVEL_LIBRARY: Record<
  CefrLevel,
  {
    objectivePrefix: string;
    vocabulary: Array<{ word: string; translation: string; example: string; audioText: string }>;
    grammarRule: string;
    grammarExamples: string[];
    miniExercise: string;
    listening: { dialogue: string; questions: string[] };
  }
> = {
  A1: {
    objectivePrefix: 'Use short and polite cabin requests in routine situations',
    vocabulary: [
      { word: 'boarding pass', translation: "carte d'embarquement", example: 'Please show your boarding pass.', audioText: 'boarding pass' },
      { word: 'seat belt', translation: 'ceinture de securite', example: 'Please fasten your seat belt.', audioText: 'seat belt' },
      { word: 'aisle', translation: 'allee', example: 'Please keep the aisle clear.', audioText: 'aisle' },
    ],
    grammarRule: 'Use can, could and would for polite passenger requests.',
    grammarExamples: ['Could you take your seat, please?', 'Would you like water or juice?'],
    miniExercise: 'Rewrite politely: "Sit down now."',
    listening: {
      dialogue: 'Crew: Could you please take your seat? Passenger: Sorry. Crew: Thank you for your cooperation.',
      questions: ['What is the polite request?', 'How does the passenger respond?'],
    },
  },
  A2: {
    objectivePrefix: 'Handle short service interactions with clear polite forms',
    vocabulary: [
      { word: 'overhead compartment', translation: 'compartiment bagages cabine', example: 'Your bag goes in the overhead compartment.', audioText: 'overhead compartment' },
      { word: 'tray table', translation: 'tablette', example: 'Please put your tray table up.', audioText: 'tray table' },
      { word: 'window seat', translation: 'siege hublot', example: 'Your seat is by the window.', audioText: 'window seat' },
    ],
    grammarRule: 'Use modal verbs and softeners (please, kindly) for service clarity.',
    grammarExamples: ['Could you place your bag under the seat, please?', 'Would you mind closing the tray table?'],
    miniExercise: 'Complete: "_____ you please remain seated?"',
    listening: {
      dialogue: 'Passenger: Can I change seats? Crew: Let me check availability. Please stay seated for now.',
      questions: ['What does the passenger ask?', 'What is the crew instruction?'],
    },
  },
  B1: {
    objectivePrefix: 'Manage practical passenger needs with professional tone',
    vocabulary: [
      { word: 'turbulence', translation: 'turbulences', example: 'We are expecting turbulence shortly.', audioText: 'turbulence' },
      { word: 'lavatory', translation: 'toilettes avion', example: 'The lavatory is currently occupied.', audioText: 'lavatory' },
      { word: 'assistance', translation: 'assistance', example: 'Do you need assistance with your luggage?', audioText: 'assistance' },
    ],
    grammarRule: 'Use modal chains and reason clauses for professional instructions.',
    grammarExamples: ['Could you return to your seat because we are taking off?', 'Would you mind waiting a moment while I assist another passenger?'],
    miniExercise: 'Rephrase with reason: "Do not stand up."',
    listening: {
      dialogue: 'Crew: Sir, could you remain seated? We are taxiing now. Passenger: I only need my phone. Crew: I understand. I can help you after takeoff.',
      questions: ['Why does the crew ask the passenger to sit?', 'Which phrase shows empathy?'],
    },
  },
  B2: {
    objectivePrefix: 'Handle non-routine cabin situations with diplomacy and precision',
    vocabulary: [
      { word: 'compliance', translation: 'conformite', example: 'Thank you for your compliance with safety instructions.', audioText: 'compliance' },
      { word: 'disruption', translation: 'perturbation', example: 'We apologize for the service disruption.', audioText: 'disruption' },
      { word: 'connecting flight', translation: 'vol de correspondance', example: 'We can assist with your connecting flight details.', audioText: 'connecting flight' },
    ],
    grammarRule: 'Use conditional politeness and conflict-reducing structures.',
    grammarExamples: ['Would it be possible for you to remain seated until we reach cruising altitude?', 'Could I ask you to lower your voice so we can assist you better?'],
    miniExercise: 'Transform into diplomatic request: "Stop complaining now."',
    listening: {
      dialogue: 'Passenger: This delay is unacceptable. Crew: I understand your frustration. Would it help if I check your connection options now?',
      questions: ['What de-escalation phrase is used?', 'What solution is offered?'],
    },
  },
  C1: {
    objectivePrefix: 'Demonstrate advanced, calm and authoritative communication in complex situations',
    vocabulary: [
      { word: 'de-escalation', translation: 'desescalade', example: 'Our priority is de-escalation and passenger safety.', audioText: 'de-escalation' },
      { word: 'contingency', translation: 'plan de secours', example: 'We have a contingency plan for this delay.', audioText: 'contingency' },
      { word: 'disembarkation', translation: 'debarquement', example: 'Disembarkation will begin shortly after arrival.', audioText: 'disembarkation' },
    ],
    grammarRule: 'Use nuanced requests with framing, reassurance and professional authority.',
    grammarExamples: ['For everyone\'s safety, could I ask you to remain seated while we resolve this immediately?', 'Would you allow me a moment to coordinate with the purser and come back with a clear solution?'],
    miniExercise: 'Rewrite with advanced diplomatic framing: "You must wait."',
    listening: {
      dialogue: 'Crew: I appreciate your patience. We are coordinating with ground staff to prioritize your transfer. Passenger: Thank you for the update.',
      questions: ['How is reassurance delivered?', 'What commitment is communicated?'],
    },
  },
};

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
  const profile = LEVEL_LIBRARY[cefrLevel];
  return {
    cefrLevel,
    introduction: {
      objective: `${profile.objectivePrefix} for ${topic}.`,
      skill: `Listening, speaking, grammar and professional vocabulary at ${cefrLevel}.`,
      prerequisites: `Validated previous outcomes up to ${cefrLevel}.`,
    },
    vocabulary: profile.vocabulary,
    grammar: {
      rule: profile.grammarRule,
      examples: profile.grammarExamples,
      miniExercise: profile.miniExercise,
    },
    listening: profile.listening,
    exercises: createProfessionalExerciseSet(cefrLevel, topic),
  };
}

function createProfessionalExerciseSet(cefrLevel: CefrLevel, topic: string): StructuredExercise[] {
  return [
    {
      id: `${cefrLevel}-${topic}-match-1`,
      kind: 'match_pairs',
      exerciseType: 'matching',
      skill: 'READING',
      phase: 'PRACTICE_CONTROLLED',
      difficulty: 'easy',
      prompt: `Match service words for ${topic}.`,
      answer: {
        aisle: 'allee',
        tray: 'tablette',
        gate: "porte d'embarquement",
      },
      explanation: 'Connect core vocabulary to operational meaning.',
    },
    {
      id: `${cefrLevel}-${topic}-fill-1`,
      kind: 'fill_blank',
      exerciseType: 'fill_blank',
      skill: 'WRITING',
      phase: 'PRACTICE_CONTROLLED',
      difficulty: 'easy',
      prompt: 'Complete: "Could you ____ your seat belt, please?"',
      answer: 'fasten',
      explanation: '"Fasten your seat belt" is the standard aviation phrase.',
    },
    {
      id: `${cefrLevel}-${topic}-order-1`,
      kind: 'sentence_order',
      exerciseType: 'drag_drop',
      skill: 'WRITING',
      phase: 'PRACTICE_CONTROLLED',
      difficulty: 'medium',
      prompt: 'Order the sentence politely.',
      options: ['could', 'you', 'please', 'take', 'your', 'seat'],
      answer: ['could', 'you', 'please', 'take', 'your', 'seat'],
      explanation: 'Polite order improves clarity and authority.',
    },
    {
      id: `${cefrLevel}-${topic}-qcm-1`,
      kind: 'qcm',
      exerciseType: 'multiple_choice',
      skill: 'READING',
      phase: 'PRACTICE_CONTROLLED',
      difficulty: 'medium',
      prompt: `Choose the best response for a ${cefrLevel} passenger scenario.`,
      options: [
        'Sit down now.',
        'Please take your seat for takeoff.',
        'Move quickly there.',
      ],
      answer: 'Please take your seat for takeoff.',
      explanation: 'Professional service needs clarity and courtesy.',
    },
    {
      id: `${cefrLevel}-${topic}-read-1`,
      kind: 'qcm',
      exerciseType: 'multiple_choice',
      skill: 'READING',
      phase: 'PRACTICE_CONTROLLED',
      difficulty: 'medium',
      prompt: 'Read a short cabin message and identify the key detail.',
      options: [
        'The passenger asks for assistance.',
        'The flight is canceled.',
        'No service is available.',
      ],
      answer: 'The passenger asks for assistance.',
      explanation: 'Reading comprehension checks operational detail extraction.',
    },
    {
      id: `${cefrLevel}-${topic}-listen-1`,
      kind: 'audio_to_word',
      exerciseType: 'listening',
      skill: 'LISTENING',
      phase: 'PRACTICE_CONTROLLED',
      difficulty: 'medium',
      prompt: 'Listen and identify the passenger request.',
      answer: 'water with ice',
      explanation: 'Listening requires capturing exact service intent.',
    },
    {
      id: `${cefrLevel}-${topic}-write-1`,
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
      id: `${cefrLevel}-${topic}-oral-1`,
      kind: 'oral',
      exerciseType: 'speaking',
      skill: 'SPEAKING',
      phase: 'ORAL_PRODUCTION',
      difficulty: 'hard',
      prompt: 'Record a polite request for a passenger during takeoff.',
      expectedPhrase: 'Could you please take your seat and fasten your seat belt?',
      answer: 'Could you please take your seat and fasten your seat belt?',
      explanation: 'Final oral transfer in a realistic cabin scenario.',
    },
    {
      id: `${cefrLevel}-${topic}-final-1`,
      kind: 'qcm',
      exerciseType: 'multiple_choice',
      skill: 'READING',
      phase: 'FINAL_EVALUATION',
      difficulty: 'hard',
      prompt: 'Final check: select the most suitable professional response.',
      options: [
        'You should wait there.',
        'Good evening, I can help you right away.',
        'No, not possible.',
      ],
      answer: 'Good evening, I can help you right away.',
      explanation: 'Final evaluation validates tone, relevance and service quality.',
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
  let feedback = 'Tres bonne production orale.';
  if (score < 60) feedback = 'Prononciation a renforcer: plusieurs mots cles manquent.';
  else if (score < 85) feedback = 'Bon niveau, ameliorez la fluidite et la precision.';

  return { score, feedback };
}
