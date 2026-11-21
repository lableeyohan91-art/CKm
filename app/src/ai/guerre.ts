import type { Simulation, SimContext } from '../engine/sim';
import type { Armee, Character, Guerre } from '../model/entities';
import type { World } from '../model/world';
import { opinionTotal } from '../rules/opinion';
import { axe, comtesTenus, type Part } from '../rules/personnage';
import type { Regles } from '../rules/regles';
import { relevede } from '../rules/succession';
import { camp, campDuComte, chemin, empechementsGuerre, force, levee, motifs, enGuerre } from '../rules/guerre';
import { evaluer, executer, interaction, parametresParDefaut, type C } from '../interactions';
import { ordonnerMarche } from '../systems/guerre';

/**
 * IA de guerre.
 * - Décision de déclarer (option d'utilité comme les autres, voir `optionsGuerre`).
 * - Conduite des armées, chaque semaine : attaquer une armée plus faible, se replier devant
 *   plus fort, sinon assiéger le comté ennemi le plus intéressant.
 * - Paix : chaque mois, les chefs de guerre proposent la paix quand elle est à leur portée.
 */
interface Option { action: string; cible?: number; score: number; raisons: Part[]; executer: () => void }

const mer = (r: Regles) => r.data.scenario.carte.liaisonsMaritimes;

/** Forces d'un camp potentiel : sa levée et celle de ses alliés. */
function puissance(w: World, r: Regles, c: Character): number {
  let total = levee(w, r, c).total;
  for (const al of w.alliances) if (al.a === c.id || al.b === c.id) total += levee(w, r, w.personnages[al.a === c.id ? al.b : al.a]!).total * 0.6;
  return total;
}

export function optionsGuerre(ctx: SimContext, r: Regles, c: Character): Option[] {
  const w = ctx.world;
  if (!c.titres.length || enGuerre(w, c.id) || !ctx.rng.chance(0.25)) return [];
  const ci: C = { sim: ctx, r, w };
  const it = interaction('declarer-guerre')!;
  const out: Option[] = [];
  const cibles = new Set<number>();
  for (const rv of c.revendications) { const t = w.titres[rv.titre]?.titulaireId; if (t !== undefined) cibles.add(t); }
  for (const id of comtesTenus(w, c).flatMap((k) => w.comtes[k]!.voisins)) { const t = w.titres[`c-${id}`]?.titulaireId; if (t !== undefined) cibles.add(t); }
  const moi = puissance(w, r, c);
  for (const id of cibles) {
    const x = w.personnages[id]!;
    if (id === c.id || empechementsGuerre(w, c, x).length) continue;
    const ms = motifs(w, c, x);
    if (!ms.length) continue;
    const m = ms.find((y) => y.motif === 'revendication' && c.revendications.find((rv) => rv.titre === y.titre)?.forte) ?? ms[0]!;
    const p = { motif: `${m.motif}|${m.titre}` };
    const ev = evaluer(ci, it, c, x, p);
    if (!ev.possible) continue;
    const eux = Math.max(100, puissance(w, r, x));
    const ratio = moi / eux;
    const forte = m.motif === 'revendication' && c.revendications.find((rv) => rv.titre === m.titre)?.forte;
    if (ratio < (forte ? 0.9 : 1.2)) continue;
    const valeur = w.titres[m.titre]!.rang === 'royaume' ? 12 : w.titres[m.titre]!.rang === 'duche' ? 7 : 4;
    const op = opinionTotal(w, r, c, x);
    const raisons: Part[] = [
      { source: `Rapport de forces (×${ratio.toFixed(1)})`, valeur: Math.min(12, Math.round((ratio - 1) * 10)) },
      { source: `Enjeu : ${w.titres[m.titre]!.nom}`, valeur: valeur },
      { source: 'Ambition', valeur: Math.round(axe(r, c, 'ambition') * 3 + axe(r, c, 'audace') * 2) },
      { source: 'Revendication forte', valeur: forte ? 5 : 0 },
      { source: `Opinion de la cible (${op})`, valeur: Math.round(-op / 10) },
      { source: 'La guerre coûte et tue', valeur: -5 },
    ].filter((x) => x.valeur !== 0);
    const score = raisons.reduce((s, x) => s + x.valeur, 0);
    if (score <= 0) continue;
    out.push({ action: 'déclarer la guerre', cible: x.id, score, raisons, executer: () => { executer(ci, 'declarer-guerre', c, x, p); } });
  }
  return out;
}

/** Un ambitieux sans motif fait forger des revendications sur ses voisins. */
export function optionsForger(ctx: SimContext, r: Regles, c: Character): Option[] {
  const w = ctx.world;
  if (!c.titres.length || c.or < 120 || enGuerre(w, c.id) || !ctx.rng.chance(0.15)) return [];
  const ci: C = { sim: ctx, r, w };
  const it = interaction('forger-revendication')!;
  const voisins = new Set<number>();
  for (const k of comtesTenus(w, c)) for (const v of w.comtes[k]!.voisins) { const t = w.titres[`c-${v}`]?.titulaireId; if (t !== undefined && t !== c.id) voisins.add(t); }
  const cands = [...voisins].map((id) => w.personnages[id]!).filter((x) => it.visible(ci, c, x));
  if (!cands.length) return [];
  const x = cands[ctx.rng.int(0, cands.length - 1)]!;
  const prm = parametresParDefaut(ci, it, c, x, {});
  const ev = evaluer(ci, it, c, x, prm);
  if (!ev.possible) return [];
  const raisons: Part[] = [
    { source: 'Ambition', valeur: Math.round(axe(r, c, 'ambition') * 4) },
    { source: 'Fourberie', valeur: Math.round(-axe(r, c, 'loyaute') * 2) },
    { source: `Opinion de la cible (${opinionTotal(w, r, c, x)})`, valeur: Math.round(-opinionTotal(w, r, c, x) / 15) },
    { source: 'Agrandir ses terres', valeur: 4 },
  ].filter((y) => y.valeur !== 0);
  const score = raisons.reduce((s, y) => s + y.valeur, 0);
  if (score <= 0) return [];
  return [{ action: 'forger une revendication', cible: x.id, score, raisons, executer: () => { executer(ci, 'forger-revendication', c, x, prm); } }];
}

// ------------------------------------------------------------------ conduite des armées

export function systemeIAGuerre(sim: Simulation, r: Regles): void {
  sim.addSystem({ id: 'ia-guerre', frequency: 'weekly', run: (ctx) => { if (ctx.world.guerres.length) { conduire(ctx, r); } } });
  sim.addSystem({ id: 'ia-paix', frequency: 'monthly', run: (ctx) => { if (ctx.world.guerres.length) paix(ctx, r); } });
}

function distance(w: World, r: Regles, de: string, vers: string): number {
  const ch = chemin(w, mer(r), de, vers); return ch ? ch.length : 99;
}

function conduire(ctx: SimContext, r: Regles): void {
  const w = ctx.world;
  for (const a of [...w.armees]) {
    if (a.manuel || a.chemin.length) continue;
    const g = w.guerres.find((x) => x.id === a.guerre); if (!g) continue;
    const moi = camp(g, a.proprietaire)!;
    const ennemies = w.armees.filter((x) => x.guerre === g.id && camp(g, x.proprietaire) !== moi);
    const amies = w.armees.filter((x) => x.guerre === g.id && camp(g, x.proprietaire) === moi);
    const maForce = force(w, [a]);
    // Menace proche : une armée ennemie bien plus forte à deux étapes ou moins
    const menace = ennemies.filter((x) => distance(w, r, x.comte, a.comte) <= 2 && force(w, [x]) > maForce * 1.4)[0];
    if (menace) {
      const refuge = amies.filter((x) => x !== a && force(w, [x]) + maForce > force(w, [menace]))
        .sort((x, y) => distance(w, r, a.comte, x.comte) - distance(w, r, a.comte, y.comte))[0];
      const cap = comtesTenus(w, w.personnages[a.proprietaire]!).find((k) => campDuComte(w, g, k) === moi);
      const vers = refuge?.comte ?? cap;
      if (vers && vers !== a.comte) { ordonnerMarche(w, r, a, vers); continue; }
    }
    // Proie : une armée ennemie plus faible à trois étapes ou moins
    const proie = ennemies.filter((x) => force(w, [x]) * 1.2 < maForce)
      .map((x) => ({ x, d: distance(w, r, a.comte, x.comte) })).filter((o) => o.d <= 3).sort((p, q) => p.d - q.d)[0];
    if (proie) { if (proie.x.comte !== a.comte) ordonnerMarche(w, r, a, proie.x.comte); continue; }
    // En siège : on reste
    if (a.siege && a.siege.comte === a.comte) continue;
    if (campDuComte(w, g, a.comte) && campDuComte(w, g, a.comte) !== moi) continue; // le siège va commencer
    const cible = cibleDeSiege(w, r, g, a, moi);
    if (cible) ordonnerMarche(w, r, a, cible);
  }
}

/** Comté ennemi à assiéger : proche, riche, de préférence l'enjeu de la guerre. Les comtés à reprendre d'abord. */
function cibleDeSiege(w: World, r: Regles, g: Guerre, a: Armee, moi: 'att' | 'def'): string | undefined {
  const assieges = new Set(w.armees.filter((x) => x !== a && x.guerre === g.id && camp(g, x.proprietaire) === moi).map((x) => x.chemin.at(-1) ?? x.comte));
  let best: string | undefined, bestScore = -Infinity;
  for (const k of Object.values(w.comtes)) {
    const cp = campDuComte(w, g, k.id);
    if (!cp || cp === moi || assieges.has(k.id)) continue;
    const d = distance(w, r, a.comte, k.id);
    if (d >= 99) continue;
    const enjeu = `c-${k.id}` === g.titre || relevede(w, `c-${k.id}`, g.titre);
    const reprise = w.occupations[k.id]?.guerre === g.id;
    const s = k.developpement + (enjeu ? 8 : 0) + (reprise ? 10 : 0) - d * 3 - k.fort * 2;
    if (s > bestScore) { bestScore = s; best = k.id; }
  }
  return best;
}

// ------------------------------------------------------------------ paix

function paix(ctx: SimContext, r: Regles): void {
  const w = ctx.world;
  const ci: C = { sim: ctx, r, w };
  const it = interaction('proposer-paix')!;
  for (const g of [...w.guerres]) {
    for (const [id, autre] of [[g.attaquant, g.defenseur], [g.defenseur, g.attaquant]] as const) {
      if (id === w.joueurId || !w.guerres.includes(g)) continue;
      const a = w.personnages[id]!, b = w.personnages[autre]!;
      if (a.prisonnierDe !== undefined) continue;
      const s = camp(g, id) === 'att' ? g.score : -g.score;
      const mois = (w.day - g.debut) / 30;
      const essais: string[] = s >= 40 ? ['exiger'] : s <= -60 ? ['blanche', 'capitulation'] : mois > 18 && Math.abs(s) < 25 ? ['blanche'] : [];
      for (const type of essais) {
        const ev = evaluer(ci, it, a, b, { type });
        if (!ev.possible) continue;
        if (ev.decideur?.id === w.joueurId) { if (!ctx.rng.chance(0.3) || w.propositions.some((p) => p.acteur === a.id && p.interaction === 'proposer-paix')) continue; }
        else if (!ev.acceptation?.accepte) continue;
        executer(ci, 'proposer-paix', a, b, { type });
        break;
      }
    }
  }
}
