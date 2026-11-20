# CHANGELOG

## [0.1.0] — Phase 1 : monde vivant (prototype jouable)

### Ajouté
- Scénario du 6 janvier 1066 : 30 comtés (France élargie et sud de l'Angleterre),
  11 duchés, 2 royaumes, 13 dynasties, 62 personnages historiques (dates
  incertaines signalées), petite noblesse générée. Données validées et
  vérifiées entre fichiers au chargement.
- Personnages : six compétences (Diplomatie, Guerre, Gestion, Intrigue, Savoir,
  Vaillance), 23 traits de personnalité, 7 traits innés héréditaires,
  éducation à 16 ans, santé et maladies, ambition durable, souvenirs.
- Famille : mariages (acceptation par l'autre famille, interdiction de la
  consanguinité), grossesses, naissances, prénoms de lignée, mariages
  matrilinéaires, bâtards exclus de l'héritage, vœux religieux.
- Succession : partage et primogéniture, représentation, frères et oncles,
  déshérence vers le suzerain ; les cadets écartés s'en souviennent.
- Économie : revenus des comtés, impôt des vassaux, entretien de la cour.
- Opinion calculée avec chacune de ses raisons ; amitiés et rivalités.
- IA par scores (Utility AI) : mariages, cadeaux au suzerain, vœux ; journal
  des décisions avec raisons et options écartées.
- Niveau de détail : les personnes sans lien avec une famille seigneuriale
  quittent la scène ; population stable sur 300 ans.
- Interface mobile : choix du personnage (ou mode observateur), carte des
  comtés (politique, dynasties, richesse ; zoom), fiche personnage avec
  explication de chaque valeur, arbre de la maison, chronique, nouvelles,
  pause automatique sur les événements importants, portraits générés.
- Accompagnement : 34 explications dans le glossaire, conseils de première fois.
- Tests : 32 tests (successions, invariants sur 100 ans, déterminisme) ;
  outil de simulation longue avec statistiques (`npm run sim`).

### Modifié
- Départ le 6 janvier 1066 (couronnement de Harold) au lieu du 1er janvier.
- Format de sauvegarde v2 ; les sauvegardes d'essai v1 sont refusées avec un
  message clair.

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
