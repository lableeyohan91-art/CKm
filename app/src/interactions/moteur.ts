import { addYears, type Day } from '../engine/calendar';
import type { SimContext } from '../engine/sim';
import type { Character, Proposition } from '../model/entities';
import type { World } from '../model/world';
import { nomComplet, perso, vivant, type Part } from '../rules/personnage';
import type { Regles } from '../rules/regles';
import { avis, concerneJoueur, notifier } from '../systems/monde';

/**
 * Moteur d'interactions entre personnages.
 * Le joueur et l'IA passent par les mêmes définitions : mêmes conditions, mêmes coûts,
 * même calcul d'acceptation (avec ses raisons), mêmes effets.
 */
export type Valeur = string | number | boolean;
export type Params = Record<string, Valeur>;
export interface C { sim: SimContext; r: Regles; w: World }
export type Categorie = 'famille' | 'relations' | 'vassaux' | 'diplomatie' | 'justice';
export const CATEGORIES: Record<Categorie, string> = { famille: 'Famille', relations: 'Relations', vassaux: 'Vassaux et conseil', diplomatie: 'Diplomatie', justice: 'Justice' };

export interface Option { valeur: Valeur; label: string }
export interface Parametre { id: string; nom: string; options: (c: C, a: Character, cible: Character) => Option[] }
export interface Cout { or?: number; prestige?: number; piete?: number }

export interface Interaction {
  id: string;
  nom: string;
  categorie: Categorie;
  description: string;
  /** Phrase utilisée quand l'IA propose cette interaction au joueur : « X vous propose … » */
  proposition?: (c: C, a: Character, cible: Character, p: Params) => string;
  /** L'interaction apparaît-elle dans le menu pour cette cible ? */
  visible: (c: C, a: Character, cible: Character) => boolean;
  /** Raisons qui empêchent l'interaction (liste vide : possible). */
  conditions?: (c: C, a: Character, cible: Character, p: Params) => string[];
  parametres?: Parametre[];
  cout?: (c: C, a: Character, cible: Character, p: Params) => Cout;
  /** Qui accepte ou refuse. Absent : décision unilatérale de l'acteur. */
  decideur?: (c: C, a: Character, cible: Character, p: Params) => Character;
  /** Raisons d'accepter (positives) ou de refuser (négatives), vues par le décideur. Accepté si total > 0. */
  acceptation?: (c: C, a: Character, cible: Character, p: Params, d: Character) => Part[];
  /** Applique l'interaction ; renvoie le texte du résultat. */
  effets: (c: C, a: Character, cible: Character, p: Params) => string;
  /** Conséquence d'un refus (facultatif). */
  refus?: (c: C, a: Character, cible: Character, p: Params, d: Character) => void;
}

export interface Evaluation {
  possible: boolean;
  raisons: string[];
  cout: Cout;
  decideur?: Character;
  acceptation?: { score: number; parts: Part[]; accepte: boolean };
}

const REGISTRE = new Map<string, Interaction>();
export function enregistrer(...its: Interaction[]): void { for (const i of its) { if (REGISTRE.has(i.id)) throw new Error(`Interaction en double : ${i.id}`); REGISTRE.set(i.id, i); } }
export const interaction = (id: string): Interaction | undefined => REGISTRE.get(id);
export const toutes = (): Interaction[] => [...REGISTRE.values()];

/** Paramètres par défaut : la première option de chaque paramètre. */
export function parametresParDefaut(c: C, it: Interaction, a: Character, cible: Character, p: Params = {}): Params {
  const out: Params = { ...p };
  for (const prm of it.parametres ?? []) {
    const opts = prm.options(c, a, cible);
    if (out[prm.id] === undefined || !opts.some((o) => o.valeur === out[prm.id])) { const o = opts[0]; if (o) out[prm.id] = o.valeur; }
  }
  return out;
}

export function evaluer(c: C, it: Interaction, a: Character, cible: Character, p: Params): Evaluation {
  const raisons: string[] = [];
  if (!vivant(a)) raisons.push("L'acteur n'est plus là.");
  if (a.prisonnierDe !== undefined) raisons.push('Vous êtes prisonnier.');
  for (const prm of it.parametres ?? []) if (p[prm.id] === undefined) raisons.push(`Aucun choix possible pour « ${prm.nom} ».`);
  if (!raisons.length && it.conditions) raisons.push(...it.conditions(c, a, cible, p));
  const cout = (raisons.length ? {} : it.cout?.(c, a, cible, p)) ?? {};
  if (cout.or && a.or < cout.or) raisons.push(`Pas assez d'or (${Math.floor(a.or)} sur ${cout.or}).`);
  if (cout.prestige && a.prestige < cout.prestige) raisons.push(`Pas assez de prestige (${Math.floor(a.prestige)} sur ${cout.prestige}).`);
  if (cout.piete && a.piete < cout.piete) raisons.push(`Pas assez de piété (${Math.floor(a.piete)} sur ${cout.piete}).`);
  const ev: Evaluation = { possible: raisons.length === 0, raisons, cout };
  if (ev.possible && it.decideur && it.acceptation) {
    const d = it.decideur(c, a, cible, p);
    if (d.id !== a.id) {
      const parts = it.acceptation(c, a, cible, p, d).filter((x) => Math.round(x.valeur) !== 0).map((x) => ({ ...x, valeur: Math.round(x.valeur) }));
      const score = parts.reduce((s, x) => s + x.valeur, 0);
      ev.decideur = d;
      ev.acceptation = { score, parts, accepte: score > 0 };
    }
  }
  return ev;
}

function payer(a: Character, cout: Cout): void {
  if (cout.or) a.or -= cout.or;
  if (cout.prestige) a.prestige -= cout.prestige;
  if (cout.piete) a.piete -= cout.piete;
}

export interface Resultat { ok: boolean; accepte?: boolean; enAttente?: boolean; texte: string }

/**
 * Exécute une interaction. Si le décideur est le joueur (et l'acteur non), une proposition
 * est mise en attente de sa réponse.
 */
export function executer(c: C, id: string, a: Character, cible: Character, p0: Params = {}): Resultat {
  const it = REGISTRE.get(id);
  if (!it) return { ok: false, texte: `Interaction inconnue : ${id}` };
  const p = parametresParDefaut(c, it, a, cible, p0);
  const ev = evaluer(c, it, a, cible, p);
  if (!ev.possible) return { ok: false, texte: ev.raisons.join(' ') };
  const d = ev.decideur;
  if (d && d.id === c.w.joueurId && a.id !== c.w.joueurId) {
    if (c.w.propositions.some((x) => x.acteur === a.id && x.interaction === id)) return { ok: false, texte: 'Une proposition est déjà en attente.' };
    const texte = it.proposition?.(c, a, cible, p) ?? `${nomComplet(c.w, a)} vous propose : ${it.nom.toLowerCase()}.`;
    const prop: Proposition = { id: c.sim.newId(), jour: c.w.day, jusqua: addYears(c.w.day, 0) + 45, interaction: id, acteur: a.id, cible: cible.id, params: p, texte };
    c.w.propositions.push(prop);
    notifier(c.w, `${texte} Répondez dans les Nouvelles.`, true, [a.id, cible.id]);
    return { ok: true, enAttente: true, texte: 'Proposition envoyée.' };
  }
  if (ev.acceptation && !ev.acceptation.accepte) {
    it.refus?.(c, a, cible, p, d!);
    return { ok: true, accepte: false, texte: `${nomComplet(c.w, d!)} refuse.` };
  }
  payer(a, ev.cout);
  const texte = it.effets(c, a, cible, p);
  return { ok: true, accepte: true, texte };
}

/** Réponse du joueur à une proposition en attente. */
export function repondre(c: C, propId: number, accepte: boolean): Resultat {
  const i = c.w.propositions.findIndex((x) => x.id === propId);
  if (i < 0) return { ok: false, texte: 'Cette proposition n’existe plus.' };
  const prop = c.w.propositions[i]!;
  c.w.propositions.splice(i, 1);
  const it = REGISTRE.get(prop.interaction), a = perso(c.w, prop.acteur), cible = perso(c.w, prop.cible);
  if (!it || !vivant(a) || !vivant(cible)) return { ok: false, texte: 'La proposition n’est plus valable.' };
  // Les conditions ont pu changer depuis (mariage entre-temps, décès…)
  const ev = evaluer(c, { ...it, decideur: undefined, acceptation: undefined }, a, cible, prop.params);
  if (!ev.possible) return { ok: false, texte: `Impossible désormais : ${ev.raisons.join(' ')}` };
  const joueur = perso(c.w, c.w.joueurId ?? undefined)!;
  if (!accepte) {
    it.refus?.(c, a, cible, prop.params, joueur);
    avis(a, joueur.id, -10, 'A refusé ma proposition', addYears(c.w.day, 5));
    return { ok: true, accepte: false, texte: 'Vous avez refusé.' };
  }
  payer(a, ev.cout);
  return { ok: true, accepte: true, texte: it.effets(c, a, cible, prop.params) };
}

/** Propositions expirées : refusées d'office. */
export function expirerPropositions(c: C): void {
  const expirees = c.w.propositions.filter((x) => x.jusqua <= c.w.day);
  for (const prop of expirees) {
    repondre(c, prop.id, false);
    notifier(c.w, `Sans réponse de votre part, la proposition a été considérée comme refusée : ${prop.texte}`, false, [prop.acteur]);
  }
}

// --------------------------------------------------------------------------- outils communs

/** Les vassaux directs de l'acteur jugent sévèrement un abus de pouvoir. */
export function tyrannie(c: C, a: Character, valeur: number, raison: string, sauf: number[] = []): void {
  for (const id of c.w.vivants) {
    const v = c.w.personnages[id]!;
    if (v.suzerainId === a.id && v.titres.length && !sauf.includes(v.id)) avis(v, a.id, valeur, raison, addYears(c.w.day, 15));
  }
}

export function notifierSiJoueur(c: C, texte: string, ids: number[], important = false): void {
  if (concerneJoueur(c.w, ids)) notifier(c.w, texte, important, ids);
}

export const jusqua = (c: C, ans: number): Day => addYears(c.w.day, ans);
export const n = (c: C, x: Character): string => nomComplet(c.w, x);
