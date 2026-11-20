import type { Apparence } from '../../worker/vues';

/**
 * Portraits par calques : choix des calques et des teintes pour un personnage.
 * Les images viennent de public/art (générées par tools/art/integrer.mjs).
 * Tout est déterministe : même personnage ⇒ même portrait, partie après partie.
 */
export interface ManifesteAsset { categorie: string; teinte: 'peau' | 'cheveux' | 'etoffe' | null; conditions: Conditions; fichiers: Record<string, string> }
export interface Manifeste { version: number; assets: Record<string, ManifesteAsset> }
interface Conditions { sexe?: 'h' | 'f'; ages?: string[]; roles?: string[]; rangs?: number[]; clerc?: boolean; maries?: boolean; marques?: string[] }
export interface Calque { id: string; src: Record<string, string>; teinte: string | null; force: number }

let manifeste: Manifeste | null = null;
let chargement: Promise<Manifeste | null> | null = null;
const abonnes = new Set<() => void>();

export function chargerManifeste(): Promise<Manifeste | null> {
  if (!chargement) {
    chargement = fetch(new URL('art/manifest.json', document.baseURI).href)
      .then((r) => (r.ok ? r.json() : null))
      .then((m: Manifeste | null) => { manifeste = m && Object.keys(m.assets).length ? m : null; abonnes.forEach((f) => f()); return manifeste; })
      .catch(() => null);
  }
  return chargement;
}
export const manifesteCharge = () => manifeste;
export function surManifeste(f: () => void): () => void { abonnes.add(f); return () => abonnes.delete(f); }

export function trancheAge(age: number): string {
  if (age < 14) return 'enfant';
  if (age < 28) return 'jeune';
  if (age < 48) return 'adulte';
  if (age < 65) return 'mur';
  return 'vieux';
}

/** Petit générateur déterministe propre à chaque catégorie de calque. */
function hasard(graine: number, sel: string): () => number {
  let h = graine >>> 0;
  for (let i = 0; i < sel.length; i++) h = Math.imul(h ^ sel.charCodeAt(i), 2654435761) >>> 0;
  return () => { h = (h + 0x6d2b79f5) >>> 0; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const CHEVEUX = ['#2a1d15', '#3b2a1e', '#4e3523', '#6b4426', '#8a5a2e', '#a8763e', '#c9a26a', '#93412a'];
const ETOFFES = ['#8f2f25', '#2d5683', '#3d6b3f', '#6c4680', '#a77d26', '#2c6566', '#7a4b33', '#4c5a2a', '#7e3354', '#3e4a73'];
const PEAUX: Record<string, string> = { occitan: '#f2dcc6', 'anglo-saxon': '#fff4ec', flamand: '#fff2ea', normand: '#fbeee3', breton: '#fbefe5', francien: '#f8e8d9' };

function convient(a: Apparence, c: Conditions): boolean {
  if (c.sexe && c.sexe !== a.sexe) return false;
  if (c.ages && !c.ages.includes(trancheAge(a.age))) return false;
  if (c.roles && !c.roles.includes(a.role)) return false;
  if (c.rangs && !c.rangs.includes(a.rang)) return false;
  if (c.clerc !== undefined && c.clerc !== a.clerc) return false;
  if (c.maries !== undefined && c.maries !== a.marie) return false;
  if (c.marques && !c.marques.some((m) => a.marques.includes(m))) return false;
  return true;
}

export function choisirCalques(a: Apparence, m: Manifeste): Calque[] | null {
  const parCat = new Map<string, [string, ManifesteAsset][]>();
  for (const [id, x] of Object.entries(m.assets)) if (convient(a, x.conditions)) {
    if (!parCat.has(x.categorie)) parCat.set(x.categorie, []);
    parCat.get(x.categorie)!.push([id, x]);
  }
  const prendre = (cat: string, proba = 1): [string, ManifesteAsset] | null => {
    let l = (parCat.get(cat) ?? []).sort(([x], [y]) => x.localeCompare(y));
    // Les calques propres aux religieux passent avant les autres (tonsure, habit, voile de nonne)
    if (a.clerc && l.some(([, x]) => x.conditions.clerc === true)) l = l.filter(([, x]) => x.conditions.clerc === true);
    const r = hasard(a.graine, cat);
    if (!l.length || r() >= proba) return null;
    return l[Math.floor(r() * l.length)]!;
  };
  const visage = prendre('visage');
  if (!visage) return null;                             // pas de visage adapté : portrait dessiné
  const r = hasard(a.graine, 'teintes');
  const tranche = trancheAge(a.age);
  const cheveux = tranche === 'vieux' ? '#d8d4cc' : tranche === 'mur' && r() < 0.6 ? '#8f8a82' : CHEVEUX[Math.floor(r() * CHEVEUX.length)]!;
  let h = 0; for (const ch of a.maison ?? 'x') h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const etoffe = ETOFFES[h % ETOFFES.length]!;
  const teinte = (x: ManifesteAsset) => x.teinte === 'cheveux' ? cheveux : x.teinte === 'etoffe' ? etoffe : x.teinte === 'peau' ? PEAUX[a.culture] ?? '#f8e8d9' : null;

  const choix: ([string, ManifesteAsset] | null)[] = [
    prendre('fond'),
    a.sexe === 'f' ? prendre('cheveux-arriere', 0.8) : null,
    visage,
    a.marques.length ? prendre('marque') : null,
    prendre('vetement'),
    a.sexe === 'h' && tranche !== 'enfant' && !a.clerc ? prendre('barbe', 0.7) : null,
    prendre('coiffe', a.clerc ? (a.sexe === 'f' ? 1 : 0) : a.sexe === 'f' && a.marie ? 0.85 : 0.1),
    a.titre ? prendre('couronne') : null,
  ];
  // Pas de cheveux visibles sous une coiffe féminine couvrante (la tonsure reste visible chez les clercs)
  const coiffe = choix[6];
  if (!(coiffe && a.sexe === 'f')) choix.splice(6, 0, prendre('cheveux'));
  return choix.filter((x): x is [string, ManifesteAsset] => !!x).map(([id, x]) => ({ id, src: x.fichiers, teinte: teinte(x), force: x.teinte === 'peau' ? 0.6 : 1 }));
}
