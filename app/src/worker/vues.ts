import { ageAt, formatDate, toCalendar } from '../engine/calendar';
import { RANK_VALUE, SKILLS, SKILL_NAMES, type Character } from '../model/entities';
import type { World } from '../model/world';
import { budget, revenuDomaine } from '../rules/economie';
import { opinion } from '../rules/opinion';
import {
  age, competence, freresSoeurs, nomComplet, perso, rangMax, santeEffective, souverain, titrePrincipal, vivant, type Part,
} from '../rules/personnage';
import { heritierPrincipal, planSuccession } from '../rules/succession';
import type { Partie } from './game';

/** Vues sérialisables envoyées à l'interface. Aucune règle ici : uniquement de la mise en forme. */

/** Ce qu'il faut pour composer un portrait par calques (voir ART_DIRECTION.md). */
export interface Apparence {
  graine: number; sexe: 'h' | 'f'; age: number; rang: number; culture: string; clerc: boolean; marie: boolean;
  role: 'enfant' | 'clerc' | 'roi' | 'chevalier' | 'noble'; maison: string | null; marques: string[]; titre: boolean;
}
export interface PersoResume {
  id: number; nom: string; age: number; sexe: 'h' | 'f'; vivant: boolean; titre?: string; portrait: number;
  rang: number; maison?: string; joueur: boolean; enfant: boolean; mort?: string; app: Apparence;
}

export function apparence(w: World, c: Character): Apparence {
  const a = age(w, c), rang = rangMax(w, c);
  const role: Apparence['role'] = a < 16 ? 'enfant' : c.clerc ? 'clerc' : rang >= 3 ? 'roi'
    : c.sexe === 'h' && !c.titres.length && c.competences.gue >= 12 ? 'chevalier' : 'noble';
  return {
    graine: c.portrait, sexe: c.sexe, age: a, rang, culture: c.cultureId, clerc: !!c.clerc,
    marie: c.conjointId !== undefined || c.anciensConjoints.length > 0, role, maison: c.maisonId, titre: c.titres.length > 0,
    marques: [...(c.malade ? ['malade'] : [])],
  };
}
export interface ComteVue {
  id: string; nom: string; titulaire?: PersoResume; grandFief?: { id: number; nom: string }; souverain?: { id: number; nom: string };
  dynastieId?: string; dynastieNom?: string; developpement: number; terrain: string; culture: string; revenu: number;
  dejure: string; royaume?: string;
}
export interface Valeur { total: number; parts: Part[] }
export interface Fiche {
  resume: PersoResume; nomComplet: string; naissance: string; deces?: string; cause?: string; incertain: boolean;
  competences: { id: string; nom: string; valeur: Valeur }[];
  traits: { id: string; nom: string; description: string; type: 'personnalite' | 'inne' | 'education' }[];
  sante: Valeur; malade: boolean; or: number; prestige: number; piete: number; ambition?: string; clerc: boolean; horsScene: boolean;
  titres: { id: string; nom: string; rang: string }[];
  suzerain?: PersoResume; souverain?: PersoResume; cour?: PersoResume; conjoint?: PersoResume; anciensConjoints: PersoResume[];
  parents: PersoResume[]; enfants: PersoResume[]; fratrie: PersoResume[];
  amis: PersoResume[]; rivaux: PersoResume[];
  memoires: { date: string; texte: string }[];
  budget?: Valeur; heritier?: PersoResume; partage?: { titre: string; heritier: PersoResume }[];
  opinionDuJoueur?: Valeur; opinionEnversJoueur?: Valeur; vassaux: PersoResume[];
}
export interface Jouable { id: number; nom: string; titre: string; age: number; difficulte: 'Facile' | 'Moyenne' | 'Difficile'; description: string; portrait: number; sexe: 'h' | 'f'; app: Apparence }
export interface Noeud { p: PersoResume; batard: boolean; conjoint?: PersoResume; enfants: Noeud[] }

export function resume(w: World, c: Character): PersoResume {
  const t = titrePrincipal(w, c);
  return {
    id: c.id, nom: nomComplet(w, c), age: age(w, c), sexe: c.sexe, vivant: vivant(c), portrait: c.portrait, rang: rangMax(w, c),
    joueur: w.joueurId === c.id, enfant: age(w, c) < 16, app: apparence(w, c),
    ...(t ? { titre: w.titres[t]!.nom } : {}), ...(c.maisonId ? { maison: w.maisons[c.maisonId]?.nom } : {}),
    ...(c.deces !== undefined ? { mort: formatDate(c.deces) } : c.horsScene !== undefined ? { mort: 'a quitté la scène' } : {}),
  };
}
const r1 = (w: World, id?: number) => { const c = perso(w, id); return c ? resume(w, c) : undefined; };

/** Le grand fief : vassal direct du souverain dont relève ce seigneur (ou le souverain lui-même). */
function grandFief(w: World, c: Character): Character {
  let cur = c; let guard = 0;
  while (cur.suzerainId !== undefined && guard++ < 20) {
    const l = w.personnages[cur.suzerainId]!;
    if (l.suzerainId === undefined) return cur;
    cur = l;
  }
  return cur;
}

export function vueCarte(p: Partie): ComteVue[] {
  const w = p.sim.world;
  return Object.values(w.comtes).map((k) => {
    const t = w.titres[`c-${k.id}`]!;
    const h = perso(w, t.titulaireId);
    const gf = h ? grandFief(w, h) : undefined, sv = h ? souverain(w, h) : undefined;
    const du = t.parentDeJure ? w.titres[t.parentDeJure] : undefined;
    return {
      id: k.id, nom: k.nom, developpement: k.developpement, terrain: k.terrain, culture: p.regles.data.culturesReligions.cultures.find((c) => c.id === k.cultureId)?.nom ?? k.cultureId,
      revenu: Math.round(k.developpement * 10) / 100, dejure: du?.nom ?? '—', ...(du?.parentDeJure ? { royaume: w.titres[du.parentDeJure]!.nom } : {}),
      ...(h ? { titulaire: resume(w, h), dynastieId: h.dynastieId ?? undefined, dynastieNom: h.dynastieId ? w.dynasties[h.dynastieId]?.nom : undefined } : {}),
      ...(gf ? { grandFief: { id: gf.id, nom: w.titres[titrePrincipal(w, gf)!]?.nom ?? nomComplet(w, gf) } } : {}),
      ...(sv ? { souverain: { id: sv.id, nom: w.titres[titrePrincipal(w, sv)!]?.nom ?? nomComplet(w, sv) } } : {}),
    };
  });
}

export function vueFiche(p: Partie, id: number): Fiche | null {
  const w = p.sim.world, r = p.regles;
  const c = w.personnages[id]; if (!c) return null;
  const j = perso(w, w.joueurId ?? undefined);
  const rel = (type: 'ami' | 'rival') => w.relations.filter((x) => x.type === type && (x.a === c.id || x.b === c.id)).map((x) => resume(w, w.personnages[x.a === c.id ? x.b : x.a]!));
  const traits = c.traits.map((t) => r.perso.has(t) ? { id: t, nom: r.perso.get(t)!.nom, description: r.perso.get(t)!.description, type: 'personnalite' as const }
    : r.innes.has(t) ? { id: t, nom: r.innes.get(t)!.nom, description: r.innes.get(t)!.description, type: 'inne' as const }
    : { id: t, nom: r.education.get(t)?.nom ?? t, description: `A reçu une ${r.education.get(t)?.nom.toLowerCase() ?? 'éducation'} : sa meilleure compétence a été renforcée.`, type: 'education' as const });
  const santeParts: Part[] = [{ source: 'Constitution', valeur: Math.round(c.sante * 10) / 10 }];
  for (const t of c.traits) { const v = r.innes.get(t)?.sante; if (v) santeParts.push({ source: r.innes.get(t)!.nom, valeur: v }); }
  if (c.malade) santeParts.push({ source: 'Malade', valeur: -2 });
  const vivantC = vivant(c);
  const heritier = vivantC && c.titres.length ? heritierPrincipal(w, c) : undefined;
  const plan = vivantC && c.titres.length ? planSuccession(w, c) : undefined;
  return {
    resume: resume(w, c), nomComplet: nomComplet(w, c), naissance: formatDate(c.naissance), incertain: !!c.incertain,
    ...(c.deces !== undefined ? { deces: formatDate(c.deces), cause: c.causeDeces } : {}),
    competences: SKILLS.map((s) => ({ id: s, nom: SKILL_NAMES[s], valeur: competence(w, r, c, s) })),
    traits, sante: { total: Math.round(santeEffective(r, c) * 10) / 10, parts: santeParts }, malade: !!c.malade,
    or: Math.round(c.or), prestige: Math.round(c.prestige), piete: Math.round(c.piete), clerc: !!c.clerc, horsScene: c.horsScene !== undefined,
    ...(c.ambition ? { ambition: c.ambition } : {}),
    titres: [...c.titres].sort((a, b) => RANK_VALUE[w.titres[b]!.rang] - RANK_VALUE[w.titres[a]!.rang]).map((t) => ({ id: t, nom: w.titres[t]!.nom, rang: w.titres[t]!.rang })),
    ...(c.titres.length ? { suzerain: r1(w, c.suzerainId), souverain: resume(w, souverain(w, c)) } : { cour: r1(w, c.courId) }),
    conjoint: r1(w, c.conjointId), anciensConjoints: c.anciensConjoints.map((x) => resume(w, w.personnages[x]!)),
    parents: [c.pereId, c.mereId].map((x) => r1(w, x)).filter((x): x is PersoResume => !!x),
    enfants: c.enfants.map((x) => resume(w, w.personnages[x]!)), fratrie: freresSoeurs(w, c).map((x) => resume(w, x)),
    amis: rel('ami'), rivaux: rel('rival'),
    memoires: [...c.memoires].reverse().slice(0, 12).map((m) => ({ date: formatDate(m.jour), texte: m.texte })),
    ...(c.titres.length ? (() => { const b = budget(w, c); return { budget: { total: Math.round(b.solde * 100) / 100, parts: b.parts } }; })() : {}),
    ...(heritier ? { heritier: resume(w, heritier) } : {}),
    ...(plan && plan.attributions.length && new Set(plan.attributions.map((a) => a.heritier)).size > 1
      ? { partage: plan.attributions.map((a) => ({ titre: w.titres[a.titre]!.nom, heritier: resume(w, w.personnages[a.heritier]!) })) } : {}),
    ...(j && j.id !== c.id && vivantC ? { opinionDuJoueur: opinion(w, r, j, c), opinionEnversJoueur: opinion(w, r, c, j) } : {}),
    vassaux: w.vivants.map((x) => w.personnages[x]!).filter((v) => v.suzerainId === c.id && v.titres.length).map((v) => resume(w, v)),
  };
}

export function vueJouables(p: Partie): Jouable[] {
  const w = p.sim.world;
  return w.vivants.map((id) => w.personnages[id]!).filter((c) => c.titres.length > 0)
    .sort((a, b) => rangMax(w, b) - rangMax(w, a) || b.titres.length - a.titres.length)
    .map((c) => {
      const n = c.titres.filter((t) => w.titres[t]!.rang === 'comte').length;
      const rang = rangMax(w, c);
      const difficulte = age(w, c) < 16 ? 'Difficile' : rang >= 2 && n >= 3 ? 'Facile' : n >= 2 ? 'Moyenne' : 'Difficile';
      const t = titrePrincipal(w, c)!;
      const sz = perso(w, c.suzerainId);
      const mineur = age(w, c) < 16 ? ' Encore mineur : son royaume est convoité.' : '';
      const description = `${w.titres[t]!.nom}, ${n} comté${n > 1 ? 's' : ''}${sz ? `, vassal de ${nomComplet(w, sz)}` : ', souverain indépendant'}.${mineur}`;
      return { id: c.id, nom: nomComplet(w, c), titre: w.titres[t]!.nom, age: age(w, c), difficulte, description, portrait: c.portrait, sexe: c.sexe, app: apparence(w, c) };
    });
}

export function vueDynastie(p: Partie, id: number): Noeud | null {
  const w = p.sim.world;
  const c = w.personnages[id]; if (!c) return null;
  // Remonte au plus ancien ancêtre connu de la même maison
  let racine = c; let guard = 0;
  while (guard++ < 12) {
    const pere = perso(w, racine.pereId);
    const mere = perso(w, racine.mereId);
    const up = pere && pere.maisonId === c.maisonId ? pere : mere && mere.maisonId === c.maisonId ? mere : undefined;
    if (!up) break; racine = up;
  }
  const noeud = (x: Character, depth: number): Noeud => ({
    p: resume(w, x), batard: !!x.batard, conjoint: r1(w, x.conjointId ?? x.anciensConjoints[x.anciensConjoints.length - 1]),
    enfants: depth > 7 ? [] : x.enfants.map((e) => w.personnages[e]!).sort((a, b) => a.naissance - b.naissance)
      .filter((e) => e.maisonId === c.maisonId || depth < 1).map((e) => noeud(e, depth + 1)),
  });
  return noeud(racine, 0);
}

export function vueChronique(p: Partie, filtre: 'tout' | 'joueur') {
  const w = p.sim.world;
  const j = perso(w, w.joueurId ?? undefined);
  const entries = filtre === 'joueur' && j
    ? w.chronicle.filter((e) => e.characterIds?.some((id) => w.personnages[id]?.dynastieId === j.dynastieId))
    : w.chronicle;
  return entries.slice(-300).reverse().map((e) => ({ date: formatDate(e.day), annee: toCalendar(e.day).year, type: e.kind, texte: e.text, persos: e.characterIds ?? [] }));
}

export function vueIA(p: Partie, id?: number) {
  const w = p.sim.world;
  const list = id !== undefined ? p.journal.pour(id) : p.journal.tout().slice(-120);
  return list.slice(-60).reverse().map((d) => ({
    date: formatDate(d.jour), acteur: resume(w, w.personnages[d.acteur]!), action: d.action, score: d.score,
    cible: d.cible !== undefined ? resume(w, w.personnages[d.cible]!) : undefined, raisons: d.raisons,
    alternatives: d.alternatives.map((a) => ({ action: a.action, score: a.score, cible: a.cible !== undefined ? nomComplet(w, w.personnages[a.cible]!) : undefined })),
  }));
}

export function vueStats(p: Partie) {
  const w = p.sim.world;
  const v = w.vivants.map((id) => w.personnages[id]!);
  return {
    vivants: v.length, seigneurs: v.filter((c) => c.titres.length).length,
    dynastiesTitrees: new Set(v.filter((c) => c.titres.length).map((c) => c.dynastieId)).size,
    maries: v.filter((c) => c.conjointId !== undefined).length, clercs: v.filter((c) => c.clerc).length,
    ageMoyen: Math.round((v.reduce((s, c) => s + ageAt(c.naissance, w.day), 0) / Math.max(1, v.length)) * 10) / 10,
    ...w.stats,
    revenuTotal: Math.round(v.reduce((s, c) => s + revenuDomaine(w, c), 0) * 10) / 10,
  };
}
