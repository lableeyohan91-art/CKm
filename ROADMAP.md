# ROADMAP

Chaque phase se termine par des **critères de fin vérifiés** (tests automatiques
+ simulation longue + test sur téléphone) avant de passer à la suivante.

## Dépendances entre mécaniques

```
Temps/RNG/données ─► Personnages ─► Famille/naissances ─► Succession ─► Titres/féodalité
                         │                                                   │
                         ├─► Opinion/mémoire ─► IA ─────────────────────────┤
                         │                                                   ▼
                         └─► Économie ─────────────────────────────► Guerre ─► Factions
                                                                       │
                                     Événements ◄──────────────────────┘
                                     Intrigues, Religion/Culture, Phase tactique
```
Le socle est : **temps, personnages, famille, succession, titres, opinion,
mémoire, IA, économie, sauvegarde**. C'est exactement le prototype demandé.

---

## Phase 0 — Fondations techniques (sans contenu de jeu) — ✅ terminée
- Projet Vite + React + TypeScript strict, ESLint, Vitest, intégration continue.
- Noyau : horloge, planificateur à fréquences, file datée, RNG à graine,
  tables d'entités, journal.
- Chargement des données avec schémas Zod.
- Worker + protocole commandes/vues.
- Sauvegarde v1 (IndexedDB, version, export/import).
- Mode développeur minimal (date, vitesse, graine, état brut).
- Accompagnement : bouton « i » et glossaire, conseils de première fois.
- **Fin** : un monde vide avance de 500 ans sans erreur ; sauvegarder/recharger
  donne le même résultat ; tests verts.

## Phase 1 — Prototype « monde vivant » (le cœur) — ✅ terminée (v0.1.0)
Contenu : 30 comtés (France élargie, 1066), ~100 personnages, 8 à 12 dynasties.
- Personnages : compétences, traits, santé, vieillissement, mort.
- Famille : mariages, fiançailles, grossesses, naissances, bâtards, génétique
  simple, éducation basique.
- Titres et féodalité : hiérarchie, vassaux, impôts, levées (chiffres seulement).
- Succession : partage et primogéniture, revendications héréditaires.
- Économie élémentaire : revenus, dépenses, cour, dettes.
- Opinion et relations (amis, rivaux, amants), **mémoire**.
- **IA Utility** : se marier, marier ses enfants, gérer son or, offrir des
  cadeaux, chercher des amis ou des rivaux, nommer son conseil, réclamer ;
  ambitions de base.
- Chronique automatique.
- Interface portrait : carte SVG (modes politique et dynastique), fiche
  personnage, arbre généalogique simple, notifications, temps (pause, 5 vitesses).
- Accompagnement : explications de toutes les valeurs (détail des calculs),
  raisons d'acceptation ou de refus, conseiller de cour, glossaire enrichi.
- Mode développeur : inspecteur des décisions de l'IA, édition des
  personnages, mode observateur, simulation accélérée de 300 ans, statistiques.
- **Fin** : 300 ans simulés sans anomalie (pas d'orphelin de titre, pas de
  mariage impossible, population stable, dynasties qui naissent et meurent) ;
  tests de succession, de parenté, d'économie et de sauvegarde verts ; fluide
  sur téléphone.

### Reste à faire, reporté de la phase 1
- Propositions de mariage faites **au** joueur et **par** le joueur (interface
  de choix) : la simulation les gère déjà pour l'IA.
- Conseil (5 postes) et conseiller qui guide le joueur.
- Performances : mesurer sur un vrai téléphone (≈ 75 ms par année simulée
  sur serveur avec 700 personnages).

## Phase 2 — Guerre (cœur demandé)
Motifs de guerre, levées, compagnies, chevaliers, mercenaires ; déplacement au
doigt ; ravitaillement, attrition, saisons ; batailles automatiques par phases ;
sièges ; prisonniers et rançons ; score de guerre ; paix ; trêves ; IA de guerre
(déclarer, mobiliser, manœuvrer, négocier).
**Fin** : guerres crédibles en simulation longue (pas de guerre perpétuelle ni
d'empire géant en 50 ans), une petite armée bien menée peut gagner.

## Phase 3 — Politique intérieure
Contrats féodaux, conseil complet, lois, autorité royale, factions, révoltes
populaires, guerres civiles, révocation, prétendants, coalitions.

## Phase 4 — Moteur d'événements et contenu narratif
Moteur complet (chaînes, effets cachés, événements de l'IA), premiers lots
d'événements (100 puis 300), tension (stress), traits qui évoluent.

## Phase 5 — Intrigues
Complots à plusieurs, espionnage, secrets, chantage, séduction, enlèvement,
assassinat, renversement.

## Phase 6 — Religions et cultures
Conversions, doctrines, guerres saintes, papauté, hérésies, traditions,
hybridation, nouvelles confessions.

## Phase 7 — Phase tactique des batailles
Placement sur un champ en zones, ordres par phase (tenir, charger, tirer, fuite
simulée, réserve), moral ; résolution automatique conservée pour les petits
combats (choix du 1066 : batailles avec phase tactique).

## Phase 8 — Passage à l'échelle européenne
Carte de plusieurs centaines de comtés, milliers de personnages, optimisations
(rendu Canvas/WebGL, tableaux typés si besoin).

## Phase 9 — Finition
Direction artistique complète, portraits et blasons aboutis, didacticiel,
accessibilité, PWA installable, équilibrage.

---

## Ordre de grandeur
CK3 est le fruit d'un studio entier pendant des années. Ce projet avance phase
par phase ; chaque phase livre un jeu jouable et testé. La phase 1 est la plus
importante : si le monde vivant n'est pas crédible, rien d'autre ne le sera.
