# CKm — Simulateur de dynasties médiévales (nom provisoire)

Jeu de grande stratégie médiévale pour mobile, centré sur les personnages et
les dynasties. Projet original : aucun graphisme, texte ou code repris d'un
jeu existant.

État : phase 1 terminée — prototype jouable du « monde vivant » (v0.1.0). Prochaine étape : la guerre.

## Documents de référence

- [GDD.md](GDD.md) : conception du jeu
- [ARCHITECTURE.md](ARCHITECTURE.md) : organisation technique et modèle de données
- [ROADMAP.md](ROADMAP.md) : feuille de route par phases
- [CHANGELOG.md](CHANGELOG.md) : journal des modifications
- [ART_DIRECTION.md](ART_DIRECTION.md) : charte graphique et système de portraits par calques
- [ASSETS_TODO.md](ASSETS_TODO.md) : images à produire avec ChatGPT (prompts)
- [recherche/](recherche/) : recherche préalable (mécaniques du genre,
  données historiques, départ en 1066)

## Lancer le jeu en local

```
cd app
npm install
npm run dev        # ouvre le jeu sur http://localhost:5173
npm test           # tests automatiques
npm run sim        # simulation de 300 ans avec statistiques (GRAINE=… ANS=…)
npm run art        # intègre les images déposées dans assets/
npm run art:todo   # régénère ASSETS_TODO.md depuis le catalogue
npm run build      # version de production dans app/dist
```
