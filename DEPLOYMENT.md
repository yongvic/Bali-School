# Deployment Guide - Bali's School

This guide covers deploying Bali's School to production.

## Prerequisites

- Node.js 18+ and pnpm
- Vercel account
- PostgreSQL database (Supabase, Neon, or similar)
- GitHub repository connected to Vercel

## Environment Setup

### 1. Database Configuration

Set up your PostgreSQL database and add these environment variables to Vercel:

```env
DATABASE_URL=postgresql://user:password@host:5432/bali_school
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
```

### 2. Authentication

NextAuth.js is configured with GitHub OAuth and email/password authentication:

```env
GITHUB_ID=<your-github-id>
GITHUB_SECRET=<your-github-secret>
```

### 3. File Storage

Vercel Blob is used for video storage:

```env
BLOB_READ_WRITE_TOKEN=<vercel-blob-token>
```

Get this from your Vercel project settings → Storage.

### 4. Email (Optional)

For email notifications:

```env
SMTP_HOST=<your-smtp-host>
SMTP_PORT=<smtp-port>
SMTP_USER=<your-email>
SMTP_PASSWORD=<your-password>
SENDER_EMAIL=<noreply@yourdomain.com>
```

## Database Setup

### 1. Run Migrations

```bash
# Push schema to database
pnpm prisma db push

# (Optional) Create seed data
pnpm prisma db seed
```

### 2. Create Admin User

Connect to your database and create an admin user:

```sql
INSERT INTO "User" (id, email, name, role, password, createdAt, updatedAt) 
VALUES (
  'admin-' || gen_random_uuid()::text,
  'admin@example.com',
  'Admin User',
  'ADMIN',
  '<hashed-password>',
  NOW(),
  NOW()
);
```

Password hashing should be done with bcrypt during signup.

## Deployment Steps

### 1. GitHub Integration

1. Push your code to GitHub
2. Connect your repo to Vercel
3. Vercel will auto-detect Next.js and configure build settings

### 2. Environment Variables

In Vercel project settings:

1. Go to Settings → Environment Variables
2. Add all environment variables listed above
3. Apply to Production environment

### 3. Deploy

```bash
# Option 1: Git push (automatic)
git push origin main

# Option 2: Manual deployment
vercel --prod
```

### 4. Verify Deployment

After deployment:

1. Visit your production URL
2. Test user signup and login
3. Test video upload functionality
4. Verify admin dashboard access

## Performance Optimization

### 1. Image Optimization

- All images are optimized via Next.js Image component
- Use WebP format where possible
- Lazy load images below the fold

### 2. Video Handling

- Videos are stored in Vercel Blob (edge-optimized)
- Client-side validation prevents oversized uploads
- Compression is handled by the browser MediaRecorder API

### 3. Database Queries

- Database queries use connection pooling
- Indexes on frequently queried fields:
  - `User.email` (authentication)
  - `Exercise.userId` (user data)
  - `Video.status` (admin queries)
  - `Module.planId` (learning paths)

### 4. Caching

- Static pages are cached at the edge
- API responses use Next.js caching headers
- Database queries are optimized with Prisma

## Monitoring & Logging

### 1. Vercel Analytics

- Real-time monitoring via Vercel dashboard
- Performance metrics and error tracking
- Deployment history and rollbacks

### 2. Database Monitoring

- Monitor connection pool usage
- Check slow query logs
- Set up alerts for query timeouts

### 3. Error Tracking

Consider integrating with:

- Sentry for error tracking
- LogRocket for session replay
- Better Stack for uptime monitoring

## Security Checklist

- [ ] NEXTAUTH_SECRET is long and random
- [ ] DATABASE_URL uses SSL/TLS
- [ ] Sensitive env vars are not in code
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] SQL injection is prevented (Prisma)
- [ ] XSS protection is enabled (Next.js default)
- [ ] Video uploads validate file types and sizes
- [ ] Admin routes check user role

## Backup & Recovery

### Database Backups

1. Enable automated backups in your database provider
2. Test restore procedures regularly
3. Keep backups for at least 30 days

### Video Backups

1. Vercel Blob has built-in redundancy
2. Monitor storage usage regularly
3. Archive old videos if needed

## Scaling Considerations

### When Traffic Increases

1. **Database**: Switch to managed PostgreSQL with read replicas
2. **Storage**: Verify Blob storage scaling
3. **API**: Consider caching layer (Redis)
4. **CDN**: Enable Vercel Edge Functions for global distribution

### Database Connection Pooling

With `@vercel/postgres`, connection pooling is automatic. For higher traffic:

```env
# Increase pool size
DATABASE_URL_POOL=postgresql://...
```

## Rollback Procedure

If issues occur after deployment:

```bash
# Rollback to previous deployment
vercel rollback

# Or redeploy specific commit
vercel --prod <git-hash>
```

## Maintenance

### Regular Tasks

1. **Weekly**: Check error logs and fix issues
2. **Monthly**: Review performance metrics
3. **Quarterly**: Audit security settings
4. **Annually**: Perform disaster recovery drill

### Updates

Keep dependencies updated:

```bash
pnpm update
pnpm audit
```

## Support

For deployment issues:

1. Check Vercel documentation: https://vercel.com/docs
2. Database provider documentation
3. Review application logs in Vercel dashboard
4. Check network tab in browser developer tools
