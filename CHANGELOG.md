# CHANGELOG

## [0.0.1] — Phase 0 : fondations

### Ajouté
- Projet `app/` : TypeScript strict, React 18, Vite 6, Vitest 3, Zod.
- Moteur : calendrier julien (dates de l'an 800 à la fin de partie), générateur
  aléatoire à graine (sfc32) dont l'état est sauvegardé, file d'événements datés,
  planificateur quotidien / hebdomadaire / mensuel / annuel.
- Simulation dans un Web Worker, 5 vitesses, pause, avance d'un jour ou d'un mois.
- Sauvegardes : format versionné avec migrations, compression gzip, emplacements
  dans IndexedDB, sauvegarde automatique annuelle, export et import de fichier.
- Données validées au chargement (temps, glossaire).
- Accompagnement : explications « i » avec renvois, conseil de bienvenue.
- Mode développeur minimal : graine, jour interne, vitesse mesurée.
- 23 tests automatiques (déterminisme, calendrier, file datée, planificateur,
  sauvegarde et migrations, IndexedDB, données, 500 ans de simulation).
- Vérifications automatiques et publication GitHub Pages (GitHub Actions).

### Conception
- Recherche préalable (`recherche/`), `GDD.md`, `ARCHITECTURE.md`, `ROADMAP.md`.
- Accompagnement du joueur ajouté comme exigence prioritaire (GDD § 13).
- Noms validés : Diplomatie, Guerre, Gestion, Intrigue, Savoir, Vaillance ;
  Tension ; Gloire dynastique.
