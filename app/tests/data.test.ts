import { describe, expect, it } from 'vitest';
import { loadData } from '../src/data/load';
import { GlossaireSchema } from '../src/data/schemas';

describe('données', () => {
  it('les fichiers de données sont valides', () => { expect(() => loadData()).not.toThrow(); });
  it('le glossaire refuse un renvoi vers une entrée inexistante', () => {
    const r = GlossaireSchema.safeParse([{ id: 'a', titre: 'A', texte: 'x', voirAussi: ['b'] }]);
    expect(r.success).toBe(false);
  });
});
