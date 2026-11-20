# CKm — Simulateur de dynasties médiévales (nom provisoire)

Jeu de grande stratégie médiévale pour mobile, centré sur les personnages et
les dynasties. Projet original : aucun graphisme, texte ou code repris d'un
jeu existant.

État : phase 0 terminée (fondations techniques). Phase 1 en cours.

## Documents de référence

- [GDD.md](GDD.md) : conception du jeu
- [ARCHITECTURE.md](ARCHITECTURE.md) : organisation technique et modèle de données
- [ROADMAP.md](ROADMAP.md) : feuille de route par phases
- [CHANGELOG.md](CHANGELOG.md) : journal des modifications
- [recherche/](recherche/) : recherche préalable (mécaniques du genre,
  données historiques, départ en 1066)

## Lancer le jeu en local

```
cd app
npm install
npm run dev        # ouvre le jeu sur http://localhost:5173
npm test           # tests automatiques
npm run build      # version de production dans app/dist
```
