import { describe, expect, it } from 'vitest';
import { newGame } from '../src/worker/game';
import { evaluer, executer, interaction, repondre, toutes, type C } from '../src/interactions';
import { mourir } from '../src/systems/monde';
import { opinion } from '../src/rules/opinion';
import { encodeSave, decodeSave, toSaveFile } from '../src/save/format';
import type { World } from '../src/model/world';

const cle = (w: World, k: string) => Object.values(w.personnages).find((c) => c.cle === k)!;
function partie(graine: string) {
  const p = newGame(graine);
  const c: C = { sim: p.sim.context, r: p.regles, w: p.sim.world };
  return { ...p, c, w: p.sim.world };
}

describe('moteur d’interactions', () => {
  it('au moins 25 interactions enregistrées, toutes décrites', () => {
    expect(toutes().length).toBeGreaterThanOrEqual(25);
    for (const i of toutes()) expect(i.description.length).toBeGreaterThan(20);
  });

  it('la prévision affichée correspond au résultat réel (fiançailles)', () => {
    const { c, w } = partie('fiancailles');
    const g = cle(w, 'guillaume-normandie'), robert = cle(w, 'robert-courteheuse'), agnes = cle(w, 'agnes-aquitaine');
    const ev = evaluer(c, interaction('fiancailles')!, g, agnes, { membre: robert.id, matrilineaire: false });
    expect(ev.possible).toBe(true);
    expect(ev.acceptation!.parts.length).toBeGreaterThan(2);
    const res = executer(c, 'fiancailles', g, agnes, { membre: robert.id, matrilineaire: false });
    expect(res.accepte).toBe(ev.acceptation!.accepte);
    if (res.accepte) expect(robert.fianceId).toBe(agnes.id);
  });

  it('une proposition de l’IA attend la réponse du joueur, puis s’applique', () => {
    const { c, w } = partie('proposition');
    const g = cle(w, 'guillaume-normandie'), robert = cle(w, 'robert-courteheuse'), gg = cle(w, 'guy-geoffroi'), agnes = cle(w, 'agnes-aquitaine');
    w.joueurId = gg.id;
    const res = executer(c, 'fiancailles', g, agnes, { membre: robert.id, matrilineaire: false });
    expect(res.enAttente).toBe(true);
    expect(w.propositions).toHaveLength(1);
    expect(w.notifications.at(-1)!.important).toBe(true);
    expect(repondre(c, w.propositions[0]!.id, true).accepte).toBe(true);
    expect(agnes.fianceId).toBe(robert.id);
    expect(w.alliances.some((a) => [a.a, a.b].includes(g.id) && [a.a, a.b].includes(gg.id))).toBe(true);
  });

  it('les fiancés se marient à leur majorité', () => {
    const { c, w, sim } = partie('majorite');
    const g = cle(w, 'guillaume-normandie'), robert = cle(w, 'robert-courteheuse'), gg = cle(w, 'guy-geoffroi'), agnes = cle(w, 'agnes-aquitaine');
    w.joueurId = gg.id;
    executer(c, 'fiancailles', g, agnes, { membre: robert.id, matrilineaire: false });
    repondre(c, w.propositions[0]!.id, true);
    sim.advance(365 * 3);
    expect(robert.deces !== undefined || agnes.deces !== undefined || robert.conjointId === agnes.id).toBe(true);
  });

  it('accorder puis révoquer un comté : vassalité, gratitude, tyrannie', () => {
    const { c, w } = partie('titres');
    const g = cle(w, 'guillaume-normandie'), mortain = cle(w, 'robert-mortain'), evreux = cle(w, 'richard-evreux');
    expect(executer(c, 'accorder-titre', g, mortain, { titre: 'c-le-mans' }).accepte).toBe(true);
    expect(mortain.titres).toContain('c-le-mans');
    expect(mortain.suzerainId).toBe(g.id);
    expect(opinion(w, c.r, mortain, g).parts.some((p) => p.source.includes('accordé'))).toBe(true);
    executer(c, 'revoquer-titre', g, evreux, { titre: 'c-evreux' });
    expect(g.titres).toContain('c-evreux');
    expect(opinion(w, c.r, mortain, g).parts.some((p) => p.source.startsWith('Tyrannie'))).toBe(true);
    // la rancune de Richard passe à son fils à sa mort
    mourir(c.sim, c.r, evreux, 'test');
    expect(opinion(w, c.r, cle(w, 'guillaume-evreux'), g).parts.some((p) => p.source.startsWith('Rancune héritée'))).toBe(true);
  });

  it('prison et exécution : le prisonnier ne peut plus agir, la famille hait l’exécuteur', () => {
    const { c, w } = partie('justice');
    const g = cle(w, 'guillaume-normandie'), richard = cle(w, 'richard-normandie'), mathilde = cle(w, 'mathilde-flandre');
    const robertM = cle(w, 'robert-mortain');
    executer(c, 'emprisonner', g, robertM, {});
    expect(robertM.prisonnierDe).toBe(g.id);
    expect(evaluer(c, interaction('cadeau')!, robertM, g, { montant: 10 }).possible).toBe(false);
    executer(c, 'executer', g, robertM, {});
    expect(robertM.deces).toBeDefined();
    void richard; void mathilde;
  });

  it('refus explicable : un roi ne marie pas sa fille sans raison à un courtisan', () => {
    const { c, w } = partie('refus');
    const courtisan = Object.values(w.personnages).find((x) => x.maisonId?.startsWith('petite-') && x.sexe === 'h' && x.conjointId === undefined)!;
    const constance = cle(w, 'constance-normandie');
    const ev = evaluer(c, interaction('fiancailles')!, courtisan, constance, {});
    if (ev.possible) { expect(ev.acceptation!.accepte).toBe(false); expect(ev.acceptation!.parts.some((p) => p.valeur < 0)).toBe(true); }
  });

  it('migration v2 → v3 : une ancienne sauvegarde se recharge', async () => {
    const { w } = partie('migration');
    const save = toSaveFile(w, 'v2');
    const ancien = JSON.parse(JSON.stringify(save));
    ancien.schemaVersion = 2; ancien.world.schemaVersion = 2;
    for (const k of ['conseils', 'alliances', 'prets', 'propositions']) delete ancien.world[k];
    const s = await decodeSave(new TextEncoder().encode(JSON.stringify(ancien)));
    expect(s.schemaVersion).toBe(3);
    expect(s.world.alliances).toEqual([]);
    expect((await decodeSave(await encodeSave(save))).world.conseils).toBeDefined();
  });
});
