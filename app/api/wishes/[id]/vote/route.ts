import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    const wish = await prisma.wish.findUnique({ where: { id } });
    if (!wish) {
      return Response.json({ message: 'Souhait introuvable' }, { status: 404 });
    }

    const updated = await prisma.wish.update({
      where: { id },
      data: { votes: { increment: 1 } },
    });

    return Response.json(updated);
  } catch (error) {
    console.error('Wish vote error:', error);
    return Response.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}

