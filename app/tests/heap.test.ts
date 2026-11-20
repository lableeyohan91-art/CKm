import { describe, expect, it } from 'vitest';
import { DatedQueue } from '../src/engine/heap';
import { Rng } from '../src/engine/rng';

describe('DatedQueue', () => {
  it('sort par date puis par ordre d’insertion', () => {
    const q = new DatedQueue<{ day: number; seq: number; v: string }>();
    q.push({ day: 5, seq: 1, v: 'a' }); q.push({ day: 2, seq: 2, v: 'b' });
    q.push({ day: 5, seq: 3, v: 'c' }); q.push({ day: 2, seq: 4, v: 'd' });
    expect([q.pop(), q.pop(), q.pop(), q.pop()].map((x) => x!.v)).toEqual(['b', 'd', 'a', 'c']);
  });
  it('popDue et toArray sur 2000 éléments aléatoires', () => {
    const r = Rng.fromSeed('heap'); const q = new DatedQueue<{ day: number; seq: number }>();
    for (let i = 0; i < 2000; i++) q.push({ day: r.int(0, 300), seq: i });
    const arr = q.toArray();
    for (let i = 1; i < arr.length; i++) expect(arr[i]!.day * 1e6 + arr[i]!.seq).toBeGreaterThan(arr[i - 1]!.day * 1e6 + arr[i - 1]!.seq);
    const due = q.popDue(100);
    expect(due.every((x) => x.day <= 100)).toBe(true);
    expect(q.peek()!.day).toBeGreaterThan(100);
    expect(due.length + q.size).toBe(2000);
  });
});
