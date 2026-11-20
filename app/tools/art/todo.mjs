// Génère ASSETS_TODO.md (à la racine du dépôt) à partir de app/data/art/catalogue.json.
// Usage : node tools/art/todo.mjs
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const app = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const c = JSON.parse(readFileSync(resolve(app, 'data/art/catalogue.json'), 'utf8'));
const manifeste = existsSync(resolve(app, 'public/art/manifest.json')) ? JSON.parse(readFileSync(resolve(app, 'public/art/manifest.json'), 'utf8')) : { assets: {} };
const fait = (id) => (manifeste.assets[id] ? '✅' : '⬜');
const TEINTES = { peau: 'teinte de peau ajustée en jeu', cheveux: 'recoloré en jeu (couleur de cheveux)', etoffe: 'recoloré en jeu (couleur de la maison)' };

let md = `# ASSETS_TODO — images à produire avec ChatGPT

> Fichier **généré** par \`npm run art:todo\` à partir de \`app/data/art/catalogue.json\`.
> Ne pas modifier à la main : modifier le catalogue puis régénérer.
> La charte graphique est dans [ART_DIRECTION.md](ART_DIRECTION.md).

## Mode d'emploi (rappel)

1. Dans ChatGPT, **joignez le gabarit** \`assets/_gabarits/gabarit-portrait.png\` pour tous les calques de portrait,
   ainsi que le **visage de référence validé** (\`visage-h-adulte-1\`) dès qu'il existe.
2. Copiez le prompt **tel quel** (en anglais : le générateur le respecte mieux).
3. Téléchargez l'image en **PNG**, renommez-la exactement avec l'identifiant indiqué (ex. \`barbe-courte.png\`).
4. Déposez-la dans le dossier \`assets/\` du dépôt (sous-dossiers libres).
5. L'intégration (vérification, recadrage, WebP, manifeste) est automatique à la publication ; en local : \`npm run art\`.

Légende : ✅ intégrée · ⬜ à produire

`;
for (const [lot, nom] of Object.entries(c.lots)) {
  const items = c.assets.filter((a) => String(a.lot) === lot);
  if (!items.length) continue;
  md += `\n## ${nom}\n\n| | Identifiant (nom du fichier) | Catégorie | Format | Recoloration |\n|---|---|---|---|---|\n`;
  for (const a of items) {
    const f = c.formats[a.format];
    md += `| ${fait(a.id)} | \`${a.id}.png\` | ${c.categories.find((x) => x.id === a.categorie)?.nom ?? a.categorie} | ${f.largeur}×${f.hauteur}${f.transparent ? ', fond transparent' : ''} | ${a.teinte ? TEINTES[a.teinte] : '—'} |\n`;
  }
  for (const a of items) md += `\n### ${fait(a.id)} \`${a.id}.png\`\n\n\`\`\`text\n${a.prompt}\n\`\`\`\n`;
}
writeFileSync(resolve(app, '../ASSETS_TODO.md'), md);
console.log(`ASSETS_TODO.md : ${c.assets.length} images, ${Object.keys(manifeste.assets).length} intégrées`);
