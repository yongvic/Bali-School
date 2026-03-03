# Bali's School - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Prerequisites
- Node.js 18 or higher
- PostgreSQL database (Neon recommended)
- Git

### Step 1: Clone & Install
```bash
cd /vercel/share/v0-project
pnpm install
```

### Step 2: Configure Environment
```bash
# Copy example env file
cp .env.example .env.local

# Edit with your settings
nano .env.local
```

**Required values:**
- `DATABASE_URL`: Your Neon PostgreSQL connection string
- `NEXTAUTH_SECRET`: Generate with: `openssl rand -hex 32`
- `NEXTAUTH_URL`: `http://localhost:3000` (development)
- `BLOB_READ_WRITE_TOKEN`: Your Vercel Blob token (optional for local dev)

### Step 3: Setup Database
```bash
# Run migrations
pnpm prisma migrate deploy

# Seed with test data
pnpm ts-node scripts/setup-db.ts
```

### Step 4: Start Development Server
```bash
pnpm dev
```

Visit: **http://localhost:3000**

---

## 🔐 Test Accounts

### Admin Account
- Email: `admin@balisschool.com`
- Password: `AdminPassword123!`
- Access: Full admin dashboard + student features

### Student Account
- Email: `student@balisschool.com`
- Password: `StudentPassword123!`
- Access: All student features

---

## 📝 First Steps After Login

### As a Student:
1. **Complete Onboarding** → Sets up your personalized learning path
2. **Choose Exercise Mode** → Start with Passenger Service (easiest)
3. **Earn Points** → Complete exercises to unlock badges
4. **Submit Videos** → Get feedback from instructors
5. **Track Progress** → Monitor your learning journey

### As an Admin:
1. **View Dashboard** → See student statistics
2. **Review Videos** → Approve/reject submissions with feedback
3. **Monitor Progress** → Track student completion rates

---

## 🛠️ Common Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Run production build locally
pnpm start

# Run TypeScript type check
pnpm tsc --noEmit

# Format code
pnpm format

# Prisma commands
pnpm prisma studio      # Open database GUI
pnpm prisma migrate dev # Create new migration
pnpm prisma generate    # Regenerate Prisma client

# Database setup
pnpm ts-node scripts/setup-db.ts

# Build testing
bash scripts/test-build.sh
```

---

## 🌐 Deployment to Vercel

### One-Click Deploy (Recommended)
1. Push code to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy

### Manual Deploy
```bash
# Install Vercel CLI
pnpm i -g vercel

# Deploy
vercel deploy
```

**Required env vars on Vercel:**
- `DATABASE_URL` (Neon)
- `NEXTAUTH_SECRET`
- `BLOB_READ_WRITE_TOKEN`

---

## 🐛 Troubleshooting

### "Database connection failed"
- Check `DATABASE_URL` in `.env.local`
- Verify PostgreSQL is running
- Test connection: `psql $DATABASE_URL`

### "NextAuth error"
- Generate new secret: `openssl rand -hex 32`
- Clear browser cookies
- Restart dev server

### "Video upload fails"
- Check `BLOB_READ_WRITE_TOKEN`
- Verify Vercel Blob is connected
- Check file size (max 100MB)

### "Prisma client errors"
```bash
# Regenerate client
pnpm prisma generate

# Reset database (⚠️ deletes all data)
pnpm prisma migrate reset
```

---

## 📚 Project Structure

```
/vercel/share/v0-project/
├── app/                    # Next.js App Router pages & APIs
├── components/ui/          # shadcn/ui components
├── lib/                    # Utilities (prisma, utils)
├── prisma/                 # Database schema & migrations
├── scripts/                # Utilities scripts
├── auth.ts                 # NextAuth.js config
├── middleware.ts           # Route protection
└── PROJECT_SUMMARY.md      # Full project documentation
```

---

## 🎯 Key Features Overview

| Feature | Status | Link |
|---------|--------|------|
| User Authentication | ✅ Complete | `/auth/signin`, `/auth/signup` |
| Student Dashboard | ✅ Complete | `/dashboard` |
| Learning Center | ✅ Complete | `/learn` (6 exercise modes) |
| Gamification | ✅ Complete | `/gamification` (badges + points) |
| Video Submission | ✅ Complete | `/submit-video` |
| Admin Panel | ✅ Complete | `/admin` |
| Progress Tracking | ✅ Complete | `/progress` |
| Onboarding | ✅ Complete | `/onboarding` |

---

## 📞 Support

For issues or questions:
1. Check `PROJECT_SUMMARY.md` for detailed documentation
2. Review error logs in console
3. Test database connection: `pnpm prisma studio`
4. Run build test: `bash scripts/test-build.sh`

---

## ✅ Deployment Checklist

- [ ] Environment variables set on Vercel
- [ ] Database migrations applied
- [ ] Test accounts created
- [ ] Landing page loads
- [ ] Sign up works
- [ ] Sign in works
- [ ] Dashboard displays
- [ ] Admin can see videos
- [ ] Exercise modes accessible
- [ ] Video upload functional

---

**Ready to launch? Let's go! 🚀**

Last updated: March 3, 2026
