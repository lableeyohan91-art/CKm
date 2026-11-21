# ASSETS_TODO — images à produire avec ChatGPT

> Fichier **généré** par `npm run art:todo` à partir de `app/data/art/catalogue.json`.
> Ne pas modifier à la main : modifier le catalogue puis régénérer.
> La charte graphique est dans [ART_DIRECTION.md](ART_DIRECTION.md).

## Mode d'emploi (rappel)

1. Dans ChatGPT, **joignez le gabarit** `assets/_gabarits/gabarit-portrait.png` pour tous les calques de portrait,
   ainsi que le **visage de référence validé** (`visage-h-adulte-1`) dès qu'il existe.
2. Copiez le prompt **tel quel** (en anglais : le générateur le respecte mieux).
3. Téléchargez l'image en **PNG**, renommez-la exactement avec l'identifiant indiqué (ex. `barbe-courte.png`).
4. Déposez-la dans le dossier `assets/` du dépôt (sous-dossiers libres).
5. L'intégration (vérification, recadrage, WebP, manifeste) est automatique à la publication ; en local : `npm run art`.

Légende : ✅ intégrée · ⬜ à produire


## Lot 0 — test de cohérence (à faire en premier)

| | Identifiant (nom du fichier) | Catégorie | Format | Recoloration |
|---|---|---|---|---|
| ✅ | `visage-h-adulte-1.png` | Visages | 1024×1536, fond transparent | teinte de peau ajustée en jeu |
| ✅ | `cheveux-h-court.png` | Cheveux | 1024×1536, fond transparent | recoloré en jeu (couleur de cheveux) |
| ✅ | `barbe-courte.png` | Barbes | 1024×1536, fond transparent | recoloré en jeu (couleur de cheveux) |
| ✅ | `vetement-h-tunique.png` | Vêtements | 1024×1536, fond transparent | recoloré en jeu (couleur de la maison) |
| ✅ | `couronne-royale.png` | Couronnes | 1024×1536, fond transparent | — |

### ✅ `visage-h-adulte-1.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: the bare head, ears, neck and upper chest skin of a man of about 38, oval face, straight nose, calm neutral expression, fair European skin tone. The head is completely BALD and CLEAN-SHAVEN (hair and beard are separate layers), no clothing, no jewellery. Neck and chest end cleanly at the shoulder line so clothing layers can cover them.
```

### ✅ `cheveux-h-court.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: the hair only of an adult man: short cropped hair, Norman style. Paint this element in NEUTRAL GRAYSCALE ONLY (no hue at all, mid-gray values with natural highlights and shadows), because the game recolors it with multiply blending.
```

### ✅ `barbe-courte.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: facial hair only: a short neat full beard and moustache. Paint this element in NEUTRAL GRAYSCALE ONLY (no hue at all, mid-gray values with natural highlights and shadows), because the game recolors it with multiply blending.
```

### ✅ `vetement-h-tunique.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: clothing only, covering the shoulders and upper chest down to the bottom of the canvas: a nobleman's wool tunic with a round neckline and a simple embroidered border. Leave the neck opening empty (the neck is on another layer). Paint this element in NEUTRAL GRAYSCALE ONLY (no hue at all, mid-gray values with natural highlights and shadows), because the game recolors it with multiply blending.
```

### ✅ `couronne-royale.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: only the crown, resting on the head at the exact height of the template: an 11th-century royal crown: a gold band with four fleuron points and set gemstones. Polished gold, natural colours.
```

## Lot 1 — l'essentiel pour des portraits variés

| | Identifiant (nom du fichier) | Catégorie | Format | Recoloration |
|---|---|---|---|---|
| ⬜ | `fond-tapisserie-rouge.png` | Fonds | 1024×1536 | — |
| ⬜ | `fond-pierre.png` | Fonds | 1024×1536 | — |
| ⬜ | `visage-h-jeune-1.png` | Visages | 1024×1536, fond transparent | teinte de peau ajustée en jeu |
| ⬜ | `visage-h-jeune-2.png` | Visages | 1024×1536, fond transparent | teinte de peau ajustée en jeu |
| ⬜ | `visage-h-adulte-2.png` | Visages | 1024×1536, fond transparent | teinte de peau ajustée en jeu |
| ⬜ | `visage-f-jeune-1.png` | Visages | 1024×1536, fond transparent | teinte de peau ajustée en jeu |
| ⬜ | `visage-f-jeune-2.png` | Visages | 1024×1536, fond transparent | teinte de peau ajustée en jeu |
| ⬜ | `visage-f-adulte-1.png` | Visages | 1024×1536, fond transparent | teinte de peau ajustée en jeu |
| ⬜ | `visage-f-adulte-2.png` | Visages | 1024×1536, fond transparent | teinte de peau ajustée en jeu |
| ⬜ | `cheveux-h-nuque-rasee.png` | Cheveux | 1024×1536, fond transparent | recoloré en jeu (couleur de cheveux) |
| ⬜ | `cheveux-h-mi-long.png` | Cheveux | 1024×1536, fond transparent | recoloré en jeu (couleur de cheveux) |
| ⬜ | `cheveux-h-boucle.png` | Cheveux | 1024×1536, fond transparent | recoloré en jeu (couleur de cheveux) |
| ⬜ | `cheveux-h-degarni.png` | Cheveux | 1024×1536, fond transparent | recoloré en jeu (couleur de cheveux) |
| ⬜ | `cheveux-h-chauve-couronne.png` | Cheveux | 1024×1536, fond transparent | recoloré en jeu (couleur de cheveux) |
| ⬜ | `cheveux-f-tresses.png` | Cheveux | 1024×1536, fond transparent | recoloré en jeu (couleur de cheveux) |
| ⬜ | `cheveux-f-chignon.png` | Cheveux | 1024×1536, fond transparent | recoloré en jeu (couleur de cheveux) |
| ⬜ | `cheveux-f-lache.png` | Cheveux | 1024×1536, fond transparent | recoloré en jeu (couleur de cheveux) |
| ⬜ | `cheveux-arriere-f-long.png` | Cheveux (arrière) | 1024×1536, fond transparent | recoloré en jeu (couleur de cheveux) |
| ⬜ | `cheveux-arriere-f-tresses-dos.png` | Cheveux (arrière) | 1024×1536, fond transparent | recoloré en jeu (couleur de cheveux) |
| ⬜ | `barbe-longue.png` | Barbes | 1024×1536, fond transparent | recoloré en jeu (couleur de cheveux) |
| ⬜ | `barbe-moustache.png` | Barbes | 1024×1536, fond transparent | recoloré en jeu (couleur de cheveux) |
| ⬜ | `barbe-taillee.png` | Barbes | 1024×1536, fond transparent | recoloré en jeu (couleur de cheveux) |
| ⬜ | `barbe-hirsute.png` | Barbes | 1024×1536, fond transparent | recoloré en jeu (couleur de cheveux) |
| ⬜ | `barbe-barbe-naissante.png` | Barbes | 1024×1536, fond transparent | recoloré en jeu (couleur de cheveux) |
| ⬜ | `vetement-h-manteau.png` | Vêtements | 1024×1536, fond transparent | recoloré en jeu (couleur de la maison) |
| ⬜ | `vetement-h-manteau-royal.png` | Vêtements | 1024×1536, fond transparent | recoloré en jeu (couleur de la maison) |
| ⬜ | `vetement-h-haubert.png` | Vêtements | 1024×1536, fond transparent | — |
| ⬜ | `vetement-f-robe.png` | Vêtements | 1024×1536, fond transparent | recoloré en jeu (couleur de la maison) |
| ⬜ | `coiffe-voile.png` | Coiffes | 1024×1536, fond transparent | recoloré en jeu (couleur de la maison) |
| ⬜ | `couronne-reine.png` | Couronnes | 1024×1536, fond transparent | — |
| ⬜ | `couronne-ducale.png` | Couronnes | 1024×1536, fond transparent | — |
| ⬜ | `couronne-comtale.png` | Couronnes | 1024×1536, fond transparent | — |
| ⬜ | `ui-parchemin.png` | Interface | 1024×1024 | — |
| ⬜ | `ui-icone.png` | Interface | 1024×1024 | — |

### ⬜ `fond-tapisserie-rouge.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. Background only, no person: a dark madder-red wall hanging with a faint woven geometric pattern. Canvas exactly 1024x1536, portrait orientation, opaque. Leave the central area calm and slightly darker so a bust portrait can be placed on top.
```

### ⬜ `fond-pierre.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. Background only, no person: a rough grey limestone castle wall with a narrow arched window, dim. Canvas exactly 1024x1536, portrait orientation, opaque. Leave the central area calm and slightly darker so a bust portrait can be placed on top.
```

### ⬜ `visage-h-jeune-1.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: the bare head, ears, neck and upper chest skin of a young man of about 20, oval face, straight nose, calm neutral expression, fair European skin tone. The head is completely BALD and CLEAN-SHAVEN (hair and beard are separate layers), no clothing, no jewellery. Neck and chest end cleanly at the shoulder line so clothing layers can cover them.
```

### ⬜ `visage-h-jeune-2.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: the bare head, ears, neck and upper chest skin of a young man of about 20, broader face, stronger jaw, calm neutral expression, fair European skin tone. The head is completely BALD and CLEAN-SHAVEN (hair and beard are separate layers), no clothing, no jewellery. Neck and chest end cleanly at the shoulder line so clothing layers can cover them.
```

### ⬜ `visage-h-adulte-2.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: the bare head, ears, neck and upper chest skin of a man of about 38, broader face, stronger jaw, calm neutral expression, fair European skin tone. The head is completely BALD and CLEAN-SHAVEN (hair and beard are separate layers), no clothing, no jewellery. Neck and chest end cleanly at the shoulder line so clothing layers can cover them.
```

### ⬜ `visage-f-jeune-1.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: the bare head, ears, neck and upper chest skin of a young woman of about 20, oval face, straight nose, calm neutral expression, fair European skin tone. The head is completely BALD and CLEAN-SHAVEN (hair and beard are separate layers), no clothing, no jewellery. Neck and chest end cleanly at the shoulder line so clothing layers can cover them.
```

### ⬜ `visage-f-jeune-2.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: the bare head, ears, neck and upper chest skin of a young woman of about 20, rounder face, softer features, calm neutral expression, fair European skin tone. The head is completely BALD and CLEAN-SHAVEN (hair and beard are separate layers), no clothing, no jewellery. Neck and chest end cleanly at the shoulder line so clothing layers can cover them.
```

### ⬜ `visage-f-adulte-1.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: the bare head, ears, neck and upper chest skin of a woman of about 38, oval face, straight nose, calm neutral expression, fair European skin tone. The head is completely BALD and CLEAN-SHAVEN (hair and beard are separate layers), no clothing, no jewellery. Neck and chest end cleanly at the shoulder line so clothing layers can cover them.
```

### ⬜ `visage-f-adulte-2.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: the bare head, ears, neck and upper chest skin of a woman of about 38, rounder face, softer features, calm neutral expression, fair European skin tone. The head is completely BALD and CLEAN-SHAVEN (hair and beard are separate layers), no clothing, no jewellery. Neck and chest end cleanly at the shoulder line so clothing layers can cover them.
```

### ⬜ `cheveux-h-nuque-rasee.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: the hair only of an adult man: hair cut in a bowl shape with shaved back of the head, typical Norman fashion. Paint this element in NEUTRAL GRAYSCALE ONLY (no hue at all, mid-gray values with natural highlights and shadows), because the game recolors it with multiply blending.
```

### ⬜ `cheveux-h-mi-long.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: the hair only of an adult man: shoulder-length straight hair parted in the middle, Anglo-Saxon style. Paint this element in NEUTRAL GRAYSCALE ONLY (no hue at all, mid-gray values with natural highlights and shadows), because the game recolors it with multiply blending.
```

### ⬜ `cheveux-h-boucle.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: the hair only of an adult man: short curly hair. Paint this element in NEUTRAL GRAYSCALE ONLY (no hue at all, mid-gray values with natural highlights and shadows), because the game recolors it with multiply blending.
```

### ⬜ `cheveux-h-degarni.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: the hair only of an adult man: receding hairline with thin hair on the sides. Paint this element in NEUTRAL GRAYSCALE ONLY (no hue at all, mid-gray values with natural highlights and shadows), because the game recolors it with multiply blending.
```

### ⬜ `cheveux-h-chauve-couronne.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: the hair only of an adult man: bald crown with a ring of hair around the sides. Paint this element in NEUTRAL GRAYSCALE ONLY (no hue at all, mid-gray values with natural highlights and shadows), because the game recolors it with multiply blending.
```

### ⬜ `cheveux-f-tresses.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: the front and top hair only of a young noblewoman: two long braids falling over the shoulders. Paint this element in NEUTRAL GRAYSCALE ONLY (no hue at all, mid-gray values with natural highlights and shadows), because the game recolors it with multiply blending.
```

### ⬜ `cheveux-f-chignon.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: the front and top hair only of a young noblewoman: hair gathered in a low bun at the nape, center parting. Paint this element in NEUTRAL GRAYSCALE ONLY (no hue at all, mid-gray values with natural highlights and shadows), because the game recolors it with multiply blending.
```

### ⬜ `cheveux-f-lache.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: the front and top hair only of a young noblewoman: long loose hair with a center parting. Paint this element in NEUTRAL GRAYSCALE ONLY (no hue at all, mid-gray values with natural highlights and shadows), because the game recolors it with multiply blending.
```

### ⬜ `cheveux-arriere-f-long.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: ONLY the part of a woman's hair that is BEHIND her head and shoulders (it will be drawn under the face and clothing layers): long hair hanging behind the shoulders and back. Paint this element in NEUTRAL GRAYSCALE ONLY (no hue at all, mid-gray values with natural highlights and shadows), because the game recolors it with multiply blending.
```

### ⬜ `cheveux-arriere-f-tresses-dos.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: ONLY the part of a woman's hair that is BEHIND her head and shoulders (it will be drawn under the face and clothing layers): the back part of long braids, behind the shoulders. Paint this element in NEUTRAL GRAYSCALE ONLY (no hue at all, mid-gray values with natural highlights and shadows), because the game recolors it with multiply blending.
```

### ⬜ `barbe-longue.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: facial hair only: a long full beard reaching the upper chest. Paint this element in NEUTRAL GRAYSCALE ONLY (no hue at all, mid-gray values with natural highlights and shadows), because the game recolors it with multiply blending.
```

### ⬜ `barbe-moustache.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: facial hair only: a long drooping moustache with a clean-shaven chin, Anglo-Saxon style. Paint this element in NEUTRAL GRAYSCALE ONLY (no hue at all, mid-gray values with natural highlights and shadows), because the game recolors it with multiply blending.
```

### ⬜ `barbe-taillee.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: facial hair only: a trimmed pointed beard. Paint this element in NEUTRAL GRAYSCALE ONLY (no hue at all, mid-gray values with natural highlights and shadows), because the game recolors it with multiply blending.
```

### ⬜ `barbe-hirsute.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: facial hair only: an unkempt bushy beard. Paint this element in NEUTRAL GRAYSCALE ONLY (no hue at all, mid-gray values with natural highlights and shadows), because the game recolors it with multiply blending.
```

### ⬜ `barbe-barbe-naissante.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: facial hair only: a few days of stubble. Paint this element in NEUTRAL GRAYSCALE ONLY (no hue at all, mid-gray values with natural highlights and shadows), because the game recolors it with multiply blending.
```

### ⬜ `vetement-h-manteau.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: clothing only, covering the shoulders and upper chest down to the bottom of the canvas: a nobleman's rectangular cloak fastened on the right shoulder with a round brooch, over a tunic. Leave the neck opening empty (the neck is on another layer). Paint this element in NEUTRAL GRAYSCALE ONLY (no hue at all, mid-gray values with natural highlights and shadows), because the game recolors it with multiply blending.
```

### ⬜ `vetement-h-manteau-royal.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: clothing only, covering the shoulders and upper chest down to the bottom of the canvas: a royal mantle lined with ermine fur, over a rich tunic with embroidered collar. Leave the neck opening empty (the neck is on another layer). Paint this element in NEUTRAL GRAYSCALE ONLY (no hue at all, mid-gray values with natural highlights and shadows), because the game recolors it with multiply blending.
```

### ⬜ `vetement-h-haubert.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: clothing only, covering the shoulders and upper chest down to the bottom of the canvas: a knight's chainmail hauberk with mail coif lowered on the shoulders (11th-century Norman style), steel grey. Leave the neck opening empty (the neck is on another layer). Use natural historical colours.
```

### ⬜ `vetement-f-robe.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: clothing only, covering the shoulders and upper chest down to the bottom of the canvas: a noblewoman's long-sleeved wool gown with an embroidered neckline. Leave the neck opening empty (the neck is on another layer). Paint this element in NEUTRAL GRAYSCALE ONLY (no hue at all, mid-gray values with natural highlights and shadows), because the game recolors it with multiply blending.
```

### ⬜ `coiffe-voile.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: headwear only: a simple linen veil covering the hair and falling on the shoulders. Paint this element in NEUTRAL GRAYSCALE ONLY (no hue at all, mid-gray values with natural highlights and shadows), because the game recolors it with multiply blending.
```

### ⬜ `couronne-reine.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: only the crown, resting on the head at the exact height of the template: a queen's slender gold crown with small fleurons, worn over a veil. Polished gold, natural colours.
```

### ⬜ `couronne-ducale.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: only the crown, resting on the head at the exact height of the template: a ducal golden circlet with small pearls. Polished gold, natural colours.
```

### ⬜ `couronne-comtale.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: only the crown, resting on the head at the exact height of the template: a plain thin golden circlet. Polished gold, natural colours.
```

### ⬜ `ui-parchemin.png`

```text
Seamless tileable texture of aged parchment, subtle fibres and light stains, very low contrast, warm cream colour. Canvas exactly 1024x1024, opaque, must tile perfectly on all edges. No text, no drawings.
```

### ⬜ `ui-icone.png`

```text
App icon for a medieval dynasty strategy game: a golden crown resting above a red wax seal stamped with a stylised tree of lineage, on a deep woad-blue background. Simple, bold, readable at 48 pixels. Canvas exactly 1024x1024, opaque, no text.
```

## Lot 2 — diversité (âges, rôles, scènes clés)

| | Identifiant (nom du fichier) | Catégorie | Format | Recoloration |
|---|---|---|---|---|
| ⬜ | `visage-h-enfant-1.png` | Visages | 1024×1536, fond transparent | teinte de peau ajustée en jeu |
| ⬜ | `visage-h-enfant-2.png` | Visages | 1024×1536, fond transparent | teinte de peau ajustée en jeu |
| ⬜ | `visage-h-mur-1.png` | Visages | 1024×1536, fond transparent | teinte de peau ajustée en jeu |
| ⬜ | `visage-h-mur-2.png` | Visages | 1024×1536, fond transparent | teinte de peau ajustée en jeu |
| ⬜ | `visage-h-vieux-1.png` | Visages | 1024×1536, fond transparent | teinte de peau ajustée en jeu |
| ⬜ | `visage-h-vieux-2.png` | Visages | 1024×1536, fond transparent | teinte de peau ajustée en jeu |
| ⬜ | `visage-f-enfant-1.png` | Visages | 1024×1536, fond transparent | teinte de peau ajustée en jeu |
| ⬜ | `visage-f-enfant-2.png` | Visages | 1024×1536, fond transparent | teinte de peau ajustée en jeu |
| ⬜ | `visage-f-mur-1.png` | Visages | 1024×1536, fond transparent | teinte de peau ajustée en jeu |
| ⬜ | `visage-f-mur-2.png` | Visages | 1024×1536, fond transparent | teinte de peau ajustée en jeu |
| ⬜ | `visage-f-vieux-1.png` | Visages | 1024×1536, fond transparent | teinte de peau ajustée en jeu |
| ⬜ | `visage-f-vieux-2.png` | Visages | 1024×1536, fond transparent | teinte de peau ajustée en jeu |
| ⬜ | `cheveux-h-tonsure.png` | Cheveux | 1024×1536, fond transparent | recoloré en jeu (couleur de cheveux) |
| ⬜ | `cheveux-h-enfant.png` | Cheveux | 1024×1536, fond transparent | recoloré en jeu (couleur de cheveux) |
| ⬜ | `cheveux-f-enfant.png` | Cheveux | 1024×1536, fond transparent | recoloré en jeu (couleur de cheveux) |
| ⬜ | `vetement-h-froc.png` | Vêtements | 1024×1536, fond transparent | — |
| ⬜ | `vetement-h-eveque.png` | Vêtements | 1024×1536, fond transparent | recoloré en jeu (couleur de la maison) |
| ⬜ | `vetement-h-enfant.png` | Vêtements | 1024×1536, fond transparent | recoloré en jeu (couleur de la maison) |
| ⬜ | `vetement-f-manteau.png` | Vêtements | 1024×1536, fond transparent | recoloré en jeu (couleur de la maison) |
| ⬜ | `vetement-f-robe-royale.png` | Vêtements | 1024×1536, fond transparent | recoloré en jeu (couleur de la maison) |
| ⬜ | `vetement-f-nonne.png` | Vêtements | 1024×1536, fond transparent | — |
| ⬜ | `vetement-f-enfant.png` | Vêtements | 1024×1536, fond transparent | recoloré en jeu (couleur de la maison) |
| ⬜ | `coiffe-voile-guimpe.png` | Coiffes | 1024×1536, fond transparent | — |
| ⬜ | `coiffe-nonne.png` | Coiffes | 1024×1536, fond transparent | — |
| ⬜ | `coiffe-capuche.png` | Coiffes | 1024×1536, fond transparent | recoloré en jeu (couleur de la maison) |
| ⬜ | `coiffe-mitre.png` | Coiffes | 1024×1536, fond transparent | — |
| ⬜ | `marque-balafre.png` | Marques et cicatrices | 1024×1536, fond transparent | — |
| ⬜ | `marque-oeil-creve.png` | Marques et cicatrices | 1024×1536, fond transparent | — |
| ⬜ | `marque-cache-oeil.png` | Marques et cicatrices | 1024×1536, fond transparent | — |
| ⬜ | `marque-variole.png` | Marques et cicatrices | 1024×1536, fond transparent | — |
| ⬜ | `marque-malade.png` | Marques et cicatrices | 1024×1536, fond transparent | — |
| ⬜ | `scene-mariage.png` | Scènes d'événements | 1536×1024 | — |
| ⬜ | `scene-naissance.png` | Scènes d'événements | 1536×1024 | — |
| ⬜ | `scene-funerailles.png` | Scènes d'événements | 1536×1024 | — |
| ⬜ | `scene-couronnement.png` | Scènes d'événements | 1536×1024 | — |
| ⬜ | `scene-bataille.png` | Scènes d'événements | 1536×1024 | — |
| ⬜ | `scene-siege.png` | Scènes d'événements | 1536×1024 | — |
| ⬜ | `ui-ecran-titre.png` | Interface | 1024×1536 | — |

### ⬜ `visage-h-enfant-1.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: the bare head, ears, neck and upper chest skin of a boy of about 8, oval face, straight nose, calm neutral expression, fair European skin tone. The head is completely BALD and CLEAN-SHAVEN (hair and beard are separate layers), no clothing, no jewellery. Neck and chest end cleanly at the shoulder line so clothing layers can cover them.
```

### ⬜ `visage-h-enfant-2.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: the bare head, ears, neck and upper chest skin of a boy of about 8, broader face, stronger jaw, calm neutral expression, fair European skin tone. The head is completely BALD and CLEAN-SHAVEN (hair and beard are separate layers), no clothing, no jewellery. Neck and chest end cleanly at the shoulder line so clothing layers can cover them.
```

### ⬜ `visage-h-mur-1.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: the bare head, ears, neck and upper chest skin of a mature man of about 55, oval face, straight nose, calm neutral expression, fair European skin tone. The head is completely BALD and CLEAN-SHAVEN (hair and beard are separate layers), no clothing, no jewellery. Neck and chest end cleanly at the shoulder line so clothing layers can cover them.
```

### ⬜ `visage-h-mur-2.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: the bare head, ears, neck and upper chest skin of a mature man of about 55, broader face, stronger jaw, calm neutral expression, fair European skin tone. The head is completely BALD and CLEAN-SHAVEN (hair and beard are separate layers), no clothing, no jewellery. Neck and chest end cleanly at the shoulder line so clothing layers can cover them.
```

### ⬜ `visage-h-vieux-1.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: the bare head, ears, neck and upper chest skin of an elderly man of about 72 with deep wrinkles, oval face, straight nose, calm neutral expression, fair European skin tone. The head is completely BALD and CLEAN-SHAVEN (hair and beard are separate layers), no clothing, no jewellery. Neck and chest end cleanly at the shoulder line so clothing layers can cover them.
```

### ⬜ `visage-h-vieux-2.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: the bare head, ears, neck and upper chest skin of an elderly man of about 72 with deep wrinkles, broader face, stronger jaw, calm neutral expression, fair European skin tone. The head is completely BALD and CLEAN-SHAVEN (hair and beard are separate layers), no clothing, no jewellery. Neck and chest end cleanly at the shoulder line so clothing layers can cover them.
```

### ⬜ `visage-f-enfant-1.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: the bare head, ears, neck and upper chest skin of a girl of about 8, oval face, straight nose, calm neutral expression, fair European skin tone. The head is completely BALD and CLEAN-SHAVEN (hair and beard are separate layers), no clothing, no jewellery. Neck and chest end cleanly at the shoulder line so clothing layers can cover them.
```

### ⬜ `visage-f-enfant-2.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: the bare head, ears, neck and upper chest skin of a girl of about 8, rounder face, softer features, calm neutral expression, fair European skin tone. The head is completely BALD and CLEAN-SHAVEN (hair and beard are separate layers), no clothing, no jewellery. Neck and chest end cleanly at the shoulder line so clothing layers can cover them.
```

### ⬜ `visage-f-mur-1.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: the bare head, ears, neck and upper chest skin of a mature woman of about 55, oval face, straight nose, calm neutral expression, fair European skin tone. The head is completely BALD and CLEAN-SHAVEN (hair and beard are separate layers), no clothing, no jewellery. Neck and chest end cleanly at the shoulder line so clothing layers can cover them.
```

### ⬜ `visage-f-mur-2.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: the bare head, ears, neck and upper chest skin of a mature woman of about 55, rounder face, softer features, calm neutral expression, fair European skin tone. The head is completely BALD and CLEAN-SHAVEN (hair and beard are separate layers), no clothing, no jewellery. Neck and chest end cleanly at the shoulder line so clothing layers can cover them.
```

### ⬜ `visage-f-vieux-1.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: the bare head, ears, neck and upper chest skin of an elderly woman of about 72 with deep wrinkles, oval face, straight nose, calm neutral expression, fair European skin tone. The head is completely BALD and CLEAN-SHAVEN (hair and beard are separate layers), no clothing, no jewellery. Neck and chest end cleanly at the shoulder line so clothing layers can cover them.
```

### ⬜ `visage-f-vieux-2.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: the bare head, ears, neck and upper chest skin of an elderly woman of about 72 with deep wrinkles, rounder face, softer features, calm neutral expression, fair European skin tone. The head is completely BALD and CLEAN-SHAVEN (hair and beard are separate layers), no clothing, no jewellery. Neck and chest end cleanly at the shoulder line so clothing layers can cover them.
```

### ⬜ `cheveux-h-tonsure.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: monastic tonsure only: shaved crown with a short ring of hair. Paint this element in NEUTRAL GRAYSCALE ONLY (no hue at all, mid-gray values with natural highlights and shadows), because the game recolors it with multiply blending.
```

### ⬜ `cheveux-h-enfant.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: hair only: short tousled hair of a boy. Paint this element in NEUTRAL GRAYSCALE ONLY (no hue at all, mid-gray values with natural highlights and shadows), because the game recolors it with multiply blending.
```

### ⬜ `cheveux-f-enfant.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: hair only: long hair of a girl, held by a thin ribbon. Paint this element in NEUTRAL GRAYSCALE ONLY (no hue at all, mid-gray values with natural highlights and shadows), because the game recolors it with multiply blending.
```

### ⬜ `vetement-h-froc.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: clothing only, covering the shoulders and upper chest down to the bottom of the canvas: a Benedictine monk's black habit with a hood resting on the shoulders. Leave the neck opening empty (the neck is on another layer). Use natural historical colours.
```

### ⬜ `vetement-h-eveque.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: clothing only, covering the shoulders and upper chest down to the bottom of the canvas: a bishop's chasuble with an embroidered orphrey and a pallium. Leave the neck opening empty (the neck is on another layer). Paint this element in NEUTRAL GRAYSCALE ONLY (no hue at all, mid-gray values with natural highlights and shadows), because the game recolors it with multiply blending.
```

### ⬜ `vetement-h-enfant.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: clothing only, covering the shoulders and upper chest down to the bottom of the canvas: a boy's simple linen tunic. Leave the neck opening empty (the neck is on another layer). Paint this element in NEUTRAL GRAYSCALE ONLY (no hue at all, mid-gray values with natural highlights and shadows), because the game recolors it with multiply blending.
```

### ⬜ `vetement-f-manteau.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: clothing only, covering the shoulders and upper chest down to the bottom of the canvas: a noblewoman's cloak fastened at the chest with a brooch, over a gown. Leave the neck opening empty (the neck is on another layer). Paint this element in NEUTRAL GRAYSCALE ONLY (no hue at all, mid-gray values with natural highlights and shadows), because the game recolors it with multiply blending.
```

### ⬜ `vetement-f-robe-royale.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: clothing only, covering the shoulders and upper chest down to the bottom of the canvas: a queen's rich gown with a fur-lined mantle. Leave the neck opening empty (the neck is on another layer). Paint this element in NEUTRAL GRAYSCALE ONLY (no hue at all, mid-gray values with natural highlights and shadows), because the game recolors it with multiply blending.
```

### ⬜ `vetement-f-nonne.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: clothing only, covering the shoulders and upper chest down to the bottom of the canvas: a Benedictine nun's black habit. Leave the neck opening empty (the neck is on another layer). Use natural historical colours.
```

### ⬜ `vetement-f-enfant.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: clothing only, covering the shoulders and upper chest down to the bottom of the canvas: a girl's simple linen dress. Leave the neck opening empty (the neck is on another layer). Paint this element in NEUTRAL GRAYSCALE ONLY (no hue at all, mid-gray values with natural highlights and shadows), because the game recolors it with multiply blending.
```

### ⬜ `coiffe-voile-guimpe.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: headwear only: a veil with a wimple covering the neck and chin sides (barbette), for an older or widowed lady. Use natural historical colours.
```

### ⬜ `coiffe-nonne.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: headwear only: a nun's black veil and white wimple. Use natural historical colours.
```

### ⬜ `coiffe-capuche.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: headwear only: a wool hood (chaperon) worn on the head. Paint this element in NEUTRAL GRAYSCALE ONLY (no hue at all, mid-gray values with natural highlights and shadows), because the game recolors it with multiply blending.
```

### ⬜ `coiffe-mitre.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: headwear only: a low 11th-century bishop's mitre with two soft peaks. Use natural historical colours.
```

### ⬜ `marque-balafre.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: only this mark on the face, on an otherwise empty transparent canvas: a healed sword scar across the left cheek. Natural colours, partially transparent edges so it blends with any skin tone.
```

### ⬜ `marque-oeil-creve.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: only this mark on the face, on an otherwise empty transparent canvas: a scarred, closed right eye. Natural colours, partially transparent edges so it blends with any skin tone.
```

### ⬜ `marque-cache-oeil.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: only this mark on the face, on an otherwise empty transparent canvas: a leather eye patch over the right eye. Natural colours, partially transparent edges so it blends with any skin tone.
```

### ⬜ `marque-variole.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: only this mark on the face, on an otherwise empty transparent canvas: faint smallpox scars on the cheeks and forehead. Natural colours, partially transparent edges so it blends with any skin tone.
```

### ⬜ `marque-malade.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. LAYER ASSET for a layered character-portrait system. Canvas exactly 1024x1536 pixels, portrait orientation, fully transparent background (PNG with alpha channel). Front view, the person looks straight at the viewer. Match EXACTLY the position, scale and proportions of the attached template image gabarit-portrait.png (head centred horizontally at x=512, top of skull at y=380, eye line at y=640, chin at y=880, shoulders at y=1050). Draw ONLY the element described below and nothing else: no background, no frame, no text, no extra body parts. Element: only this mark on the face, on an otherwise empty transparent canvas: a sickly pale tint with dark circles under the eyes (semi-transparent overlay). Natural colours, partially transparent edges so it blends with any skin tone.
```

### ⬜ `scene-mariage.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. Scene illustration (no text, no frame): a noble wedding at the door of a Romanesque church, the couple joining hands before a priest. Wide format, canvas exactly 1536x1024, landscape, opaque. Composition readable at small size on a phone, main subject in the central third.
```

### ⬜ `scene-naissance.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. Scene illustration (no text, no frame): a noblewoman resting after childbirth in a curtained bed, a midwife holding the swaddled newborn. Wide format, canvas exactly 1536x1024, landscape, opaque. Composition readable at small size on a phone, main subject in the central third.
```

### ⬜ `scene-funerailles.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. Scene illustration (no text, no frame): the funeral of a lord: a draped bier in a candle-lit Romanesque church, mourners in dark cloaks. Wide format, canvas exactly 1536x1024, landscape, opaque. Composition readable at small size on a phone, main subject in the central third.
```

### ⬜ `scene-couronnement.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. Scene illustration (no text, no frame): the coronation of a king by an archbishop in a cathedral. Wide format, canvas exactly 1536x1024, landscape, opaque. Composition readable at small size on a phone, main subject in the central third.
```

### ⬜ `scene-bataille.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. Scene illustration (no text, no frame): a cavalry charge of Norman knights with kite shields against an Anglo-Saxon shield wall on a hill. Wide format, canvas exactly 1536x1024, landscape, opaque. Composition readable at small size on a phone, main subject in the central third.
```

### ⬜ `scene-siege.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. Scene illustration (no text, no frame): the siege of a motte-and-bailey castle with a wooden palisade, attackers with ladders and fire. Wide format, canvas exactly 1536x1024, landscape, opaque. Composition readable at small size on a phone, main subject in the central third.
```

### ⬜ `ui-ecran-titre.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. Title screen illustration without any text: a Norman castle on a hill at dawn over the sea, banners in the wind, a fleet in the distance. Canvas exactly 1024x1536 portrait, opaque, with an empty calm sky area in the top third for the game title.
```

## Lot 3 — enrichissement

| | Identifiant (nom du fichier) | Catégorie | Format | Recoloration |
|---|---|---|---|---|
| ⬜ | `fond-enluminure-bleue.png` | Fonds | 1024×1536 | — |
| ⬜ | `fond-bois.png` | Fonds | 1024×1536 | — |
| ⬜ | `fond-verdure.png` | Fonds | 1024×1536 | — |
| ⬜ | `fond-cloitre.png` | Fonds | 1024×1536 | — |
| ⬜ | `scene-festin.png` | Scènes d'événements | 1536×1024 | — |
| ⬜ | `scene-conseil.png` | Scènes d'événements | 1536×1024 | — |
| ⬜ | `scene-complot.png` | Scènes d'événements | 1536×1024 | — |
| ⬜ | `scene-chasse.png` | Scènes d'événements | 1536×1024 | — |
| ⬜ | `scene-maladie.png` | Scènes d'événements | 1536×1024 | — |
| ⬜ | `scene-famine.png` | Scènes d'événements | 1536×1024 | — |
| ⬜ | `scene-priere.png` | Scènes d'événements | 1536×1024 | — |
| ⬜ | `scene-pelerinage.png` | Scènes d'événements | 1536×1024 | — |
| ⬜ | `scene-traversee.png` | Scènes d'événements | 1536×1024 | — |
| ⬜ | `scene-revolte.png` | Scènes d'événements | 1536×1024 | — |

### ⬜ `fond-enluminure-bleue.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. Background only, no person: a deep woad-blue background with a subtle gold diaper pattern, like a manuscript illumination. Canvas exactly 1024x1536, portrait orientation, opaque. Leave the central area calm and slightly darker so a bust portrait can be placed on top.
```

### ⬜ `fond-bois.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. Background only, no person: dark oak panelling of a great hall lit by firelight. Canvas exactly 1024x1536, portrait orientation, opaque. Leave the central area calm and slightly darker so a bust portrait can be placed on top.
```

### ⬜ `fond-verdure.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. Background only, no person: a muted green tapestry with stylised leaves. Canvas exactly 1024x1536, portrait orientation, opaque. Leave the central area calm and slightly darker so a bust portrait can be placed on top.
```

### ⬜ `fond-cloitre.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. Background only, no person: a softly blurred Romanesque cloister arcade. Canvas exactly 1024x1536, portrait orientation, opaque. Leave the central area calm and slightly darker so a bust portrait can be placed on top.
```

### ⬜ `scene-festin.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. Scene illustration (no text, no frame): a feast in a timber great hall, a lord at the high table, minstrels playing. Wide format, canvas exactly 1536x1024, landscape, opaque. Composition readable at small size on a phone, main subject in the central third.
```

### ⬜ `scene-conseil.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. Scene illustration (no text, no frame): a lord holding council with his advisers around a table with a parchment map. Wide format, canvas exactly 1536x1024, landscape, opaque. Composition readable at small size on a phone, main subject in the central third.
```

### ⬜ `scene-complot.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. Scene illustration (no text, no frame): two conspirators whispering in a dark stone corridor by candlelight. Wide format, canvas exactly 1536x1024, landscape, opaque. Composition readable at small size on a phone, main subject in the central third.
```

### ⬜ `scene-chasse.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. Scene illustration (no text, no frame): a noble hunting party with hounds and falcons in an autumn forest. Wide format, canvas exactly 1536x1024, landscape, opaque. Composition readable at small size on a phone, main subject in the central third.
```

### ⬜ `scene-maladie.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. Scene illustration (no text, no frame): a physician-monk tending a feverish noble in bed, herbs and a basin. Wide format, canvas exactly 1536x1024, landscape, opaque. Composition readable at small size on a phone, main subject in the central third.
```

### ⬜ `scene-famine.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. Scene illustration (no text, no frame): starving peasants before an empty granary under a grey sky. Wide format, canvas exactly 1536x1024, landscape, opaque. Composition readable at small size on a phone, main subject in the central third.
```

### ⬜ `scene-priere.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. Scene illustration (no text, no frame): a noble kneeling in prayer before an altar in a small chapel. Wide format, canvas exactly 1536x1024, landscape, opaque. Composition readable at small size on a phone, main subject in the central third.
```

### ⬜ `scene-pelerinage.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. Scene illustration (no text, no frame): pilgrims with staffs and scallop shells on a road toward a distant church. Wide format, canvas exactly 1536x1024, landscape, opaque. Composition readable at small size on a phone, main subject in the central third.
```

### ⬜ `scene-traversee.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. Scene illustration (no text, no frame): a fleet of Viking-style longships with horses crossing the Channel. Wide format, canvas exactly 1536x1024, landscape, opaque. Composition readable at small size on a phone, main subject in the central third.
```

### ⬜ `scene-revolte.png`

```text
Realistic medieval portrait painting set in Western Europe around 1066 (Norman and Anglo-Saxon era). Refined egg-tempera and oil panel technique with a subtle illuminated-manuscript influence, fine visible brushwork, soft warm light from the upper left, earthy natural palette (ochre, umber, madder red, woad blue, verdigris green). Historically accurate: no plate armour, no Renaissance or Gothic fashion, no modern elements. Scene illustration (no text, no frame): angry peasants with pitchforks and torches before a manor gate. Wide format, canvas exactly 1536x1024, landscape, opaque. Composition readable at small size on a phone, main subject in the central third.
```
