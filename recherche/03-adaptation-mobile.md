# 3. Adapter le genre au téléphone

Les jeux du genre sont faits pour PC : écrans larges, centaines de provinces,
milliers de personnages, sessions longues. Voici les contraintes à respecter
et les choix qui en découlent.

---

## 3.1 Contraintes

| Contrainte | Conséquence pour la conception |
|---|---|
| Petit écran, utilisation à une main | menus par grandes cartes, boutons en bas, pas de survol à la souris |
| Sessions courtes (pauses, trajets) | jeu au tour par tour, sauvegarde automatique à chaque tour |
| Partie sur plusieurs jours | sauvegarde fiable, résumé « ce qui s'est passé » à la reprise |
| Puissance limitée | simulation simplifiée des personnages non joueurs (IA) |
| Pas de réseau garanti | le jeu doit tourner sans connexion une fois chargé |

---

## 3.2 Rythme proposé

- **Un tour = une saison** (4 tours par an).
- À chaque tour : 1 à 3 événements, les mouvements d'armées, les sièges, les
  rapports du conseil.
- Une vie de souverain ≈ 25 à 40 ans ≈ 100 à 160 tours.
- Une partie complète (1180 → 1300, par exemple) ≈ 480 tours, à jouer sur
  plusieurs jours ou semaines.

---

## 3.3 Écrans principaux (à concevoir)

1. **Cour** : votre personnage, sa famille, son conseil, ses ressources.
2. **Carte** : comtés colorés par royaume, armées, sièges en cours. Zoom et
   déplacement au doigt.
3. **Personnage** : fiche détaillée, opinion, actions possibles (marier,
   complot, nommer, emprisonner).
4. **Guerre** : casus belli, armées levées, score de guerre, négociation.
5. **Événement** : texte, illustration simple, 2 à 4 choix avec les
   conséquences annoncées ou cachées.
6. **Chronique** : journal de la dynastie (naissances, morts, guerres), utile
   pour suivre les conséquences dans la durée.

---

## 3.4 Sauvegarde

- Sauvegarde **automatique** à chaque tour dans le navigateur.
- **Export / import** d'un fichier de sauvegarde, pour ne pas perdre la partie
  si le navigateur efface ses données (à confirmer selon l'endroit où le jeu
  sera publié).
- Plusieurs emplacements de sauvegarde.

Point à vérifier : sur une page publiée sur claude.ai, la mémoire du navigateur
peut être vidée (navigation privée, nettoyage). Il faudra soit une sauvegarde
côté serveur, soit l'export de fichier, soit les deux.

---

## 3.5 Échelle de simulation (ordres de grandeur)

| Élément | Jeux PC du genre | Proposition mobile |
|---|---|---|
| Comtés | plusieurs milliers | 60 à 90 |
| Personnages vivants simulés | dizaines de milliers | 300 à 800 |
| Dynasties | plusieurs milliers | 30 à 60 |
| Types d'unités | une dizaine et plus | 6 à 8 |
| Événements écrits | plusieurs milliers | 150 à 300 pour une première version, enrichis ensuite |
