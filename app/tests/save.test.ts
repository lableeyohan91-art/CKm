import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { createWorld, Simulation } from '../src/engine/sim';
import { decodeSave, encodeSave, migrate, SaveError, toSaveFile, type Migration } from '../src/save/format';
import { getSlot, listSlots, putSlot } from '../src/save/storage';

/** Système de test qui consomme du hasard et programme des traitements : rend le test d'intégrité exigeant. */
function build(sim: Simulation) {
  sim.addSystem({ id: 'hasard', frequency: 'monthly', run: (ctx) => {
    ctx.world.flags.total = ((ctx.world.flags.total as number) ?? 0) + ctx.rng.int(0, 100);
    if (ctx.rng.chance(0.3)) ctx.schedule(ctx.day + ctx.rng.int(1, 400), 'echo', { v: ctx.rng.int(0, 9) });
  } });
  sim.on('echo', (ctx, p) => { ctx.world.flags.echo = ((ctx.world.flags.echo as number) ?? 0) * 7 % 100003 + (p.v as number); });
  return sim;
}

describe('sauvegarde', () => {
  it('sauvegarder puis recharger donne exactement la même suite de partie', async () => {
    const ref = build(new Simulation(createWorld('integrite')));
    ref.advance(3000);
    const bytes = await encodeSave(toSaveFile(ref.sync(), 'test'));
    const reloaded = build(new Simulation((await decodeSave(bytes)).world));
    ref.advance(20000); reloaded.advance(20000);
    expect(reloaded.sync()).toEqual(ref.sync());
  });
  it('la compression réduit la taille', async () => {
    const sim = build(new Simulation(createWorld('taille'))); sim.advance(5000);
    const save = toSaveFile(sim.sync(), 't');
    const bytes = await encodeSave(save);
    expect(bytes.length).toBeLessThan(JSON.stringify(save).length);
  });
  it('applique les migrations dans l’ordre', () => {
    const old = { ...toSaveFile(createWorld('m'), 'v1'), schemaVersion: 1 };
    const migs: Record<number, Migration> = {
      1: (w) => ({ ...w, ajouteEnV2: true }),
      2: (w) => ({ ...w, ajouteEnV3: (w.ajouteEnV2 as boolean) ? 'oui' : 'non' }),
    };
    const s = migrate(old, migs, 3);
    expect(s.schemaVersion).toBe(3);
    expect(s.world as unknown).toMatchObject({ ajouteEnV2: true, ajouteEnV3: 'oui', schemaVersion: 3 });
  });
  it('refuse les fichiers invalides et les versions futures', async () => {
    await expect(decodeSave(new TextEncoder().encode('pas du json'))).rejects.toThrow(SaveError);
    expect(() => migrate({ format: 'autre' })).toThrow(SaveError);
    expect(() => migrate({ ...toSaveFile(createWorld('f'), 'f'), schemaVersion: 99 })).toThrow(/plus récente/);
  });
  it('stocke et relit un emplacement dans IndexedDB', async () => {
    const bytes = await encodeSave(toSaveFile(createWorld('idb'), 'idb'));
    await putSlot({ slot: '1', label: 'Emplacement 1', savedAt: '2026-01-01T00:00:00Z', dateLabel: '1er janvier 1066', bytes });
    const back = await getSlot('1');
    expect(back?.bytes).toEqual(bytes);
    expect((await listSlots()).map((s) => s.slot)).toContain('1');
  });
});
