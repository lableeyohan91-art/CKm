# ARCHITECTURE

Version 0.1 — proposition avant développement.

## 1. Principes

1. **Simulation séparée de l'interface** : la simulation tourne dans un
   **Web Worker** ; l'interface (React) n'affiche que des vues et envoie des
   **commandes**. Aucune règle de jeu dans les composants React.
2. **Déterminisme** : même graine + mêmes commandes ⇒ même partie. Générateur
   pseudo-aléatoire à état sauvegardé, jamais `Math.random`. Ordre d'itération
   stable (identifiants triés). Indispensable pour le débogage, les tests et la
   relecture.
3. **Données hors du code** : personnages initiaux, cartes, traits, bâtiments,
   cultures, religions, événements, paramètres d'équilibrage en fichiers de
   données validés par schéma au chargement.
4. **Planification par fréquence** : chaque système déclare sa fréquence
   (jour, semaine, mois, an) et la charge est **étalée** (les personnages ne
   réfléchissent pas tous le même jour).
5. **Niveaux de détail** : tout le monde n'est pas simulé avec la même finesse
   (voir § 6).
6. **Prototype = fondations** : rien de jetable dans le moteur. Seuls le
   contenu (carte de 30 comtés, personnages) sera remplacé.

## 2. Pile technique

| Rôle | Choix | Raison |
|---|---|---|
| Langage | TypeScript strict | modèle de données riche, refactorisations sûres |
| Interface | React 18.3 + Vite 6 | demandé ; versions stables éprouvées |
| État de l'interface | état React simple ; Zustand si le besoin apparaît | stocke les vues reçues du worker |
| Carte | **SVG** au prototype, passage **Canvas/WebGL** si nécessaire | SVG simple et précis au toucher jusqu'à quelques centaines de zones |
| Simulation | Web Worker + protocole de messages maison (`src/worker/protocol.ts`) | calcul hors du fil d'affichage, sans dépendance |
| Validation des données | Zod | schémas = documentation + erreurs claires |
| Sauvegarde | IndexedDB (via idb) + compression | grosses sauvegardes, hors ligne |
| Hors ligne / installation | vite-plugin-pwa (service worker) | PWA Android, iOS, PC |
| Tests | Vitest 3 (+ Playwright pour l'interface) | rapides, même outil pour le moteur et les simulations longues |
| Qualité | ESLint, Prettier, tests en intégration continue (GitHub Actions) | |

## 3. Organisation des dossiers

```
ckm/   (racine du dépôt)
  GDD.md  ARCHITECTURE.md  ROADMAP.md  CHANGELOG.md
  app/                     ← projet Vite
    src/
      engine/              ← noyau sans règles : horloge, planificateur, RNG,
                             stockage des entités, journal, bus d'événements
      model/               ← types et schémas (Character, Title, County…)
      rules/               ← formules pures : opinion, revenus, succession,
                             fertilité, bataille… (paramétrées par balance/)
      systems/             ← systèmes planifiés : démographie, santé, économie,
                             succession, relations, guerre, intrigues…
      ai/                  ← Utility AI : actions, considérations, ambitions,
                             mémoire, explications
      events/              ← moteur d'événements (conditions, effets, chaînes)
      save/                ← sérialisation, versions, migrations, IndexedDB
      worker/              ← point d'entrée du worker, protocole commandes/vues
      ui/                  ← React : écrans, carte, composants, infobulles
      dev/                 ← mode développeur (inspecteur IA, éditeurs, stats)
    data/                  ← contenu (JSON/TS) : map/, characters/, dynasties/,
                             traits/, buildings/, cultures/, religions/,
                             events/, balance/
    tools/                 ← simulation sans interface (Node), validateurs,
                             générateur de carte
    tests/
```

Règle de dépendance : `ui → worker (protocole) → systems/ai/events → rules →
model/engine`. Jamais l'inverse.

## 4. Modèle de données (noyau)

Toutes les entités sont dans des tables indexées par identifiant numérique
(`Map<Id, T>` au prototype ; passage à des tableaux typés si les mesures
l'exigent).

```ts
type Day = number;            // jours depuis le 1er janvier 1066 (négatif avant), calendrier julien, valable dès l'an 800

interface Character {
  id; firstName; dynastyId; houseId; sex; birth: Date; death?: Date;
  fatherId?; motherId?; realFatherId?;        // paternité cachée possible
  spouseIds; betrothedId?; childrenIds;
  cultureId; religionId;
  skills: { dip, war, ges, int, sav, val };    // noms provisoires
  traitIds; health; fertility; tension;
  prestige; piety; gold; debt;
  titleIds; claims: Claim[]; liegeId?; courtOfId?; councilPost?;
  employerId?; prisonerOf?;
  ambition?: AmbitionState;
  memoryIds; secretIds;
  portrait: PortraitGenes;                     // pour le portrait généré
  aiNextThink: Date;                           // étalement de l'IA
  lod: 0 | 1 | 2;                              // niveau de détail (§ 6)
}

interface Dynasty { id; name; coa: CoatOfArms; founderId; glory; houseIds }
interface House { id; dynastyId; name; headId; parentHouseId? }

interface Title {
  id; rank: 'barony'|'county'|'duchy'|'kingdom'|'empire';
  name; holderId?; deJureParentId?; deFactoLiegeTitleId?;
  successionLaw; genderLaw; holderHistory: { charId; from; to }[];
  countyId?;                                    // pour baronnies et comtés
}

interface County {
  id; titleId; neighbors: Id[]; terrain; position;
  population; cultureId; religionId; development;
  control; unrest; buildings; resources;
  levyBase; garrison; fortLevel; supplyLimit;
}

interface Opinion { // calculée, non stockée telle quelle
  total; parts: { source: ModifierSource; value; until?: Date }[];
}
interface Relation { a; b; kind: 'friend'|'rival'|'lover'|'nemesis'|'mentor'; since }
interface Memory { id; ownerId; kind; otherIds; date; intensity; decay; inheritable }
interface Modifier { id; target; stat; value; until?: Date; source }

interface Army { id; ownerId; commanderId?; knights; regiments; levies;
                 location: CountyId; path; morale; supply }
interface War { id; casusBelli; attackers; defenders; targetTitleId; score; start }
interface Scheme { id; kind; ownerId; targetId; agents; power; secrecy; progress }
interface Faction { id; kind; targetLiegeId; memberIds; power; demand }

interface ScheduledEvent { date; eventId; scope: Record<string, Id> }
interface ChronicleEntry { date; kind; charIds; titleIds; text }

interface World {
  version; seed; rng: RngState; date: Date;
  characters; dynasties; houses; titles; counties; armies; wars;
  schemes; factions; relations; memories; modifiers;
  scheduled: ScheduledEvent[]; chronicle: ChronicleEntry[];
  playerCharacterId?;                           // absent en mode observateur
}
```

L'opinion n'est pas stockée en matrice (n² impossible pour des milliers de
personnages) : elle est **calculée** à la demande à partir des relations, des
traits, des souvenirs et des modificateurs, avec un **cache** invalidé quand
une de ces sources change.

## 5. Simulation et temps

- **Horloge** : un pas = 1 jour. Les vitesses changent le nombre de jours
  simulés par seconde.
- **Planificateur** :
  - quotidien : déplacements d'armées, batailles, sièges ;
  - hebdomadaire : progression des complots ;
  - mensuel : économie, santé, grossesses, réflexion de l'IA (étalée sur le mois
    par `aiNextThink`), événements aléatoires ;
  - annuel : vieillissement, éducation, développement, croissance de population.
- **File d'événements datés** (tas binaire) : naissances programmées, chaînes
  d'événements, fins de trêve, expirations de modificateurs. Pas de balayage
  complet du monde pour les trouver.
- **Commandes** du joueur et de l'IA passent par le même chemin (validation,
  coût, effet, journal), ce qui garantit que le joueur et l'IA suivent les
  mêmes règles.

## 6. Niveaux de détail (performances)

| Niveau | Qui | Simulation |
|---|---|---|
| 0 — complet | détenteurs de titres, leur famille proche, membres des conseils, personnages liés au joueur | IA complète, événements, mémoire |
| 1 — réduit | courtisans ordinaires | IA mensuelle réduite (mariage, ambition simple), événements limités |
| 2 — dormant | personnages sans rôle et loin du joueur | vieillissement et mort seulement ; réveil s'ils deviennent pertinents |

Objectif cible : 3 000 à 8 000 personnages vivants, une année simulée en moins
d'une seconde sur un téléphone récent en vitesse maximale. À mesurer dès le
prototype (tests de performance).

## 7. Intelligence artificielle

```
Ambition (années)  →  Actions candidates (mensuel)  →  Score  →  Choix  →  Commande
                          ↑                               │
            considérations (courbes 0–1)            journal d'explication
            poids de personnalité (traits)          (mode développeur)
            mémoire, relations, risques
```

- Une **action** déclare : qui peut la faire (filtre rapide), ses
  considérations, ses poids par trait, son effet (une commande).
- Choix : tirage pondéré parmi les 3 meilleurs scores, avec la graine. Jamais
  uniforme.
- Contrôle de cohérence : une action ne peut contredire l'ambition en cours
  sans un score nettement supérieur (hystérésis).
- Explication enregistrée pour chaque décision (désactivable en production).

## 8. Événements

Définition en données :
```
id, déclencheur (pulsation mensuelle, action, chaîne), portée (personnages
impliqués), conditions, poids (modifié par traits et contexte), textes avec
variables, choix[] → effets (immédiats, modificateurs datés, souvenirs,
marqueurs, événements programmés), choix de l'IA (scores par trait).
```
Le même événement peut toucher le joueur (fenêtre de choix) ou l'IA (choix
calculé). Chaque événement important écrit dans la **chronique**.

## 9. Sauvegarde

- Sérialisation de `World` (JSON compact puis compression), stockée dans
  IndexedDB ; plusieurs emplacements ; sauvegarde automatique mensuelle ou
  annuelle, au choix.
- **Version** dans chaque sauvegarde ; **migrations** successives
  `v1 → v2 → …` testées.
- Export et import d'un fichier, pour ne jamais dépendre seulement du navigateur.
- Test d'intégrité : sauvegarder, recharger, simuler N ans ⇒ résultat identique
  à la simulation sans rechargement (grâce au déterminisme).

## 10. Carte

- Prototype : 30 comtés en **SVG**, contours générés à partir des coordonnées
  réelles des chefs-lieux (diagramme de Voronoï découpé par le trait de côte),
  puis retouchés. Données géographiques de base : domaine public (Natural Earth).
- Les vraies frontières des comtés médiévaux n'existent pas en données
  libres : la génération par Voronoï est la méthode la plus réaliste à coût
  raisonnable.
- Passage à l'échelle : pré-calcul des formes, simplification selon le zoom,
  rendu Canvas/WebGL si le SVG ralentit au-delà de quelques centaines de comtés.

## 11. Hébergement

Dépôt public `ckm` : publication avec **GitHub Pages**, gratuit pour un dépôt
public. Une PWA installable et hors ligne doit être servie depuis un vrai site :
un service worker ne fonctionne pas dans une page publiée sur claude.ai.

## 12. Risques techniques principaux

| Risque | Parade |
|---|---|
| Performances sur téléphone | worker, niveaux de détail, étalement, mesures dès le prototype |
| IA incohérente ou absurde | ambitions durables, hystérésis, inspecteur de décisions, simulations longues automatisées |
| Volume de contenu (événements) | format de données simple, outils de validation, contenu écrit par lots |
| Interface trop dense sur téléphone | feuille coulissante, infobulles à l'appui long, tests sur vrai téléphone |
| Carte médiévale réaliste | génération Voronoï + retouches, sources libres |
| Évolution des sauvegardes | versions et migrations dès la v1 |
| Ambition hors d'échelle | phases courtes et testées (voir `ROADMAP.md`) |
