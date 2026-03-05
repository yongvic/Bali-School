import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return Response.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const onboarding = await prisma.onboarding.findUnique({
        where: { userId: session.user.id },
        select: {
            englishLevel: true,
            airportCode: true,
            airportName: true,
            professionGoal: true,
            dailyMinutes: true,
            weeklyGoal: true,
        },
    });

    if (!onboarding) {
        return Response.json({ message: 'Profil non trouvé' }, { status: 404 });
    }

    return Response.json(onboarding);
}
