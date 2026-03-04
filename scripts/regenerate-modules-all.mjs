console.error(
  [
    'This legacy script has been disabled to prevent generating inconsistent modules.',
    'Use the centralized CEFR generation flow instead:',
    '1) Update learner level via /learning-plan (PUT /api/learning-plan with englishLevel)',
    '2) Or run onboarding completion flow (/api/onboarding/complete).',
  ].join('\n')
);
process.exit(1);
