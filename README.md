# Ravi's

Ravi's est une plateforme d'apprentissage de l'anglais professionnel (interface française, contenus pédagogiques en anglais) avec progression CEFR, exercices multi-compétences et suivi pédagogique.

## Fonctionnalités principales

- Modules multi-compétences: Reading, Listening, Writing, Speaking.
- Progression pédagogique structurée:
  - Introduction
  - Découverte (input)
  - Pratique contrôlée
  - Pratique semi-guidée
  - Production orale (fin de module)
  - Évaluation finale
- Types d'exercices:
  - QCM
  - Phrase à compléter
  - Drag & drop
  - Association
  - Compréhension écrite
  - Compréhension orale
  - Writing
  - Speaking
- Scoring par compétence (reading/listening/writing/speaking).
- Validation de module par seuil global + minimum speaking.
- Répétition espacée (SRS): les erreurs faibles reviennent plus tard.
- Soumission vidéo orale (caméra ou galerie) avec revue admin.
- Carte de progression aéroport.

## Stack technique

- Next.js App Router
- TypeScript
- Prisma + PostgreSQL (Neon)
- Auth.js / NextAuth
- Tailwind + composants UI
- Vercel Blob (ou fallback local en dev pour upload vidéo)

## Installation

```bash
npm install
```

Configurer l'environnement via `.env` ou `.env.local`.

Variables clés:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `BLOB_READ_WRITE_TOKEN` (optionnel en dev, recommandé en prod)
- `RESEND_API_KEY` + `EMAIL_FROM` (email reset password)

## Commandes utiles

```bash
npm run dev
npm run build
npm run start
npm run regenerate:modules
```

## État pédagogique actuel

- L'ancienne logique "tout vocal" a été retirée.
- Les modules sont régénérés en format multi-exercices équilibré.
- La production orale n'est plus dominante et intervient en fin de module.

## Dépannage rapide

1. Téléchargement plan échoue en PDF:
- fallback HTML automatique côté backend.

2. Reset password ne reçoit pas d'email:
- vérifier `RESEND_API_KEY` + `EMAIL_FROM`.
- en développement, l'API retourne un lien de réinitialisation de secours.

3. Upload vidéo échoue:
- en absence de token Blob, fallback local dans `public/uploads/...`.

4. Modules hérités incohérents:
- exécuter `npm run regenerate:modules`.

## Sécurité

- Authentification par session.
- Validation serveur des payloads.
- Mot de passe hashé.
- Token de réinitialisation expirant.

## Documentation complémentaire

- Guide de lancement serveurs et accès admin: `SERVERS_ADMIN.md`
- Spécification produit consolidée: `PRODUCT_SPEC.md`
