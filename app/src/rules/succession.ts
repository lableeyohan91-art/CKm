import { RANK_VALUE, type Character } from '../model/entities';
import type { World } from '../model/world';
import { age, freresSoeurs, perso, vivant } from './personnage';

/** Peut hériter : vivant, pas clerc. */
export const peutHeriter = (c: Character | undefined): c is Character => vivant(c) && !c.clerc;

/** Enfants légitimes triés : fils par âge, puis filles par âge (préférence masculine). */
export function enfantsOrdonnes(w: World, c: Character): Character[] {
  const kids = c.enfants.map((id) => w.personnages[id]!).filter((k) => !k.batard);
  const byAge = (a: Character, b: Character) => a.naissance - b.naissance || a.id - b.id;
  return [...kids.filter((k) => k.sexe === 'h').sort(byAge), ...kids.filter((k) => k.sexe === 'f').sort(byAge)];
}

/**
 * Ordre de primogéniture : le premier enfant et toute sa descendance, puis le suivant…
 * (un petit-fils d'un fils aîné mort passe avant un fils cadet vivant).
 */
export function ligneeDescendante(w: World, c: Character, depth = 0): Character[] {
  if (depth > 6) return [];
  const out: Character[] = [];
  for (const k of enfantsOrdonnes(w, c)) {
    if (peutHeriter(k)) out.push(k);
    out.push(...ligneeDescendante(w, k, depth + 1));
  }
  return out;
}

/** Héritier principal (primogéniture), avec repli : fratrie et leur descendance, puis la maison. */
export function heritierPrincipal(w: World, c: Character): Character | undefined {
  const direct = ligneeDescendante(w, c).find((x) => x.id !== c.id && peutHeriter(x));
  if (direct) return direct;
  // Frères et sœurs (frères d'abord, par âge), puis leur descendance
  const sibs = freresSoeurs(w, c).filter((s) => !s.batard)
    .sort((a, b) => (a.sexe === b.sexe ? a.naissance - b.naissance : a.sexe === 'h' ? -1 : 1));
  for (const s of sibs) {
    if (peutHeriter(s)) return s;
    const d = ligneeDescendante(w, s).find(peutHeriter); if (d) return d;
  }
  // Oncles et leur descendance (via le père)
  const pere = perso(w, c.pereId);
  if (pere) {
    for (const s of freresSoeurs(w, pere).filter((x) => !x.batard)) {
      if (peutHeriter(s)) return s;
      const d = ligneeDescendante(w, s).find(peutHeriter); if (d) return d;
    }
  }
  // Membre adulte le plus âgé de la même maison
  if (c.maisonId) {
    const membres = w.vivants.map((id) => w.personnages[id]!)
      .filter((x) => x.id !== c.id && x.maisonId === c.maisonId && peutHeriter(x) && !x.batard)
      .sort((a, b) => (a.sexe === b.sexe ? a.naissance - b.naissance : a.sexe === 'h' ? -1 : 1));
    if (membres[0]) return membres[0];
  }
  return undefined;
}

/** Héritiers d'un partage : les fils légitimes vivants ; à défaut, l'héritier principal seul. */
export function heritiersPartage(w: World, c: Character): Character[] {
  const fils = enfantsOrdonnes(w, c).filter((k) => k.sexe === 'h' && peutHeriter(k));
  if (fils.length > 0) return fils;
  const h = heritierPrincipal(w, c);
  return h ? [h] : [];
}

export interface PlanSuccession { attributions: { titre: string; heritier: number }[]; principal?: number }

/**
 * Répartition des titres d'un défunt.
 * - Le titre principal suit sa propre loi ; l'aîné reçoit aussi le comté le plus riche lié à ce titre.
 * - Sous le partage, les autres titres sont distribués à tour de rôle entre les fils.
 * - Sous la primogéniture, tout va à l'héritier principal.
 */
export function planSuccession(w: World, defunt: Character): PlanSuccession {
  const titres = [...defunt.titres].sort((a, b) =>
    RANK_VALUE[w.titres[b]!.rang] - RANK_VALUE[w.titres[a]!.rang]
    || (w.comtes[w.titres[b]!.comteId ?? '']?.developpement ?? 0) - (w.comtes[w.titres[a]!.comteId ?? '']?.developpement ?? 0)
    || a.localeCompare(b));
  if (titres.length === 0) return { attributions: [] };
  const principal = titres[0]!;
  const loi = w.titres[principal]!.succession;
  const heritiers = loi === 'partage' ? heritiersPartage(w, defunt) : [heritierPrincipal(w, defunt)].filter((x): x is Character => !!x);
  if (heritiers.length === 0) return { attributions: [] };
  const aine = heritiers[0]!;
  if (heritiers.length === 1) return { principal: aine.id, attributions: titres.map((t) => ({ titre: t, heritier: aine.id })) };

  const attributions: { titre: string; heritier: number }[] = [{ titre: principal, heritier: aine.id }];
  // Comté le plus riche relevant du titre principal : réservé à l'aîné (sa capitale)
  const capitale = titres.find((t) => w.titres[t]!.rang === 'comte' && relevede(w, t, principal));
  if (capitale) attributions.push({ titre: capitale, heritier: aine.id });
  let i = 1;
  for (const t of titres) {
    if (t === principal || t === capitale) continue;
    attributions.push({ titre: t, heritier: heritiers[i % heritiers.length]!.id });
    i++;
  }
  return { principal: aine.id, attributions };
}

/** Vrai si le titre `t` fait partie (de droit) du titre `parent`, directement ou par un duché. */
export function relevede(w: World, t: string, parent: string): boolean {
  let cur = w.titres[t]?.parentDeJure; let guard = 0;
  while (cur && guard++ < 5) { if (cur === parent) return true; cur = w.titres[cur]?.parentDeJure; }
  return false;
}

export const ageDe = age;
