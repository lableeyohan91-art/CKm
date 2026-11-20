import { describe, expect, it } from 'vitest';
import { fromCalendar, toCalendar } from '../src/engine/calendar';
import { createWorld, Simulation } from '../src/engine/sim';

describe('Simulation', () => {
  it('exécute chaque système à sa fréquence', () => {
    const sim = new Simulation(createWorld('freq'));
    const n = { daily: 0, weekly: 0, monthly: 0, yearly: 0 };
    for (const f of ['daily', 'weekly', 'monthly', 'yearly'] as const) sim.addSystem({ id: f, frequency: f, run: () => { n[f]++; } });
    sim.advanceTo(fromCalendar(1076, 1, 1)); // 10 ans pile
    expect(n.yearly).toBe(10);
    expect(n.monthly).toBe(120);
    expect(n.daily).toBe(fromCalendar(1076, 1, 1));
    expect(Math.abs(n.weekly - n.daily / 7)).toBeLessThan(1);
  });
  it('les traitements datés s’exécutent à la bonne date et peuvent s’enchaîner', () => {
    const sim = new Simulation(createWorld('queue'));
    const log: string[] = [];
    sim.on('ping', (ctx, p) => { log.push(`${toCalendar(ctx.day).year}:${p.n}`); if ((p.n as number) < 3) ctx.schedule(ctx.day + 365, 'ping', { n: (p.n as number) + 1 }); });
    sim.context.schedule(fromCalendar(1070, 1, 1), 'ping', { n: 1 });
    sim.advanceTo(fromCalendar(1080, 1, 1));
    expect(log).toEqual(['1070:1', '1071:2', '1072:3']);
  });
  it('refuse un traitement sans gestionnaire (erreur claire)', () => {
    const sim = new Simulation(createWorld('err'));
    sim.context.schedule(5, 'inconnu');
    expect(() => sim.advance(10)).toThrow(/inconnu/);
  });
});
