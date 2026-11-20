# GDD — Simulateur de dynasties médiévales (nom provisoire)

Document de conception du jeu. Il décrit **quoi** et **pourquoi**.
L'organisation technique est dans `ARCHITECTURE.md`, le calendrier dans `ROADMAP.md`.

Version 0.1 — analyse initiale, avant développement.

---

## 1. Vision

Simulateur de grande stratégie médiévale **centré sur les personnages**, pour
smartphone en mode portrait (et PC). Le joueur incarne un personnage, puis ses
héritiers, à travers plusieurs siècles. Le monde vit sans lui : chaque personnage
a ses ambitions et agit seul.

Inspiration assumée : la profondeur des jeux du genre, Crusader Kings III en
tête. **Interdits** : reprendre ses graphismes, ses textes, son code, sa carte,
son interface ou ses noms de systèmes propres. On reprend des **mécaniques de
genre** et on les nomme nous-mêmes (voir § 12).

## 2. Piliers

1. **Les personnages d'abord** : la politique est faite par des gens, pas par
   des territoires.
2. **Conséquences dans la durée** : tout acte important laisse une trace
   (mémoire, rancune, dette, revendication) qui peut ressortir des décennies
   plus tard.
3. **Narration émergente** : aucun scénario imposé ; les histoires naissent de
   la simulation et des événements contextuels.
4. **Plusieurs voies de réussite** : guerre, économie, diplomatie, intrigue.
   Perdre une guerre ne fait pas perdre la partie.
5. **Lisibilité** : le joueur peut toujours savoir **pourquoi** une valeur vaut
   ce qu'elle vaut et **pourquoi** une proposition est acceptée ou refusée.
6. **Équité** : pas de paiement pour gagner, pas de jauge d'énergie.

## 3. Fin de partie

- La partie continue tant que la **dynastie du joueur** tient au moins un titre
  terrien. Sinon : fin, avec bilan et chronique.
- Option : continuer avec un autre membre de la dynastie sans titre (mode
  aventurier), à concevoir plus tard.
- Date de fin indicative : 1453 (ajustable), puis mode « sans fin ».

## 4. Monde et carte

### 4.1 Hiérarchie territoriale
`Baronnie (fief) → Comté → Duché → Royaume → Empire`

- Le **comté** est l'unité de la carte (zone qu'on touche, où l'armée se déplace).
- Les **baronnies** sont des fiefs à l'intérieur d'un comté : château, ville,
  évêché. Un comté en compte 1 à 7.
- Duchés, royaumes et empires sont des **titres** qui regroupent des comtés de
  droit (*de jure*), tenus ou non par un même personnage (*de facto*).

### 4.2 Données d'un comté
Population, culture, religion, développement, revenus, ressources (blé, bois,
fer, sel, vin, laine…), terrain, bâtiments, capacité militaire (levées,
garnison, fortification), **contrôle** (autorité effective du seigneur après
conquête ou révolte), **mécontentement** populaire, propriétaire, revendications.

### 4.3 Modes de carte
Politique, diplomatique (relations avec le joueur), religieux, culturel,
économique, militaire (armées, sièges, ravitaillement), plus un mode
**dynastique** (terres tenues par chaque dynastie), proposé en plus.

### 4.4 Périmètre
- **Prototype** : 30 comtés, France élargie, départ en **1066**
  (voir `recherche/05-depart-1066.md`).
- **Cible** : Europe et ses marges, plusieurs centaines de comtés et environ
  2 000 baronnies. L'architecture doit le permettre dès le prototype.

## 5. Personnages

### 5.1 Données
Prénom, dynastie et maison, âge, sexe, **portrait généré**, parents, conjoints,
enfants (légitimes ou non, reconnus ou non), culture, religion, santé, fertilité,
**tension** (notre nom pour le stress), prestige, piété, or, titres,
revendications, traits, secrets, mémoire, relations.

### 5.2 Compétences
Six compétences, de 0 à environ 30 (noms provisoires, voir § 12) :

| Proposition | Usage |
|---|---|
| Diplomatie | relations, mariages, négociation |
| Guerre | commandement, organisation des troupes |
| Gestion | impôts, développement, construction |
| Intrigue | complots, espionnage, défense contre les complots |
| Savoir | religion, médecine, éducation, technologies |
| Vaillance | combat personnel, duels, survie en bataille |

Valeur finale = base génétique et éducative + traits + âge + santé + modificateurs.

### 5.3 Traits
- **Personnalité** (3 par adulte) : ambitieux, content de son sort, loyal,
  fourbe, jaloux, généreux, cupide, courageux, lâche, cruel, compatissant,
  calculateur, impulsif, timide, sociable, pieux, cynique, colérique, patient…
  Chaque trait porte des **poids de comportement** utilisés par l'IA, plus des
  oppositions qui créent de l'antipathie.
- **Innés et héréditaires** : robuste, chétif, beau, laid, génie, simple
  d'esprit, géant, nain… Transmission avec probabilités (génétique simplifiée).
- **Acquis** : balafré, estropié, ivrogne, érudit, excommunié, lépreux…
- **Éducation** : issue de l'enfance et du précepteur.

### 5.4 Cycle de vie
Naissance → enfance (éducation, tuteur) → majorité (16 ans) → mariage →
vieillesse → mort (maladie, bataille, assassinat, accident, exécution, couches).
La personnalité peut évoluer après des événements marquants.

### 5.5 Tension (stress)
Agir contre ses traits fait monter la tension (un compatissant qui fait
torturer). Au-delà de seuils : crises, nouveaux traits négatifs, santé en baisse.
C'est le principal frein à « jouer contre son personnage ».

## 6. Intelligence artificielle des personnages

Priorité absolue. Fonctionne **localement**, sans service externe.

### 6.1 Principe : Utility AI
Chaque personnage, à intervalles réguliers, évalue une liste d'**actions
possibles**. Chaque action reçoit un **score** = produit de **considérations**
(courbes de 0 à 1) × poids de personnalité. On choisit parmi les meilleures,
avec un tirage pondéré déterministe (graine) pour éviter la monotonie, jamais
un tirage uniforme.

Exemple « rejoindre une faction d'indépendance » :
`ambition × (1 − opinion du suzerain) × rapport de puissance × (1 − risque perçu)
× (1 − loyauté) × mémoire (« a été humilié par le roi »)`.

### 6.2 Entrées de l'IA
Personnalité, famille, relations, ambitions (objectif courant), finances,
puissance militaire, foi, intérêts politiques, risques, **mémoire**.

### 6.3 Objectifs (couche au-dessus des actions)
Chaque personnage a 1 à 2 **ambitions** durables : obtenir un titre, se venger,
marier sa fille au roi, s'enrichir, devenir pieux, se faire aimer… Elles
orientent le score des actions sur plusieurs années, ce qui donne de la
cohérence (pas de décisions erratiques d'un mois à l'autre).

### 6.4 Mémoire
Entrées datées : trahison, assassinat d'un proche, faveur reçue, guerre,
emprisonnement, alliance, humiliation, cadeau. Chaque souvenir a une intensité
qui décroît (sauf les plus graves), se transmet en partie aux enfants
(vendetta, gratitude familiale) et pèse sur l'opinion et l'IA.

### 6.5 Transparence
Mode développeur : pour chaque décision, liste des actions évaluées, scores,
considérations et souvenirs utilisés. En jeu : le joueur voit les **raisons**
d'un refus (« Il vous déteste : −40 ; vous avez tué son frère en 1071 »).

## 7. Dynasties et succession

- Mariages (normaux, matrilinéaires), fiançailles, concubinage selon la foi.
- Naissances après grossesse (9 mois), mortalité infantile et en couches.
- Bâtards : reconnus ou non, légitimables, secrets.
- Génétique simplifiée des traits innés, consanguinité.
- Éducation : tuteur, trait d'éducation, compétences.
- Maisons et **branches cadettes**, chef de dynastie, **gloire dynastique**
  (nom provisoire) débloquant des héritages.
- Lois de succession : partage, primogéniture, plus tard élection, séniorat ;
  variantes masculine, préférence masculine, égalitaire.
- Crises : prétendants, factions, guerres civiles, partage territorial.

## 8. Diplomatie

Interactions entre **personnages** : proposer un mariage, une alliance, un
traité (non-agression, tribut), déclarer une guerre, envoyer un cadeau,
courtiser, négocier une rançon, exiger la soumission (vassalisation),
revendiquer, former une coalition contre un voisin menaçant, soutenir un
prétendant. Chaque réponse est calculée par l'IA de la cible et **expliquée**.

## 9. Féodalité et politique intérieure

- Vassaux de vassaux (sans limite de profondeur).
- **Contrat féodal** par vassal : impôt, levée, droits (à étendre).
- Conseil : cinq postes (chancelier, maréchal, intendant, maître-espion,
  chapelain), chacun avec ses tâches.
- Lois du royaume, **autorité royale** (nom provisoire) qui limite ce qu'on peut
  imposer aux vassaux (révocation, guerres entre vassaux, succession).
- Factions de vassaux, révoltes populaires, guerres civiles, révocation et
  attribution de titres, prétendants.

## 10. Guerre

- **Motifs de guerre** (casus belli) : revendication, terres de droit, guerre
  sainte, indépendance, conquête selon la culture.
- **Troupes** : levées féodales, compagnies professionnelles (régiments typés),
  chevaliers (personnages), mercenaires, ordres religieux.
- **Facteurs** : commandant, moral, qualité, terrain, saison, ravitaillement,
  attrition, fortifications, renforts.
- **Batailles** : résolution automatique par phases (escarmouche, mêlée,
  poursuite). Une **phase tactique** jouable est prévue plus tard (décision
  du 1066 : voir `ROADMAP.md`, phase 7). Une petite armée bien commandée, bien
  placée, peut vaincre une plus grande.
- **Sièges**, prisonniers, rançons, **score de guerre**, négociation de paix,
  trêves.
- Les personnages engagés peuvent être blessés, capturés, tués.
- Déplacement des armées sur la carte, au doigt.

## 11. Intrigues, économie, religions, événements

- **Intrigues** : complots à plusieurs (assassinat, enlèvement, séduction,
  chantage, fabrication de revendication, renversement), réseaux d'espions,
  secrets, découverte, conséquences inattendues. Chaque complice a ses propres
  motivations.
- **Économie** : revenus mensuels, impôts, entretien des troupes et de la cour,
  bâtiments, commerce simple (routes, marchés), dettes, récoltes et famines,
  pillage, développement. L'IA gère ses finances.
- **Religions et cultures** : conversions (personnes et terres), tensions,
  guerres saintes, doctrines, traditions culturelles, hybridation culturelle,
  hérésies puis nouvelles confessions.
- **Événements** : moteur générique piloté par des fichiers de données ;
  conditions sur le contexte réel, choix avec effets visibles ou cachés,
  chaînes sur plusieurs années, événements touchant aussi les personnages de
  l'IA. **Chronique** automatique des règnes et dynasties.

## 12. Identité propre : noms à valider

Pour éviter de reprendre la terminologie exacte de CK3 (notamment sa liste de
compétences en français), proposition de noms :

| Notion | Nom proposé |
|---|---|
| Diplomatie / Martial / Intendance / Intrigue / Érudition / Prouesse | Diplomatie / Guerre / Gestion / Intrigue / Savoir / Vaillance |
| Stress | Tension |
| Renommée dynastique | Gloire dynastique |
| Autorité de la couronne | Autorité royale |
| Levées | Ost (vocabulaire féodal réel) |
| Contrôle | Emprise |

Le vocabulaire féodal historique (ost, hommage, commise, relief) est libre et
renforce l'identité.

## 13. Temps

Temps réel avec pause, **cinq vitesses**, avance manuelle (jour, mois).
**Pause automatique** configurable sur les événements importants (indispensable
sur téléphone, sinon le joueur rate des décisions). Le monde évolue même si le
joueur ne fait rien.

## 14. Interface (portrait, mobile d'abord)

Écrans : carte, personnage, cour, conseil, dynastie et arbre, relations,
diplomatie, intrigues, armées, économie, territoires, notifications, chronique.

Principes :
- carte plein écran, **barre d'onglets en bas** (5 entrées) et **feuille
  coulissante** (bottom sheet) pour les détails : on garde la carte visible ;
- **appui long = infobulle** sur toute valeur, avec le détail des modificateurs ;
- toute proposition affiche « Acceptera / Refusera » et la liste des raisons
  avant d'être envoyée ;
- esthétique médiévale réaliste : parchemin, encre, sceaux, enluminures
  sobres, typographie de manuscrit pour les titres ; blasons générés selon les
  règles héraldiques ; portraits générés par calques.
