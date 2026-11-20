import { fromCalendar } from '../engine/calendar';
import { createWorld, Simulation, type SimContext } from '../engine/sim';
import type { GameData } from '../data/load';
import { SKILLS, type Character, type Sex, type Skills } from '../model/entities';
import type { World } from '../model/world';
import { buildRegles, type Regles } from '../rules/regles';
import { creerPersonnage, donnerTitre, marier } from '../systems/monde';

/**
 * Construit le monde de départ (1066) à partir des fichiers de scénario.
 * Les personnages historiques viennent des données ; une petite noblesse
 * générée (chevaliers, dames de compagnie) peuple les cours.
 */
export function construireMonde(seed: string, data: GameData): World {
  const d = data.temps.dateDeDepart;
  const w = createWorld(seed, fromCalendar(d.annee, d.mois, d.jour));
  const sim = new Simulation(w);
  const ctx = sim.context;
  const r = buildRegles(data);
  const sc = data.scenario;

  // Comtés et titres
  for (const c of sc.carte.comtes) {
    w.comtes[c.id] = { id: c.id, nom: c.nom, lat: c.lat, lon: c.lon, terrain: c.terrain, developpement: c.developpement,
      cultureId: c.culture, religionId: c.religion, fort: c.fort, voisins: [...c.voisins], controle: 100, mecontentement: 0 };
  }
  for (const k of sc.titres.royaumes) w.titres[k.id] = { id: k.id, nom: k.nom, rang: 'royaume', succession: k.succession, historique: [] };
  for (const du of sc.titres.duches) {
    const royaume = sc.titres.royaumes.find((k) => k.duches.includes(du.id))?.id;
    w.titres[du.id] = { id: du.id, nom: du.nom, rang: 'duche', succession: du.succession, historique: [], ...(royaume ? { parentDeJure: royaume } : {}) };
    for (const cid of du.comtes) {
      w.titres[`c-${cid}`] = { id: `c-${cid}`, nom: `Comté de ${w.comtes[cid]!.nom}`, rang: 'comte', comteId: cid,
        succession: sc.titres.successionComtes, historique: [], parentDeJure: du.id };
    }
  }
  // Dynasties
  for (const dy of sc.dynasties) {
    w.dynasties[dy.id] = { id: dy.id, nom: dy.nom, maisons: dy.maisons.map((m) => m.id), gloire: 0 };
    for (const m of dy.maisons) w.maisons[m.id] = { id: m.id, nom: m.nom, dynastieId: dy.id, ...(m.parent ? { parentId: m.parent } : {}) };
  }

  // Personnages historiques (deux passes : création, puis liens)
  const parCle = new Map<string, Character>();
  const tries = [...sc.personnages].sort((a, b) => a.naissance - b.naissance); // parents avant enfants
  for (const p of tries) {
    const pere = p.pere ? parCle.get(p.pere) : undefined, mere = p.mere ? parCle.get(p.mere) : undefined;
    const comp = competencesInitiales(ctx, p.competences);
    const traits = [...p.traits, ...(p.innes ?? [])];
    const c = creerPersonnage(ctx, {
      prenom: p.prenom, ...(p.surnom ? { surnom: p.surnom } : {}), sexe: p.sexe, naissance: fromCalendar(p.naissance, 1 + (ctx.rng.int(0, 11)), 1 + ctx.rng.int(0, 27)),
      maisonId: p.maison, cultureId: p.culture, religionId: 'catholique', competences: comp, traits, cle: p.id,
      ...(p.incertain ? { incertain: true } : {}), ...(pere ? { pereId: pere.id } : {}), ...(mere ? { mereId: mere.id } : {}),
      ...(p.batard ? { batard: true } : {}),
    });
    if (p.clerc) c.clerc = true;
    parCle.set(p.id, c);
  }
  for (const p of sc.personnages) {
    const c = parCle.get(p.id)!;
    for (const t of p.titres ?? []) donnerTitre(w, t, c);
    if (p.suzerain) c.suzerainId = parCle.get(p.suzerain)!.id;
    if (p.cour && c.titres.length === 0) c.courId = parCle.get(p.cour)!.id;
    if (p.conjoint && c.conjointId === undefined) {
      const x = parCle.get(p.conjoint)!;
      c.conjointId = x.id; x.conjointId = c.id;
    }
  }
  // Historique des titres : détenus depuis le début de la partie
  for (const t of Object.values(w.titres)) for (const h of t.historique) h.de = w.day;
  // Les titres de duché/royaume non attribués restent vacants ; les comtés doivent tous avoir un maître
  for (const t of Object.values(w.titres)) if (t.rang === 'comte' && t.titulaireId === undefined) throw new Error(`Comté sans seigneur au départ : ${t.id}`);

  // Fortune de départ selon les terres
  for (const id of w.vivants) {
    const c = w.personnages[id]!;
    c.or = 20 * c.titres.length + ctx.rng.int(0, 20);
    c.prestige = 100 * c.titres.length;
    c.piete = c.traits.includes('pieux') ? 150 : 50;
  }

  peuplerCours(ctx, r);
  w.stats.mariages = 0;
  w.chronicle = [{ day: w.day, kind: 'systeme', text: 'Début de la chronique : Harold vient d’être couronné roi d’Angleterre.' }];
  return sim.sync();
}

function competencesInitiales(ctx: SimContext, connues?: Partial<Skills>): Skills {
  const out = {} as Skills;
  for (const s of SKILLS) out[s] = connues?.[s] ?? Math.max(1, Math.min(18, Math.round(ctx.rng.normal(8, 3))));
  return out;
}

/** Ajoute à chaque grande cour quelques membres de la petite noblesse, pour atteindre ~100 personnages. */
function peuplerCours(ctx: SimContext, r: Regles): void {
  const w = ctx.world;
  const seigneurs = w.vivants.map((id) => w.personnages[id]!).filter((c) => c.titres.length > 0);
  const persos = r.data.traits.personnalite.map((t) => t.id);
  for (const s of seigneurs) {
    const n = Math.min(4, 1 + Math.floor(s.titres.length / 2));
    for (let i = 0; i < n; i++) {
      const noms = r.data.noms[s.cultureId] ?? r.data.noms.francien!;
      const lieu = ctx.rng.pick(noms.lieux);
      const maisonId = `petite-${lieu.toLowerCase().replace(/[^a-z]+/g, '-')}`;
      if (!w.maisons[maisonId]) {
        w.dynasties[maisonId] = { id: maisonId, nom: `Maison de ${lieu}`, maisons: [maisonId], gloire: 0 };
        w.maisons[maisonId] = { id: maisonId, nom: lieu, dynastieId: maisonId };
      }
      const sexe: Sex = ctx.rng.chance(0.6) ? 'h' : 'f';
      const naissance = w.day - ctx.rng.int(17, 45) * 365 - ctx.rng.int(0, 364);
      const c = creerPersonnage(ctx, {
        prenom: ctx.rng.pick(sexe === 'h' ? noms.h : noms.f), sexe, naissance, maisonId, cultureId: s.cultureId, religionId: 'catholique',
        competences: competencesInitiales(ctx), traits: tirerTraits(ctx, persos, r, 3), courId: s.id,
      });
      c.or = ctx.rng.int(2, 15); c.prestige = 20; c.piete = 30;
      // Certains courtisans sont déjà mariés entre eux
      if (i > 0 && ctx.rng.chance(0.35)) {
        const autre = w.vivants.map((id) => w.personnages[id]!).find((x) => x.courId === s.id && x.id !== c.id
          && x.sexe !== c.sexe && x.conjointId === undefined && x.maisonId !== c.maisonId && x.maisonId?.startsWith('petite-'));
        if (autre) marier(ctx, c, autre);
      }
    }
  }
}

/** Tire n traits de personnalité compatibles (jamais deux opposés). */
export function tirerTraits(ctx: SimContext, ids: string[], r: Regles, n: number, deja: string[] = []): string[] {
  const out = [...deja];
  let guard = 0;
  while (out.filter((t) => r.perso.has(t)).length < n && guard++ < 50) {
    const t = ctx.rng.pick(ids);
    const op = r.perso.get(t)?.oppose;
    if (out.includes(t) || (op && out.includes(op))) continue;
    out.push(t);
  }
  return out;
}
