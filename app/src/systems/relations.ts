import type { Simulation, SimContext } from '../engine/sim';
import type { Character } from '../model/entities';
import { opinionTotal } from '../rules/opinion';
import { axe, majeur, nomComplet, vivant } from '../rules/personnage';
import type { Regles } from '../rules/regles';
import { concerneJoueur, notifier } from './monde';

/** Personnes que l'on côtoie : même cour, suzerain, vassaux, conjoint. */
export function entourage(ctx: SimContext, c: Character): Character[] {
  const w = ctx.world;
  const centre = c.titres.length ? c.id : c.courId;
  const out: Character[] = [];
  for (const id of w.vivants) {
    if (id === c.id) continue;
    const x = w.personnages[id]!;
    if ((centre !== undefined && (x.courId === centre || x.id === centre)) || x.suzerainId === c.id || c.suzerainId === x.id || x.conjointId === c.id) out.push(x);
  }
  return out;
}

export function systemesRelations(sim: Simulation, r: Regles): void {
  sim.addSystem({ id: 'relations', frequency: 'monthly', run: (ctx) => {
    const w = ctx.world;
    for (const id of [...w.vivants]) {
      const c = w.personnages[id]!;
      if (!vivant(c) || !majeur(w, c) || !ctx.rng.chance(0.08)) continue;
      const proches = entourage(ctx, c).filter((x) => majeur(w, x));
      if (!proches.length) continue;
      const x = ctx.rng.pick(proches);
      const deja = w.relations.find((rel) => (rel.a === c.id && rel.b === x.id) || (rel.a === x.id && rel.b === c.id));
      if (deja) continue;
      const op = opinionTotal(w, r, c, x), opx = opinionTotal(w, r, x, c);
      const nbAmis = w.relations.filter((rel) => rel.type === 'ami' && (rel.a === c.id || rel.b === c.id)).length;
      const nbRivaux = w.relations.filter((rel) => rel.type === 'rival' && (rel.a === c.id || rel.b === c.id)).length;
      let type: 'ami' | 'rival' | null = null;
      if (op + opx > 40 && nbAmis < 3 && ctx.rng.chance(0.3 + 0.15 * axe(r, c, 'sociabilite'))) type = 'ami';
      else if (op + opx < -30 && nbRivaux < 2 && ctx.rng.chance(0.3 + 0.15 * axe(r, c, 'rancune'))) type = 'rival';
      if (!type) continue;
      const [a, b] = c.id < x.id ? [c.id, x.id] : [x.id, c.id];
      w.relations.push({ a, b, type, depuis: w.day });
      const texte = type === 'ami' ? `${nomComplet(w, c)} et ${nomComplet(w, x)} deviennent amis.` : `${nomComplet(w, c)} et ${nomComplet(w, x)} deviennent rivaux.`;
      if (concerneJoueur(w, [c.id, x.id]) && (w.joueurId === c.id || w.joueurId === x.id)) notifier(w, texte, type === 'rival', [c.id, x.id]);
    }
  } });
}
