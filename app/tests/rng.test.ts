import { describe, expect, it } from 'vitest';
import { Rng } from '../src/engine/rng';

describe('Rng', () => {
  it('même graine ⇒ même suite', () => {
    const a = Rng.fromSeed('ckm'), b = Rng.fromSeed('ckm');
    for (let i = 0; i < 1000; i++) expect(a.nextUint32()).toBe(b.nextUint32());
  });
  it('graines différentes ⇒ suites différentes', () => {
    expect(Rng.fromSeed('a').next()).not.toBe(Rng.fromSeed('b').next());
  });
  it("reprend exactement après restauration d'état", () => {
    const a = Rng.fromSeed('x'); for (let i = 0; i < 50; i++) a.next();
    const b = Rng.restore(a.getState());
    for (let i = 0; i < 100; i++) expect(b.next()).toBe(a.next());
  });
  it('int() reste dans les bornes et couvre toutes les valeurs', () => {
    const r = Rng.fromSeed('int'); const seen = new Set<number>();
    for (let i = 0; i < 5000; i++) { const v = r.int(1, 6); expect(v).toBeGreaterThanOrEqual(1); expect(v).toBeLessThanOrEqual(6); seen.add(v); }
    expect(seen.size).toBe(6);
  });
  it('weighted() respecte les poids et ignore les poids nuls', () => {
    const r = Rng.fromSeed('w'); const counts = { a: 0, b: 0, c: 0 };
    for (let i = 0; i < 20000; i++) counts[r.weighted(['a', 'b', 'c'] as const, (x) => ({ a: 1, b: 3, c: 0 })[x])!]++;
    expect(counts.c).toBe(0);
    expect(counts.b / counts.a).toBeGreaterThan(2.6);
    expect(counts.b / counts.a).toBeLessThan(3.4);
    expect(r.weighted(['a'], () => 0)).toBeUndefined();
  });
});
