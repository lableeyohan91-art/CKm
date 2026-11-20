import { describe, expect, it } from 'vitest';
import { ageAt } from '../../src/engine/calendar';
import { newGame, build, exportGame } from '../../src/worker/game';
import { decodeSave } from '../../src/save/format';
import { consanguins, vivant } from '../../src/rules/personnage';
import type { World } from '../../src/model/world';

/** Vérifie la cohérence du monde : renvoie la liste des anomalies. */
export function anomalies(w: World): string[] {
  const out: string[] = [];
  for (const t of Object.values(w.titres)) {
    if (t.titulaireId === undefined) continue;
    const h = w.personnages[t.titulaireId];
    if (!vivant(h)) out.push(`${t.id} tenu par un mort ou absent (${t.titulaireId})`);
    else if (!h.titres.includes(t.id)) out.push(`${t.id} : le titulaire ne le liste pas`);
  }
  for (const id of w.vivants) {
    const c = w.personnages[id]!;
    if (!vivant(c)) out.push(`${id} dans les vivants mais mort`);
    for (const t of c.titres) if (w.titres[t]!.titulaireId !== c.id) out.push(`${id} liste ${t} sans le tenir`);
    if (c.suzerainId !== undefined && c.titres.length) {
      if (!vivant(w.personnages[c.suzerainId])) out.push(`${id} : suzerain mort ${c.suzerainId}`);
      let cur = c, n = 0; while (cur.suzerainId !== undefined && n < 20) { cur = w.personnages[cur.suzerainId]!; n++; }
      if (n >= 20) out.push(`${id} : boucle de vassalité`);
    }
    if (c.conjointId !== undefined) {
      const x = w.personnages[c.conjointId];
      if (!vivant(x) || x.conjointId !== c.id) out.push(`${id} : conjoint incohérent`);
      else if (x.sexe === c.sexe) out.push(`${id} : conjoint du même sexe`);
    }
    const a = ageAt(c.naissance, w.day);
    if (a > 105) out.push(`${id} a ${a} ans`);
    const m = c.mereId !== undefined ? w.personnages[c.mereId] : undefined;
    if (m) { const am = ageAt(m.naissance, c.naissance); if (am < 13 || am > 52) out.push(`${id} : mère âgée de ${am} ans à la naissance`); }
  }
  return out;
}

describe('monde vivant', () => {
  it('100 ans : aucun anomalie, population stable, dynasties vivantes, mariages légitimes', () => {
    const { sim } = newGame('cent-ans');
    const w = sim.world;
    const t0 = performance.now();
    for (let y = 0; y < 100; y++) {
      sim.advance(365);
      if (y % 10 === 9) expect(anomalies(w)).toEqual([]);
    }
    const ms = performance.now() - t0;
    expect(w.vivants.length).toBeGreaterThan(60);
    expect(w.vivants.length).toBeLessThan(1500);
    expect(w.stats.naissances).toBeGreaterThan(200);
    expect(w.stats.successions).toBeGreaterThan(20);
    const titrees = new Set(w.vivants.map((id) => w.personnages[id]!).filter((c) => c.titres.length).map((c) => c.dynastieId));
    expect(titrees.size).toBeGreaterThanOrEqual(5);
    for (const id of w.vivants) {
      const c = w.personnages[id]!;
      if (c.conjointId !== undefined) expect(consanguins(w, c, w.personnages[c.conjointId]!)).toBe(false);
    }
    console.info(`100 ans : ${w.vivants.length} vivants, ${JSON.stringify(w.stats)}, ${Math.round(ms)} ms`);
  });
  it('déterminisme : même graine ⇒ même monde ; sauvegarde à mi-parcours ⇒ même suite', async () => {
    const a = newGame('det'), b = newGame('det');
    a.sim.advance(365 * 15); b.sim.advance(365 * 15);
    expect(b.sim.sync()).toEqual(a.sim.sync());
    const bytes = await exportGame(a.sim, 'mi-parcours');
    const c = build((await decodeSave(bytes)).world);
    a.sim.advance(365 * 15); c.sim.advance(365 * 15);
    expect(c.sim.sync()).toEqual(a.sim.sync());
  });
});
