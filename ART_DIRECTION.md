# ART_DIRECTION — Charte graphique

Version 1. Document de référence pour toutes les images du jeu, produites avec
ChatGPT (direction artistique et génération) et intégrées par Claude.

- **Liste des images à produire et leurs prompts** : [ASSETS_TODO.md](ASSETS_TODO.md)
  (généré depuis `app/data/art/catalogue.json`, la source unique).
- **Gabarit d'alignement** : `assets/_gabarits/gabarit-portrait.png`.

---

## 1. Intention

Un monde médiéval **réaliste et sobre**, vu à travers les yeux d'un chroniqueur :
la peinture de panneau et l'enluminure de la fin du XIᵉ siècle, mais avec la
lisibilité d'une interface moderne sur téléphone.

Trois mots : **grave, humain, lisible**.

- *Grave* : pas de fantasy, pas de couleurs criardes, pas d'héroïsme de film.
- *Humain* : des visages crédibles, marqués par l'âge, la maladie, la guerre.
- *Lisible* : chaque image doit se comprendre à 40 pixels de large.

## 2. Époque et exactitude historique (1066 → XIIIᵉ siècle)

Ce qui est juste vers 1066 :

| Thème | Oui | Non |
|---|---|---|
| Armures | haubert de mailles, casque conique à nasal, bouclier en amande | armure de plaques, heaume fermé, blasons complexes sur l'armure |
| Vêtements | tunique de laine, manteau rectangulaire agrafé à l'épaule par une fibule, braies | pourpoint, houppelande, manches à crevés (bien plus tardifs) |
| Femmes nobles | robe longue, voile de lin, guimpe pour les dames âgées ou veuves | hennin, coiffes à cornes |
| Couronnes | bandeau d'or à fleurons simples, cercle orné | couronnes fermées impériales, couronnes Renaissance |
| Architecture | roman : arcs en plein cintre, mottes castrales en bois, premiers donjons de pierre | gothique, vitraux flamboyants |
| Navires | navires de type viking (Tapisserie de Bayeux) | caravelles, galions |

Références visuelles libres de droits à garder en tête : la Tapisserie de Bayeux,
les enluminures romanes (Bible de Saint-Bénigne, Beatus), les fresques de
Saint-Savin-sur-Gartempe.

## 3. Palette

Les images reprennent les couleurs de l'interface (`app/src/ui/styles.css`).

| Rôle | Couleur | Usage |
|---|---|---|
| Parchemin | `#f2e8d5` | fonds clairs, interface |
| Encre | `#2b1d14` | traits, textes |
| Cire rouge | `#9b2a1e` | actions principales, sceaux |
| Or d'enluminure | `#b0821e` | couronnes, accents, rangs |
| Pigments | ocre, terre d'ombre, garance (rouge), guède (bleu), vert-de-gris | peinture des personnages et scènes |

Les **étoffes des personnages prennent la couleur de leur maison** : elles sont
peintes en gris neutre et recolorées par le jeu.

## 4. Système de portraits par calques (le cœur du dispositif)

### Principe

Au lieu de peindre un portrait par personnage (impossible : des milliers de
personnages naissent pendant une partie), on peint **une centaine de pièces
détachées** que le jeu superpose et recolore. Rien n'est généré par IA pendant
la partie : tout est calculé sur le téléphone, gratuitement, hors ligne.

Ordre d'empilement (du fond vers l'avant) :

| Ordre | Calque | Recoloré en jeu | Exemples |
|---|---|---|---|
| 0 | fond | non | tapisserie, pierre, enluminure |
| 10 | cheveux arrière | couleur de cheveux | longue chevelure derrière les épaules |
| 20 | visage (tête, cou, haut du torse) | teint (léger) | 5 âges × 2 sexes × 2 morphologies |
| 30 | marques | non | balafre, œil crevé, cache-œil, variole, maladie |
| 40 | vêtement | couleur de la maison | tunique, manteau, haubert, bure, robe |
| 50 | barbe | couleur de cheveux | courte, longue, moustache saxonne |
| 60 | cheveux | couleur de cheveux | coupe normande, tonsure, tresses |
| 70 | coiffe | selon le cas | voile, guimpe, capuche, mitre |
| 80 | couronne | non | royale, reine, ducale, comtale |

Combinatoire : avec 20 visages, 14 coiffures, 6 barbes, 12 vêtements, 5 coiffes,
4 couronnes, 8 couleurs de cheveux et 10 couleurs de maison, on obtient
**plusieurs centaines de milliers de combinaisons** vraisemblables.

Choix des calques : déterministe à partir de la graine du personnage, de son
sexe, de son âge, de son rang, de son rôle (enfant, clerc, roi, chevalier,
noble), de son mariage et de ses marques. Les cheveux grisonnent avec l'âge ; la
tonsure et l'habit remplacent les autres choix pour les religieux.

### Règles techniques des calques (impératives)

1. **Toile 1024 × 1536 px, portrait, PNG avec transparence.** C'est le format
   natif « portrait » de ChatGPT : aucune déformation.
2. **Vue de face**, le personnage regarde le spectateur.
3. **Alignement sur le gabarit** (`assets/_gabarits/gabarit-portrait.png`) :
   axe vertical x = 512, sommet du crâne y = 380, ligne des yeux y = 640,
   menton y = 880, épaules y = 1050. Joindre le gabarit à **chaque** demande.
4. **Un seul élément par image** : un calque « barbe » ne contient ni visage ni
   fond.
5. **Visages chauves et rasés**, sans vêtement : les cheveux, barbes et habits
   sont d'autres calques.
6. **Calques recolorables en gris neutre** (cheveux, barbes, étoffes) : aucune
   teinte, des valeurs moyennes avec ombres et lumières. Le jeu les multiplie
   par la couleur voulue.
7. **Lumière identique partout** : douce, venant du haut à gauche.

### Cadrages utilisés par le jeu

- Petit portrait (listes, arbre) : carré x 192→832, y 260→900.
- Fiche personnage : 4:5, x 152→872, y 240→1140.

Ces zones sont dessinées sur le gabarit : rien d'important ne doit en sortir.

## 5. Autres familles d'images

| Famille | Format | Usage | Règle |
|---|---|---|---|
| Scènes d'événements | 1536 × 1024, opaque | illustration des événements (mariage, bataille, peste…) | génériques et réutilisables : pas de visage reconnaissable, sujet au centre, lisible en petit |
| Fonds de portrait | 1024 × 1536, opaque | derrière les portraits | centre calme et sombre |
| Interface | 1024 × 1024 | texture parchemin (raccordable), icône d'application | sans texte |
| Écran titre | 1024 × 1536 | ouverture du jeu | ciel vide en haut pour le titre |

Ce que **Claude produit lui-même, sans IA d'image** : armoiries (générées selon
les règles du blason : émaux, partitions, meubles), icônes d'interface, carte
(Natural Earth), cadres et ornements simples. Cela garde l'identité cohérente et
le poids du jeu faible.

## 6. Méthode de production avec ChatGPT

1. **Lot 0 d'abord (5 images)** : un visage de référence, une coiffure, une
   barbe, un vêtement, une couronne. Claude les intègre et vérifie l'alignement
   en jeu. On ajuste la méthode avant de lancer la production en série.
2. Le visage `visage-h-adulte-1` validé devient la **référence de style** : le
   joindre, avec le gabarit, à toutes les demandes suivantes (« même style,
   même lumière, même échelle »).
3. Copier les prompts **tels quels** (en anglais, mieux suivis par le générateur).
4. Nommer chaque fichier exactement selon son identifiant (`barbe-courte.png`)
   et le déposer dans `assets/` (sous-dossiers libres).
5. Si un calque est légèrement décalé, ne pas le régénérer : ajouter un réglage
   dans `assets/reglages.json`, par exemple
   `{ "barbe-courte": { "dx": 0, "dy": -12, "echelle": 1.02 } }`
   (décalage en pixels de la toile 1024 × 1536).

## 7. Intégration et optimisation (automatiques)

`npm run art` (lancé aussi avant chaque construction du jeu) :

- reconnaît les fichiers par leur nom, signale les noms inconnus en proposant
  le nom le plus proche, vérifie proportions et transparence ;
- recale chaque image sur sa toile de référence (avec les réglages manuels) ;
- produit des **WebP** en deux tailles (portrait : 256 × 384 et 512 × 768 ; scènes :
  768 × 512 et 1536 × 1024), soit environ 10 à 40 Ko par calque ;
- écrit le manifeste lu par le jeu (`public/art/manifest.json`).

En jeu : chargement à la demande, mise en cache, taille choisie selon l'écran
(écrans haute densité inclus). Tant qu'une pièce manque, le personnage garde
son portrait dessiné de secours.

## 8. Ce qu'on s'interdit

- Reprendre le style, les personnages ou les visuels d'un jeu existant.
- Représenter des personnes réelles vivantes ou des œuvres protégées.
- Le texte dans les images (illisible sur téléphone, non traduisible).
- Les anachronismes listés au § 2.
