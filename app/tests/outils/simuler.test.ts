// Outil : simulation longue avec statistiques (npx vitest run tools/simuler.test.ts)
import { it } from 'vitest';
import { toCalendar } from '../../src/engine/calendar';
import { newGame } from '../../src/worker/game';
import { age, nomComplet } from '../../src/rules/personnage';

it('simulation 300 ans avec statistiques', () => {
  const { sim } = newGame(process.env.GRAINE ?? 'outil');
  const w = sim.world;
  const t0 = performance.now();
  console.log(`départ : ${w.vivants.length} vivants`);
  for (let an = 1; an <= Number(process.env.ANS ?? 300); an++) {
    sim.advance(365);
    if (an % Number(process.env.PAS ?? 25) === 0) {
      const v = w.vivants.map((id) => w.personnages[id]!);
      const titres = v.filter((c) => c.titres.length);
      const dyn = new Set(titres.map((c) => c.dynastieId));
      const maries = v.filter((c) => c.conjointId !== undefined).length;
      const clercs = v.filter((c) => c.clerc).length;
      const ageMoyen = v.reduce((s, c) => s + age(w, c), 0) / v.length;
      const roi = Object.values(w.titres).filter((t) => t.rang === 'royaume').map((t) => `${t.nom.replace('Royaume ', '')} : ${t.titulaireId ? nomComplet(w, w.personnages[t.titulaireId]!) : 'vacant'}`).join(' | ');
      console.log(`${toCalendar(w.day).year} : ${v.length} vivants, ${titres.length} seigneurs, ${dyn.size} dynasties titrées, ${maries} mariés, ${clercs} clercs, âge moyen ${ageMoyen.toFixed(1)} — ${roi}`);
    }
  }
  console.log(`stats : ${JSON.stringify(w.stats)} en ${Math.round(performance.now() - t0)} ms`);
}, 600_000);
