import { ageAt, type Day } from '../engine/calendar';
import { RANK_VALUE, SKILLS, type Character, type SkillId, type Skills } from '../model/entities';
import type { World } from '../model/world';
import type { Regles } from './regles';

export const MAJORITE = 16;

export const perso = (w: World, id: number | undefined): Character | undefined => (id === undefined ? undefined : w.personnages[id]);
export const vivant = (c: Character | undefined): c is Character => !!c && c.deces === undefined && c.horsScene === undefined;
export const age = (w: World, c: Character): number => ageAt(c.naissance, c.deces ?? w.day);
export const majeur = (w: World, c: Character): boolean => age(w, c) >= MAJORITE;

export function nomComplet(w: World, c: Character): string {
  const maison = c.maisonId ? w.maisons[c.maisonId]?.nom : undefined;
  return `${c.prenom}${c.surnom ? ` ${c.surnom}` : ''}${maison && !c.surnom ? ` de ${maison}` : ''}`;
}

/** Une ligne d'explication : d'où vient chaque point d'une valeur. */
export interface Part { source: string; valeur: number }

/** Compétence effective, avec le détail de son calcul (pour les infobulles). */
export function competence(w: World, r: Regles, c: Character, s: SkillId): { total: number; parts: Part[] } {
  const parts: Part[] = [{ source: 'Base', valeur: c.competences[s] }];
  for (const t of c.traits) {
    const v = r.perso.get(t)?.competences[s] ?? r.innes.get(t)?.competences[s] ?? 0;
    if (v) parts.push({ source: r.perso.get(t)?.nom ?? r.innes.get(t)?.nom ?? t, valeur: v });
  }
  const a = age(w, c);
  if (a < MAJORITE) parts.push({ source: 'Enfance', valeur: -Math.round((MAJORITE - a) * 0.6) });
  else if (a >= 60 && s !== 'sav' && s !== 'dip') parts.push({ source: 'Vieillesse', valeur: -Math.floor((a - 55) / 5) });
  if (c.malade) parts.push({ source: 'Maladie', valeur: -2 });
  const total = Math.max(0, parts.reduce((x, p) => x + p.valeur, 0));
  return { total, parts };
}

export function competences(w: World, r: Regles, c: Character): Skills {
  return Object.fromEntries(SKILLS.map((s) => [s, competence(w, r, c, s).total])) as Skills;
}

/** Valeur d'un axe de personnalité (ambition, loyauté…), somme des traits. */
export function axe(r: Regles, c: Character, nom: string): number {
  let v = 0;
  for (const t of c.traits) v += r.perso.get(t)?.axes[nom] ?? 0;
  return v;
}

export function fertilite(r: Regles, c: Character): number {
  let f = 1;
  for (const t of c.traits) f += r.innes.get(t)?.fertilite ?? 0;
  return Math.max(0.1, f);
}

export function santeEffective(r: Regles, c: Character): number {
  let s = c.sante;
  for (const t of c.traits) s += r.innes.get(t)?.sante ?? 0;
  if (c.malade) s -= 2;
  return s;
}

// ------------------------------------------------------------- Titres

export function rangMax(w: World, c: Character): number {
  let m = 0;
  for (const t of c.titres) m = Math.max(m, RANK_VALUE[w.titres[t]!.rang]);
  return m;
}

/** Titre principal : le plus haut rang ; à rang égal, le premier acquis. */
export function titrePrincipal(w: World, c: Character): string | undefined {
  let best: string | undefined, rank = 0;
  for (const t of c.titres) { const v = RANK_VALUE[w.titres[t]!.rang]; if (v > rank) { rank = v; best = t; } }
  return best;
}

export function comtesTenus(w: World, c: Character): string[] {
  return c.titres.filter((t) => w.titres[t]!.rang === 'comte').map((t) => w.titres[t]!.comteId!);
}

/** Le seigneur effectif d'un personnage : son suzerain s'il a des titres, sinon le maître de sa cour. */
export function seigneur(w: World, c: Character): Character | undefined {
  return perso(w, c.titres.length ? c.suzerainId : c.courId);
}

export function vassaux(w: World, c: Character): Character[] {
  return w.vivants.map((id) => w.personnages[id]!).filter((v) => v.suzerainId === c.id && v.titres.length > 0);
}

/** Souverain indépendant au sommet de la chaîne féodale. */
export function souverain(w: World, c: Character): Character {
  let cur = c; const seen = new Set<number>();
  for (;;) {
    const l = perso(w, cur.suzerainId);
    if (!vivant(l) || seen.has(l.id)) return cur;
    seen.add(cur.id); cur = l;
  }
}

// ------------------------------------------------------------- Famille

export function parents(w: World, c: Character): Character[] {
  return [perso(w, c.pereId), perso(w, c.mereId)].filter((x): x is Character => !!x);
}

export function freresSoeurs(w: World, c: Character): Character[] {
  const ids = new Set<number>();
  for (const p of parents(w, c)) for (const e of p.enfants) if (e !== c.id) ids.add(e);
  return [...ids].sort((a, b) => a - b).map((id) => w.personnages[id]!);
}

/** Ancêtres jusqu'à `profondeur` générations (sans le personnage lui-même). */
export function ancetres(w: World, c: Character, profondeur: number): Set<number> {
  const out = new Set<number>(); let front = [c];
  for (let g = 0; g < profondeur; g++) {
    const next: Character[] = [];
    for (const x of front) for (const p of parents(w, x)) if (!out.has(p.id)) { out.add(p.id); next.push(p); }
    front = next;
  }
  return out;
}

/** Parenté trop proche pour l'Église : ancêtre commun sur 3 générations, ou lien direct. */
export function consanguins(w: World, a: Character, b: Character): boolean {
  if (a.id === b.id) return true;
  const aa = ancetres(w, a, 3), ab = ancetres(w, b, 3);
  if (aa.has(b.id) || ab.has(a.id)) return true;
  for (const x of aa) if (ab.has(x)) return true;
  return false;
}

export function famillesProches(w: World, a: Character, b: Character): 'parent' | 'enfant' | 'fratrie' | 'conjoint' | null {
  if (a.conjointId === b.id) return 'conjoint';
  if (a.pereId === b.id || a.mereId === b.id) return 'parent';
  if (b.pereId === a.id || b.mereId === a.id) return 'enfant';
  if ((a.pereId !== undefined && a.pereId === b.pereId) || (a.mereId !== undefined && a.mereId === b.mereId)) return 'fratrie';
  return null;
}

export function jour(w: World): Day { return w.day; }

/**
 * Un personnage compte pour la simulation détaillée s'il possède des terres,
 * est le joueur, ou est proche (conjoint, parent, enfant, petit-enfant, frère ou sœur) d'un seigneur ou du joueur.
 */
export function pertinent(w: World, c: Character): boolean {
  if (c.titres.length || w.joueurId === c.id) return true;
  const important = (x: Character | undefined) => vivant(x) && (x.titres.length > 0 || w.joueurId === x.id);
  const p = perso(w, c.pereId), m = perso(w, c.mereId);
  if (important(perso(w, c.conjointId)) || important(p) || important(m)) return true;
  if ([perso(w, p?.pereId), perso(w, p?.mereId), perso(w, m?.pereId), perso(w, m?.mereId)].some(important)) return true;
  if (c.enfants.some((id) => important(w.personnages[id]))) return true;
  return freresSoeurs(w, c).some(important);
}
