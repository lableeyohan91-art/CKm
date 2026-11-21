// Aperçu : compose des portraits comme le jeu (mêmes calques, mêmes teintes, mêmes cadrages).
// Usage : node tools/art/apercu.mjs [sortie.png]
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const app = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const m = JSON.parse(readFileSync(resolve(app, 'public/art/manifest.json'), 'utf8'));
const sortie = process.argv[2] ?? resolve(app, '../assets/_apercu.png');
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);

async function calque(id, couleur, force = 1) {
  const f = resolve(app, 'public', m.assets[id].fichiers['512']);
  const { data, info } = await sharp(f).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  if (couleur) {
    const c = hex(couleur).map((v) => 1 - force + force * v);
    for (let i = 0; i < data.length; i += 4) for (let k = 0; k < 3; k++) data[i + k] = Math.round(data[i + k] * c[k]);
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

const VARIANTES = [
  { cheveux: '#2a1d15', etoffe: '#8f2f25', couronne: true, barbe: true },
  { cheveux: '#c9a26a', etoffe: '#2d5683', couronne: false, barbe: true },
  { cheveux: '#93412a', etoffe: '#3d6b3f', couronne: false, barbe: false },
  { cheveux: '#8f8a82', etoffe: '#a77d26', couronne: true, barbe: true },
];
const tuiles = [];
for (const v of VARIANTES) {
  const pile = [];
  const has = (id) => !!m.assets[id];
  if (has('visage-h-adulte-1')) pile.push(await calque('visage-h-adulte-1', '#f8e8d9', 0.6));
  if (has('vetement-h-tunique')) pile.push(await calque('vetement-h-tunique', v.etoffe));
  if (v.barbe && has('barbe-courte')) pile.push(await calque('barbe-courte', v.cheveux));
  if (has('cheveux-h-court')) pile.push(await calque('cheveux-h-court', v.cheveux));
  if (v.couronne && has('couronne-royale')) pile.push(await calque('couronne-royale'));
  const toile = await sharp({ create: { width: 512, height: 768, channels: 4, background: '#6e2a22' } }).composite(pile.map((input) => ({ input }))).png().toBuffer();
  // cadrage fiche (4:5) : x 152→872, y 240→1140 sur 1024×1536 (moitié ici)
  tuiles.push(await sharp(toile).extract({ left: 76, top: 120, width: 360, height: 450 }).resize(240, 300).png().toBuffer());
  // cadrage petit portrait (carré) : x 212→812, y 290→890
  tuiles.push(await sharp(toile).extract({ left: 106, top: 145, width: 300, height: 300 }).resize(120, 120).png().toBuffer());
}
const W = VARIANTES.length * 250;
await sharp({ create: { width: W, height: 440, channels: 3, background: '#f2e8d5' } })
  .composite(tuiles.map((input, i) => ({ input, left: Math.floor(i / 2) * 250 + 5, top: i % 2 === 0 ? 5 : 312 }))).png().toFile(sortie);
console.log(`Aperçu écrit : ${sortie}`);
