import type { Simulation } from '../engine/sim';
import { budget } from '../rules/economie';

export function systemesEconomie(sim: Simulation): void {
  sim.addSystem({ id: 'economie', frequency: 'monthly', run: (ctx) => {
    const w = ctx.world;
    for (const id of w.vivants) {
      const c = w.personnages[id]!;
      if (!c.titres.length) continue;
      c.or = Math.round((c.or + budget(w, c).solde) * 100) / 100;
      // Le prestige des grands titres croît lentement
      c.prestige += c.titres.length * 0.5;
      c.piete += c.traits.includes('pieux') ? 0.5 : 0.1;
    }
  } });
}
