import { describe, expect, it } from 'vitest';
import { toCalendar } from '../../src/engine/calendar';
import { newGame } from '../../src/worker/game';

describe('simulation longue', () => {
  it('un monde vide avance de 500 ans sans erreur', () => {
    const sim = newGame('long-500');
    const t0 = performance.now();
    sim.advance(500 * 365.25);
    const ms = performance.now() - t0;
    expect(toCalendar(sim.world.day).year).toBe(1566);
    console.info(`500 ans (monde vide) simulés en ${Math.round(ms)} ms`);
  });
});
