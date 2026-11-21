import { describe, expect, it } from 'vitest';
import { newGame } from '../src/worker/game';
import { executer, type C } from '../src/interactions';
import { optionsTrahison } from '../src/ai/ia';
import { avis, mourir } from '../src/systems/monde';
import { opinion } from '../src/rules/opinion';
import type { World } from '../src/model/world';

const cle = (w: World, k: string) => Object.values(w.personnages).find((c) => c.cle === k)!;
function partie(g: string) { const p = newGame(g); return { ...p, c: { sim: p.sim.context, r: p.regles, w: p.sim.world } as C, w: p.sim.world }; }

describe('trahison', () => {
  it('rompre une alliance : la victime garde une rancune permanente, ses alliés jugent le traître', () => {
    const { c, w } = partie('t1');
    const g = cle(w, 'guillaume-normandie'), b = cle(w, 'baudouin5'), h = cle(w, 'harold2');
    w.alliances.push({ a: Math.min(g.id, b.id), b: Math.max(g.id, b.id), depuis: w.day }, { a: Math.min(b.id, h.id), b: Math.max(b.id, h.id), depuis: w.day });
    expect(executer(c, 'rompre-alliance', g, b, {}).accepte).toBe(true);
    const ob = opinion(w, c.r, b, g).parts.find((p) => p.source.startsWith("M'a trahi"));
    expect(ob?.valeur).toBeLessThan(0);
    expect(opinion(w, c.r, h, g).parts.some((p) => p.source.startsWith('A trahi'))).toBe(true);
    expect(b.memoires.some((m) => m.type === 'trahison')).toBe(true);
  });
  it('la rancune d’une trahison passe aux enfants', () => {
    const { c, w } = partie('t2');
    const g = cle(w, 'guillaume-normandie'), richard = cle(w, 'richard-evreux');
    executer(c, 'revoquer-titre', g, richard, { titre: 'c-evreux' });
    mourir(c.sim, c.r, richard, 'test');
    expect(opinion(w, c.r, cle(w, 'guillaume-evreux'), g).parts.some((p) => p.source.startsWith('Rancune héritée'))).toBe(true);
  });
  it('un suzerain cruel et fourbe envisage d’emprisonner un vassal qu’il hait ; un loyal compatissant non', () => {
    const { c, w } = partie('t3');
    const g = cle(w, 'guillaume-normandie'), richard = cle(w, 'richard-evreux');
    avis(g, richard.id, -90, 'Haine (test)');
    g.traits = ['cruel', 'fourbe', 'ambitieux'];
    const opt = optionsTrahison(c.sim, c.r, g).find((o) => o.action === 'emprisonner un vassal haï');
    expect(opt).toBeDefined();
    expect(opt!.score).toBeGreaterThan(10);
    g.traits = ['compatissant', 'loyal', 'calme'];
    const opt2 = optionsTrahison(c.sim, c.r, g).find((o) => o.action === 'emprisonner un vassal haï');
    expect(opt2 === undefined || opt2.score < opt!.score - 15).toBe(true);
  });
  it('trahir quand on est loyal de caractère crée de la tension', () => {
    const { c, w } = partie('t4');
    const g = cle(w, 'guillaume-normandie'), b = cle(w, 'baudouin5');
    g.traits = ['loyal', 'calme', 'pieux'];
    w.alliances.push({ a: Math.min(g.id, b.id), b: Math.max(g.id, b.id), depuis: w.day });
    executer(c, 'rompre-alliance', g, b, {});
    expect(g.tension).toBeGreaterThan(0);
  });
  it('le joueur trahi est prévenu et le jeu se met en pause', () => {
    const { c, w } = partie('t5');
    const g = cle(w, 'guillaume-normandie'), b = cle(w, 'baudouin5');
    w.joueurId = b.id;
    w.alliances.push({ a: Math.min(g.id, b.id), b: Math.max(g.id, b.id), depuis: w.day });
    executer(c, 'rompre-alliance', g, b, {});
    expect(w.notifications.at(-1)?.texte).toContain('Trahison');
    expect(w.notifications.at(-1)?.important).toBe(true);
  });
});
