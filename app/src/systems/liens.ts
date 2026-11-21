import type { Simulation, SimContext } from '../engine/sim';
import { POSTES, POSTE_COMPETENCE, type Character } from '../model/entities';
import type { World } from '../model/world';
import { expirerPropositions, type C } from '../interactions';
import { competence, majeur, nomComplet, perso, vivant } from '../rules/personnage';
import type { Regles } from '../rules/regles';
import { avis, concerneJoueur, marier, notifier } from './monde';
import { allierFamilles } from '../interactions/famille';

/** Liens entre personnages qui évoluent avec le temps : fiançailles, dettes, prisonniers, conseils. */
export function systemesLiens(sim: Simulation, r: Regles): void {
  sim.addSystem({ id: 'liens', frequency: 'monthly', run: (ctx) => {
    const c: C = { sim: ctx, r, w: ctx.world };
    fiancailles(c);
    expirerPropositions(c);
    dettes(c);
    prisonniers(c);
    for (const id of ctx.world.vivants) {
      const s = ctx.world.personnages[id]!;
      if (!s.titres.length) continue;
      entretenirConseil(c, s, s.id !== ctx.world.joueurId);
    }
  } });
}

/** Mariage des fiancés dès que les deux sont majeurs. */
function fiancailles(c: C): void {
  const w = c.w;
  for (const id of [...w.vivants]) {
    const x = w.personnages[id]!;
    if (x.fianceId === undefined || x.id > x.fianceId) continue;
    const y = perso(w, x.fianceId);
    if (!vivant(y)) { delete x.fianceId; continue; }
    if (!majeur(w, x) || !majeur(w, y)) continue;
    const matri = !!x.fiancesMatrilineaire;
    delete x.fianceId; delete y.fianceId; delete x.fiancesMatrilineaire; delete y.fiancesMatrilineaire;
    if (x.conjointId !== undefined || y.conjointId !== undefined || x.clerc || y.clerc) continue;
    marier(c.sim, x, y, matri);
    allierFamilles(c, x, y);
  }
}

/** Les débiteurs de l'IA remboursent dès qu'ils le peuvent ; une dette échue fâche le prêteur. */
function dettes(c: C): void {
  const w = c.w;
  for (const p of [...w.prets]) {
    const d = perso(w, p.debiteur), cr = perso(w, p.creancier);
    if (!vivant(d) || !vivant(cr)) { w.prets = w.prets.filter((x) => x !== p); continue; }
    if (d.id !== w.joueurId && d.or >= p.montant * 1.5) {
      d.or -= p.montant; cr.or += p.montant; w.prets = w.prets.filter((x) => x !== p);
      continue;
    }
    if (p.echeance <= w.day && !cr.opinions.some((o) => o.cible === d.id && o.raison === 'Dette non remboursée')) {
      avis(cr, d.id, -30, 'Dette non remboursée');
      if (d.id === w.joueurId) notifier(w, `Votre dette de ${p.montant} pièces envers ${nomComplet(w, cr)} est échue. Il est furieux.`, true, [cr.id]);
    }
  }
}

/** La captivité use la santé ; les plus habiles s'évadent parfois. */
function prisonniers(c: C): void {
  const w = c.w;
  for (const id of w.vivants) {
    const x = w.personnages[id]!;
    if (x.prisonnierDe === undefined) continue;
    x.sante = Math.max(0, x.sante - 0.05);
    if (c.sim.rng.chance(0.004 + x.competences.int * 0.0008)) {
      const geolier = x.prisonnierDe;
      delete x.prisonnierDe;
      if (concerneJoueur(w, [x.id, geolier])) notifier(w, `${nomComplet(w, x)} s'est évadé !`, true, [x.id]);
    }
  }
}

/** Candidats au conseil : adultes libres de la cour, vassaux directs, conjoint. */
export function candidatsConseil(w: World, s: Character): Character[] {
  return w.vivants.map((id) => w.personnages[id]!).filter((x) => x.id !== s.id && majeur(w, x) && x.prisonnierDe === undefined
    && (x.courId === s.id || (x.suzerainId === s.id && x.titres.length > 0) || x.conjointId === s.id));
}

/** Retire les conseillers partis ; l'IA pourvoit les postes vacants par les plus compétents. */
export function entretenirConseil(c: C, s: Character, pourvoir: boolean): void {
  const w = c.w;
  const cons = (w.conseils[s.id] ??= {});
  const candidats = candidatsConseil(w, s);
  for (const po of POSTES) {
    const m = perso(w, cons[po]);
    if (m && (!vivant(m) || !candidats.includes(m))) delete cons[po];
  }
  if (pourvoir) {
    for (const po of POSTES) {
      if (cons[po] !== undefined) continue;
      const pris = new Set(Object.values(cons));
      const best = candidats.filter((x) => !pris.has(x.id)).sort((a, b) => competence(w, c.r, b, POSTE_COMPETENCE[po]).total - competence(w, c.r, a, POSTE_COMPETENCE[po]).total || a.id - b.id)[0];
      if (best) cons[po] = best.id;
    }
  }
  const ch = perso(w, cons.chapelain);
  if (vivant(ch)) s.piete += ch.competences.sav * 0.03;
}

export function conseilsInitiaux(ctx: SimContext, r: Regles): void {
  const c: C = { sim: ctx, r, w: ctx.world };
  for (const id of ctx.world.vivants) { const s = ctx.world.personnages[id]!; if (s.titres.length) entretenirConseil(c, s, true); }
}
