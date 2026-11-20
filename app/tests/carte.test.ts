import { describe, expect, it } from 'vitest';
import geometrie from '../data/scenarios/1066/geometrie.json';
import { loadData } from '../src/data/load';

describe('carte (Natural Earth)', () => {
  const carte = loadData().scenario.carte;
  it('chaque comté a un contour', () => {
    for (const c of carte.comtes) expect((geometrie.comtes as Record<string, unknown[]>)[c.id]?.length ?? 0).toBeGreaterThan(0);
  });
  it('les voisinages des déplacements correspondent aux frontières dessinées', () => {
    const calc = geometrie.voisinsCalcules as Record<string, string[]>;
    for (const c of carte.comtes) expect([...c.voisins].sort()).toEqual(calc[c.id]);
  });
});
