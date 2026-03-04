import { auth } from '@/auth';
import { createModuleBlueprint, levelByWeek, normalizeCefrLevel } from '@/lib/learning-content';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updatePlanSchema = z.object({
  weeklyFocus: z.array(z.string().min(2)).min(1).max(12).optional(),
  englishLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).optional(),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return Response.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const plan = await prisma.learningPlan.findUnique({
      where: { userId: session.user.id },
      include: {
        modules: {
          orderBy: { week: 'asc' },
        },
      },
    });

    if (!plan) {
      return Response.json(
        { message: "Aucun plan d'apprentissage trouvé" },
        { status: 404 }
      );
    }

    return Response.json(plan);
  } catch (error) {
    console.error('Learning plan error:', error);
    return Response.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const body = await req.json();
    const payload = updatePlanSchema.parse(body);

    const plan = await prisma.learningPlan.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!plan) {
      return Response.json({ message: "Aucun plan d'apprentissage trouvé" }, { status: 404 });
    }

    const updates: { weeklyFocus?: string[]; estimatedCompletion?: Date } = {};
    if (payload.weeklyFocus) {
      updates.weeklyFocus = payload.weeklyFocus;
      updates.estimatedCompletion = new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000);
    }

    await prisma.learningPlan.update({
      where: { id: plan.id },
      data: updates,
    });

    if (payload.englishLevel) {
      const normalizedLevel = normalizeCefrLevel(payload.englishLevel);
      await prisma.onboarding.updateMany({
        where: { userId: session.user.id },
        data: { englishLevel: normalizedLevel },
      });
      await rebuildPlanModules(plan.id, session.user.id, normalizedLevel);
    }

    return Response.json({ message: 'Plan mis à jour avec succès' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ message: 'Données invalides', errors: error.errors }, { status: 400 });
    }

    console.error('Learning plan update error:', error);
    return Response.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}

async function rebuildPlanModules(planId: string, userId: string, englishLevel: string) {
  await prisma.exercise.deleteMany({
    where: { module: { planId } },
  });
  await prisma.module.deleteMany({
    where: { planId },
  });

  const levelPointTarget = englishLevel.startsWith('A') ? 220 : englishLevel.startsWith('B') ? 280 : 340;
  const modeTemplates: Array<{ mode: any; title: string; description: string; points: number; topic: string }> = [
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

    const picks = [modeTemplates[(week - 1) % modeTemplates.length], modeTemplates[week % modeTemplates.length]];
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

