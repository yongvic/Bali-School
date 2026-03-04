# SERVERS_ADMIN

## 1) Lancer les serveurs

### Prérequis
- Node.js installé
- Variables d'environnement configurées (`.env` ou `.env.local`)
- Base PostgreSQL accessible

### Démarrage développement

```bash
npm install
npm run dev
```

Application:
- local: `http://localhost:3000`

### Build production

```bash
npm run build
npm run start
```

## 2) Synchroniser la base Prisma

```bash
npm exec prisma db push
npm exec prisma generate
```

## 3) Forcer la régénération pédagogique de tous les utilisateurs

Cette commande supprime les anciens modules d'un plan et recrée une structure pédagogique multi-compétences.

```bash
npm run regenerate:modules
```

## 4) Accès espace admin

### URL
- Tableau admin: `http://localhost:3000/admin`

### Condition d'accès
- Le compte doit avoir `role = ADMIN` en base.

### Rendre un compte admin (Prisma Studio)

```bash
npm exec prisma studio
```

Puis dans la table `User`, modifier `role` en `ADMIN`.

## 5) Fonctionnalités admin principales

- Revue des vidéos soumises
- Feedback/validation
- Suivi des élèves

## 6) Password reset email

Pour envoi réel:
- `RESEND_API_KEY`
- `EMAIL_FROM`

Si non configuré en développement:
- la route forgot-password renvoie un lien de réinitialisation de secours.

## 7) Upload vidéo

- Avec `BLOB_READ_WRITE_TOKEN`: stockage blob.
- Sans token (dev): fallback local dans `public/uploads/<userId>/...`.
