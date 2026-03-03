import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@balieschool.com' },
    update: {},
    create: {
      email: 'admin@balieschool.com',
      name: 'Admin',
      password: await bcrypt.hash('AdminPassword123!', 10),
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create demo student user
  const studentUser = await prisma.user.upsert({
    where: { email: 'student@balieschool.com' },
    update: {},
    create: {
      email: 'student@balieschool.com',
      name: 'Demo Student',
      password: await bcrypt.hash('StudentPassword123!', 10),
      role: 'STUDENT',
    },
  });

  console.log('✅ Student user created:', studentUser.email);

  console.log('🎉 Database seeding completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
