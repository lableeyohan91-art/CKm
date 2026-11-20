import { addMonths } from '../engine/calendar';
import type { Simulation, SimContext, System } from '../engine/sim';
import type { Character } from '../model/entities';
import { age, axe, fertilite, MAJORITE, nomComplet, perso, pertinent, santeEffective, vivant } from '../rules/personnage';
import type { Regles } from '../rules/regles';
import { tirerTraits } from '../scenario/build';
import { competencesNaissance, concerneJoueur, creerPersonnage, estNotable, memoriser, mourir, notifier } from './monde';

/** Risque annuel de mourir selon l'âge (avant effet de la santé). */
export function risqueAnnuel(a: number): number {
  if (a < 1) return 0.2;
  if (a < 5) return 0.05;
  if (a < 16) return 0.008;
  if (a < 40) return 0.012;
  if (a < 50) return 0.02;
  if (a < 60) return 0.04;
  if (a < 70) return 0.08;
  if (a < 80) return 0.16;
  return 0.32;
}

/** Fertilité d'une femme selon son âge (1 = maximale). */
export function fertiliteAge(a: number): number {
  if (a < 16) return 0;
  if (a <= 30) return 1;
  if (a <= 35) return 0.75;
  if (a <= 40) return 0.45;
  if (a <= 45) return 0.15;
  if (a <= 48) return 0.04;
  return 0;
}

const CONCEPTION = 0.045;   // chance mensuelle de base pour un couple fertile

export function systemesDemographie(sim: Simulation, r: Regles): void {
  sim.addSystem({ id: 'sante-et-mort', frequency: 'monthly', run: (ctx) => santeEtMort(ctx, r) });
  sim.addSystem({ id: 'conception', frequency: 'monthly', run: (ctx) => conception(ctx, r) });
  sim.addSystem({ id: 'anniversaires', frequency: 'yearly', run: (ctx) => anniversaires(ctx, r) });
  sim.addSystem({ id: 'eloignement', frequency: 'yearly', run: (ctx) => eloignement(ctx) });
  sim.on('naissance', (ctx, p) => naissance(ctx, r, p.mereId as number));
}

function santeEtMort(ctx: SimContext, r: Regles): void {
  const w = ctx.world;
  for (const id of [...w.vivants]) {
    const c = w.personnages[id]!;
    if (!vivant(c)) continue;
    const a = age(w, c);
    // Maladies : plus fréquentes avec l'âge
    if (!c.malade && ctx.rng.chance((0.02 + Math.max(0, a - 40) * 0.002) / 12)) {
      c.malade = true;
      if (concerneJoueur(w, [c.id])) notifier(w, `${nomComplet(w, c)} est tombé malade.`, false, [c.id]);
    } else if (c.malade && ctx.rng.chance(0.18)) delete c.malade;
    const sante = santeEffective(r, c);
    const p = (risqueAnnuel(a) / 12) * Math.exp(-(sante - 5) * 0.25);
    if (ctx.rng.chance(p)) mourir(ctx, r, c, c.malade ? 'maladie' : a >= 60 ? 'vieillesse' : a < 5 ? 'maladie infantile' : 'accident');
  }
}

function conception(ctx: SimContext, r: Regles): void {
  const w = ctx.world;
  for (const id of w.vivants) {
    const f = w.personnages[id]!;
    if (f.sexe !== 'f' || f.enceinte || f.conjointId === undefined || f.clerc) continue;
    const h = perso(w, f.conjointId);
    if (!vivant(h)) continue;
    const fa = fertiliteAge(age(w, f)); if (fa <= 0) continue;
    const nbEnfants = f.enfants.length;
    const p = CONCEPTION * fa * fertilite(r, f) * fertilite(r, h) * (nbEnfants >= 8 ? 0.4 : 1) * (age(w, h) > 60 ? 0.5 : 1);
    if (ctx.rng.chance(p)) {
      const terme = addMonths(w.day, 9);
      f.enceinte = { pereId: h.id, terme };
      ctx.schedule(terme, 'naissance', { mereId: f.id });
    }
  }
}

function naissance(ctx: SimContext, r: Regles, mereId: number): void {
  const w = ctx.world;
  const mere = w.personnages[mereId];
  if (!mere || !mere.enceinte) return;
  const pere = perso(w, mere.enceinte.pereId);
  delete mere.enceinte;
  if (!vivant(mere)) return;
  const sexe = ctx.rng.chance(0.51) ? 'h' as const : 'f' as const;
  const maisonId = mere.matrilineaire ? mere.maisonId : pere?.maisonId ?? mere.maisonId;
  const noms = r.data.noms[(pere ?? mere).cultureId] ?? r.data.noms.francien!;
  const prenom = choisirPrenom(ctx, w, pere, mere, sexe, noms[sexe]);
  // Traits innés : transmis selon les parents, rarement spontanés
  const innes: string[] = [];
  for (const t of r.data.traits.innes) {
    const n = (pere?.traits.includes(t.id) ? 1 : 0) + (mere.traits.includes(t.id) ? 1 : 0);
    const p = n === 2 ? Math.min(0.9, t.transmission * 2.5) : n === 1 ? t.transmission : 0.015;
    if (ctx.rng.chance(p) && !(innes.includes('beau') && t.id === 'laid') && !(innes.includes('laid') && t.id === 'beau')
      && !(innes.includes('genie') && t.id === 'lent') && !(innes.includes('lent') && t.id === 'genie')
      && !(innes.includes('robuste') && t.id === 'chetif') && !(innes.includes('chetif') && t.id === 'robuste')) innes.push(t.id);
  }
  const enfant = creerPersonnage(ctx, {
    prenom, sexe, naissance: w.day, maisonId, cultureId: (pere ?? mere).cultureId, religionId: mere.religionId,
    competences: competencesNaissance(ctx, pere, mere), traits: innes, courId: mere.titres.length ? mere.id : mere.courId ?? pere?.id ?? mere.id,
    mereId: mere.id, ...(pere ? { pereId: pere.id } : {}),
  });
  enfant.sante = Math.max(1, Math.min(9, Math.round(ctx.rng.normal(5, 1.2))));
  w.stats.naissances++;
  for (const p of [pere, mere]) if (vivant(p)) memoriser(p, 'naissance-enfant', w.day, `Naissance de ${enfant.prenom}`, enfant.id, 0.5);
  if (estNotable(w, enfant)) ctx.chronicle({ kind: 'naissance', text: `Naissance de ${nomComplet(w, enfant)}, ${sexe === 'h' ? 'fils' : 'fille'} de ${pere ? nomComplet(w, pere) : nomComplet(w, mere)}.`, characterIds: [enfant.id] });
  if (concerneJoueur(w, [mere.id, ...(pere ? [pere.id] : [])])) notifier(w, `Naissance de ${enfant.prenom}, ${sexe === 'h' ? 'un fils' : 'une fille'}.`, w.joueurId === pere?.id || w.joueurId === mere.id, [enfant.id]);
  // Couches : risque pour la mère et l'enfant
  if (ctx.rng.chance(0.015 * Math.exp(-(santeEffective(r, mere) - 5) * 0.2))) mourir(ctx, r, mere, 'en couches');
}

/** Prénoms : souvent ceux des grands-parents ou du père, pour garder les noms de lignée. */
function choisirPrenom(ctx: SimContext, w: Parameters<typeof perso>[0], pere: Character | undefined, mere: Character,
  sexe: 'h' | 'f', liste: string[]): string {
  const famille = [pere, mere, perso(w, pere?.pereId), perso(w, pere?.mereId), perso(w, mere.pereId), perso(w, mere.mereId)]
    .filter((x): x is Character => !!x && x.sexe === sexe).map((x) => x.prenom);
  const freres = new Set([...(pere?.enfants ?? []), ...mere.enfants].map((id) => w.personnages[id]).filter((k) => vivant(k)).map((k) => k!.prenom));
  const choix = famille.filter((n) => !freres.has(n));
  if (choix.length && ctx.rng.chance(0.6)) return ctx.rng.pick(choix);
  const libres = liste.filter((n) => !freres.has(n));
  return ctx.rng.pick(libres.length ? libres : liste);
}

/** Chaque 1er janvier : majorité, vieillissement. */
function anniversaires(ctx: SimContext, r: Regles): void {
  const w = ctx.world;
  const persoIds = r.data.traits.personnalite.map((t) => t.id);
  for (const id of w.vivants) {
    const c = w.personnages[id]!;
    const a = age(w, c);
    // Traits de caractère : 1 vers 6 ans, puis complétés à la majorité (influencés par les parents)
    const nbPerso = c.traits.filter((t) => r.perso.has(t)).length;
    if (a >= 6 && nbPerso === 0) c.traits = tirerTraitsHerites(ctx, w, r, c, persoIds, 1);
    if (a >= MAJORITE && nbPerso < 3) {
      c.traits = tirerTraitsHerites(ctx, w, r, c, persoIds, 3);
      if (!c.traits.some((t) => r.education.has(t))) {
        const best = (['dip', 'gue', 'ges', 'int', 'sav'] as const).reduce((x, s) => (c.competences[s] > c.competences[x] ? s : x), 'dip' as 'dip' | 'gue' | 'ges' | 'int' | 'sav');
        const edu = r.data.traits.education.find((e) => e.competence === best)!;
        c.traits.push(edu.id);
        c.competences[best] += ctx.rng.int(1, 3);
      }
      if (!c.ambition) c.ambition = choisirAmbition(r, c);
    }
    if (a > 50) c.sante = Math.max(0, c.sante - 0.15);
  }
}

function tirerTraitsHerites(ctx: SimContext, w: Parameters<typeof perso>[0], r: Regles, c: Character, ids: string[], n: number): string[] {
  const parentsTraits = [perso(w, c.pereId), perso(w, c.mereId)].flatMap((p) => p?.traits ?? []).filter((t) => r.perso.has(t));
  let traits = [...c.traits];
  // une chance sur trois d'hériter d'un trait d'un parent
  if (parentsTraits.length && ctx.rng.chance(0.35)) {
    const t = ctx.rng.pick(parentsTraits); const op = r.perso.get(t)?.oppose;
    if (!traits.includes(t) && !(op && traits.includes(op))) traits.push(t);
  }
  traits = tirerTraits(ctx, ids, r, n, traits);
  return traits;
}

/** Ambition durable, tirée de la personnalité : oriente l'IA pendant des années. */
export function choisirAmbition(r: Regles, c: Character): string {
  const scores: [string, number][] = [
    ['puissance', axe(r, c, 'ambition') * 2 + axe(r, c, 'audace')],
    ['richesse', axe(r, c, 'cupidite') * 2 + axe(r, c, 'raison')],
    ['piete', axe(r, c, 'piete') * 2],
    ['amitie', axe(r, c, 'sociabilite') * 2 - axe(r, c, 'rancune')],
    ['famille', 1 + axe(r, c, 'compassion')],
  ];
  scores.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  return scores[0]![0];
}

/**
 * Niveau de détail : les adultes sans lien proche avec une famille titrée quittent
 * peu à peu la scène (avec leur conjoint et leurs jeunes enfants). Ils ne meurent pas :
 * ils ne sont simplement plus simulés. Cela garde le monde vivant à une taille stable.
 */
function eloignement(ctx: SimContext): void {
  const w = ctx.world;
  const partir = new Set<number>();
  for (const id of w.vivants) {
    const c = w.personnages[id]!;
    if (partir.has(id) || age(w, c) < MAJORITE || pertinent(w, c) || !ctx.rng.chance(0.3)) continue;
    const conj = perso(w, c.conjointId);
    if (conj && pertinent(w, conj)) continue;
    partir.add(c.id); if (conj) partir.add(conj.id);
    for (const k of [...c.enfants, ...(conj?.enfants ?? [])]) {
      const e = w.personnages[k]!;
      if (vivant(e) && age(w, e) < MAJORITE && !pertinent(w, e)) partir.add(e.id);
    }
  }
  if (!partir.size) return;
  for (const id of partir) {
    const c = w.personnages[id]!;
    c.horsScene = w.day;
    if (c.enceinte) delete c.enceinte;
  }
  w.vivants = w.vivants.filter((id) => !partir.has(id));
  w.relations = w.relations.filter((r) => !partir.has(r.a) && !partir.has(r.b));
}
