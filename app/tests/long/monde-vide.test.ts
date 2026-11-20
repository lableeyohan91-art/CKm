import { describe, expect, it } from 'vitest';
import { toCalendar } from '../../src/engine/calendar';
import { createWorld, Simulation } from '../../src/engine/sim';

describe('moteur', () => {
  it('un monde vide avance de 500 ans sans erreur', () => {
    const sim = new Simulation(createWorld('long-500'));
    sim.addSystem({ id: 'mensuel', frequency: 'monthly', run: () => {} });
    sim.advance(Math.round(500 * 365.25));
    expect(toCalendar(sim.world.day).year).toBe(1566);
  });
});
