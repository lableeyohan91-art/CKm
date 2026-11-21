import { addYears, ageAt, type Day } from '../engine/calendar';
import type { SimContext } from '../engine/sim';
import { SKILLS, type Character, type MemoryKind, type Sex, type Skills } from '../model/entities';
import type { World } from '../model/world';
import { nomComplet, perso, titrePrincipal, vivant } from '../rules/personnage';
import type { Regles } from '../rules/regles';
import { planSuccession } from '../rules/succession';

/**
 * Opérations qui modifient le monde. Le joueur et l'IA passent par ces mêmes
 * fonctions : mêmes règles pour tous, et un seul endroit à tester.
 */

export function notifier(w: World, texte: string, important: boolean, persos: number[] = []): void {
  w.notifications.push({ jour: w.day, texte, important, persos });
  if (w.notifications.length > 300) w.notifications.splice(0, w.notifications.length - 300);
}

/** Le joueur est-il concerné (lui, sa famille proche, ses vassaux directs) ? */
export function concerneJoueur(w: World, ids: number[]): boolean {
  const j = perso(w, w.joueurId ?? undefined); if (!j) return false;
  return ids.some((id) => {
    const c = w.personnages[id]; if (!c) return false;
    return c.id === j.id || c.conjointId === j.id || c.pereId === j.id || c.mereId === j.id
      || j.pereId === c.id || j.mereId === c.id || c.suzerainId === j.id || j.suzerainId === c.id;
  });
}

export const estNotable = (w: World, c: Character): boolean => c.titres.length > 0
  || [perso(w, c.pereId), perso(w, c.mereId), perso(w, c.conjointId)].some((p) => !!p && p.titres.length > 0);

export function memoriser(c: Character, type: MemoryKind, jour: Day, texte: string, autre?: number, intensite = 1): void {
  c.memoires.push({ type, jour, texte, intensite, ...(autre !== undefined ? { autre } : {}) });
  if (c.memoires.length > 40) c.memoires.splice(0, c.memoires.length - 40);
}

export function avis(c: Character, cible: number, valeur: number, raison: string, jusqua?: Day): void {
  c.opinions = c.opinions.filter((o) => !(o.cible === cible && o.raison === raison));
  c.opinions.push({ cible, valeur, raison, ...(jusqua !== undefined ? { jusqua } : {}) });
}

export interface NouveauPersonnage {
  prenom: string; surnom?: string; sexe: Sex; naissance: Day; maisonId: string | null; cultureId: string; religionId: string;
  pereId?: number; mereId?: number; batard?: boolean; competences: Skills; traits: string[]; courId?: number; cle?: string;
  incertain?: boolean;
}

export function creerPersonnage(ctx: SimContext, p: NouveauPersonnage): Character {
  const w = ctx.world;
  const c: Character = {
    id: ctx.newId(), prenom: p.prenom, maisonId: p.maisonId,
    dynastieId: p.maisonId ? w.maisons[p.maisonId]?.dynastieId ?? null : null,
    sexe: p.sexe, naissance: p.naissance, anciensConjoints: [], enfants: [], cultureId: p.cultureId, religionId: p.religionId,
    competences: p.competences, traits: p.traits, sante: 5, tension: 0, prestige: 0, piete: 0, or: 0, titres: [],
    opinions: [], memoires: [], revendications: [], portrait: ctx.rng.nextUint32(),
    ...(p.surnom ? { surnom: p.surnom } : {}), ...(p.cle ? { cle: p.cle } : {}), ...(p.incertain ? { incertain: true } : {}),
    ...(p.pereId !== undefined ? { pereId: p.pereId } : {}), ...(p.mereId !== undefined ? { mereId: p.mereId } : {}),
    ...(p.batard ? { batard: true } : {}), ...(p.courId !== undefined ? { courId: p.courId } : {}),
  };
  w.personnages[c.id] = c;
  w.vivants.push(c.id);
  const pere = perso(w, p.pereId), mere = perso(w, p.mereId);
  if (pere) pere.enfants.push(c.id);
  if (mere) mere.enfants.push(c.id);
  return c;
}

/** Compétences de départ : moyenne des parents (s'ils existent) + hasard. */
export function competencesNaissance(ctx: SimContext, pere?: Character, mere?: Character): Skills {
  const out = {} as Skills;
  for (const s of SKILLS) {
    const base = pere && mere ? (pere.competences[s] + mere.competences[s]) / 2 : 6;
    out[s] = Math.max(0, Math.min(20, Math.round(ctx.rng.normal(base * 0.5 + 3, 2.5))));
  }
  return out;
}

export function marier(ctx: SimContext, a: Character, b: Character, matrilineaire = false): void {
  const w = ctx.world;
  const [h, f] = a.sexe === 'h' ? [a, b] : [b, a];
  h.conjointId = f.id; f.conjointId = h.id;
  if (matrilineaire) { h.matrilineaire = true; f.matrilineaire = true; }
  // Résidence : chez le conjoint titré (l'homme par défaut)
  const [hote, invite] = f.titres.length > 0 && h.titres.length === 0 ? [f, h] : [h, f];
  if (invite.titres.length === 0) invite.courId = hote.titres.length > 0 ? hote.id : hote.courId ?? hote.id;
  const jusqua = addYears(w.day, 15);
  for (const [x, y] of [[h, f], [f, h]] as const) memoriser(x, 'mariage', w.day, `Mariage avec ${nomComplet(w, y)}`, y.id, 0.6);
  // Rapprochement des familles
  const ph = perso(w, h.pereId), pf = perso(w, f.pereId);
  if (vivant(ph) && vivant(pf)) { avis(ph, pf.id, 15, 'Alliance par mariage', jusqua); avis(pf, ph.id, 15, 'Alliance par mariage', jusqua); }
  w.stats.mariages++;
  if (estNotable(w, h) || estNotable(w, f)) ctx.chronicle({ kind: 'mariage', text: `${nomComplet(w, h)} épouse ${nomComplet(w, f)}.`, characterIds: [h.id, f.id] });
  if (concerneJoueur(w, [h.id, f.id])) notifier(w, `${nomComplet(w, h)} épouse ${nomComplet(w, f)}.`, false, [h.id, f.id]);
}

/**
 * Trahison : la victime garde une rancune permanente (transmise à ses enfants),
 * ses proches et alliés jugent le traître, et un traître loyal de caractère en souffre.
 */
export function trahir(w: World, traitre: Character, victime: Character, texte: string, gravite = 50): void {
  avis(victime, traitre.id, -gravite, `M'a trahi : ${texte}`);
  memoriser(victime, 'trahison', w.day, `Trahi par ${nomComplet(w, traitre)} : ${texte}`, traitre.id, 1);
  const temoins = new Set<number>([victime.pereId, victime.mereId, victime.conjointId, ...victime.enfants].filter((x): x is number => x !== undefined));
  for (const a of w.alliances) { if (a.a === victime.id) temoins.add(a.b); if (a.b === victime.id) temoins.add(a.a); }
  for (const id of temoins) {
    const t = w.personnages[id];
    if (t && t.deces === undefined && t.horsScene === undefined && t.id !== traitre.id) avis(t, traitre.id, -Math.round(gravite / 4), `A trahi ${victime.prenom}`, addYears(w.day, 15));
  }
  if (traitre.traits.includes('loyal')) traitre.tension += 25;
  if (concerneJoueur(w, [victime.id]) && w.joueurId !== traitre.id) notifier(w, `Trahison ! ${nomComplet(w, traitre)} : ${texte}.`, true, [traitre.id, victime.id]);
}

/** Donne un titre à un personnage (sans gérer la vassalité). */
export function donnerTitre(w: World, titreId: string, a: Character | undefined): void {
  const t = w.titres[titreId]!;
  const ancien = perso(w, t.titulaireId);
  if (ancien) ancien.titres = ancien.titres.filter((x) => x !== titreId);
  const last = t.historique[t.historique.length - 1];
  if (last && last.a === undefined) last.a = w.day;
  if (a) {
    t.titulaireId = a.id; a.titres.push(titreId); t.historique.push({ id: a.id, de: w.day });
    if (a.revendications.length) a.revendications = a.revendications.filter((x) => x.titre !== titreId);
    if (a.courId !== undefined) delete a.courId;
  } else delete t.titulaireId;
}

export function mourir(ctx: SimContext, r: Regles, c: Character, cause: string): void {
  const w = ctx.world;
  if (!vivant(c)) return;
  c.deces = w.day; c.causeDeces = cause;
  w.vivants = w.vivants.filter((id) => id !== c.id);
  w.stats.deces++;
  delete c.enceinte;
  w.relations = w.relations.filter((rel) => rel.a !== c.id && rel.b !== c.id);
  const conj = perso(w, c.conjointId);
  if (conj) { delete conj.conjointId; conj.anciensConjoints.push(c.id); memoriser(conj, 'veuvage', w.day, `Veuvage : mort de ${nomComplet(w, c)}`, c.id, 0.8); }
  delete c.conjointId;
  for (const id of [c.pereId, c.mereId, ...c.enfants]) {
    const k = perso(w, id); if (vivant(k)) memoriser(k, 'mort-proche', w.day, `Mort de ${nomComplet(w, c)}`, c.id, 0.7);
  }
  nettoyerApresDeces(w, c);
  const notable = c.titres.length > 0 || estNotable(w, c);
  const etaitJoueur = w.joueurId === c.id;
  const succ = c.titres.length > 0 ? appliquerSuccession(ctx, r, c) : undefined;

  // Les courtisans et la famille du défunt rejoignent l'héritier (ou leur propre seigneur)
  const heritier = perso(w, succ?.principal);
  transmettreGuerres(w, c, heritier);
  transmettreRevendications(w, c, heritier);
  for (const id of w.vivants) {
    const x = w.personnages[id]!;
    if (x.courId === c.id) { if (heritier) x.courId = heritier.id; else delete x.courId; }
    if (x.suzerainId === c.id && x.titres.length > 0 && !succ) delete x.suzerainId;
  }
  if (notable) ctx.chronicle({ kind: 'deces', text: `Mort de ${nomComplet(w, c)} (${cause}).`, characterIds: [c.id] });
  if (concerneJoueur(w, [c.id]) && !etaitJoueur) notifier(w, `${nomComplet(w, c)} est mort (${cause}).`, true, [c.id]);

  if (etaitJoueur) {
    const suivant = heritier && heritier.dynastieId === c.dynastieId ? heritier
      : w.vivants.map((id) => w.personnages[id]!).find((x) => x.dynastieId === c.dynastieId && x.titres.length > 0);
    if (suivant) {
      w.joueurId = suivant.id;
      notifier(w, `${nomComplet(w, c)} est mort (${cause}). Vous incarnez désormais ${nomComplet(w, suivant)}.`, true, [c.id, suivant.id]);
    } else {
      w.joueurId = null; w.finDePartie = `Votre dynastie ne possède plus aucune terre après la mort de ${nomComplet(w, c)}.`;
      notifier(w, w.finDePartie, true, [c.id]);
    }
  }
}

/** L'héritier reprend les guerres et les armées du défunt. */
function transmettreGuerres(w: World, c: Character, h: Character | undefined): void {
  for (const g of w.guerres) {
    const liste = g.attaquants.includes(c.id) ? g.attaquants : g.defenseurs.includes(c.id) ? g.defenseurs : null;
    if (!liste) continue;
    liste.splice(liste.indexOf(c.id), 1);
    const reprend = h && !g.attaquants.includes(h.id) && !g.defenseurs.includes(h.id) && (g.attaquant === c.id || g.defenseur === c.id || h.titres.length > 0);
    if (h && reprend) liste.push(h.id);
    if (h && g.attaquant === c.id) g.attaquant = h.id;
    if (h && g.defenseur === c.id) g.defenseur = h.id;
    for (const a of w.armees) if (a.guerre === g.id && a.proprietaire === c.id) { if (h && liste.includes(h.id)) a.proprietaire = h.id; }
    w.armees = w.armees.filter((a) => a.proprietaire !== c.id);
  }
  for (const a of w.armees) if (a.commandant === c.id) delete a.commandant;
}

/** Les revendications fortes passent à l'héritier principal (affaiblies pour les autres fils). */
function transmettreRevendications(w: World, c: Character, h: Character | undefined): void {
  for (const rv of c.revendications) {
    if (!rv.forte) continue;
    for (const id of c.enfants) {
      const k = w.personnages[id];
      if (!k || k.deces !== undefined || k.horsScene !== undefined || k.batard || k.clerc) continue;
      if (w.titres[rv.titre]?.titulaireId === k.id || k.revendications.some((x) => x.titre === rv.titre)) continue;
      const principal = h?.id === k.id;
      if (!principal && k.sexe !== 'h') continue;
      k.revendications.push({ titre: rv.titre, forte: principal, origine: `Héritée de ${c.prenom}` });
    }
  }
}

/**
 * Conséquences d'une disparition sur les liens : prisonniers libérés, alliances et fiançailles
 * rompues, conseil, prêts, propositions — et rancunes transmises aux enfants.
 */
function nettoyerApresDeces(w: World, c: Character): void {
  for (const id of w.vivants) {
    const x = w.personnages[id]!;
    if (x.prisonnierDe === c.id) delete x.prisonnierDe;
    if (x.fianceId === c.id) { delete x.fianceId; delete x.fiancesMatrilineaire; }
    if (x.tuteurId === c.id) delete x.tuteurId;
  }
  delete c.fianceId; delete c.prisonnierDe;
  w.alliances = w.alliances.filter((a) => a.a !== c.id && a.b !== c.id);
  delete w.conseils[c.id];
  for (const cons of Object.values(w.conseils)) for (const k of Object.keys(cons) as (keyof typeof cons)[]) if (cons[k] === c.id) delete cons[k];
  w.prets = w.prets.filter((p) => p.debiteur !== c.id);
  w.propositions = w.propositions.filter((p) => p.acteur !== c.id && p.cible !== c.id);
  // Les grandes rancunes (permanentes) passent aux enfants adultes, atténuées de moitié
  for (const id of c.enfants) {
    const k = w.personnages[id];
    if (!k || k.deces !== undefined || k.horsScene !== undefined || ageAt(k.naissance, w.day) < 16) continue;
    for (const o of c.opinions) {
      if (o.valeur <= -40 && o.jusqua === undefined && o.cible !== k.id && !o.raison.startsWith('Rancune héritée')) {
        avis(k, o.cible, Math.round(o.valeur / 2), `Rancune héritée de ${c.prenom} : ${o.raison.charAt(0).toLowerCase()}${o.raison.slice(1)}`);
      }
    }
  }
}

/** Transmet les titres du défunt et réorganise la vassalité. */
export function appliquerSuccession(ctx: SimContext, r: Regles, defunt: Character): { principal?: number } {
  const w = ctx.world;
  const plan = planSuccession(w, defunt);
  const suzerainDuDefunt = perso(w, defunt.suzerainId);
  const vassauxDuDefunt = w.vivants.map((id) => w.personnages[id]!).filter((v) => v.suzerainId === defunt.id && v.titres.length > 0);
  const titres = [...defunt.titres];
  if (plan.attributions.length === 0) {
    // Déshérence : les titres reviennent au suzerain, sinon restent vacants
    for (const t of titres) donnerTitre(w, t, vivant(suzerainDuDefunt) ? suzerainDuDefunt : undefined);
    for (const v of vassauxDuDefunt) { if (vivant(suzerainDuDefunt)) v.suzerainId = suzerainDuDefunt.id; else delete v.suzerainId; }
    ctx.chronicle({ kind: 'succession', text: `${nomComplet(w, defunt)} meurt sans héritier : ses terres ${vivant(suzerainDuDefunt) ? `reviennent à ${nomComplet(w, suzerainDuDefunt)}` : 'restent sans maître'}.`, characterIds: [defunt.id] });
    w.stats.successions++;
    return {};
  }
  for (const a of plan.attributions) donnerTitre(w, a.titre, w.personnages[a.heritier]);
  const aine = w.personnages[plan.principal!]!;
  for (const p of w.prets) if (p.creancier === defunt.id) p.creancier = aine.id;
  const heritiers = [...new Set(plan.attributions.map((a) => a.heritier))].map((id) => w.personnages[id]!);

  // Vassalité des héritiers
  for (const h of heritiers) {
    if (h.id === aine.id) {
      // l'aîné prend la place du défunt, sauf s'il avait déjà un rang plus haut ailleurs
      if (vivant(suzerainDuDefunt) && suzerainDuDefunt.id !== aine.id) aine.suzerainId = suzerainDuDefunt.id;
      else if (!aine.suzerainId || aine.suzerainId === defunt.id) delete aine.suzerainId;
    } else {
      h.suzerainId = aine.id;
      memoriser(h, 'heritage', w.day, `A reçu une part de l'héritage de ${nomComplet(w, defunt)}`, aine.id, 0.5);
    }
  }
  // Les vassaux du défunt suivent l'aîné
  for (const v of vassauxDuDefunt) if (!heritiers.includes(v)) v.suzerainId = aine.id;
  // Les frères exclus d'une primogéniture s'en souviennent
  if (w.titres[titrePrincipal(w, aine) ?? '']?.succession === 'primogeniture') {
    for (const id of defunt.enfants) {
      const k = w.personnages[id]!;
      if (vivant(k) && k.id !== aine.id && k.sexe === 'h' && !k.batard && !k.clerc) {
        memoriser(k, 'desherite', w.day, `Écarté de l'héritage au profit de ${nomComplet(w, aine)}`, aine.id, 1);
        const tp = titrePrincipal(w, aine);
        if (tp && !k.revendications.some((x) => x.titre === tp)) k.revendications.push({ titre: tp, forte: false, origine: `Fils écarté de ${defunt.prenom}` });
      }
    }
  }
  w.stats.successions++;
  const noms = heritiers.map((h) => nomComplet(w, h)).join(', ');
  ctx.chronicle({ kind: 'succession', text: `Succession de ${nomComplet(w, defunt)} : ${heritiers.length > 1 ? `partage entre ${noms}` : `${noms} hérite de tout`}.`, characterIds: [defunt.id, ...heritiers.map((h) => h.id)] });
  if (concerneJoueur(w, [defunt.id, ...heritiers.map((h) => h.id)])) notifier(w, `Succession de ${nomComplet(w, defunt)} : ${noms}.`, false, heritiers.map((h) => h.id));
  return { principal: aine.id };
}
