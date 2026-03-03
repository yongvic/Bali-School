#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const projectRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

console.log('📦 Prisma Database Initialization Script\n');

try {
  // Step 1: Generate Prisma Client
  console.log('1️⃣ Generating Prisma Client...');
  execSync('npx prisma generate', { 
    cwd: projectRoot,
    stdio: 'inherit' 
  });
  console.log('✅ Prisma Client generated\n');

  // Step 2: Run migrations
  console.log('2️⃣ Running database migrations...');
  execSync('npx prisma migrate deploy', { 
    cwd: projectRoot,
    stdio: 'inherit' 
  });
  console.log('✅ Migrations completed\n');

  // Step 3: Run seed (if exists)
  const seedPath = path.join(projectRoot, 'prisma', 'seed.ts');
  if (fs.existsSync(seedPath)) {
    console.log('3️⃣ Seeding database...');
    execSync('npx ts-node prisma/seed.ts', { 
      cwd: projectRoot,
      stdio: 'inherit' 
    });
    console.log('✅ Database seeded\n');
  }

  console.log('🎉 Database setup completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('❌ Error during database initialization:', error.message);
  process.exit(1);
}
