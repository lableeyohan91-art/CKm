import type { Character } from '../model/entities';
import type { World } from '../model/world';
import { opinionTotal } from './opinion';
import { age, consanguins, majeur, perso, rangMax, vivant, type Part } from './personnage';
import type { Regles } from './regles';

/** Fertilité d'une femme selon son âge (1 = maximale). */
export function fertiliteAge(a: number): number {
  if (a < 16) return 0;
  if (a <= 30) return 1;
  if (a <= 35) return 0.75;
  if (a <= 40) return 0.45;
  if (a <= 45) return 0.15;
  if (a <= 48) return 0.04;
  return 0;
}

/** Qui décide du mariage d'un personnage : lui-même s'il est titré, sinon son père vivant, sinon sa mère titrée, sinon lui-même. */
export function chefDeFamille(w: World, c: Character): Character {
  if (c.titres.length) return c;
  const p = perso(w, c.pereId); if (vivant(p)) return p;
  const m = perso(w, c.mereId); if (vivant(m) && m.titres.length) return m;
  return c;
}

/** Rang de la famille : celui du chef de famille (0 à 3). */
export const rangFamille = (w: World, c: Character): number => Math.max(rangMax(w, c), rangMax(w, chefDeFamille(w, c)));

export function estHeritierPrincipal(w: World, c: Character): boolean {
  const p = perso(w, c.pereId);
  if (!vivant(p) || !p.titres.length) return c.titres.length > 0;
  const fils = p.enfants.map((id) => w.personnages[id]!).filter((k) => vivant(k) && k.sexe === 'h' && !k.batard && !k.clerc).sort((a, b) => a.naissance - b.naissance);
  return fils[0]?.id === c.id;
}

/** Peut-on marier (ou fiancer) ces deux personnes ? Renvoie les empêchements. */
export function empechements(w: World, a: Character, b: Character, fiancailles: boolean): string[] {
  const out: string[] = [];
  if (a.sexe === b.sexe) out.push('Ils sont du même sexe.');
  for (const x of [a, b]) {
    if (x.deces !== undefined || x.horsScene !== undefined) out.push(`${x.prenom} n'est plus là.`);
    if (x.conjointId !== undefined) out.push(`${x.prenom} est déjà marié.`);
    if (x.fianceId !== undefined) out.push(`${x.prenom} est déjà fiancé.`);
    if (x.clerc) out.push(`${x.prenom} a prononcé ses vœux.`);
    if (x.prisonnierDe !== undefined) out.push(`${x.prenom} est prisonnier.`);
    if (fiancailles && majeur(w, x)) out.push(`${x.prenom} est majeur : il faut un mariage, pas des fiançailles.`);
    if (!fiancailles && !majeur(w, x)) out.push(`${x.prenom} est trop jeune (fiançailles possibles).`);
    if (!fiancailles && x.sexe === 'f' && age(w, x) > 45) out.push(`${x.prenom} n'est plus en âge d'avoir des enfants.`);
  }
  if (a.religionId !== b.religionId) out.push("Ils ne partagent pas la même foi.");
  if (consanguins(w, a, b)) out.push("L'Église interdit cette union : ils sont trop proches parents.");
  return out;
}

/** Intérêt d'un mariage entre `dep` et `cand`, vu par le décideur `pour`. */
export function interetMariage(w: World, r: Regles, pour: Character, dep: Character, cand: Character): { score: number; raisons: Part[] } {
  const raisons: Part[] = [];
  const add = (source: string, v: number) => { if (Math.round(v)) raisons.push({ source, valeur: Math.round(v) }); };
  const poidsRang = (pour.ambition === 'puissance' ? 1.5 : 1) * (dep.titres.length || estHeritierPrincipal(w, dep) ? 1.3 : 1);
  add('Rang de sa famille', rangFamille(w, cand) * 12 * poidsRang);
  const femme = cand.sexe === 'f' ? cand : dep;
  const af = age(w, femme);
  add('Âge pour avoir des enfants', (af < 16 ? 0.9 : fertiliteAge(af)) * 15 * (pour.ambition === 'famille' ? 1.4 : 1));
  const ecart = Math.abs(age(w, dep) - age(w, cand));
  if (ecart > 10) add("Différence d'âge", -(ecart - 10));
  const chef = chefDeFamille(w, cand);
  if (chef.id !== pour.id) add('Opinion de sa famille', opinionTotal(w, r, pour, chef) / 5);
  for (const [t, v] of [['beau', 5], ['laid', -5], ['genie', 8], ['lent', -6], ['chetif', -5], ['robuste', 4]] as const) if (cand.traits.includes(t)) add(r.innes.get(t)!.nom, v);
  if (cand.cultureId === dep.cultureId) add('Même culture', 3);
  if (cand.titres.length) add('Possède des terres', 10 * poidsRang);
  return { score: raisons.reduce((s, x) => s + x.valeur, 0), raisons };
}
