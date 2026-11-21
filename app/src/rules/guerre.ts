import type { Armee, Character, Guerre, MotifGuerre } from '../model/entities';
import type { World } from '../model/world';
import { opinionTotal } from './opinion';
import { comtesTenus, majeur, perso, souverain, vivant } from './personnage';
import type { Regles } from './regles';
import { relevede } from './succession';

/** Règles de la guerre (pures : aucune modification du monde). */

export const HOMMES_PAR_DEV = 80;            // levée par point de développement d'un comté du domaine
export const JOURS_ETAPE = 10;               // durée de base pour traverser un comté
export const JOURS_MER = 25;                 // traversée d'une liaison maritime
export const TERRAIN: Record<string, { marche: number; defense: number; ravitaillement: number; nom: string }> = {
  plaine: { marche: 1, defense: 0, ravitaillement: 1, nom: 'plaine' },
  bocage: { marche: 1.2, defense: 0.1, ravitaillement: 0.9, nom: 'bocage' },
  collines: { marche: 1.3, defense: 0.2, ravitaillement: 0.8, nom: 'collines' },
  marais: { marche: 1.5, defense: 0.15, ravitaillement: 0.7, nom: 'marais' },
};
export const terrain = (t: string) => TERRAIN[t] ?? TERRAIN.plaine!;

export interface Motif { motif: MotifGuerre; titre: string; texte: string }

/** L'un est-il (directement ou non) vassal de l'autre ? */
export function sousLaCouronneDe(w: World, vassal: Character, seigneur: Character): boolean {
  let cur = vassal; let g = 0;
  while (cur.suzerainId !== undefined && g++ < 20) { if (cur.suzerainId === seigneur.id) return true; cur = w.personnages[cur.suzerainId]!; }
  return false;
}

export const enGuerreContre = (w: World, a: number, b: number): Guerre | undefined =>
  w.guerres.find((g) => (g.attaquants.includes(a) && g.defenseurs.includes(b)) || (g.attaquants.includes(b) && g.defenseurs.includes(a)));
export const enGuerre = (w: World, a: number): Guerre | undefined => w.guerres.find((g) => g.attaquants.includes(a) || g.defenseurs.includes(a));
export const treve = (w: World, a: number, b: number) => w.treves.find((t) => ((t.a === a && t.b === b) || (t.a === b && t.b === a)) && t.jusqua > w.day);
export const allies = (w: World, a: number, b: number) => w.alliances.some((x) => (x.a === a && x.b === b) || (x.a === b && x.b === a));

/** Motifs de guerre de `a` contre `cible`. */
export function motifs(w: World, a: Character, cible: Character): Motif[] {
  const out: Motif[] = [];
  for (const r of a.revendications) {
    if (w.titres[r.titre]?.titulaireId === cible.id) out.push({ motif: 'revendication', titre: r.titre, texte: `Revendication ${r.forte ? 'forte' : 'faible'} sur ${w.titres[r.titre]!.nom}` });
  }
  // Terres de droit : un comté qui relève de l'un de vos duchés ou royaumes
  for (const t of a.titres) {
    const rang = w.titres[t]!.rang;
    if (rang === 'comte') continue;
    for (const ct of cible.titres) {
      if (w.titres[ct]!.rang !== 'comte' || !relevede(w, ct, t)) continue;
      out.push({ motif: 'dejure', titre: ct, texte: `${w.titres[ct]!.nom} relève de droit de votre ${w.titres[t]!.nom.toLowerCase()}` });
    }
  }
  return out;
}

/** Empêchements à déclarer la guerre. */
export function empechementsGuerre(w: World, a: Character, cible: Character): string[] {
  const out: string[] = [];
  if (!a.titres.length) out.push('Il faut posséder des terres pour faire la guerre.');
  if (!majeur(w, a)) out.push('Un enfant ne peut pas déclarer la guerre.');
  if (!cible.titres.length) out.push("Il n'a pas de terres à prendre.");
  if (sousLaCouronneDe(w, cible, a)) out.push("C'est votre vassal : révoquez plutôt son titre.");
  if (sousLaCouronneDe(w, a, cible)) out.push("C'est votre suzerain (la révolte viendra avec les factions).");
  if (allies(w, a.id, cible.id)) out.push('Vous êtes alliés : rompez d’abord l’alliance.');
  const t = treve(w, a.id, cible.id);
  if (t) out.push('Une trêve vous lie encore.');
  if (enGuerreContre(w, a.id, cible.id)) out.push('Vous êtes déjà en guerre contre lui.');
  if (enGuerre(w, a.id)) out.push('Vous menez déjà une guerre.');
  return out;
}

/** Levée d'un seigneur : son domaine, plus une part de celle de ses vassaux selon leur opinion. */
export function levee(w: World, r: Regles, c: Character, profondeur = 0): { total: number; parts: { source: string; valeur: number }[] } {
  const parts: { source: string; valeur: number }[] = [];
  const dom = comtesTenus(w, c).reduce((s, id) => s + w.comtes[id]!.developpement * HOMMES_PAR_DEV * (w.comtes[id]!.controle / 100), 0);
  if (dom) parts.push({ source: 'Votre domaine', valeur: Math.round(dom) });
  if (profondeur < 4) {
    for (const id of w.vivants) {
      const v = w.personnages[id]!;
      if (v.suzerainId !== c.id || !v.titres.length || v.prisonnierDe !== undefined) continue;
      const op = opinionTotal(w, r, v, c);
      const part = Math.max(0, Math.min(0.8, 0.4 + op / 150));
      const lv = Math.round(levee(w, r, v, profondeur + 1).total * part);
      if (lv) parts.push({ source: `${v.prenom} (${Math.round(part * 100)} % de son ost)`, valeur: lv });
    }
  }
  return { total: parts.reduce((s, p) => s + p.valeur, 0), parts };
}

export function capitale(w: World, c: Character): string | undefined {
  return comtesTenus(w, c).sort((x, y) => w.comtes[y]!.developpement - w.comtes[x]!.developpement || x.localeCompare(y))[0];
}

/** Voisins par terre et par mer, avec la durée de passage. */
export function voisinsAvecDuree(w: World, mer: [string, string][], id: string): { id: string; jours: number }[] {
  const k = w.comtes[id]!;
  const out = k.voisins.map((v) => ({ id: v, jours: Math.round(JOURS_ETAPE * terrain(w.comtes[v]!.terrain).marche) }));
  for (const [a, b] of mer) { if (a === id) out.push({ id: b, jours: JOURS_MER }); if (b === id) out.push({ id: a, jours: JOURS_MER }); }
  return out;
}

/** Plus court chemin (en jours) entre deux comtés. */
export function chemin(w: World, mer: [string, string][], de: string, vers: string): string[] | null {
  if (de === vers) return [];
  const dist = new Map<string, number>([[de, 0]]), prec = new Map<string, string>();
  const file: string[] = [de];
  while (file.length) {
    file.sort((a, b) => dist.get(a)! - dist.get(b)! || a.localeCompare(b));
    const u = file.shift()!;
    if (u === vers) break;
    for (const { id, jours } of voisinsAvecDuree(w, mer, u)) {
      const d = dist.get(u)! + jours;
      if (d < (dist.get(id) ?? Infinity)) { dist.set(id, d); prec.set(id, u); if (!file.includes(id)) file.push(id); }
    }
  }
  if (!prec.has(vers)) return null;
  const out: string[] = []; let cur = vers;
  while (cur !== de) { out.unshift(cur); cur = prec.get(cur)!; }
  return out;
}

/** Camp d'un personnage dans une guerre. */
export function camp(g: Guerre, id: number): 'att' | 'def' | null {
  return g.attaquants.includes(id) ? 'att' : g.defenseurs.includes(id) ? 'def' : null;
}

/** Camp qui tient un comté dans une guerre : celui de son seigneur (ou de son souverain), sauf occupation. */
export function campDuComte(w: World, g: Guerre, comteId: string): 'att' | 'def' | null {
  const occ = w.occupations[comteId];
  if (occ && occ.guerre === g.id) return occ.camp;
  const h = perso(w, w.titres[`c-${comteId}`]?.titulaireId);
  if (!h) return null;
  let cur: Character | undefined = h; let n = 0;
  while (cur && n++ < 20) { const cp = camp(g, cur.id); if (cp) return cp; cur = perso(w, cur.suzerainId); }
  return null;
}

/** Force de combat d'un ensemble d'armées (pour l'IA et l'affichage). */
export function force(w: World, armees: Armee[]): number {
  return armees.reduce((s, a) => s + a.hommes * a.moral * (1 + (perso(w, a.commandant)?.competences.gue ?? 5) * 0.04), 0);
}

export const commandantPossible = (w: World, x: Character | undefined): x is Character => vivant(x) && majeur(w, x) && x.prisonnierDe === undefined && !x.clerc;
export { souverain };
