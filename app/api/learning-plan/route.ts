import { auth } from '@/auth';
import { normalizeCefrLevel } from '@/lib/learning-content';
import { rebuildPlanModules } from '@/lib/module-generation';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updatePlanSchema = z.object({
  weeklyFocus: z.array(z.string().min(2)).min(1).max(12).optional(),
  weeklyObjectives: z.array(z.string().min(3)).max(12).optional(),
  skillFocuses: z.array(z.string().min(3)).max(10).optional(),
  exerciseSuggestions: z.array(z.string().min(3)).max(10).optional(),
  goals30: z.array(z.string().min(5)).max(5).optional(),
  goals60: z.array(z.string().min(5)).max(5).optional(),
  goals90: z.array(z.string().min(5)).max(5).optional(),
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

    const updates: {
      weeklyFocus?: string[];
      weeklyObjectives?: string[];
      skillFocuses?: string[];
      exerciseSuggestions?: string[];
      goals30?: string[];
      goals60?: string[];
      goals90?: string[];
      estimatedCompletion?: Date;
    } = {};
    if (payload.weeklyFocus) {
      updates.weeklyFocus = payload.weeklyFocus;
      updates.estimatedCompletion = new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000);
    }
    if (payload.weeklyObjectives) {
      updates.weeklyObjectives = payload.weeklyObjectives;
    }
    if (payload.skillFocuses) {
      updates.skillFocuses = payload.skillFocuses;
    }
    if (payload.exerciseSuggestions) {
      updates.exerciseSuggestions = payload.exerciseSuggestions;
    }
    if (payload.goals30) {
      updates.goals30 = payload.goals30;
    }
    if (payload.goals60) {
      updates.goals60 = payload.goals60;
    }
    if (payload.goals90) {
      updates.goals90 = payload.goals90;
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


