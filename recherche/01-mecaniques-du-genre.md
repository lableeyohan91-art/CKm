# 1. Mécaniques du genre « gestion de dynastie médiévale »

Ce document décrit les mécaniques **communes au genre** (grande stratégie
centrée sur des personnages), dont Crusader Kings est l'exemple le plus connu.
Il sert de référence pour concevoir **notre propre jeu**. On ne reprend ni les
noms de systèmes, ni les textes, ni l'interface, ni les graphismes d'un jeu
existant (voir la section 10, « Garde-fous »).

---

## 1.1 Boucle de jeu principale

1. **Le temps avance** : tour par tour, par saison (proposition pour le mobile)
   ou en continu avec pause.
2. **Des événements surviennent** : naissances, morts, complots, récoltes,
   révoltes, rencontres. Chacun propose 2 à 4 choix.
3. **Le joueur décide** : mariages, guerres, nominations, complots, dépenses.
4. **Les conséquences s'accumulent** : immédiates (or, opinion) et différées
   (rancunes, maladies, héritiers, prétentions sur des terres).
5. **Le personnage meurt** : le joueur reprend son héritier. La partie continue
   tant que la **dynastie** possède au moins un titre.

L'objectif n'est pas fixé par le jeu. Le joueur se donne le sien : agrandir le
royaume, faire durer la lignée, devenir empereur, unifier un peuple.

---

## 1.2 Personnages

Chaque personnage est un objet complet. Données minimales :

| Donnée | Exemples | Rôle en jeu |
|---|---|---|
| Identité | prénom, dynastie, sexe, âge, culture, religion | succession, relations |
| Caractéristiques (0–20) | diplomatie, guerre, gestion, intrigue, savoir | réussite des actions |
| Traits de caractère | brave, lâche, pieux, cruel, juste, cupide, ambitieux, humble | modifient les stats, les opinions et les choix proposés |
| Traits acquis | estropié, balafré, ivrogne, érudit, excommunié | apparaissent après des événements |
| Santé | robuste, malade, blessé, mourant | espérance de vie |
| Fertilité | variable avec l'âge | naissance d'héritiers |
| Liens | parents, conjoint, enfants, amants, rivaux, amis | réseau d'intrigues |
| Secrets | bâtard caché, meurtre, hérésie | leviers de chantage |
| Mémoire | « a fait tuer mon père en 1192 » | base des conséquences à long terme |

**Opinion** : chaque personnage a une note d'opinion (–100 à +100) envers chaque
autre, calculée à partir de modificateurs datés, par exemple :
- « Lui a offert un fief » +30, pour 10 ans ;
- « A exécuté mon frère » –60, pour toute la vie ;
- traits opposés (pieux / cynique) –15 en permanence.

L'opinion décide de tout : vote des vassaux, acceptation d'un mariage, risque de
révolte, fidélité d'un commandant.

---

## 1.3 Dynastie et prestige

- **Maison** : branche de la dynastie, avec un chef de maison.
- **Renommée de la dynastie** : points cumulés par tous ses membres (titres
  tenus, guerres gagnées, mariages prestigieux). Elle débloque des avantages
  héréditaires.
- **Prestige** (personnel) : monnaie de la gloire, gagnée par les victoires et
  la générosité, dépensée pour revendiquer des titres ou imposer des lois.
- **Piété** : monnaie religieuse, gagnée par les dons et les pèlerinages,
  dépensée pour obtenir l'appui de l'Église.
- **Héraldique** : chaque dynastie a des armoiries. On peut les générer avec des
  règles de blason (émaux, partitions, meubles), sans dessin manuel.

---

## 1.4 Titres et hiérarchie féodale

| Rang | Titre (exemple) | Territoire |
|---|---|---|
| 1 | Baronnie / seigneurie, cité, évêché | un château, une ville, un domaine d'Église |
| 2 | Comté | une province (unité de base de la carte) |
| 3 | Duché | un groupe de comtés |
| 4 | Royaume | un groupe de duchés |
| 5 | Empire | un groupe de royaumes |

- **Domaine** : nombre limité de comtés qu'un seigneur peut tenir en propre ;
  au-delà, il doit les confier à des vassaux.
- **Vassaux** : ils paient un **impôt** et fournissent des **troupes** (levées)
  selon leur opinion et les lois du royaume.
- **De jure / de facto** : un titre a un territoire « de droit ». Tenir une terre
  qui appartient de droit au titre d'un autre crée une **revendication**.
- **Création d'un titre** : possible en contrôlant une part suffisante de son
  territoire de droit (par exemple 51 %) et en payant de l'or et du prestige.

---

## 1.5 Succession

C'est le moteur principal des conséquences à long terme.

| Loi | Effet | Conséquence typique |
|---|---|---|
| Partage (gavelkind) | les titres sont divisés entre les fils | le royaume éclate à chaque mort |
| Primogéniture | l'aîné hérite de tout | les cadets deviennent des rivaux |
| Élection | les grands vassaux votent | il faut acheter les votes |
| Séniorat | le plus âgé de la dynastie hérite | règnes courts, oncles puissants |
| Tanistrie | un héritier désigné parmi les parents | stabilité si l'opinion suit |

Variantes de genre : masculine (agnatique), préférence masculine (cognatique),
égalitaire. **Changer de loi** coûte cher, demande l'accord des vassaux et peut
déclencher une guerre civile.

---

## 1.6 Mariages et alliances

- **Mariage** : il crée une **alliance** entre les chefs des deux familles. Il
  peut faire hériter des terres d'une autre dynastie (mariage « matrilinéaire »).
- **Conditions** : âge, consanguinité (l'Église interdit les degrés proches),
  religion, rang.
- **Conséquences différées** : 20 ans plus tard, un petit-fils peut hériter du
  duché voisin, ou au contraire votre héritière l'emporter dans une autre maison.
- **Fiançailles** d'enfants : elles engagent l'avenir et peuvent être rompues,
  au prix d'une perte d'opinion.

---

## 1.7 Conseil et gouvernement

Cinq postes classiques, confiés à des personnages de la cour :
- **Chancelier** (diplomatie) : améliorer les relations, fabriquer des revendications ;
- **Maréchal** (guerre) : entraîner les troupes, contrôle de la population ;
- **Intendant** (gestion) : collecter l'impôt, développer les terres ;
- **Maître-espion** (intrigue) : découvrir les complots et les secrets ;
- **Chapelain** (savoir) : gagner la piété, convertir, apaiser l'Église.

Nommer un rival au conseil achète sa fidélité, mais lui donne du pouvoir.

---

## 1.8 Intrigues et complots

- **Complot** : l'initiateur recrute des complices. Le succès dépend de la
  puissance cumulée et du secret.
- **Types** : assassinat, enlèvement, séduction, fabrication de revendication,
  découverte de secrets.
- **Révélation** : un complot découvert devient un **secret**, puis un levier
  (chantage, emprisonnement légitime).
- **Factions** de vassaux mécontents : elles se forment autour d'une demande
  (indépendance, changer de souverain, baisser les impôts) et lancent un
  ultimatum, puis une guerre civile si leur puissance dépasse celle du suzerain.

---

## 1.9 Religion

- **Autorité religieuse** (pape, patriarche) : elle peut excommunier, accorder
  des dispenses de mariage, appeler à la **croisade**.
- **Hérésies** : elles apparaissent par événement et se propagent.
- **Guerres saintes** : casus belli religieux contre d'autres fois.
- **Évêchés** : vassaux d'Église qui paient la dîme et dont la nomination est un
  enjeu (querelle des investitures).

---

## 1.10 Événements et conséquences dans la durée

C'est le point que vous avez demandé de soigner. Techniques du genre :

1. **Marqueurs (« flags »)** : un choix pose un marqueur persistant, par exemple
   « a trahi le comte de Blois ». Des événements futurs ne se déclenchent que si
   ce marqueur existe.
2. **Chaînes d'événements** : un événement en programme un autre, des mois ou
   des années plus tard (« L'enfant que vous avez épargné revient, 15 ans après »).
3. **Modificateurs datés** : un effet qui dure (« Récolte gâtée : –30 % d'impôt
   pendant 3 ans »).
4. **Mémoire des personnages** : chaque personnage retient les actes importants
   le concernant, ce qui fixe son opinion et ses choix futurs.
5. **Héritage des rancunes** : les rivalités passent aux enfants (« vendetta »).
6. **Probabilités pondérées** : les traits changent les chances
   (un personnage cruel a plus de chances de choisir la torture).
7. **Événements de dynastie** : légitimité, bâtards reconnus, schismes familiaux.

Structure de données d'un événement (pour plus tard) :

```
id, titre, texte, conditions (qui ? quand ? marqueurs ?),
poids (probabilité), choix[] -> effets immédiats + effets différés
(marqueurs posés, événements programmés à N mois, modificateurs datés)
```

---

## 1.11 Guerre et armées (cœur du jeu demandé)

### Déclarer une guerre
- **Casus belli** obligatoire : revendication sur un titre, terre de droit,
  guerre sainte, conquête (si la culture ou le rang le permet), indépendance
  (pour un vassal), sous-revendication.
- Pas de casus belli = perte de prestige, opinion négative générale, voire
  excommunication.
- **Alliés** appelés aux armes ; ils viennent selon leur opinion.
- **Trêve** après une guerre : la briser coûte très cher.

### Composer une armée
| Composante | Origine | Caractéristiques |
|---|---|---|
| **Levées** | paysans fournis par le domaine et les vassaux | nombreuses, faibles, gratuites hors campagne, nuisent à l'économie si elles restent levées |
| **Troupes professionnelles** | régiments recrutés et entretenus | coûteuses, spécialisées (archers, piquiers, cavalerie lourde, arbalétriers) |
| **Chevaliers** | personnages de la cour bons à la guerre | bonus individuel ; peuvent être blessés, capturés ou tués |
| **Mercenaires** | compagnies louées | immédiatement disponibles, très chers |
| **Ordres saints** | ordres militaires religieux | disponibles pour les guerres saintes |

**Triangle de contres** (à concevoir nous-mêmes, exemple) :
- cavalerie lourde > archers et infanterie légère ;
- piquiers > cavalerie ;
- archers et arbalétriers > piquiers et infanterie lente ;
- engins de siège : inutiles en bataille, indispensables contre les places fortes.

### Commandement et bataille
- **Commandant** : sa caractéristique « guerre » et ses traits (stratège,
  téméraire, prudent) modifient l'issue.
- **Terrain** : plaine, forêt, colline, montagne, marais, rivière à traverser
  (malus d'attaque), désert. Défendre en colline donne un avantage.
- **Phases** : escarmouche (archers) → mêlée (infanterie, cavalerie) → poursuite
  (pertes du vaincu multipliées). Le **moral** compte autant que l'effectif.
- **Saisons** : l'hiver cause de l'attrition, le printemps et l'été sont les
  saisons de campagne.

### Sièges
- Chaque comté a un **niveau de fortification** (motte castrale, château de
  pierre, enceinte urbaine).
- Le siège dure des mois. Il est accéléré par les engins de siège et les
  maladies dans la place, et rendu possible par un assaut (pertes lourdes).
- Prendre un château fait gagner du **score de guerre**.

### Logistique
- **Ravitaillement** : chaque comté nourrit un nombre limité de soldats. Au-delà,
  c'est l'**attrition** (pertes mensuelles).
- **Pillage** : ravager les terres ennemies rapporte de l'or mais crée des
  rancunes durables.
- **Mouvement** : sur une carte de provinces adjacentes, coût selon le terrain.

### Fin de guerre
- **Score de guerre** (–100 à +100), alimenté par les batailles, les sièges, la
  capture du chef ennemi et l'occupation de la cible.
- À +100 : victoire imposée. Négociation possible avant (paix blanche, rançon).
- Conséquences : transfert du titre, rançons, prisonniers, trêve, prestige.

---

## 1.12 Économie (simple)

- **Or** : impôts du domaine, impôts des vassaux, pillage, rançons.
- **Dépenses** : entretien des troupes, constructions, cadeaux, pots-de-vin.
- **Développement** des comtés : il augmente l'impôt et les levées, mais
  lentement, sur des décennies.
- **Bâtiments** par comté : château, marché, caserne, église, ferme.

---

## 1.13 Garde-fous : ce qu'on ne copie pas

Pour rester un jeu original du même genre :
- **pas** le nom « Crusader Kings », ni un nom proche ;
- **pas** les noms de systèmes propres à ce jeu (par exemple ses noms de
  ressources, d'arbres de compétences, de jauges spécifiques) : on donne nos
  propres noms ;
- **pas** de textes d'événements recopiés ou paraphrasés ;
- **pas** son interface, ses portraits, sa carte ni sa musique ;
- **oui** à l'histoire réelle (dynasties, dates, titres historiques), qui
  appartient à tout le monde ;
- **oui** aux mécaniques générales du genre décrites ci-dessus.
