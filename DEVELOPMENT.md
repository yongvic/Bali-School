# Development Guide - Bali's School

## Project Overview

Bali's School is a full-stack English learning platform for aviation professionals. It features:

- **User Authentication**: NextAuth.js with email/password and GitHub OAuth
- **Learning System**: 12-week program with 8 exercise modes and video submissions
- **Gamification**: Kiki Points system with 8 unlockable badges
- **Admin Dashboard**: Video review, student management, and content moderation
- **Storage**: Vercel Blob for video uploads

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Storage**: Vercel Blob
- **UI Components**: shadcn/ui
- **Package Manager**: pnpm

## Project Structure

```
app/
├── (auth)/              # Auth pages (login, signup, onboarding)
├── admin/               # Admin dashboard and review pages
├── api/                 # API routes
│   ├── admin/          # Admin endpoints
│   ├── auth/           # Authentication endpoints
│   ├── exercises/      # Exercise endpoints
│   ├── gamification/   # Gamification endpoints
│   ├── modules/        # Module endpoints
│   ├── onboarding/     # Onboarding endpoints
│   └── videos/         # Video upload and management
├── dashboard/          # Student dashboard
├── gamification/       # Gamification page
├── learning/           # Learning platform (exercises, modules)
└── page.tsx           # Landing page

components/
├── learning/           # Learning components (exercises, progress)
├── gamification/       # Gamification components (badges, points)
├── ui/                # shadcn/ui components
└── Navigation.tsx     # Main navigation

lib/
├── prisma.ts          # Prisma client
├── utils.ts           # Utility functions
├── gamification.ts    # Gamification logic
└── video-validation.ts # Video validation

prisma/
├── schema.prisma      # Database schema
└── seed.ts           # Seed script

public/                # Static assets
```

## Getting Started

### 1. Environment Setup

```bash
# Install dependencies
pnpm install

# Create .env.local
cp .env.example .env.local
```

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<random-secret>"

# GitHub OAuth (optional)
GITHUB_ID="<your-id>"
GITHUB_SECRET="<your-secret>"

# Vercel Blob (optional, for file uploads)
BLOB_READ_WRITE_TOKEN="<your-token>"
```

### 2. Database Setup

```bash
# Push schema to database
pnpm prisma db push

# Open Prisma Studio to view data
pnpm prisma studio
```

### 3. Run Development Server

```bash
pnpm dev
```

Visit http://localhost:3000

## Key Features Implementation

### 1. Authentication

Located in `/app/auth/` and `/app/api/auth/`

- Email/password with bcrypt hashing
- GitHub OAuth integration
- NextAuth.js session management
- Role-based access control (Student/Admin)

### 2. Learning System

Located in `/app/learning/` and `/app/api/`

**Exercise Modes** (8 types):
- PASSENGER: Customer service scenarios
- ACCENT_TRAINING: Pronunciation practice
- SECRET_CHALLENGE: Unexpected scenarios
- WHEEL_OF_ENGLISH: Random topic speaking
- ROLE_PLAY: Dialogue practice
- LISTENING: Comprehension
- EMERGENCY: Safety procedures
- CUSTOM: User-created

**Video Submission Flow**:
1. User records video using MediaRecorder API
2. Client-side validation (type, size, duration)
3. Upload to Vercel Blob
4. Store metadata in database
5. Admin reviews and provides feedback
6. Points awarded on approval

### 3. Gamification

Located in `/components/gamification/` and `/lib/gamification.ts`

**Kiki Points System**:
- 50-80 points per exercise completion
- 25 bonus points for video approval
- 100 points for badge unlocks
- 10 points daily streak bonus
- Weekly reset with 300-point goal

**Badges** (8 total):
- FIRST_EXERCISE: Complete 1 exercise
- PRONUNCIATION_STAR: 5 accent exercises
- CABIN_MASTER: 10 passenger exercises
- SAFETY_GURU: 5 emergency exercises
- CONSISTENCY_KING: 20+ exercises
- GRAMMAR_CHAMPION: 3 role-plays
- LISTENING_LEGEND: 3 listening exercises
- WHEEL_WINNER: 5 wheel challenges

### 4. Admin Dashboard

Located in `/app/admin/`

**Capabilities**:
- View student statistics
- Review pending videos
- Provide structured feedback
- Grade submissions (0-100)
- Award badges automatically

## Database Schema

Key tables:

```prisma
User
├── id (unique)
├── email (unique)
├── name
├── role (STUDENT | ADMIN)
├── password (hashed)

LearningPlan
├── id
├── userId (foreign key)
├── weeklyFocus
├── estimatedCompletion

Module
├── id
├── planId (foreign key)
├── week
├── title
├── targetPoints

Exercise
├── id
├── userId (foreign key)
├── moduleId (foreign key)
├── mode (enum: 8 types)
├── title
├── content
├── pointsValue
├── completed

Video
├── id
├── userId (foreign key)
├── exerciseId (foreign key)
├── blobUrl
├── status (PENDING | APPROVED | REVISION_NEEDED | REJECTED)
├── duration

AdminFeedback
├── id
├── videoId (foreign key)
├── adminId (foreign key)
├── decision
├── textFeedback
├── grade
├── strengths (array)
├── improvements (array)

KikiPoints
├── id
├── userId (foreign key)
├── totalPoints
├── weeklyPoints
├── weekStartDate

Badge
├── id
├── userId (foreign key)
├── badgeType
├── unlockedAt
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Create account
- `POST /api/auth/signin` - Login
- `GET /api/auth/session` - Get current session
- `POST /api/auth/signout` - Logout

### Learning

- `GET /api/modules/[id]` - Get module with exercises
- `GET /api/exercises/[id]` - Get exercise details
- `POST /api/videos/upload` - Upload video submission
- `GET /api/gamification` - Get points and badges

### Admin

- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/videos/pending` - List pending videos
- `GET /api/admin/students` - List all students
- `GET /api/admin/videos/[id]` - Get video for review
- `POST /api/admin/videos/[id]/feedback` - Submit feedback

### Onboarding

- `POST /api/onboarding/complete` - Complete onboarding

## Development Workflow

### Adding a New Feature

1. **Database**: Update `prisma/schema.prisma`
2. **Migration**: Run `pnpm prisma migrate dev`
3. **API**: Create endpoint in `/app/api/`
4. **Frontend**: Create component in `/components/`
5. **Page**: Create route in `/app/`
6. **Testing**: Test locally with `pnpm dev`

### Styling

- Use Tailwind CSS classes
- Follow shadcn/ui component patterns
- Color scheme: Primary (blue), Success (green), Warning (orange), Danger (red)
- Dark mode supported by default

### Code Organization

- Keep components focused and reusable
- Use TypeScript for type safety
- Organize by feature, not by layer
- Keep API logic in route handlers
- Use Prisma for all database queries

## Common Tasks

### Creating a New Exercise Mode

1. Add to `Exercise.mode` enum in schema
2. Create exercise template in gamification.ts
3. Add to exercise card mode colors/icons
4. Add to exercise mode guide in exercise page

### Adding a New Badge

1. Add to Badge definitions in BadgeDisplay.tsx
2. Add unlock condition in `checkAndUnlockBadges` function
3. Test with test user account

### Modifying Gamification Points

1. Update values in `completeExercise` function
2. Update display in gamification page
3. Document changes in this file

## Testing

### Manual Testing

1. **Signup**: Create test account
2. **Onboarding**: Complete 12-week plan selection
3. **Learning**: Start exercises and record videos
4. **Gamification**: Check points and badges
5. **Admin**: Review submissions

### Database Testing

```bash
# Open Prisma Studio
pnpm prisma studio

# Check data relationships
# Verify foreign keys
# Test queries
```

## Debugging

### Enable Debug Logging

Add to code:

```typescript
console.log('[Component] Debug message:', data);
```

View in browser console or server logs.

### Database Queries

Use Prisma Studio or add logging:

```typescript
await prisma.$queryRaw`SELECT * FROM "User"`;
```

### Video Upload Issues

Check:
1. File type validation in `video-validation.ts`
2. File size limits (100MB max)
3. Video duration (10 sec to 5 min)
4. Vercel Blob token configuration
5. Browser console errors

## Performance Tips

1. **Images**: Use Next.js Image component
2. **Queries**: Use Prisma select to limit fields
3. **Caching**: Leverage Next.js caching headers
4. **Splitting**: Code-split large components
5. **Lazy Loading**: Lazy load heavy components

## Deployment Notes

See `DEPLOYMENT.md` for production deployment guide.

Key points:
- Set NEXTAUTH_SECRET to random 32-char string
- Configure database backup strategy
- Monitor error logs regularly
- Test rollback procedure

## Useful Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm prisma studio   # Open database GUI

# Building
pnpm build           # Build for production
pnpm start           # Start production server

# Database
pnpm prisma migrate dev  # Create migration
pnpm prisma db push     # Push schema
pnpm prisma seed        # Run seed script

# Type checking
pnpm tsc --noEmit     # Check TypeScript

# Linting
pnpm lint             # Run ESLint
```

## Resources

- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- NextAuth.js: https://next-auth.js.org
- Tailwind: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com
