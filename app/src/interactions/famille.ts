import { SKILL_NAMES, type Character, type SkillId } from '../model/entities';
import { chefDeFamille, empechements, interetMariage, rangFamille } from '../rules/mariage';
import { opinionTotal } from '../rules/opinion';
import { age, axe, competence, famillesProches, majeur, perso, rangMax, vivant, type Part } from '../rules/personnage';
import { avis, marier, memoriser } from '../systems/monde';
import { enregistrer, jusqua, n, notifierSiJoueur, type C, type Interaction, type Params } from './moteur';

/** Membres de la famille dont l'acteur décide le mariage (lui-même et ses enfants à sa charge). */
function aMaCharge(c: C, a: Character): Character[] {
  return [a, ...a.enfants.map((id) => c.w.personnages[id]!)]
    .filter((x) => vivant(x) && chefDeFamille(c.w, x).id === a.id && x.conjointId === undefined && x.fianceId === undefined && !x.clerc && x.prisonnierDe === undefined);
}
const membre = (c: C, p: Params): Character => c.w.personnages[p.membre as number]!;
const alliance = (c: C, x: Character, y: Character) => c.w.alliances.some((al) => (al.a === x.id && al.b === y.id) || (al.a === y.id && al.b === x.id));

/** Les chefs de famille titrés deviennent alliés par le mariage de leurs enfants. */
export function allierFamilles(c: C, x: Character, y: Character): void {
  const cx = chefDeFamille(c.w, x), cy = chefDeFamille(c.w, y);
  if (cx.id === cy.id || !cx.titres.length || !cy.titres.length || alliance(c, cx, cy)) return;
  c.w.alliances.push({ a: Math.min(cx.id, cy.id), b: Math.max(cx.id, cy.id), depuis: c.w.day });
}

function acceptationUnion(c: C, a: Character, cible: Character, p: Params, d: Character, fiancailles: boolean): Part[] {
  const m = membre(c, p);
  const parts: Part[] = interetMariage(c.w, c.r, d, cible, m).raisons.map((x) => ({ ...x }));
  parts.push({ source: `Opinion de ${n(c, d)} envers vous`, valeur: opinionTotal(c.w, c.r, d, a) / 4 });
  const ecartRang = rangFamille(c.w, cible) - rangFamille(c.w, m);
  if (ecartRang > 0) parts.push({ source: 'Vous êtes de rang inférieur', valeur: -12 * ecartRang });
  if (p.matrilineaire && cible.sexe === 'h') parts.push({ source: 'Ses enfants porteraient votre nom (mariage matrilinéaire)', valeur: -15 });
  if (alliance(c, a, d)) parts.push({ source: 'Déjà alliés', valeur: 8 });
  if (fiancailles) parts.push({ source: 'Engagement lointain (fiançailles)', valeur: -5 });
  parts.push({ source: 'Exigence de base', valeur: -8 });
  return parts;
}

const mariage: Interaction = {
  id: 'mariage', nom: 'Proposer un mariage', categorie: 'famille',
  description: "Unir l'un des vôtres (vous-même ou un enfant à votre charge) à ce personnage. Le mariage allie les deux chefs de famille et décide de la descendance.",
  visible: (c, a, cible) => cible.id !== a.id && majeur(c.w, cible) && cible.conjointId === undefined && !cible.clerc,
  parametres: [
    { id: 'membre', nom: 'Qui marier', options: (c, a, cible) => aMaCharge(c, a).filter((x) => majeur(c.w, x) && !empechements(c.w, x, cible, false).length).map((x) => ({ valeur: x.id, label: x.id === a.id ? `Vous-même (${age(c.w, x)} ans)` : `${n(c, x)} (${age(c.w, x)} ans)` })) },
    { id: 'matrilineaire', nom: 'Lignée', options: (c, a, cible) => {
      const opts = [{ valeur: false, label: 'Normale (les enfants prennent le nom du père)' }];
      if (cible.sexe === 'h') opts.push({ valeur: true, label: 'Matrilinéaire (les enfants prennent votre nom)' });
      return opts;
    } },
  ],
  conditions: (c, a, cible, p) => empechements(c.w, membre(c, p), cible, false),
  decideur: (c, a, cible) => chefDeFamille(c.w, cible),
  acceptation: (c, a, cible, p, d) => acceptationUnion(c, a, cible, p, d, false),
  proposition: (c, a, cible, p) => `${n(c, a)} propose de marier ${membre(c, p).id === a.id ? 'sa personne' : n(c, membre(c, p))} à ${n(c, cible)}.`,
  effets: (c, a, cible, p) => {
    const m = membre(c, p);
    marier(c.sim, m, cible, !!p.matrilineaire);
    allierFamilles(c, m, cible);
    return `${n(c, m)} épouse ${n(c, cible)}.`;
  },
};

const fiancailles: Interaction = {
  id: 'fiancailles', nom: 'Proposer des fiançailles', categorie: 'famille',
  description: 'Promettre deux enfants l’un à l’autre. Le mariage sera célébré automatiquement quand les deux auront 16 ans. Rompre une promesse coûte cher en réputation.',
  visible: (c, a, cible) => cible.id !== a.id && !majeur(c.w, cible) && cible.fianceId === undefined && !cible.clerc,
  parametres: [
    { id: 'membre', nom: 'Quel enfant', options: (c, a, cible) => aMaCharge(c, a).filter((x) => !majeur(c.w, x) && !empechements(c.w, x, cible, true).length).map((x) => ({ valeur: x.id, label: `${n(c, x)} (${age(c.w, x)} ans)` })) },
    { id: 'matrilineaire', nom: 'Lignée', options: (c, a, cible) => cible.sexe === 'h' ? [{ valeur: false, label: 'Normale' }, { valeur: true, label: 'Matrilinéaire' }] : [{ valeur: false, label: 'Normale' }] },
  ],
  conditions: (c, a, cible, p) => empechements(c.w, membre(c, p), cible, true),
  decideur: (c, a, cible) => chefDeFamille(c.w, cible),
  acceptation: (c, a, cible, p, d) => acceptationUnion(c, a, cible, p, d, true),
  proposition: (c, a, cible, p) => `${n(c, a)} propose de fiancer ${n(c, membre(c, p))} à ${n(c, cible)}.`,
  effets: (c, a, cible, p) => {
    const m = membre(c, p);
    m.fianceId = cible.id; cible.fianceId = m.id;
    if (p.matrilineaire) { m.fiancesMatrilineaire = true; cible.fiancesMatrilineaire = true; }
    for (const x of [m, cible]) memoriser(x, 'fiancailles', c.w.day, `Fiancé à ${n(c, x === m ? cible : m)}`, x === m ? cible.id : m.id, 0.4);
    allierFamilles(c, m, cible);
    notifierSiJoueur(c, `${n(c, m)} et ${n(c, cible)} sont fiancés.`, [m.id, cible.id]);
    return `${n(c, m)} et ${n(c, cible)} sont fiancés.`;
  },
};

const rompreFiancailles: Interaction = {
  id: 'rompre-fiancailles', nom: 'Rompre les fiançailles', categorie: 'famille',
  description: 'Rompre la promesse faite à sa famille. Elle ne l’oubliera pas, et votre parole perd de sa valeur.',
  visible: (c, a, cible) => cible.fianceId !== undefined && chefDeFamille(c.w, c.w.personnages[cible.fianceId]!).id === a.id,
  cout: () => ({ prestige: 50 }),
  effets: (c, a, cible) => {
    const autre = c.w.personnages[cible.fianceId!]!;
    delete cible.fianceId; delete autre.fianceId; delete cible.fiancesMatrilineaire; delete autre.fiancesMatrilineaire;
    const chef = chefDeFamille(c.w, cible);
    avis(chef, a.id, -25, 'A rompu les fiançailles de notre enfant', jusqua(c, 15));
    return `Les fiançailles de ${n(c, autre)} et ${n(c, cible)} sont rompues.`;
  },
};

const legitimer: Interaction = {
  id: 'legitimer', nom: 'Légitimer ce bâtard', categorie: 'famille',
  description: 'Faire de cet enfant naturel un enfant légitime : il pourra hériter. Vos autres enfants et votre conjoint risquent de mal le prendre.',
  visible: (c, a, cible) => !!cible.batard && (cible.pereId === a.id || cible.mereId === a.id),
  cout: () => ({ prestige: 150, piete: 50 }),
  effets: (c, a, cible) => {
    delete cible.batard;
    if (a.maisonId && !cible.maisonId) { cible.maisonId = a.maisonId; cible.dynastieId = a.dynastieId; }
    const conj = perso(c.w, a.conjointId);
    if (conj && cible.mereId !== conj.id && cible.pereId !== conj.id) avis(conj, a.id, -20, `A légitimé son bâtard ${cible.prenom}`, jusqua(c, 15));
    for (const id of a.enfants) { const k = c.w.personnages[id]!; if (vivant(k) && k.id !== cible.id && !k.batard) avis(k, a.id, -10, `A légitimé ${cible.prenom}`, jusqua(c, 10)); }
    return `${n(c, cible)} est désormais un enfant légitime.`;
  },
};

const orienterEducation: Interaction = {
  id: 'education', nom: "Orienter l'éducation", categorie: 'famille',
  description: "Choisir la compétence que l'on cultivera chez cet enfant. À 16 ans, il recevra l'éducation correspondante, renforcée par la valeur de son précepteur.",
  visible: (c, a, cible) => !majeur(c.w, cible) && (cible.pereId === a.id || cible.mereId === a.id || cible.tuteurId === a.id),
  parametres: [{ id: 'competence', nom: 'Compétence à cultiver', options: () => (['dip', 'gue', 'ges', 'int', 'sav'] as SkillId[]).map((s) => ({ valeur: s, label: SKILL_NAMES[s] })) }],
  effets: (c, a, cible, p) => { cible.educationVoulue = p.competence as SkillId; return `${n(c, cible)} sera éduqué en ${SKILL_NAMES[p.competence as SkillId].toLowerCase()}.`; },
};

const choisirPrecepteur: Interaction = {
  id: 'precepteur', nom: 'Le nommer précepteur', categorie: 'famille',
  description: "Confier l'éducation de l'un de vos enfants à ce personnage. Plus il est doué, meilleure sera l'éducation.",
  visible: (c, a, cible) => cible.id !== a.id && majeur(c.w, cible) && (cible.courId === a.id || cible.conjointId === a.id) && a.enfants.some((id) => vivant(c.w.personnages[id]) && !majeur(c.w, c.w.personnages[id]!)),
  parametres: [{ id: 'enfant', nom: 'Pour quel enfant', options: (c, a) => a.enfants.map((id) => c.w.personnages[id]!).filter((k) => vivant(k) && !majeur(c.w, k)).map((k) => ({ valeur: k.id, label: `${n(c, k)} (${age(c.w, k)} ans)` })) }],
  effets: (c, a, cible, p) => {
    const k = c.w.personnages[p.enfant as number]!;
    k.tuteurId = cible.id;
    avis(cible, a.id, 5, 'Nommé précepteur', jusqua(c, 10));
    return `${n(c, cible)} devient le précepteur de ${n(c, k)}.`;
  },
};

const pupille: Interaction = {
  id: 'pupille', nom: 'Le prendre en pupille', categorie: 'famille',
  description: 'Proposer d’élever cet enfant à votre cour. Ses parents vous en seront reconnaissants, et l’enfant gardera toute sa vie un lien avec vous.',
  visible: (c, a, cible) => cible.id !== a.id && !majeur(c.w, cible) && cible.courId !== a.id && famillesProches(c.w, a, cible) === null && age(c.w, cible) >= 4,
  conditions: (c, a) => (a.titres.length ? [] : ['Il faut une cour (posséder des terres) pour accueillir un pupille.']),
  decideur: (c, a, cible) => chefDeFamille(c.w, cible),
  acceptation: (c, a, cible, p, d) => [
    { source: `Opinion de ${n(c, d)} envers vous`, valeur: opinionTotal(c.w, c.r, d, a) / 3 },
    { source: 'Votre rang', valeur: (rangMax(c.w, a) - rangMax(c.w, d)) * 10 },
    { source: 'Votre meilleure compétence', valeur: Math.max(...(['dip', 'gue', 'ges', 'int', 'sav'] as const).map((s) => competence(c.w, c.r, a, s).total)) / 2 - 6 },
    { source: 'Attachement à son enfant', valeur: -6 - axe(c.r, d, 'compassion') * 4 },
  ],
  proposition: (c, a, cible) => `${n(c, a)} propose d'élever ${n(c, cible)} à sa cour.`,
  effets: (c, a, cible) => {
    cible.courId = a.id; cible.tuteurId = a.id;
    for (const par of [perso(c.w, cible.pereId), perso(c.w, cible.mereId)]) if (vivant(par)) avis(par, a.id, 10, `Élève notre enfant ${cible.prenom}`, jusqua(c, 15));
    avis(cible, a.id, 15, 'M’a élevé à sa cour');
    memoriser(cible, 'pupille', c.w.day, `Élevé à la cour de ${n(c, a)}`, a.id, 0.6);
    return `${n(c, cible)} sera élevé à votre cour.`;
  },
};

const inviter: Interaction = {
  id: 'inviter', nom: 'Inviter à votre cour', categorie: 'famille',
  description: 'Proposer à ce personnage (et à sa famille proche) de venir vivre à votre cour. Utile pour trouver un conseiller, un précepteur ou un parti à marier.',
  visible: (c, a, cible) => cible.id !== a.id && majeur(c.w, cible) && !cible.titres.length && cible.courId !== a.id && cible.prisonnierDe === undefined && !perso(c.w, cible.conjointId)?.titres.length,
  conditions: (c, a) => (a.titres.length ? [] : ['Il faut une cour (posséder des terres).']),
  decideur: (c, a, cible) => cible,
  acceptation: (c, a, cible) => {
    const actuel = perso(c.w, cible.courId);
    const parts: Part[] = [
      { source: 'Votre rang', valeur: rangMax(c.w, a) * 8 },
      { source: 'Opinion envers vous', valeur: opinionTotal(c.w, c.r, cible, a) / 3 },
    ];
    if (actuel) {
      parts.push({ source: `Rang de ${n(c, actuel)}, son seigneur actuel`, valeur: -rangMax(c.w, actuel) * 8 });
      parts.push({ source: `Attachement à ${n(c, actuel)}`, valeur: -opinionTotal(c.w, c.r, cible, actuel) / 3 });
      if (famillesProches(c.w, cible, actuel)) parts.push({ source: 'Vit auprès de sa famille', valeur: -20 });
    } else parts.push({ source: 'Sans seigneur', valeur: 10 });
    if (famillesProches(c.w, cible, a)) parts.push({ source: 'Vous êtes de sa famille', valeur: 20 });
    parts.push({ source: 'Quitter son foyer', valeur: -5 });
    return parts;
  },
  effets: (c, a, cible) => {
    const venir = [cible, perso(c.w, cible.conjointId), ...cible.enfants.map((id) => c.w.personnages[id])]
      .filter((x): x is Character => vivant(x) && !x.titres.length && (x.id === cible.id || x.id === cible.conjointId || !majeur(c.w, x)));
    for (const x of venir) x.courId = a.id;
    return `${n(c, cible)} rejoint votre cour${venir.length > 1 ? ' avec sa famille' : ''}.`;
  },
};

const renvoyer: Interaction = {
  id: 'renvoyer', nom: 'Renvoyer de votre cour', categorie: 'famille',
  description: 'Chasser ce courtisan. Il rejoindra un parent s’il en a un, sinon il quittera la scène. Il vous en voudra.',
  visible: (c, a, cible) => cible.courId === a.id && cible.id !== a.conjointId && cible.pereId !== a.id && cible.mereId !== a.id && cible.prisonnierDe === undefined,
  effets: (c, a, cible) => {
    avis(cible, a.id, -30, 'M’a chassé de sa cour', jusqua(c, 15));
    const parent = [perso(c.w, cible.pereId), perso(c.w, cible.mereId)].find((x) => vivant(x) && x.titres.length && x.id !== a.id);
    for (const pid of Object.keys(c.w.conseils)) { const cons = c.w.conseils[Number(pid)]!; for (const k of Object.keys(cons) as (keyof typeof cons)[]) if (cons[k] === cible.id) delete cons[k]; }
    if (parent) { cible.courId = parent.id; return `${n(c, cible)} quitte votre cour pour celle de ${n(c, parent)}.`; }
    delete cible.courId; cible.horsScene = c.w.day; c.w.vivants = c.w.vivants.filter((id) => id !== cible.id);
    return `${n(c, cible)} quitte votre cour et disparaît de la scène.`;
  },
};

enregistrer(mariage, fiancailles, rompreFiancailles, legitimer, orienterEducation, choisirPrecepteur, pupille, inviter, renvoyer);
