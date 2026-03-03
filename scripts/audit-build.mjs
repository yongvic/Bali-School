import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

const criticalFiles = [
  'auth.ts',
  'auth.config.ts',
  'middleware.ts',
  'package.json',
  'tsconfig.json',
  'next.config.mjs',
  'app/layout.tsx',
  'app/page.tsx',
  'app/globals.css',
  'lib/prisma.ts',
  'lib/utils.ts',
  'hooks/use-mobile.ts',
  'prisma/schema.prisma',
  'components/ui/button.tsx',
  'components/ui/card.tsx',
  'components/ui/input.tsx',
];

const requiredPages = [
  'app/page.tsx',
  'app/auth/signin/page.tsx',
  'app/auth/signup/page.tsx',
  'app/dashboard/page.tsx',
  'app/onboarding/page.tsx',
  'app/learn/page.tsx',
  'app/gamification/page.tsx',
  'app/admin/page.tsx',
];

const requiredAPIs = [
  'app/api/auth/[...nextauth]/route.ts',
  'app/api/dashboard/stats/route.ts',
  'app/api/admin/stats/route.ts',
  'app/api/admin/videos/route.ts',
  'app/api/admin/videos/[id]/route.ts',
];

console.log('🔍 Starting Build Audit...\n');

let missingFiles = [];
let missingPages = [];
let missingAPIs = [];

// Check critical files
console.log('Checking critical files:');
for (const file of criticalFiles) {
  const filePath = path.join(projectRoot, file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✓ ${file}`);
  } else {
    console.log(`  ✗ ${file}`);
    missingFiles.push(file);
  }
}

console.log('\nChecking required pages:');
for (const page of requiredPages) {
  const filePath = path.join(projectRoot, page);
  if (fs.existsSync(filePath)) {
    console.log(`  ✓ ${page}`);
  } else {
    console.log(`  ✗ ${page}`);
    missingPages.push(page);
  }
}

console.log('\nChecking required API routes:');
for (const api of requiredAPIs) {
  const filePath = path.join(projectRoot, api);
  if (fs.existsSync(filePath)) {
    console.log(`  ✓ ${api}`);
  } else {
    console.log(`  ✗ ${api}`);
    missingAPIs.push(api);
  }
}

// Summary
console.log('\n📊 Audit Summary:');
console.log(`  Critical files: ${criticalFiles.length - missingFiles.length}/${criticalFiles.length}`);
console.log(`  Pages: ${requiredPages.length - missingPages.length}/${requiredPages.length}`);
console.log(`  API routes: ${requiredAPIs.length - missingAPIs.length}/${requiredAPIs.length}`);

if (missingFiles.length === 0 && missingPages.length === 0 && missingAPIs.length === 0) {
  console.log('\n✅ All required files present! Ready for build.');
  process.exit(0);
} else {
  console.log('\n❌ Missing files detected. Cannot proceed with build.');
  process.exit(1);
}
