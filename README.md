# Ravi's

Plateforme éducative pour l'anglais cabine (interface FR, contenus EN), orientée progression CEFR, simulation métier et feedback pédagogique.

## 1. Vision produit

Ravi's guide un apprenant de `A1` à `C1` via:
- modules structurés par phase pédagogique
- entraînement multi-compétences (`Reading`, `Listening`, `Writing`, `Speaking`)
- production orale de fin de module
- évaluation finale et validation progressive
- gamification (points + badges standards + badges de niveau CEFR)

## 2. Stack technique

- `Next.js 16` (App Router)
- `TypeScript`
- `Prisma` + PostgreSQL (Neon)
- `Auth.js / NextAuth` (credentials)
- `Tailwind CSS v4` + composants UI
- `Puppeteer` pour PDF du plan
- `Vercel Blob` (fallback local pour uploads)

## 3. Architecture principale

- `app/`:
  - pages UI
  - routes API (`app/api/**/route.ts`)
- `lib/`:
  - logique métier (génération modules, gamification, PDF, scoring oral)
- `prisma/`:
  - schéma + migrations
- `components/`:
  - UI primitives et blocs métier
- `public/`:
  - assets statiques (logos, icônes, placeholders, uploads locaux)

## 4. Génération pédagogique des modules

Le moteur CEFR est centralisé dans:
- `lib/learning-content.ts`
- `lib/module-generation.ts`

Points clés:
- contenus différenciés par niveau (`A1`, `A2`, `B1`, `B2`, `C1`)
- modules hebdomadaires avec progression cognitive guidée
- oral placé en phase finale
- évaluation de clôture

Les flux onboarding et mise à jour de plan réutilisent ce même moteur:
- `app/api/onboarding/complete/route.ts`
- `app/api/learning-plan/route.ts`

## 5. Gamification & badges

Badges standards + badges de niveau CEFR:
- `LEVEL_A1`, `LEVEL_A2`, `LEVEL_B1`, `LEVEL_B2`, `LEVEL_C1`

Fichiers:
- `lib/gamification.ts`
- `app/api/gamification/route.ts`
- `app/api/gamification/badges/route.ts`
- `app/gamification/page.tsx`

## 6. Profil utilisateur

Fonctionnalités:
- avatar par défaut (icône/fallback)
- upload photo profil (`jpg/png/webp`, max 3MB)
- modification du nom affiché

Fichiers:
- `app/profile/page.tsx`
- `app/api/profile/route.ts`
- `app/api/profile/avatar/route.ts`
- `components/Navigation.tsx`

## 7. Branding (logo + favicon)

Assets utilisés:
- logo: `public/logo.svg`
- flaticon/favicon: `public/flaticon.svg`

Intégration:
- metadata globale (`app/layout.tsx`)
- headers/navigation/dashboard/landing/admin (responsive via `next/image`)

## 8. PDF du plan d'apprentissage

Route:
- `GET /api/learning-plan/download-pdf`

Comportement:
- génère un PDF principal via Puppeteer
- fallback PDF en cas d'échec moteur navigateur
- robustesse ajoutée sur champs optionnels du plan (goals/skills/exercises)
- nom de fichier normalisé: `plan-apprentissage-ravis.pdf`

## 9. Accessibilité & UI (WCAG)

Le thème a été structuré pour éviter les conflits de contraste:
- palette cohérente et non agressive
- meilleure lisibilité des textes secondaires
- états interactifs distincts (hover/focus/disabled/error/success)
- placeholders renforcés
- cartes et surfaces avec séparation visuelle claire

Fichiers impactés:
- `app/globals.css`
- `styles/globals.css`
- `components/ui/button.tsx`
- `components/ui/input.tsx`
- `components/ui/textarea.tsx`
- `components/ui/card.tsx`

## 10. Variables d'environnement

Créer `.env.local` avec au minimum:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

Optionnelles selon fonctionnalités:
- `BLOB_READ_WRITE_TOKEN` (upload distant)
- `RESEND_API_KEY`
- `EMAIL_FROM`

## 11. Commandes

```bash
npm install
npm run dev
npm run build
npm run start
npm exec prisma db push
```

## 12. Dépannage rapide

1. PDF plan KO:
- vérifier que la route `/api/learning-plan/download-pdf` répond en `application/pdf`
- fallback PDF est automatique si Puppeteer échoue

2. Upload vidéo/avatar KO:
- vérifier droits d'écriture dans `public/uploads`
- vérifier token Blob si usage distant

3. Badges niveau non visibles:
- vérifier progression réelle (modules validés + oral approuvé + score)

4. Données CEFR incohérentes:
- relancer le flux officiel de régénération via l'onboarding ou via `PUT /api/learning-plan` avec `englishLevel`.

## 13. Documents projet

- `PRODUCT_SPEC.md`
- `SERVERS_ADMIN.md`
