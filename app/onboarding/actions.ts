'use server';

import { prisma } from '@/lib/prisma';
import { rebuildPlanModules } from '@/lib/module-generation';
import { z } from 'zod';

const onboardingSchema = z.object({
  userId: z.string(),
  professionGoal: z.string(),
  englishLevel: z.string(),
  dailyMinutes: z.number(),
  weeklyGoal: z.number(),
  challenges: z.array(z.string()),
  motivation: z.string(),
  airportCode: z.string().optional(),
  airportName: z.string().optional(),
});

export async function createOnboarding(data: unknown) {
  try {
    const validatedData = onboardingSchema.parse(data);

    // Upsert to avoid unique constraint on userId when onboarding is re-opened.
    const onboarding = await prisma.onboarding.upsert({
      where: { userId: validatedData.userId },
      create: {
        userId: validatedData.userId,
        professionGoal: validatedData.professionGoal,
        englishLevel: validatedData.englishLevel,
        dailyMinutes: validatedData.dailyMinutes,
        weeklyGoal: validatedData.weeklyGoal,
        challenges: validatedData.challenges,
        motivation: validatedData.motivation,
        airportCode: validatedData.airportCode || null,
        airportName: validatedData.airportName || null,
        readyInWeeks: 12,
        comfortableOnCamera: true,
        biggestDifficulty: null,
      },
      update: {
        professionGoal: validatedData.professionGoal,
        englishLevel: validatedData.englishLevel,
        dailyMinutes: validatedData.dailyMinutes,
        weeklyGoal: validatedData.weeklyGoal,
        challenges: validatedData.challenges,
        motivation: validatedData.motivation,
        airportCode: validatedData.airportCode || null,
        airportName: validatedData.airportName || null,
        readyInWeeks: 12,
        comfortableOnCamera: true,
      },
    });

    // Keep this legacy action safe if invoked elsewhere.
    const weeklyFocus = generateWeeklyFocus(validatedData.challenges, validatedData.englishLevel);
    
    const learningPlan = await prisma.learningPlan.upsert({
      where: { userId: validatedData.userId },
      create: {
        userId: validatedData.userId,
        weeklyFocus: weeklyFocus,
        estimatedCompletion: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      },
      update: {
        weeklyFocus: weeklyFocus,
        estimatedCompletion: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    });

    await rebuildPlanModules(learningPlan.id, validatedData.userId, validatedData.englishLevel);

    return { success: true, onboardingId: onboarding.id, planId: learningPlan.id };
  } catch (error) {
    console.error('Onboarding error:', error);
    if (error instanceof z.ZodError) {
      return { error: 'Invalid form data' };
    }
    return { error: 'Failed to create onboarding' };
  }
}

function generateWeeklyFocus(challenges: string[], level: string): string[] {
  const focusAreas = new Map([
    ['Pronunciation', 'Accent Training & Pronunciation'],
    ['Listening comprehension', 'Listening & Comprehension'],
    ['Grammar and syntax', 'Grammar & Sentence Structure'],
    ['Customer service phrases', 'Customer Service Scenarios'],
    ['Emergency procedures', 'Safety & Emergency Phrases'],
    ['Accent training', 'Accent Neutralization'],
    ['Business English', 'Professional Communication'],
    ['Confidence speaking', 'Fluency & Confidence Building'],
  ]);

  const weeks: string[] = [];
  const selectedFocus = challenges.slice(0, 8).map(c => focusAreas.get(c) || c);

  // Week 1-2: Foundations
  weeks.push('English Foundations & Basics');
  weeks.push('Cabin Service Basics');

  // Week 3-10: Focus areas
  for (let i = 0; i < Math.min(8, selectedFocus.length); i++) {
    weeks.push(selectedFocus[i]);
  }

  // Week 11-12: Review & Integration
  while (weeks.length < 12) {
    weeks.push('Comprehensive Review & Integration');
  }

  return weeks;
}
