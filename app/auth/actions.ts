'use server';

import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { z } from 'zod';

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function signup(data: unknown) {
  try {
    const validatedData = signupSchema.parse(data);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return { error: 'Email already in use' };
    }

    // Hash password
    const hashedPassword = await hash(validatedData.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: 'STUDENT',
      },
    });

    // Initialize Kiki Points
    await prisma.kikiPoints.create({
      data: {
        userId: user.id,
        totalPoints: 0,
        weeklyPoints: 0,
      },
    });

    // Initialize Airport Map
    await prisma.airportMap.create({
      data: {
        userId: user.id,
        progressPercentage: 0,
        currentTerminal: 1,
      },
    });

    return { success: true, userId: user.id };
  } catch (error) {
    console.error('Signup error:', error);
    if (error instanceof z.ZodError) {
      return { error: 'Invalid form data' };
    }
    return { error: 'Failed to create account' };
  }
}
