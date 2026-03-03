# Bali's School - Project Summary

## Project Overview

Bali's School is a **gamified English learning platform** designed specifically for flight attendants and aviation professionals. The application combines interactive exercises, video submission, admin review systems, and a comprehensive gamification system with Kiki Points and achievement badges.

**Tech Stack:**
- Frontend: Next.js 16 (App Router), React 19, TailwindCSS v4
- Backend: Next.js API Routes, Prisma ORM
- Database: Neon (PostgreSQL)
- Authentication: NextAuth.js with credentials provider
- File Storage: Vercel Blob (for video uploads)
- Notifications: Sonner (toast messages)
- UI Components: shadcn/ui
- Form Handling: React Hook Form

---

## Project Structure

```
/vercel/share/v0-project/
├── app/
│   ├── layout.tsx                    # Root layout with metadata & fonts
│   ├── page.tsx                      # Landing page
│   ├── globals.css                   # TailwindCSS + design tokens
│   ├── auth/
│   │   ├── signin/page.tsx          # Sign in page
│   │   ├── signup/page.tsx          # Sign up page
│   │   ├── actions.ts               # Server actions for auth
│   │   └── error.tsx                # Auth error handling
│   ├── dashboard/page.tsx            # Main dashboard (students & admins)
│   ├── learn/
│   │   ├── page.tsx                 # Learning center with 6 exercise modes
│   │   └── [mode]/page.tsx          # Dynamic exercise mode page
│   ├── gamification/page.tsx         # Achievements & badges
│   ├── progress/page.tsx             # User progress tracking
│   ├── submit-video/page.tsx         # Video submission interface
│   ├── admin/page.tsx                # Admin dashboard
│   ├── onboarding/page.tsx           # 5-step onboarding wizard
│   └── api/
│       ├── auth/[...nextauth]/route.ts     # NextAuth.js routes
│       ├── dashboard/stats/route.ts        # Dashboard statistics
│       ├── learning/modules/route.ts       # Learning modules
│       ├── exercises/route.ts              # Exercise list
│       ├── exercises/complete/route.ts     # Complete exercise
│       ├── user/progress/route.ts          # User progress API
│       ├── videos/upload/route.ts          # Video upload handler
│       ├── admin/stats/route.ts            # Admin statistics
│       ├── admin/videos/route.ts           # Admin video list
│       └── admin/videos/[id]/route.ts      # Video review/feedback
├── components/
│   └── ui/                           # shadcn/ui components
│       ├── button.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── card.tsx
│       ├── badge.tsx
│       ├── checkbox.tsx
│       ├── radio-group.tsx
│       ├── progress.tsx
│       └── ... (other UI components)
├── hooks/
│   └── use-mobile.ts                 # Mobile detection hook
├── lib/
│   ├── utils.ts                      # Utility functions (cn, etc)
│   └── prisma.ts                     # Prisma client singleton
├── prisma/
│   ├── schema.prisma                 # Database schema
│   └── migrations/                   # Database migrations
├── auth.ts                           # NextAuth.js configuration
├── middleware.ts                     # Route protection middleware
├── next.config.mjs                   # Next.js configuration
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript configuration
└── scripts/
    ├── setup-db.ts                   # Database initialization
    ├── test-build.sh                 # Build testing script
    └── audit-build.mjs               # Project audit script
```

---

## Key Features

### 1. **Authentication System**
- Credentials-based authentication with bcrypt password hashing
- Role-based access control (Student & Admin)
- NextAuth.js integration with secure session management
- Sign-up with account verification
- Password validation (minimum 8 characters)

### 2. **Learning Center**
Six exercise modes for comprehensive English learning:
- **Passenger Service** (50 pts): Handle customer requests
- **Accent Training** (60 pts): Pronunciation improvement
- **Emergency Procedures** (75 pts): Critical safety phrases
- **Role Play Dialogue** (55 pts): Interactive conversations
- **Listening Comprehension** (45 pts): Audio understanding
- **Wheel of English** (50 pts): Random scenario challenges

### 3. **Gamification System**
- **Kiki Points**: Earned by completing exercises and submitting videos
  - Exercise completion: 50-75 points
  - Video submission: 20 points
  - Badge unlock: 100 points
  - Daily streak bonus: 10 points/day
- **Badges**: 8 achievement badges to unlock
  - First Exercise, Pronunciation Star, Cabin Master
  - Safety Guru, Consistency King, Grammar Champion
  - Listening Legend, Wheel Winner
- **Weekly Goals**: Target of 300+ points per week
- **Progress Tracking**: Visual progress bars and statistics

### 4. **Video Submission System**
- Upload practice videos for instructor review
- Support for WebM, MP4, QuickTime, AVI formats
- Maximum file size: 100MB
- Video storage via Vercel Blob
- Automatic pending status, admin review required

### 5. **Admin Dashboard**
- Monitor student progress and submissions
- Review pending videos
- Provide constructive feedback
- Approve or reject submissions with points
- View comprehensive statistics:
  - Total students
  - Pending videos queue
  - Videos reviewed
  - Average completion rate

### 6. **Onboarding Wizard**
5-step onboarding process:
1. **Goal Selection**: Flight attendant, profession improvement, personal growth
2. **English Level**: A1-C2 CEFR levels
3. **Time Availability**: Daily minutes and weekly hours
4. **Learning Challenges**: Select focus areas (pronunciation, grammar, etc.)
5. **Airport Information**: Home airport code and motivation

### 7. **Progress Tracking**
- Total points earned
- Weekly and monthly progress
- Exercise completion statistics
- Video submission count
- Learning level assessment
- Visual progress indicators

---

## Database Schema (Prisma)

**Core Models:**
- `User`: Students and admins with authentication
- `KikiPoints`: Point tracking per user
- `Badge`: Achievement tracking
- `Exercise`: Learning exercises
- `Video`: Submitted practice videos
- `AdminFeedback`: Instructor feedback on videos
- `LearningPlan`: Personalized learning paths
- `AirportMap`: Progress tracking for airport terminal learning

**Key Relationships:**
- User → KikiPoints (1:1)
- User → Exercise (1:Many)
- User → Video (1:Many)
- User → Badge (1:Many)
- Video → AdminFeedback (1:1)
- User → LearningPlan (1:1)

---

## API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth.js credentials flow

### Student Endpoints
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/learning/modules` - Learning modules
- `GET /api/exercises` - Exercise list
- `POST /api/exercises/complete` - Mark exercise complete
- `GET /api/user/progress` - User progress data
- `POST /api/videos/upload` - Upload practice video

### Admin Endpoints
- `GET /api/admin/stats` - Admin statistics
- `GET /api/admin/videos` - Pending videos list
- `PATCH /api/admin/videos/[id]` - Review and feedback

---

## Security Features

✅ **Password Security**
- bcryptjs hashing with 10 salt rounds
- Minimum 8-character passwords
- Confirmation password validation

✅ **Session Management**
- HTTP-only secure cookies
- CSRF protection via NextAuth.js
- Role-based route protection via middleware

✅ **Data Validation**
- Input validation on all forms
- File type validation (videos only)
- File size limits (100MB max)
- Parameterized database queries via Prisma

✅ **Access Control**
- Protected routes via middleware
- Role-based dashboard access
- Admin-only API endpoints

---

## Styling & Design

**Design System:**
- Color scheme: Blue, Purple, Amber, Green (primary + accent)
- Neutral palette: Slate shades
- Typography: Geist (sans-serif), Geist Mono

**Layout Framework:**
- Flexbox-first for responsive design
- Mobile-first approach
- TailwindCSS v4 utilities
- Dark mode support

**Components:**
- Gradient backgrounds for visual interest
- Card-based layouts for content organization
- Icons from lucide-react
- Toast notifications via Sonner

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (Neon)
- npm/pnpm package manager

### Installation
```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Initialize database
pnpm prisma migrate deploy
pnpm ts-node scripts/setup-db.ts

# Run development server
pnpm dev
```

### Environment Variables
```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=<generate-random-secret>
NEXTAUTH_URL=http://localhost:3000
BLOB_READ_WRITE_TOKEN=<vercel-blob-token>
```

### Build & Deploy
```bash
# Test build locally
pnpm build

# Deploy to Vercel
vercel deploy
```

---

## Testing & Validation

**Test Accounts:**
- Admin: `admin@balisschool.com` / `AdminPassword123!`
- Student: `student@balisschool.com` / `StudentPassword123!`

**Build Verification:**
```bash
bash scripts/test-build.sh
```

Checks:
- Dependency installation
- TypeScript compilation
- Next.js build output
- Build artifacts validation

---

## Completed Features ✅

- [x] User authentication (sign up, sign in, sign out)
- [x] Role-based access control (Student & Admin)
- [x] Landing page with features overview
- [x] Student dashboard with quick actions
- [x] 6 exercise modes in learning center
- [x] Gamification system (Kiki Points + Badges)
- [x] Video submission and upload
- [x] Admin dashboard for reviewing submissions
- [x] User progress tracking
- [x] Onboarding wizard (5 steps)
- [x] Database schema with Prisma
- [x] API routes for all core features
- [x] Middleware for route protection
- [x] NextAuth.js integration
- [x] Responsive UI with TailwindCSS
- [x] Toast notifications with Sonner

---

## Future Enhancements

- [ ] AI-powered exercise generation
- [ ] Real-time video processing for duration extraction
- [ ] Advanced analytics dashboard
- [ ] Email notifications for feedback
- [ ] Mobile app (React Native)
- [ ] Payment integration for premium features
- [ ] Leaderboards and competitions
- [ ] Certificate generation
- [ ] Multi-language support

---

## Project Status: ✅ READY FOR DEPLOYMENT

The project is fully functional with all core features implemented and ready for production deployment on Vercel. All pages, API routes, authentication, and database integration are complete and tested.

**Last Updated:** March 3, 2026
