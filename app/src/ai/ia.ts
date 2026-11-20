import { addYears } from '../engine/calendar';
import type { Simulation, SimContext } from '../engine/sim';
import type { Character } from '../model/entities';
import { fertiliteAge } from '../systems/demographie';
import { avis, creerPersonnage, marier, memoriser, competencesNaissance, concerneJoueur, notifier } from '../systems/monde';
import { opinionTotal } from '../rules/opinion';
import { age, axe, consanguins, majeur, nomComplet, perso, pertinent, rangMax, vivant, type Part } from '../rules/personnage';
import type { Regles } from '../rules/regles';
import { tirerTraits } from '../scenario/build';
import type { JournalIA } from './journal';

/**
 * IA des personnages : « Utility AI ».
 * Chaque personnage réfléchit environ une fois par mois (étalé selon son identifiant).
 * Il évalue des options, chacune notée par des considérations explicites, puis
 * choisit parmi les meilleures par un tirage pondéré (déterministe, jamais uniforme).
 */
interface Option { action: string; cible?: number; score: number; raisons: Part[]; executer: () => void }

const PERIODE = 30;
const SEUIL_ATTENTE = 10;

export function systemeIA(sim: Simulation, r: Regles, journal: JournalIA): void {
  sim.addSystem({ id: 'ia', frequency: 'daily', run: (ctx) => {
    const w = ctx.world;
    const penseurs = w.vivants.filter((id) => (id + w.day) % PERIODE === 0 && id !== w.joueurId);
    if (!penseurs.length) return;
    const celibs = celibataires(ctx);
    for (const id of penseurs) {
      const c = w.personnages[id]!;
      if (!vivant(c) || !majeur(w, c)) continue;
      reflechir(ctx, r, c, celibs, journal);
    }
  } });
}

function reflechir(ctx: SimContext, r: Regles, c: Character, celibs: Character[], journal: JournalIA): void {
  const options: Option[] = [{ action: 'attendre', score: SEUIL_ATTENTE, raisons: [{ source: 'Ne rien faire', valeur: SEUIL_ATTENTE }], executer: () => {} }];
  options.push(...optionsMariage(ctx, r, c, celibs), ...optionsCadeau(ctx, r, c), ...optionsReligion(ctx, r, c));
  options.sort((a, b) => b.score - a.score);
  const top = options.slice(0, 3).filter((o) => o.score >= options[0]!.score * 0.7);
  const choix = ctx.rng.weighted(top, (o) => o.score) ?? options[0]!;
  journal.add({ jour: ctx.day, acteur: c.id, action: choix.action, ...(choix.cible !== undefined ? { cible: choix.cible } : {}), score: Math.round(choix.score),
    raisons: choix.raisons, alternatives: options.slice(0, 5).map((o) => ({ action: o.action, ...(o.cible !== undefined ? { cible: o.cible } : {}), score: Math.round(o.score) })) });
  choix.executer();
}

// ------------------------------------------------------------------ Mariages

/** Liste des célibataires mariables du jour (calculée une fois par jour). */
function celibataires(ctx: SimContext): Character[] {
  const w = ctx.world;
  return w.vivants.map((id) => w.personnages[id]!).filter((x) => x.conjointId === undefined && !x.clerc && majeur(w, x) && (x.sexe === 'h' || age(w, x) <= 40));
}

/** Qui décide du mariage d'un personnage : son père vivant, sinon sa mère titrée, sinon lui-même. */
export function tuteur(w: SimContext['world'], c: Character): Character {
  if (c.titres.length) return c;
  const p = perso(w, c.pereId); if (vivant(p)) return p;
  const m = perso(w, c.mereId); if (vivant(m) && m.titres.length) return m;
  return c;
}

/** Rang de la famille : celui du chef de famille (0 à 3). */
const rangFamille = (w: SimContext['world'], c: Character) => Math.max(rangMax(w, c), rangMax(w, tuteur(w, c)));

const estHeritierPrincipal = (w: SimContext['world'], c: Character): boolean => {
  const p = perso(w, c.pereId);
  if (!vivant(p) || !p.titres.length) return c.titres.length > 0;
  const fils = p.enfants.map((id) => w.personnages[id]!).filter((k) => vivant(k) && k.sexe === 'h' && !k.batard && !k.clerc).sort((a, b) => a.naissance - b.naissance);
  return fils[0]?.id === c.id;
};

/** Intérêt d'un mariage entre `dep` et `cand`, vu par le décideur `pour`. */
export function interetMariage(ctx: SimContext, r: Regles, pour: Character, dep: Character, cand: Character): { score: number; raisons: Part[] } {
  const w = ctx.world;
  const raisons: Part[] = [];
  const add = (source: string, v: number) => { if (v) raisons.push({ source, valeur: Math.round(v) }); };
  const poidsRang = (pour.ambition === 'puissance' ? 1.5 : 1) * (dep.titres.length || estHeritierPrincipal(w, dep) ? 1.3 : 1);
  add('Rang de sa famille', rangFamille(w, cand) * 12 * poidsRang);
  const femme = cand.sexe === 'f' ? cand : dep;
  add('Âge pour avoir des enfants', fertiliteAge(age(w, femme)) * 15 * (pour.ambition === 'famille' ? 1.4 : 1));
  const ecart = Math.abs(age(w, dep) - age(w, cand));
  if (ecart > 10) add("Différence d'âge", -(ecart - 10));
  const tuteurCand = tuteur(w, cand);
  if (tuteurCand.id !== pour.id) add('Opinion de sa famille', opinionTotal(w, r, pour, tuteurCand) / 5);
  for (const [t, v] of [['beau', 5], ['laid', -5], ['genie', 8], ['lent', -6], ['chetif', -5], ['robuste', 4]] as const) if (cand.traits.includes(t)) add(r.innes.get(t)!.nom, v);
  if (cand.cultureId === dep.cultureId) add('Même culture', 3);
  if (cand.titres.length) add('Possède des terres', 10 * poidsRang);
  return { score: raisons.reduce((s, x) => s + x.valeur, 0), raisons };
}

function optionsMariage(ctx: SimContext, r: Regles, c: Character, celibs: Character[]): Option[] {
  const w = ctx.world;
  const dependants = [c, ...c.enfants.map((id) => w.personnages[id]!)]
    .filter((d) => vivant(d) && d.conjointId === undefined && !d.clerc && majeur(w, d) && tuteur(w, d).id === c.id && (d.sexe === 'h' || age(w, d) <= 40) && pertinent(w, d));
  const out: Option[] = [];
  for (const dep of dependants.slice(0, 2)) {
    const pool = celibs.filter((x) => x.sexe !== dep.sexe && x.religionId === dep.religionId && x.id !== dep.id);
    let meilleur: { cand: Character; score: number; raisons: Part[] } | undefined;
    for (let i = 0; i < Math.min(40, pool.length); i++) {
      const cand = pool[ctx.rng.int(0, pool.length - 1)]!;
      if (cand.conjointId !== undefined || consanguins(w, dep, cand)) continue;
      const tc = tuteur(w, cand);
      if (tc.id === w.joueurId) continue;                 // les propositions au joueur arriveront avec l'interface
      const it = interetMariage(ctx, r, c, dep, cand);
      if (meilleur && it.score <= meilleur.score) continue;
      // La famille d'en face accepte-t-elle ?
      const accept = interetMariage(ctx, r, tc, cand, dep).score + opinionTotal(w, r, tc, c) / 5 - Math.max(0, rangFamille(w, cand) - rangFamille(w, dep)) * 10;
      if (accept < 8) continue;
      meilleur = { cand, ...it };
    }
    const urgence = dep.sexe === 'h' ? 0.8 + 0.05 * Math.max(0, age(w, dep) - 18) : 1 + 0.1 * Math.max(0, age(w, dep) - 16);
    if (meilleur && meilleur.score >= 12) {
      const m = meilleur;
      const raisons = [...m.raisons, { source: 'Urgence (âge)', valeur: Math.round((urgence - 1) * m.score) }];
      out.push({ action: dep.id === c.id ? 'se marier' : 'marier un enfant', cible: m.cand.id, score: m.score * urgence, raisons,
        executer: () => celebrer(ctx, r, dep, m.cand) });
    } else if (dep.titres.length || estHeritierPrincipal(w, dep)) {
      // Faute de parti convenable, une union dans la petite noblesse assure la lignée
      const s = 8 + Math.max(0, age(w, dep) - 20) * 1.5;
      out.push({ action: 'épouser dans la petite noblesse', score: s, raisons: [{ source: 'Assurer la descendance', valeur: Math.round(s) }],
        executer: () => celebrer(ctx, r, dep, genererConjoint(ctx, r, dep)) });
    }
  }
  return out;
}

function celebrer(ctx: SimContext, r: Regles, a: Character, b: Character): void {
  const w = ctx.world;
  if (a.conjointId !== undefined || b.conjointId !== undefined || !vivant(a) || !vivant(b)) return;
  const femme = a.sexe === 'f' ? a : b, homme = a.sexe === 'h' ? a : b;
  const matri = femme.titres.length > 0 && rangMax(w, femme) > rangMax(w, homme)
    || (estHeritierPrincipal(w, femme) && femme.sexe === 'f' && !perso(w, femme.pereId)?.enfants.some((id) => { const k = w.personnages[id]!; return vivant(k) && k.sexe === 'h' && !k.batard; }));
  marier(ctx, a, b, !!matri);
  void r;
}

function genererConjoint(ctx: SimContext, r: Regles, dep: Character): Character {
  const w = ctx.world;
  const noms = r.data.noms[dep.cultureId] ?? r.data.noms.francien!;
  const lieu = ctx.rng.pick(noms.lieux);
  const maisonId = `petite-${lieu.toLowerCase().replace(/[^a-z]+/g, '-')}`;
  if (!w.maisons[maisonId]) {
    w.dynasties[maisonId] = { id: maisonId, nom: `Maison de ${lieu}`, maisons: [maisonId], gloire: 0 };
    w.maisons[maisonId] = { id: maisonId, nom: lieu, dynastieId: maisonId };
  }
  const sexe = dep.sexe === 'h' ? 'f' as const : 'h' as const;
  const a = dep.sexe === 'h' ? ctx.rng.int(16, 24) : Math.max(16, age(w, dep) + ctx.rng.int(-3, 8));
  const c = creerPersonnage(ctx, {
    prenom: ctx.rng.pick(noms[sexe]), sexe, naissance: w.day - a * 365 - ctx.rng.int(0, 364), maisonId, cultureId: dep.cultureId,
    religionId: dep.religionId, competences: competencesNaissance(ctx), traits: tirerTraits(ctx, r.data.traits.personnalite.map((t) => t.id), r, 3),
  });
  c.or = 2; c.prestige = 10;
  return c;
}

// ------------------------------------------------------------------ Cadeaux

function optionsCadeau(ctx: SimContext, r: Regles, c: Character): Option[] {
  const w = ctx.world;
  const s = perso(w, c.suzerainId);
  if (!c.titres.length || !vivant(s) || c.or < 30) return [];
  const op = opinionTotal(w, r, s, c);
  if (op >= 30) return [];
  const raisons: Part[] = [
    { source: `Opinion de votre suzerain (${op})`, valeur: Math.round((30 - op) / 2) },
    { source: 'Générosité / avarice', valeur: -axe(r, c, 'cupidite') * 6 },
    { source: 'Ambition', valeur: c.ambition === 'amitie' || c.ambition === 'puissance' ? 4 : 0 },
  ].filter((x) => x.valeur);
  const score = raisons.reduce((a, x) => a + x.valeur, 0);
  const montant = Math.max(10, Math.round(c.or * 0.2));
  return [{ action: 'offrir un cadeau au suzerain', cible: s.id, score, raisons, executer: () => {
    c.or -= montant; s.or += montant;
    avis(s, c.id, 15, `Cadeau de ${montant} pièces d'or`, addYears(w.day, 10));
    memoriser(s, 'cadeau-recu', w.day, `Cadeau de ${nomComplet(w, c)}`, c.id, 0.4);
    if (concerneJoueur(w, [s.id]) && w.joueurId === s.id) notifier(w, `${nomComplet(w, c)} vous offre ${montant} pièces d'or.`, false, [c.id]);
  } }];
}

// ------------------------------------------------------------------ Vœux religieux

function optionsReligion(ctx: SimContext, r: Regles, c: Character): Option[] {
  const w = ctx.world;
  if (c.titres.length || c.conjointId !== undefined || c.clerc || estHeritierPrincipal(w, c) || age(w, c) > 40) return [];
  const p = perso(w, c.pereId);
  const cadet = !!p && p.titres.length > 0;
  const raisons: Part[] = [
    { source: 'Piété', valeur: axe(r, c, 'piete') * 6 },
    { source: 'Cadet sans héritage', valeur: cadet ? 6 : 2 },
    { source: 'Ambition', valeur: -axe(r, c, 'ambition') * 4 },
    { source: 'Âge sans mariage', valeur: Math.max(0, age(w, c) - 25) },
  ].filter((x) => x.valeur);
  const score = raisons.reduce((a, x) => a + x.valeur, 0);
  return [{ action: 'prononcer ses vœux', score, raisons, executer: () => {
    c.clerc = true; c.piete += 100;
    if (concerneJoueur(w, [c.id])) notifier(w, `${nomComplet(w, c)} entre dans les ordres.`, false, [c.id]);
  } }];
}
