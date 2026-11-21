import { addYears, toCalendar } from '../engine/calendar';
import type { Simulation, SimContext } from '../engine/sim';
import type { Armee, Character, Guerre, MotifGuerre } from '../model/entities';
import type { World } from '../model/world';
import { opinionTotal } from '../rules/opinion';
import { comtesTenus, competence, nomComplet, perso, souverain, vivant } from '../rules/personnage';
import type { Regles } from '../rules/regles';
import { relevede } from '../rules/succession';
import { de } from '../scenario/build';
import {
  camp, campDuComte, capitale, chemin, commandantPossible, enGuerre, force, levee, terrain,
} from '../rules/guerre';
import { avis, concerneJoueur, donnerTitre, memoriser, mourir, notifier, trahir } from './monde';

/**
 * La guerre : déclaration, levée de l'ost, marche, batailles, sièges, usure, score et paix.
 * Batailles résolues automatiquement (la phase tactique viendra en vague 2).
 */
const minus = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const mer = (r: Regles) => r.data.scenario.carte.liaisonsMaritimes;
const pourJoueur = (w: World, ids: number[]) => concerneJoueur(w, ids) || ids.includes(w.joueurId ?? -1);

// ================================================================ déclaration et levée

export function declarerGuerre(ctx: SimContext, r: Regles, a: Character, cible: Character, motif: MotifGuerre, titre: string): Guerre {
  const w = ctx.world;
  const nomT = w.titres[titre]!.nom;
  const g: Guerre = {
    id: ctx.newId(), nom: motif === 'revendication' ? `Guerre pour le ${minus(nomT)}` : `Conquête ${de(w.comtes[titre.slice(2)]?.nom ?? nomT)}`,
    attaquant: a.id, defenseur: cible.id, motif, titre, debut: w.day,
    attaquants: [a.id], defenseurs: [cible.id], score: 0, batailles: 0, occupations: {},
  };
  w.guerres.push(g);
  ctx.chronicle({ kind: 'guerre', text: `${nomComplet(w, a)} déclare la guerre à ${nomComplet(w, cible)} : ${minus(g.nom)}.`, characterIds: [a.id, cible.id] });
  if (pourJoueur(w, [a.id, cible.id])) notifier(w, `${nomComplet(w, a)} déclare la guerre à ${nomComplet(w, cible)} (${minus(g.nom)}).`, true, [a.id, cible.id]);
  appelerAllies(ctx, r, g, a, 'att');
  appelerAllies(ctx, r, g, cible, 'def');
  for (const id of [...g.attaquants, ...g.defenseurs]) leverOst(ctx, r, w.personnages[id]!, g);
  return g;
}

/** Les alliés sont appelés aux armes ; refuser est une trahison. */
function appelerAllies(ctx: SimContext, r: Regles, g: Guerre, chef: Character, cote: 'att' | 'def'): void {
  const w = ctx.world;
  for (const al of w.alliances) {
    if (al.a !== chef.id && al.b !== chef.id) continue;
    const x = w.personnages[al.a === chef.id ? al.b : al.a]!;
    if (!vivant(x) || g.attaquants.includes(x.id) || g.defenseurs.includes(x.id) || enGuerre(w, x.id)) continue;
    const autreChef = cote === 'att' ? g.defenseur : g.attaquant;
    if (w.alliances.some((b) => (b.a === x.id && b.b === autreChef) || (b.b === x.id && b.a === autreChef))) continue; // allié des deux : il reste neutre
    if (x.id === w.joueurId) {
      (cote === 'att' ? g.attaquants : g.defenseurs).push(x.id);
      notifier(w, `Votre allié ${nomComplet(w, chef)} vous appelle aux armes : vous entrez dans la ${minus(g.nom)}.`, true, [chef.id]);
      continue;
    }
    if (opinionTotal(w, r, x, chef) >= -10) (cote === 'att' ? g.attaquants : g.defenseurs).push(x.id);
    else trahir(w, x, chef, `a ignoré mon appel aux armes (${minus(g.nom)})`, 30);
  }
}

/** Lève l'ost d'un seigneur : une armée à sa capitale, menée par lui-même ou son maréchal. */
export function leverOst(ctx: SimContext, r: Regles, c: Character, g: Guerre): Armee | undefined {
  const w = ctx.world;
  if (w.armees.some((x) => x.proprietaire === c.id)) return undefined;
  const hommes = levee(w, r, c).total;
  const cap = capitale(w, c);
  if (!cap || hommes < 50) return undefined;
  const marechal = perso(w, w.conseils[c.id]?.marechal);
  const cmd = [c, marechal].filter((x): x is Character => commandantPossible(w, x))
    .sort((x, y) => competence(w, r, y, 'gue').total - competence(w, r, x, 'gue').total)[0];
  const armee: Armee = { id: ctx.newId(), proprietaire: c.id, hommes, hommesMax: hommes, moral: 1, comte: cap, chemin: [], progres: 0, guerre: g.id,
    ...(cmd ? { commandant: cmd.id } : {}) };
  w.armees.push(armee);
  return armee;
}

// ================================================================ fin de guerre

export type Issue = 'victoire' | 'defaite' | 'blanche';

/** Termine une guerre. `issue` du point de vue des attaquants. */
export function finirGuerre(ctx: SimContext, r: Regles, g: Guerre, issue: Issue): void {
  const w = ctx.world;
  const a = w.personnages[g.attaquant]!, d = w.personnages[g.defenseur]!;
  const nomT = w.titres[g.titre]!.nom;
  let texte: string;
  if (issue === 'victoire' && vivant(a)) {
    const perdant = perso(w, w.titres[g.titre]!.titulaireId);
    transfererTitre(w, g.titre, a, perdant);
    a.prestige += 200;
    a.revendications = a.revendications.filter((x) => x.titre !== g.titre);
    if (perdant && perdant.id !== a.id) {
      perdant.revendications.push({ titre: g.titre, forte: true, origine: `Perdu face à ${nomComplet(w, a)}` });
      avis(perdant, a.id, -40, `M'a pris ${nomT}`);
      memoriser(perdant, 'spolie', w.day, `A perdu ${nomT} face à ${nomComplet(w, a)}`, a.id, 1);
    }
    texte = `${nomComplet(w, a)} l'emporte : ${nomT} lui revient.`;
  } else if (issue === 'defaite') {
    const tribut = Math.round(Math.max(0, a.or) * 0.3);
    a.or -= tribut; d.or += tribut; a.prestige = Math.max(0, a.prestige - 100); d.prestige += 100;
    texte = `${nomComplet(w, d)} repousse l'agression de ${nomComplet(w, a)}, qui verse ${tribut} pièces d'or.`;
  } else texte = `Paix blanche entre ${nomComplet(w, a)} et ${nomComplet(w, d)}.`;

  // Démobilisation, fin des occupations, trêves
  w.armees = w.armees.filter((x) => x.guerre !== g.id);
  for (const [k, o] of Object.entries(w.occupations)) if (o.guerre === g.id) delete w.occupations[k];
  w.guerres = w.guerres.filter((x) => x !== g);
  for (const x of g.attaquants) for (const y of g.defenseurs) w.treves.push({ a: x, b: y, jusqua: addYears(w.day, 10) });
  ctx.chronicle({ kind: 'guerre', text: `Fin de la ${minus(g.nom)} : ${texte}`, characterIds: [a.id, d.id] });
  if (pourJoueur(w, [...g.attaquants, ...g.defenseurs])) notifier(w, `Fin de la ${minus(g.nom)} : ${texte}`, true, [a.id, d.id]);
}

/**
 * Transfert d'un titre conquis. Pour un duché ou un royaume, le vainqueur reçoit aussi les
 * comtés de droit tenus par le vaincu et devient le suzerain des vassaux qui en relèvent.
 */
function transfererTitre(w: World, titre: string, vainqueur: Character, perdant: Character | undefined): void {
  donnerTitre(w, titre, vainqueur);
  if (!perdant || w.titres[titre]!.rang === 'comte') return;
  for (const t of [...perdant.titres]) if (relevede(w, t, titre) && w.titres[t]!.rang === 'comte') donnerTitre(w, t, vainqueur);
  for (const id of w.vivants) {
    const v = w.personnages[id]!;
    if (v.suzerainId === perdant.id && v.titres.some((t) => relevede(w, t, titre) || t === titre)) v.suzerainId = vainqueur.id;
  }
  if (!perdant.titres.length) { delete perdant.suzerainId; perdant.courId = vainqueur.id; }
  else if (vainqueur.suzerainId !== perdant.id && souverain(w, perdant).id === perdant.id && w.titres[titre]!.rang === 'royaume') perdant.suzerainId = vainqueur.id;
}

// ================================================================ systèmes

export function systemesGuerre(sim: Simulation, r: Regles): void {
  sim.addSystem({ id: 'guerre-jour', frequency: 'daily', run: (ctx) => { if (ctx.world.guerres.length) { marches(ctx, r); combats(ctx, r); sieges(ctx, r); } } });
  sim.addSystem({ id: 'guerre-mois', frequency: 'monthly', run: (ctx) => { if (ctx.world.guerres.length) { usure(ctx, r); bilans(ctx, r); } } });
}

function guerreDe(w: World, a: Armee): Guerre | undefined { return w.guerres.find((g) => g.id === a.guerre); }

/** Avance les armées en marche. */
function marches(ctx: SimContext, r: Regles): void {
  const w = ctx.world;
  for (const a of w.armees) {
    if (!a.chemin.length) continue;
    const prochain = a.chemin[0]!;
    const mers = mer(r).some(([x, y]) => (x === a.comte && y === prochain) || (y === a.comte && x === prochain));
    const duree = mers ? 25 : Math.round(10 * terrain(w.comtes[prochain]!.terrain).marche);
    a.progres++;
    delete a.siege;
    if (a.progres >= duree) { a.comte = prochain; a.chemin.shift(); a.progres = 0; }
  }
}

/** Batailles : armées ennemies au même endroit, à l'arrêt ou arrivées. */
function combats(ctx: SimContext, r: Regles): void {
  const w = ctx.world;
  for (const g of [...w.guerres]) {
    const ici = new Map<string, Armee[]>();
    for (const a of w.armees) if (a.guerre === g.id && a.progres === 0) { const l = ici.get(a.comte) ?? []; l.push(a); ici.set(a.comte, l); }
    for (const [comte, armees] of ici) {
      const att = armees.filter((a) => camp(g, a.proprietaire) === 'att'), def = armees.filter((a) => camp(g, a.proprietaire) === 'def');
      if (att.length && def.length) bataille(ctx, r, g, comte, att, def);
    }
  }
}

function bataille(ctx: SimContext, r: Regles, g: Guerre, comte: string, att: Armee[], def: Armee[]): void {
  const w = ctx.world;
  const tient = campDuComte(w, g, comte);
  const bonusTerrain = terrain(w.comtes[comte]!.terrain).defense;
  const fa = force(w, att) * (tient === 'att' ? 1 + bonusTerrain : 1) * (0.85 + ctx.rng.next() * 0.3);
  const fd = force(w, def) * (tient === 'def' ? 1 + bonusTerrain : 1) * (0.85 + ctx.rng.next() * 0.3);
  const attGagne = fa >= fd;
  const [vainq, vaincus] = attGagne ? [att, def] : [def, att];
  const ratio = Math.max(fa, fd) / Math.max(1, Math.min(fa, fd));
  const pertesV = 0.05 + ctx.rng.next() * 0.08;
  const pertesP = Math.min(0.6, 0.15 + 0.1 * Math.min(3, ratio) + ctx.rng.next() * 0.1);
  let tuesChezVaincus = 0;
  for (const a of vainq) { a.hommes = Math.round(a.hommes * (1 - pertesV)); a.moral = Math.min(1, a.moral + 0.05); }
  for (const a of vaincus) { const p = Math.round(a.hommes * pertesP); tuesChezVaincus += p; a.hommes -= p; a.moral = Math.max(0.1, a.moral - 0.35); }
  // Sort des commandants
  const evenements: string[] = [];
  for (const a of [...vainq, ...vaincus]) {
    const cmd = perso(w, a.commandant); if (!vivant(cmd)) continue;
    const perdu = vaincus.includes(a);
    const val = cmd.competences.val;
    if (ctx.rng.chance((perdu ? 0.06 : 0.02) * (1.5 - val / 25))) { evenements.push(`${nomComplet(w, cmd)} est tué`); mourir(ctx, r, cmd, 'tué au combat'); delete a.commandant; continue; }
    if (perdu && ctx.rng.chance(0.1 * (1.5 - val / 25))) {
      const geolier = w.personnages[vainq[0]!.proprietaire]!;
      cmd.prisonnierDe = geolier.id; delete a.commandant;
      avis(cmd, geolier.id, -20, 'M’a capturé à la bataille');
      evenements.push(`${nomComplet(w, cmd)} est capturé`);
      if (cmd.id === (attGagne ? g.defenseur : g.attaquant)) g.batailles += attGagne ? 40 : -40; // capturer le chef ennemi pèse lourd
    }
  }
  // Retraite des vaincus vers un comté de leur camp
  const campV = attGagne ? 'def' : 'att';
  for (const a of vaincus) {
    if (a.hommes < 50) { w.armees = w.armees.filter((x) => x !== a); continue; }
    const repli = w.comtes[comte]!.voisins.find((v) => campDuComte(w, g, v) === campV) ?? capitale(w, w.personnages[a.proprietaire]!);
    if (repli && repli !== comte) { a.chemin = [repli]; a.progres = 1; }
    delete a.siege;
  }
  const totalEnnemi = Math.max(500, vaincus.reduce((s, a) => s + a.hommesMax, 0));
  const apport = Math.min(25, Math.round((tuesChezVaincus / totalEnnemi) * 60) + 5);
  g.batailles = Math.max(-60, Math.min(60, g.batailles + (attGagne ? apport : -apport)));
  const nomsV = [...new Set(vainq.map((a) => nomComplet(w, w.personnages[a.proprietaire]!)))].join(' et ');
  const texte = `Bataille de ${w.comtes[comte]!.nom} : victoire de ${nomsV} (${tuesChezVaincus} morts chez l'ennemi)${evenements.length ? `. ${evenements.join(', ')}` : ''}.`;
  ctx.chronicle({ kind: 'guerre', text: texte, characterIds: [...vainq, ...vaincus].map((a) => a.proprietaire) });
  if (pourJoueur(w, [...vainq, ...vaincus].map((a) => a.proprietaire))) notifier(w, texte, true, [vainq[0]!.proprietaire]);
}

/** Sièges : une armée seule dans un comté ennemi l'assiège, puis l'occupe. */
function sieges(ctx: SimContext, r: Regles): void {
  const w = ctx.world;
  for (const a of w.armees) {
    if (a.chemin.length || a.progres) continue;
    const g = guerreDe(w, a); if (!g) continue;
    const moi = camp(g, a.proprietaire);
    const tient = campDuComte(w, g, a.comte);
    if (!moi || !tient || tient === moi) { delete a.siege; continue; }
    if (w.armees.some((x) => x.guerre === g.id && x.comte === a.comte && camp(g, x.proprietaire) !== moi && !x.chemin.length)) continue;
    const k = w.comtes[a.comte]!;
    if (!a.siege || a.siege.comte !== a.comte) a.siege = { comte: a.comte, progres: 0, duree: Math.round((40 * k.fort + 20) * (a.hommes > 3000 ? 0.75 : a.hommes < 800 ? 1.4 : 1)) };
    a.siege.progres++;
    if (a.siege.progres >= a.siege.duree) {
      const libere = w.occupations[a.comte]?.guerre === g.id;   // reprise d'un comté occupé
      if (libere) delete w.occupations[a.comte]; else w.occupations[a.comte] = { guerre: g.id, camp: moi };
      delete a.siege;
      const texte = `${libere ? 'Reprise' : 'Prise'} de ${k.nom} par ${nomComplet(w, w.personnages[a.proprietaire]!)}.`;
      ctx.chronicle({ kind: 'guerre', text: texte, characterIds: [a.proprietaire] });
      if (pourJoueur(w, [...g.attaquants, ...g.defenseurs])) notifier(w, texte, false, [a.proprietaire]);
    }
  }
}

/** Usure (ravitaillement, hiver), renforts en terre amie, solde. */
function usure(ctx: SimContext, r: Regles): void {
  const w = ctx.world;
  const hiver = [12, 1, 2].includes(toCalendar(w.day).month);
  for (const a of [...w.armees]) {
    const g = guerreDe(w, a); if (!g) continue;
    const k = w.comtes[a.comte]!;
    const ravitaillement = (k.developpement * 400 + 2000) * terrain(k.terrain).ravitaillement;
    const chezSoi = campDuComte(w, g, a.comte) === camp(g, a.proprietaire);
    let perte = 0;
    if (a.hommes > ravitaillement) perte += 0.04;
    if (hiver) perte += chezSoi ? 0.01 : 0.03;
    a.hommes = Math.round(a.hommes * (1 - perte));
    if (chezSoi && !a.chemin.length) { a.hommes = Math.min(a.hommesMax, Math.round(a.hommes + a.hommesMax * 0.03)); a.moral = Math.min(1, a.moral + 0.1); }
    const p = w.personnages[a.proprietaire]!;
    p.or -= a.hommes * 0.002;                                   // solde : 2 pièces par mois pour 1 000 hommes
    if (a.hommes < 50) w.armees = w.armees.filter((x) => x !== a);
  }
}

/** Score de guerre, capitulations forcées, lassitude. */
function bilans(ctx: SimContext, r: Regles): void {
  const w = ctx.world;
  for (const g of [...w.guerres]) {
    const a = perso(w, g.attaquant), d = perso(w, g.defenseur);
    if (!vivant(a) || !vivant(d)) { finirGuerre(ctx, r, g, 'blanche'); continue; }
    // Occupations : part du développement adverse tenue
    const devCamp = (cp: 'att' | 'def') => Object.values(w.comtes).filter((k) => campDuComte(w, { ...g }, k.id) === cp || w.occupations[k.id]?.guerre === g.id && w.occupations[k.id]!.camp !== cp && proprietaireCamp(w, g, k.id) === cp)
      .reduce((s, k) => s + k.developpement, 0);
    let occ = 0;
    for (const [id, o] of Object.entries(w.occupations)) {
      if (o.guerre !== g.id) continue;
      const k = w.comtes[id]!;
      const cible = relevede(w, `c-${id}`, g.titre) || `c-${id}` === g.titre ? 1.5 : 1;
      const base = o.camp === 'att' ? devCamp('def') : devCamp('att');
      occ += (o.camp === 'att' ? 1 : -1) * Math.min(40, (k.developpement / Math.max(1, base)) * 100 * cible);
    }
    g.score = Math.max(-100, Math.min(100, Math.round(g.batailles + occ)));
    // Défaite totale : plus aucune armée et des terres occupées
    const armeesCamp = (cp: 'att' | 'def') => w.armees.filter((x) => x.guerre === g.id && camp(g, x.proprietaire) === cp).length;
    if (g.score >= 100 || (armeesCamp('def') === 0 && g.score >= 50)) { finirGuerre(ctx, r, g, 'victoire'); continue; }
    if (g.score <= -100 || (armeesCamp('att') === 0 && g.score <= -50)) { finirGuerre(ctx, r, g, 'defaite'); continue; }
    const mois = (w.day - g.debut) / 30;
    if (mois > 60) finirGuerre(ctx, r, g, g.score > 30 ? 'victoire' : g.score < -30 ? 'defaite' : 'blanche');   // cinq ans : épuisement
  }
}

/** Camp du seigneur légitime d'un comté (sans tenir compte des occupations). */
function proprietaireCamp(w: World, g: Guerre, id: string): 'att' | 'def' | null {
  let cur = perso(w, w.titres[`c-${id}`]?.titulaireId); let n = 0;
  while (cur && n++ < 20) { const cp = camp(g, cur.id); if (cp) return cp; cur = perso(w, cur.suzerainId); }
  return null;
}

// ================================================================ ordres

/** Ordonne à une armée de marcher vers un comté. */
export function ordonnerMarche(w: World, r: Regles, a: Armee, vers: string): boolean {
  const ch = chemin(w, mer(r), a.comte, vers);
  if (!ch) return false;
  a.chemin = ch; if (!a.progres) a.progres = 0;
  return true;
}

export { comtesTenus };
