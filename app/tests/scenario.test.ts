import { describe, expect, it } from 'vitest';
import { formatDate } from '../src/engine/calendar';
import { newGame } from '../src/worker/game';
import { mourir } from '../src/systems/monde';
import { nomComplet, souverain, titrePrincipal } from '../src/rules/personnage';
import { opinion } from '../src/rules/opinion';
import type { World } from '../src/model/world';

const parCle = (w: World, cle: string) => Object.values(w.personnages).find((c) => c.cle === cle)!;

describe('scénario 1066', () => {
  it('démarre le 6 janvier 1066 avec ~100 personnages et des comtés tous tenus', () => {
    const { sim } = newGame('scenario');
    const w = sim.world;
    expect(formatDate(w.day)).toBe('6 janvier 1066');
    expect(w.vivants.length).toBeGreaterThanOrEqual(85);
    expect(w.vivants.length).toBeLessThanOrEqual(130);
    expect(Object.keys(w.comtes)).toHaveLength(30);
    for (const t of Object.values(w.titres).filter((t) => t.rang === 'comte')) expect(t.titulaireId).toBeDefined();
  });
  it('liens féodaux : Guillaume est vassal de Philippe, Leofwine de Harold', () => {
    const w = newGame('feodal').sim.world;
    expect(souverain(w, parCle(w, 'guillaume-normandie')).cle).toBe('philippe1');
    expect(souverain(w, parCle(w, 'richard-evreux')).cle).toBe('philippe1');
    expect(parCle(w, 'leofwine').suzerainId).toBe(parCle(w, 'harold2').id);
    expect(titrePrincipal(w, parCle(w, 'guillaume-normandie'))).toBe('d-normandie');
  });
  it('les opinions sont expliquées par des raisons', () => {
    const { sim, regles } = newGame('opinion');
    const w = sim.world;
    const op = opinion(w, regles, parCle(w, 'foulques-rechin'), parCle(w, 'geoffroy3-anjou'));
    expect(op.parts.length).toBeGreaterThan(0);
    expect(op.parts.some((p) => p.source === 'Frère ou sœur' || p.source === 'Même maison')).toBe(true);
  });
});

describe('succession', () => {
  it('partage : les fils de Guillaume se partagent la Normandie, l’aîné garde le duché et Rouen', () => {
    const { sim, regles } = newGame('partage');
    const w = sim.world;
    const g = parCle(w, 'guillaume-normandie');
    mourir(sim.context, regles, g, 'test');
    const robert = parCle(w, 'robert-courteheuse'), richard = parCle(w, 'richard-normandie'), roux = parCle(w, 'guillaume-roux');
    expect(robert.titres).toContain('d-normandie');
    expect(robert.titres).toContain('c-rouen');
    expect(richard.titres.length + roux.titres.length).toBeGreaterThan(0);
    expect(richard.titres.length + roux.titres.length + robert.titres.length).toBe(5);
    for (const cadet of [richard, roux]) if (cadet.titres.length) expect(cadet.suzerainId).toBe(robert.id);
    expect(robert.suzerainId).toBe(parCle(w, 'philippe1').id);
    expect(parCle(w, 'richard-evreux').suzerainId).toBe(robert.id);
  });
  it('primogéniture : sans enfant, Philippe Ier laisse le royaume à son frère Hugues', () => {
    const { sim, regles } = newGame('primo');
    const w = sim.world;
    mourir(sim.context, regles, parCle(w, 'philippe1'), 'test');
    const hugues = parCle(w, 'hugues-vermandois');
    expect(hugues.titres).toContain('k-france');
    expect(parCle(w, 'guillaume-normandie').suzerainId).toBe(hugues.id);
  });
  it('les bâtards n’héritent pas : la couronne de Harold reste dans la maison Godwin, sans ses fils naturels', () => {
    const { sim, regles } = newGame('batards');
    const w = sim.world;
    mourir(sim.context, regles, parCle(w, 'harold2'), 'bataille');
    const roi = w.personnages[w.titres['k-angleterre']!.titulaireId!]!;
    expect(roi.maisonId).toBe('godwin');
    expect(roi.batard).toBeFalsy();
    expect(nomComplet(w, roi)).not.toContain('Harold');
  });
  it('mort du joueur : il incarne son héritier', () => {
    const { sim, regles } = newGame('joueur');
    const w = sim.world;
    const g = parCle(w, 'guillaume-normandie');
    w.joueurId = g.id;
    mourir(sim.context, regles, g, 'test');
    expect(w.joueurId).toBe(parCle(w, 'robert-courteheuse').id);
    expect(w.notifications.at(-1)?.important).toBe(true);
  });
});
