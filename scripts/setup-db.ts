import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function setupDatabase() {
  console.log("[v0] Starting database setup...");

  try {
    // Create a test admin user if it doesn't exist
    const adminExists = await prisma.user.findUnique({
      where: { email: "admin@balisschool.com" },
    });

    if (!adminExists) {
      const hashedPassword = await hash("AdminPassword123!", 10);
      const adminUser = await prisma.user.create({
        data: {
          email: "admin@balisschool.com",
          name: "Admin",
          password: hashedPassword,
          role: "ADMIN",
        },
      });
      console.log("[v0] Admin user created:", adminUser.id);
    } else {
      console.log("[v0] Admin user already exists");
    }

    // Create a test student user if it doesn't exist
    const studentExists = await prisma.user.findUnique({
      where: { email: "student@balisschool.com" },
    });

    if (!studentExists) {
      const hashedPassword = await hash("StudentPassword123!", 10);
      const studentUser = await prisma.user.create({
        data: {
          email: "student@balisschool.com",
          name: "Test Student",
          password: hashedPassword,
          role: "STUDENT",
          kikiPoints: {
            create: {
              totalPoints: 0,
              weeklyPoints: 0,
              monthlyPoints: 0,
              monthlyObjective: 300,
            },
          },
          airportMap: {
            create: {
              progressPercentage: 0,
              currentTerminal: 1,
              completedAreas: [],
            },
          },
        },
        include: {
          kikiPoints: true,
          airportMap: true,
        },
      });
      console.log("[v0] Student user created:", studentUser.id);
    } else {
      console.log("[v0] Student user already exists");
    }

    console.log("[v0] Database setup completed successfully!");
  } catch (error) {
    console.error("[v0] Database setup error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase();
