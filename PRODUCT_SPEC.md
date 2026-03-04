# PRODUCT_SPEC - Ravi's

## Résumé produit

Ravi's est une plateforme d'apprentissage de l'anglais professionnel pour contextes aéronautiques, avec interface française et contenus en anglais.

Objectifs majeurs:
- parcours pédagogique complet par module;
- progression CEFR structurée;
- pratique orale + vidéo + feedback;
- suivi de progression et gamification.

## Architecture

- Frontend: Next.js App Router + Tailwind + composants UI.
- Backend: API routes Next.js.
- Données: Prisma/PostgreSQL.
- Auth: Auth.js.
- Média: upload vidéo (blob), enregistrement micro/caméra côté client.

## Modèle fonctionnel

### 1) Modules pédagogiques
Chaque module inclut:
- Introduction pédagogique (objectif, compétence, prérequis)
- Vocabulaire ciblé (mot, traduction FR, phrase exemple, audio)
- Grammaire (règle, exemples, mini-exercice)
- Compréhension orale (dialogue, questions)
- Exercices interactifs variés (QCM, texte à compléter, association, ordre logique, oral)

### 2) Oral
- Accès micro navigateur
- Enregistrement oral
- Transcription automatique (selon support navigateur)
- Comparaison avec phrase attendue
- Score oral + feedback immédiat

### 3) Progression CEFR
- Niveaux A1, A2, B1, B2, C1
- Recommandation de module courant
- Verrouillage strict: module suivant inaccessible tant que le précédent n'est pas validé totalement

### 4) Évaluation
- Auto-correction instantanée sur exercices interactifs
- Score quiz/oral
- Explications d'erreurs
- Progression globale et hebdomadaire

### 5) Plan d'apprentissage
- Persisté en base
- Réutilisable sans refaire onboarding
- Modifiable via API/page de plan

### 6) Vidéo et feedback
- Soumission vidéo de fin de module
- Caméra directe ou sélection galerie
- Workflow admin de revue/feedback conservé

### 7) Modes d'exercices
Implémentés et exposés:
- Passenger Mode
- Accent Training Mode
- Secret Challenge Mode
- Wheel of English
- Love & English Mode
- Mode Urgence
- Mode Interview Compagnie
- Lost Passenger Mode

### 8) Carte aéroport
- Carte interactive avec zones de progression
- Déblocage visuel par avancée
- Position apprenant affichée

### 9) Règle "Souhaits"
- Souhaits bloqués tant que l'objectif hebdomadaire n'est pas atteint
- Barre explicite de progression hebdomadaire

## Responsive mobile - vérification

Vérification réalisée:
- audit des pages principales et classes Tailwind responsive;
- correction de points sensibles (grilles onboarding et header dashboard) pour éviter le débordement mobile;
- build applicatif validé.

Résultat:
- structure globalement responsive (grilles `grid-cols-1 md:*`, boutons `w-full`, conteneurs `max-w-*` + `px-4`);
- navigation mobile présente;
- pages clés (dashboard, learn, module, plan, wishes, carte) adaptées.

Limite de la vérification:
- absence de test visuel device automatisé dans cette passe (type snapshot Playwright multi-viewports).

## Validation technique

- Build production: OK (`npm run build`).
- Routes API compilées et pages générées sans erreur bloquante.

## Historique consolidé

Les anciens documents `QUICKSTART`, `DEVELOPMENT`, `DEPLOYMENT`, `PROJECT_STATUS`, `PROJECT_SUMMARY` et rapport d'implémentation ont été fusionnés dans ce fichier.
