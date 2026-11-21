// Intègre les images déposées dans assets/ : vérification, recadrage, conversion WebP, manifeste.
// Usage : node tools/art/integrer.mjs   (variable ASSETS_DIR pour un autre dossier source)
import sharp from 'sharp';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const app = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const src = resolve(process.env.ASSETS_DIR ?? resolve(app, '../assets'));
const dest = resolve(app, 'public/art');
const catalogue = JSON.parse(readFileSync(resolve(app, 'data/art/catalogue.json'), 'utf8'));
const reglages = existsSync(join(src, 'reglages.json')) ? JSON.parse(readFileSync(join(src, 'reglages.json'), 'utf8')) : {};

function fichiers(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    if (n.startsWith('_') || n.startsWith('.')) return [];
    return statSync(p).isDirectory() ? fichiers(p) : /\.(png|webp|jpe?g)$/i.test(n) ? [p] : [];
  });
}

/**
 * Préparation selon la catégorie :
 * - barbe : retire les lèvres éventuellement peintes (pixels roses saturés), qui appartiennent au visage ;
 * - calques recolorables (cheveux, étoffes) : passage en gris neutre puis étirement des valeurs,
 *   pour que la recoloration par multiplication donne aussi bien du blond que du noir.
 */
async function preparer(source, a) {
  if (a.teinte !== 'cheveux' && a.teinte !== 'etoffe') return sharp(source).png().toBuffer();
  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const lum = new Float32Array(info.width * info.height);
  const vals = [];
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
    if (a.categorie === 'barbe') {
      const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
      const sat = max === min ? 0 : (max - min) / (1 - Math.abs(2 * l - 1));
      const rouge = r >= g && r >= b && (r - b) > 0.12 && (r - g) > 0.1;
      if (rouge && sat > 0.28 && l > 0.42) { data[i + 3] = 0; continue; }
    }
    lum[p] = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    if (data[i + 3] > 128) vals.push(lum[p]);
  }
  vals.sort((x, y) => x - y);
  const bas = vals[Math.floor(vals.length * 0.02)] ?? 0, haut = vals[Math.floor(vals.length * 0.98)] ?? 1;
  const cibleBas = 0.18, cibleHaut = 0.95;
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const t = Math.min(1, Math.max(0, (lum[p] - bas) / Math.max(0.01, haut - bas)));
    const v = Math.round((cibleBas + t * (cibleHaut - cibleBas)) * 255);
    data[i] = data[i + 1] = data[i + 2] = v;
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

const parId = new Map(fichiers(src).map((p) => [basename(p, extname(p)).toLowerCase(), p]));
const connus = new Set(catalogue.assets.map((a) => a.id));
const manifeste = { version: 1, assets: {} };
const rapport = { integres: [], avertissements: [], inconnus: [] };
mkdirSync(dest, { recursive: true });

for (const a of catalogue.assets) {
  const source = parId.get(a.id);
  if (!source) continue;
  const f = catalogue.formats[a.format];
  const meta = await sharp(source).metadata();
  const ratioAttendu = f.largeur / f.hauteur, ratio = meta.width / meta.height;
  if (Math.abs(ratio - ratioAttendu) / ratioAttendu > 0.02) rapport.avertissements.push(`${a.id} : proportions ${meta.width}x${meta.height} au lieu de ${f.largeur}x${f.hauteur} (l'image sera ajustée, vérifiez l'alignement)`);
  if (f.transparent && !meta.hasAlpha) rapport.avertissements.push(`${a.id} : pas de transparence alors qu'un calque transparent est attendu`);
  // Mise à l'échelle sur la toile de référence, puis réglage manuel éventuel (décalage, échelle)
  const r = reglages[a.id] ?? {};
  const echelle = r.echelle ?? 1;
  const lw = Math.round(f.largeur * echelle), lh = Math.round(f.hauteur * echelle);
  const fond = f.transparent ? { r: 0, g: 0, b: 0, alpha: 0 } : { r: 0, g: 0, b: 0, alpha: 1 };
  const prepare = await preparer(source, a);
  const pose = await sharp(prepare).resize(lw, lh, { fit: 'contain', background: fond }).png().toBuffer();
  const left = Math.round((f.largeur - lw) / 2 + (r.dx ?? 0)), top = Math.round((f.hauteur - lh) / 2 + (r.dy ?? 0));
  const toile = await sharp({ create: { width: f.largeur, height: f.hauteur, channels: 4, background: fond } })
    .composite([{ input: pose, left: Math.max(-lw, left), top: Math.max(-lh, top) }]).png().toBuffer();
  const sorties = {};
  for (const [w, h] of f.sorties) {
    const rel = `art/${a.categorie}/${a.id}-${w}.webp`;
    const out = join(dest, a.categorie, `${a.id}-${w}.webp`);
    mkdirSync(dirname(out), { recursive: true });
    {
      await sharp(toile).resize(w, h).webp({ quality: 82, alphaQuality: 90, effort: 5 }).toFile(out);
    }
    sorties[w] = rel;
  }
  manifeste.assets[a.id] = { categorie: a.categorie, teinte: a.teinte ?? null, conditions: a.conditions, fichiers: sorties };
  rapport.integres.push(a.id);
}
function distance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
for (const [id, p] of parId) if (!connus.has(id)) {
  const proche = [...connus].sort((x, y) => distance(id, x) - distance(id, y))[0];
  rapport.inconnus.push(`${relative(src, p)} (vouliez-vous dire « ${proche}.png » ?)`);
}

writeFileSync(join(dest, 'manifest.json'), JSON.stringify(manifeste));
const manquants = catalogue.assets.filter((a) => !manifeste.assets[a.id]);
console.log(`Images intégrées : ${rapport.integres.length} / ${catalogue.assets.length}`);
for (const [lot, nom] of Object.entries(catalogue.lots)) {
  const m = manquants.filter((a) => String(a.lot) === lot).length;
  if (m) console.log(`  ${nom} : ${m} manquante(s)`);
}
for (const w of rapport.avertissements) console.log(`⚠ ${w}`);
for (const u of rapport.inconnus) console.log(`? Fichier non reconnu (nom absent du catalogue) : ${u}`);
