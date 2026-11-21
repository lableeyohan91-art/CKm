// Outil : quelles interactions l'IA utilise-t-elle sur 100 ans ? (OUTILS=1 npx vitest run tests/outils/interactions-ia.test.ts)
import { it } from 'vitest';
import { newGame } from '../../src/worker/game';

it('usage des interactions par l’IA', () => {
  const { sim, journal } = newGame(process.env.GRAINE ?? 'ia-inter');
  const compte: Record<string, number> = {};
  for (let an = 0; an < 100; an++) {
    sim.advance(365);
    for (const d of journal.tout()) compte[d.action] = (compte[d.action] ?? 0) + 1;
    journal.tout().length = 0;
    (journal as unknown as { entries: unknown[] }).entries.length = 0;
  }
  const w = sim.world;
  console.log('décisions :', JSON.stringify(compte));
  console.log(`alliances ${w.alliances.length}, prêts ${w.prets.length}, fiancés ${w.vivants.filter((id) => w.personnages[id]!.fianceId !== undefined).length}, conseils remplis ${Object.values(w.conseils).reduce((s, c) => s + Object.keys(c).length, 0)}, seigneurs ${w.vivants.filter((id) => w.personnages[id]!.titres.length).length}, vivants ${w.vivants.length}`);
  console.log(JSON.stringify(w.stats));
}, 600_000);
