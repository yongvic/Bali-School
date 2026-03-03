import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = registerSchema.parse(body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return Response.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'STUDENT',
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    // Initialize KikiPoints and AirportMap
    await Promise.all([
      prisma.kikiPoints.create({
        data: {
          userId: user.id,
          totalPoints: 0,
          weeklyPoints: 0,
          monthlyPoints: 0,
          monthlyObjective: 300,
        },
      }),
      prisma.airportMap.create({
        data: {
          userId: user.id,
          progressPercentage: 0,
          currentTerminal: 1,
        },
      }),
    ]);

    return Response.json(
      { message: 'User created successfully', user },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { message: 'Invalid input', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Register error:', error);
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
