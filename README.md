# Ravi's

Ravi's est une plateforme d'apprentissage de l'anglais (UI en français, contenus pédagogiques en anglais), orientée CEFR et scénarios métiers aéronautiques.

## Installation

```bash
npm install
```

Configurer `.env.local` (ou `.env`) puis générer Prisma:

```bash
npx prisma generate
```

## Exécution

```bash
npm run dev
```

Build production:

```bash
npm run build
npm run start
```

## Fonctionnalités clés

- Progression CEFR A1 -> C1 avec déblocage conditionné à la validation complète du module.
- Modules structurés: introduction, vocabulaire, grammaire, compréhension orale, exercices interactifs.
- Production orale: micro, transcription, score, feedback immédiat.
- Soumission vidéo de fin de module: caméra directe ou galerie.
- Carte aéroport interactive de progression.
- Plan d'apprentissage persistant et modifiable sans refaire l'onboarding.
- Souhaits débloqués uniquement après objectif hebdomadaire atteint.

## Scripts utiles

- `npm run dev`
- `npm run build`
- `npm run start`
- `npx prisma generate`

## Documentation

Voir `PRODUCT_SPEC.md` pour le résumé technique et fonctionnel consolidé.
