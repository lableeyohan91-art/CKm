import type { Simulation, SimContext } from '../engine/sim';
import type { Character } from '../model/entities';
import { creerPersonnage, marier, competencesNaissance, concerneJoueur, notifier } from '../systems/monde';
import { opinionTotal } from '../rules/opinion';
import { age, axe, comtesTenus, majeur, nomComplet, perso, pertinent, vivant, type Part } from '../rules/personnage';
import { chefDeFamille, estHeritierPrincipal, interetMariage } from '../rules/mariage';
import { evaluer, executer, interaction, type C } from '../interactions';
import type { Regles } from '../rules/regles';
import { tirerTraits } from '../scenario/build';
import type { JournalIA } from './journal';
import { optionsForger, optionsGuerre } from './guerre';

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
      if (!vivant(c) || !majeur(w, c) || c.prisonnierDe !== undefined) continue;
      reflechir(ctx, r, c, celibs, journal);
    }
  } });
}

function reflechir(ctx: SimContext, r: Regles, c: Character, celibs: Character[], journal: JournalIA): void {
  const options: Option[] = [{ action: 'attendre', score: SEUIL_ATTENTE, raisons: [{ source: 'Ne rien faire', valeur: SEUIL_ATTENTE }], executer: () => {} }];
  options.push(...optionsMariage(ctx, r, c, celibs), ...optionsCadeau(ctx, r, c), ...optionsReligion(ctx, r, c),
    ...optionsDoterFils(ctx, r, c), ...optionsAideOr(ctx, r, c), ...optionsAlliance(ctx, r, c), ...optionsTrahison(ctx, r, c), ...optionsGuerre(ctx, r, c), ...optionsForger(ctx, r, c));
  options.sort((a, b) => b.score - a.score);
  const top = options.slice(0, 3).filter((o) => o.score >= options[0]!.score * 0.7);
  const choix = ctx.rng.weighted(top, (o) => o.score) ?? options[0]!;
  journal.add({ jour: ctx.day, acteur: c.id, action: choix.action, ...(choix.cible !== undefined ? { cible: choix.cible } : {}), score: Math.round(choix.score),
    raisons: choix.raisons, alternatives: options.slice(0, 5).map((o) => ({ action: o.action, ...(o.cible !== undefined ? { cible: o.cible } : {}), score: Math.round(o.score) })) });
  choix.executer();
}

// ------------------------------------------------------------------ Mariages et fiançailles

/** Liste des célibataires du jour (calculée une fois par jour). */
function celibataires(ctx: SimContext): Character[] {
  const w = ctx.world;
  return w.vivants.map((id) => w.personnages[id]!).filter((x) => x.conjointId === undefined && x.fianceId === undefined && !x.clerc && x.prisonnierDe === undefined && (x.sexe === 'h' || age(w, x) <= 40));
}

export const tuteur = chefDeFamille;

function optionsMariage(ctx: SimContext, r: Regles, c: Character, celibs: Character[]): Option[] {
  const w = ctx.world;
  const ci: C = { sim: ctx, r, w };
  const dependants = [c, ...c.enfants.map((id) => w.personnages[id]!)]
    .filter((d) => vivant(d) && d.conjointId === undefined && d.fianceId === undefined && !d.clerc && chefDeFamille(w, d).id === c.id
      && (d.sexe === 'h' || age(w, d) <= 40) && pertinent(w, d) && (majeur(w, d) || age(w, d) >= 6));
  const out: Option[] = [];
  for (const dep of dependants.slice(0, 2)) {
    const fiance = !majeur(w, dep);
    if (fiance && !ctx.rng.chance(0.25)) continue;                // les fiançailles ne pressent pas
    const id = fiance ? 'fiancailles' : 'mariage';
    const pool = celibs.filter((x) => x.sexe !== dep.sexe && x.religionId === dep.religionId && x.id !== dep.id && majeur(w, x) !== fiance && (!fiance || age(w, x) >= 4));
    let meilleur: { cand: Character; score: number; raisons: Part[]; matri: boolean } | undefined;
    for (let i = 0; i < Math.min(40, pool.length); i++) {
      const cand = pool[ctx.rng.int(0, pool.length - 1)]!;
      const it = interetMariage(w, r, c, dep, cand);
      if (meilleur && it.score <= meilleur.score) continue;
      const matri = dep.sexe === 'f' && estHeritiere(w, dep);
      const ev = evaluer(ci, interaction(id)!, c, cand, { membre: dep.id, matrilineaire: matri });
      if (!ev.possible) continue;
      const versJoueur = ev.decideur?.id === w.joueurId;
      if (!versJoueur && !ev.acceptation?.accepte) continue;
      if (versJoueur && (w.propositions.some((x) => x.acteur === c.id) || !ctx.rng.chance(0.3))) continue;
      meilleur = { cand, ...it, matri };
    }
    const urgence = fiance ? 0.6 : dep.sexe === 'h' ? 0.8 + 0.05 * Math.max(0, age(w, dep) - 18) : 1 + 0.1 * Math.max(0, age(w, dep) - 16);
    if (meilleur && meilleur.score >= 12) {
      const m = meilleur;
      const raisons = [...m.raisons, { source: 'Urgence (âge)', valeur: Math.round((urgence - 1) * m.score) }];
      out.push({ action: fiance ? 'fiancer un enfant' : dep.id === c.id ? 'se marier' : 'marier un enfant', cible: m.cand.id, score: m.score * urgence, raisons,
        executer: () => { executer(ci, id, c, m.cand, { membre: dep.id, matrilineaire: m.matri }); } });
    } else if (!fiance && (dep.titres.length || estHeritierPrincipal(w, dep))) {
      // Faute de parti convenable, une union dans la petite noblesse assure la lignée
      const s = 8 + Math.max(0, age(w, dep) - 20) * 1.5;
      out.push({ action: 'épouser dans la petite noblesse', score: s, raisons: [{ source: 'Assurer la descendance', valeur: Math.round(s) }],
        executer: () => { const conj = genererConjoint(ctx, r, dep); marier(ctx, dep, conj, dep.sexe === 'f' && estHeritiere(w, dep)); } });
    }
  }
  return out;
}

/** Une fille héritière (sans frère légitime vivant) se marie de préférence en lignée matrilinéaire. */
function estHeritiere(w: SimContext['world'], f: Character): boolean {
  if (f.titres.length) return true;
  const p = perso(w, f.pereId);
  if (!vivant(p) || !p.titres.length) return false;
  return estHeritierPrincipal(w, f) || !p.enfants.some((id) => { const k = w.personnages[id]!; return vivant(k) && k.sexe === 'h' && !k.batard && !k.clerc; });
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

// ------------------------------------------------------------------ Cadeaux, terres, aide, alliances

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
  const montant = c.or >= 90 ? 60 : c.or >= 45 ? 30 : 10;
  return [{ action: 'offrir un cadeau au suzerain', cible: s.id, score, raisons, executer: () => { executer({ sim: ctx, r, w }, 'cadeau', c, s, { montant }); } }];
}

/** Un grand seigneur dote son fils adulte sans terre d'un comté. */
function optionsDoterFils(ctx: SimContext, r: Regles, c: Character): Option[] {
  const w = ctx.world;
  const nb = comtesTenus(w, c).length;
  if (nb < 4) return [];
  const fils = c.enfants.map((id) => w.personnages[id]!).filter((k) => vivant(k) && majeur(w, k) && !k.titres.length && !k.clerc && !k.batard && k.prisonnierDe === undefined && k.courId === c.id);
  const k = fils.sort((a, b) => a.naissance - b.naissance)[1] ?? (nb >= 6 ? fils[0] : undefined); // de préférence un cadet
  if (!k) return [];
  const ci: C = { sim: ctx, r, w };
  const it = interaction('accorder-titre')!;
  const opts = it.parametres![0]!.options(ci, c, k);
  if (!opts.length) return [];
  const titre = opts[opts.length - 1]!.valeur;                  // le comté le moins riche
  const raisons: Part[] = [
    { source: 'Grand domaine', valeur: (nb - 3) * 3 },
    { source: 'Doter ses enfants', valeur: c.ambition === 'famille' ? 8 : 3 },
    { source: 'Garder ses terres', valeur: c.ambition === 'puissance' || c.ambition === 'richesse' ? -6 : 0 },
    { source: 'Compassion', valeur: axe(r, c, 'compassion') * 2 },
  ].filter((x) => x.valeur);
  return [{ action: 'doter un fils', cible: k.id, score: raisons.reduce((a, x) => a + x.valeur, 0), raisons, executer: () => { executer(ci, 'accorder-titre', c, k, { titre }); } }];
}

function optionsAideOr(ctx: SimContext, r: Regles, c: Character): Option[] {
  const w = ctx.world;
  if (!c.titres.length || c.or > 5) return [];
  const riches = w.vivants.map((id) => w.personnages[id]!).filter((v) => v.suzerainId === c.id && v.titres.length && v.or >= 30).sort((a, b) => b.or - a.or);
  const ci: C = { sim: ctx, r, w };
  const v = riches.find((x) => evaluer(ci, interaction('aide-or')!, c, x, { part: 0.2 }).possible); if (!v) return [];
  return [{ action: 'réclamer une aide en or', cible: v.id, score: 14 - c.or, raisons: [{ source: 'Trésor vide', valeur: 14 - Math.round(c.or) }], executer: () => { executer(ci, 'aide-or', c, v, { part: 0.2 }); } }];
}

function optionsAlliance(ctx: SimContext, r: Regles, c: Character): Option[] {
  const w = ctx.world;
  if (!c.titres.length || !ctx.rng.chance(0.2)) return [];
  const ci: C = { sim: ctx, r, w };
  const it = interaction('alliance')!;
  const cands = w.vivants.map((id) => w.personnages[id]!).filter((x) => x.titres.length && x.id !== c.id && it.visible(ci, c, x));
  if (!cands.length) return [];
  const x = cands[ctx.rng.int(0, cands.length - 1)]!;
  const ev = evaluer(ci, it, c, x, {});
  if (!ev.possible || (ev.decideur?.id !== w.joueurId && !ev.acceptation?.accepte)) return [];
  if (ev.decideur?.id === w.joueurId && w.propositions.some((p) => p.acteur === c.id)) return [];
  const op = opinionTotal(w, r, c, x);
  const score = 4 + op / 6 + (c.ambition === 'puissance' ? 4 : 0);
  return [{ action: 'proposer une alliance', cible: x.id, score, raisons: [{ source: `Opinion (${op})`, valeur: Math.round(op / 6) }, { source: 'Chercher des appuis', valeur: 4 }], executer: () => { executer(ci, 'alliance', c, x, {}); } }];
}

// ------------------------------------------------------------------ Trahisons

/**
 * Le caractère décide : un fourbe trahit volontiers, un loyal presque jamais.
 * Toutes ces trahisons passent par les interactions communes (mêmes coûts, mêmes conséquences).
 */
export function optionsTrahison(ctx: SimContext, r: Regles, c: Character): Option[] {
  const w = ctx.world;
  const ci: C = { sim: ctx, r, w };
  const loyaute = axe(r, c, 'loyaute');                         // +2 loyal, −2 fourbe
  const out: Option[] = [];

  // 1. Rompre une alliance devenue odieuse
  for (const al of w.alliances) {
    if (al.a !== c.id && al.b !== c.id) continue;
    const allie = w.personnages[al.a === c.id ? al.b : al.a]!;
    const op = opinionTotal(w, r, c, allie);
    if (op > -15 || c.prestige < 100) continue;
    const raisons: Part[] = [
      { source: `Mépris pour ${allie.prenom} (${op})`, valeur: Math.round(-op / 3) },
      { source: loyaute < 0 ? 'Fourberie' : 'Loyauté', valeur: loyaute < 0 ? -loyaute * 5 : -loyaute * 12 },
      { source: 'Le déshonneur d’une rupture', valeur: -6 },
    ];
    out.push({ action: 'rompre une alliance', cible: allie.id, score: raisons.reduce((s, x) => s + x.valeur, 0), raisons,
      executer: () => { executer(ci, 'rompre-alliance', c, allie, {}); } });
  }

  // 2. Rompre des fiançailles pour un meilleur parti
  if (ctx.rng.chance(0.06)) {
    for (const id of c.enfants) {
      const k = w.personnages[id]!;
      if (!vivant(k) || k.fianceId === undefined || chefDeFamille(w, k).id !== c.id) continue;
      const promis = w.personnages[k.fianceId]!;
      const actuel = interetMariage(w, r, c, k, promis).score;
      const pool = w.vivants.map((x) => w.personnages[x]!).filter((x) => x.sexe !== k.sexe && x.fianceId === undefined && x.conjointId === undefined && !x.clerc && !majeur(w, x) && x.id !== promis.id);
      let mieux: { cand: Character; score: number } | undefined;
      for (let i = 0; i < Math.min(15, pool.length); i++) {
        const cand = pool[ctx.rng.int(0, pool.length - 1)]!;
        const sc = interetMariage(w, r, c, k, cand).score;
        if (mieux && sc <= mieux.score) continue;
        // on évalue le nouveau parti comme si la promesse actuelle était déjà rompue
        const promesse: number | undefined = k.fianceId;
        delete k.fianceId;
        const ev = evaluer(ci, interaction('fiancailles')!, c, cand, { membre: k.id, matrilineaire: false });
        k.fianceId = promesse;
        if (!ev.possible || ev.decideur?.id === w.joueurId || !ev.acceptation?.accepte) continue;
        mieux = { cand, score: sc };
      }
      if (!mieux) continue;
      const gain = mieux.score - actuel;
      const raisons: Part[] = [
        { source: 'Meilleur parti trouvé', valeur: Math.round((gain - 15) / 2) },
        { source: loyaute < 0 ? 'Fourberie' : 'Parole donnée', valeur: loyaute < 0 ? -loyaute * 3 : -12 - loyaute * 10 },
        { source: 'Ambition', valeur: c.ambition === 'puissance' ? 5 : 0 },
      ];
      const m = mieux;
      out.push({ action: 'rompre des fiançailles', cible: promis.id, score: raisons.reduce((s, x) => s + x.valeur, 0), raisons,
        executer: () => {
          if (executer(ci, 'rompre-fiancailles', c, promis, {}).ok) executer(ci, 'fiancailles', c, m.cand, { membre: k.id, matrilineaire: false });
        } });
      break;
    }
  }

  // 3. Le suzerain cruel ou fourbe jette au cachot un vassal qu'il hait, puis le dépouille
  for (const id of w.vivants) {
    const v = w.personnages[id]!;
    if (v.suzerainId !== c.id || !v.titres.length) continue;
    if (v.prisonnierDe === c.id) {
      const raisons: Part[] = [{ source: 'Prisonnier à sa merci', valeur: 6 }, { source: 'Avidité', valeur: axe(r, c, 'cupidite') * 3 + (c.ambition === 'puissance' ? 4 : 0) }, { source: 'Compassion', valeur: -axe(r, c, 'compassion') * 4 }];
      const titre = v.titres[v.titres.length - 1]!;
      out.push({ action: 'dépouiller un vassal emprisonné', cible: v.id, score: raisons.reduce((s, x) => s + x.valeur, 0), raisons,
        executer: () => { executer(ci, 'revoquer-titre', c, v, { titre }); } });
      continue;
    }
    const op = opinionTotal(w, r, c, v);
    if (op > -40) continue;
    const raisons: Part[] = [
      { source: `Haine envers ${v.prenom} (${op})`, valeur: Math.round((-op - 30) / 3) },
      { source: 'Cruauté', valeur: -axe(r, c, 'compassion') * 4 },
      { source: loyaute < 0 ? 'Fourberie' : 'Respect du serment', valeur: loyaute < 0 ? -loyaute * 3 : -6 - loyaute * 6 },
      { source: 'Prudence (puissance du vassal)', valeur: -comtesTenus(w, v).length * 3 - axe(r, c, 'raison') * 2 },
    ];
    out.push({ action: 'emprisonner un vassal haï', cible: v.id, score: raisons.reduce((s, x) => s + x.valeur, 0), raisons,
      executer: () => { executer(ci, 'emprisonner', c, v, {}); } });
  }
  return out;
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
