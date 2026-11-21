import { it } from 'vitest';
import { newGame } from '../../src/worker/game';
import { levee } from '../../src/rules/guerre';
import { nomComplet } from '../../src/rules/personnage';

/** Outil : levées des grands seigneurs, et guerres sur un siècle. OUTILS=1 npx vitest run tests/outils/guerre-bilan */
it.runIf(process.env.OUTILS)('bilan guerre', () => {
  const p = newGame('bilan-guerre');
  const w = p.sim.world;
  for (const id of w.vivants) {
    const c = w.personnages[id]!;
    if (!c.titres.length || c.suzerainId !== undefined) continue;
    const l = levee(w, p.regles, c);
    console.log(nomComplet(w, c), l.total, l.parts.map((x) => `${x.source}:${x.valeur}`).join(' | '));
  }
  const debut = w.day;
  for (let i = 0; i < 365 * 100; i++) p.sim.step();
  const guerres = w.chronicle.filter((e) => e.kind === 'guerre');
  console.log('déclarations', guerres.filter((e) => e.text.includes('déclare la guerre')).length,
    'batailles', guerres.filter((e) => e.text.startsWith('Bataille')).length,
    'prises', guerres.filter((e) => e.text.startsWith('Prise')).length, 'fins', guerres.filter((e) => e.text.startsWith('Fin')).length, 'jours', w.day - debut);
  for (const e of guerres.filter((x) => x.text.includes('déclare') || x.text.startsWith('Fin')).slice(0, 40)) console.log(e.text);
  const forg = Object.values(w.personnages).flatMap((c) => c.revendications.filter((r) => r.origine.startsWith('Forgée')));
  const tent = Object.values(w.personnages).flatMap((c) => c.memoires.filter((m) => m.type === 'intrigue'));
  console.log('revendications forgées', forg.length, 'tentatives', tent.length);
  console.log('vivants', w.vivants.length, 'Angleterre :', nomComplet(w, w.personnages[w.titres['k-angleterre']!.titulaireId!]!));
}, 600000);
