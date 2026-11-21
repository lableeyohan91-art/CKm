import { POSTES, POSTE_COMPETENCE, POSTE_NOMS, type Character, type Poste } from '../model/entities';
import { opinionTotal } from '../rules/opinion';
import { axe, comtesTenus, competence, famillesProches, majeur, nomComplet, perso, rangMax, titrePrincipal, vivant, type Part } from '../rules/personnage';
import { avis, donnerTitre, memoriser, mourir } from '../systems/monde';
import { enregistrer, jusqua, n, notifierSiJoueur, tyrannie, type C, type Interaction } from './moteur';

const relation = (c: C, a: Character, b: Character, type?: 'ami' | 'rival') =>
  c.w.relations.find((r) => ((r.a === a.id && r.b === b.id) || (r.a === b.id && r.b === a.id)) && (!type || r.type === type));
const nbRelations = (c: C, x: Character, type: 'ami' | 'rival') => c.w.relations.filter((r) => r.type === type && (r.a === x.id || r.b === x.id)).length;
const allies = (c: C, a: Character, b: Character) => c.w.alliances.some((al) => (al.a === a.id && al.b === b.id) || (al.a === b.id && al.b === a.id));
const op = (c: C, de: Character, vers: Character) => opinionTotal(c.w, c.r, de, vers);
const estVassalDirect = (a: Character, b: Character) => b.suzerainId === a.id && b.titres.length > 0;

// ============================================================== Relations

const cadeau: Interaction = {
  id: 'cadeau', nom: 'Offrir un cadeau', categorie: 'relations',
  description: "Envoyer de l'or pour gagner les faveurs de ce personnage. L'effet s'estompe avec les années ; les avares y sont plus sensibles.",
  visible: (c, a, cible) => cible.id !== a.id && cible.prisonnierDe === undefined,
  parametres: [{ id: 'montant', nom: 'Montant', options: (c, a) => [10, 30, 60].filter((m) => m <= Math.max(10, a.or)).map((m) => ({ valeur: m, label: `${m} pièces d'or` })) }],
  cout: (c, a, cible, p) => ({ or: p.montant as number }),
  effets: (c, a, cible, p) => {
    const m = p.montant as number;
    const gain = Math.min(45, Math.round((m / 2) * (1 + 0.25 * axe(c.r, cible, 'cupidite'))));
    cible.or += m;
    avis(cible, a.id, gain, `Cadeau de ${m} pièces d'or`, jusqua(c, 10));
    memoriser(cible, 'cadeau-recu', c.w.day, `Cadeau de ${nomComplet(c.w, a)}`, a.id, 0.4);
    notifierSiJoueur(c, `${n(c, a)} offre ${m} pièces d'or à ${n(c, cible)}.`, [cible.id]);
    return `${n(c, cible)} apprécie votre cadeau (opinion +${gain}).`;
  },
};

const emissaire: Interaction = {
  id: 'emissaire', nom: 'Envoyer un émissaire', categorie: 'relations',
  description: "Votre chancelier (ou vous-même, sans chancelier) va plaider votre cause. L'effet dépend de sa diplomatie. Une fois par an et par personne.",
  visible: (c, a, cible) => cible.id !== a.id && a.titres.length > 0 && cible.titres.length > 0,
  conditions: (c, a, cible) => (cible.opinions.some((o) => o.cible === a.id && o.raison.startsWith('Émissaire') && (o.jusqua ?? 0) > c.w.day - 365 * 4) ? ['Un émissaire est déjà venu cette année.'] : []),
  cout: () => ({ or: 10 }),
  effets: (c, a, cible) => {
    const chancelier = perso(c.w, c.w.conseils[a.id]?.chancelier);
    const envoye = vivant(chancelier) ? chancelier : a;
    const gain = Math.round(5 + competence(c.w, c.r, envoye, 'dip').total / 2);
    avis(cible, a.id, gain, `Émissaire de ${a.prenom}`, jusqua(c, 5));
    return `${n(c, envoye)} plaide votre cause auprès de ${n(c, cible)} (opinion +${gain}).`;
  },
};

const amitie: Interaction = {
  id: 'amitie', nom: "Lui proposer votre amitié", categorie: 'relations',
  description: 'Devenir amis : +40 d’opinion réciproque, durable. Il faut déjà s’apprécier. Trois amis au plus.',
  visible: (c, a, cible) => cible.id !== a.id && majeur(c.w, cible) && !relation(c, a, cible),
  conditions: (c, a) => (nbRelations(c, a, 'ami') >= 3 ? ['Vous avez déjà trois amis.'] : []),
  decideur: (c, a, cible) => cible,
  acceptation: (c, a, cible) => [
    { source: 'Son opinion de vous', valeur: op(c, cible, a) / 2 },
    { source: 'Sociabilité', valeur: axe(c.r, cible, 'sociabilite') * 8 },
    { source: 'Il a déjà beaucoup d’amis', valeur: nbRelations(c, cible, 'ami') >= 3 ? -100 : 0 },
    { source: "L'amitié se mérite", valeur: -15 },
  ],
  proposition: (c, a) => `${n(c, a)} vous propose son amitié.`,
  effets: (c, a, cible) => {
    c.w.relations.push({ a: Math.min(a.id, cible.id), b: Math.max(a.id, cible.id), type: 'ami', depuis: c.w.day });
    for (const [x, y] of [[a, cible], [cible, a]] as const) memoriser(x, 'amitie', c.w.day, `Amitié avec ${nomComplet(c.w, y)}`, y.id, 0.5);
    return `${n(c, cible)} devient votre ami.`;
  },
};

const reconcilier: Interaction = {
  id: 'reconcilier', nom: 'Chercher la réconciliation', categorie: 'relations',
  description: 'Faire le premier pas envers un rival. Cela coûte un peu de fierté (prestige) ; les rancuniers pardonnent mal.',
  visible: (c, a, cible) => !!relation(c, a, cible, 'rival'),
  cout: () => ({ prestige: 50 }),
  decideur: (c, a, cible) => cible,
  acceptation: (c, a, cible) => [
    { source: 'Son opinion de vous (hors rivalité)', valeur: (op(c, cible, a) + 50) / 2 },
    { source: 'Compassion', valeur: axe(c.r, cible, 'compassion') * 10 },
    { source: 'Rancune', valeur: -axe(c.r, cible, 'rancune') * 10 },
    { source: 'Votre geste d’humilité', valeur: 10 },
  ],
  effets: (c, a, cible) => {
    c.w.relations = c.w.relations.filter((r) => r !== relation(c, a, cible, 'rival'));
    avis(cible, a.id, 15, 'Réconciliation', jusqua(c, 10)); avis(a, cible.id, 15, 'Réconciliation', jusqua(c, 10));
    return `${n(c, cible)} accepte de tourner la page.`;
  },
};

const emprunter: Interaction = {
  id: 'emprunter', nom: 'Demander un prêt', categorie: 'relations',
  description: "Emprunter de l'or, à rembourser avec 20 % d'intérêt sous cinq ans. Un prêt non remboursé à l'échéance fâche durablement le prêteur.",
  visible: (c, a, cible) => cible.id !== a.id && cible.or >= 40 && majeur(c.w, cible),
  parametres: [{ id: 'montant', nom: 'Montant', options: (c, a, cible) => [20, 50, 100].filter((m) => m * 1.5 <= cible.or).map((m) => ({ valeur: m, label: `${m} pièces (rembourser ${Math.round(m * 1.2)})` })) }],
  decideur: (c, a, cible) => cible,
  acceptation: (c, a, cible, p) => [
    { source: 'Son opinion de vous', valeur: op(c, cible, a) / 3 },
    { source: 'Les intérêts l’intéressent', valeur: axe(c.r, cible, 'cupidite') * 6 },
    { source: 'Part de sa fortune', valeur: -((p.montant as number) / cible.or) * 30 },
    { source: 'Alliés', valeur: allies(c, a, cible) ? 12 : 0 },
    { source: 'Dettes déjà dues', valeur: -c.w.prets.filter((x) => x.debiteur === a.id).length * 15 },
  ],
  effets: (c, a, cible, p) => {
    const m = p.montant as number;
    cible.or -= m; a.or += m;
    c.w.prets.push({ id: c.sim.newId(), creancier: cible.id, debiteur: a.id, montant: Math.round(m * 1.2), echeance: jusqua(c, 5) });
    return `${n(c, cible)} vous prête ${m} pièces d'or (à rembourser ${Math.round(m * 1.2)} sous cinq ans).`;
  },
};

const rembourser: Interaction = {
  id: 'rembourser', nom: 'Rembourser votre dette', categorie: 'relations',
  description: "Rendre au prêteur la somme due (intérêts compris). Il vous en saura gré, et sa colère s'apaise si l'échéance était dépassée.",
  visible: (c, a, cible) => c.w.prets.some((x) => x.debiteur === a.id && x.creancier === cible.id),
  cout: (c, a, cible) => ({ or: c.w.prets.find((x) => x.debiteur === a.id && x.creancier === cible.id)!.montant }),
  effets: (c, a, cible) => {
    const pret = c.w.prets.find((x) => x.debiteur === a.id && x.creancier === cible.id)!;
    cible.or += pret.montant;
    c.w.prets = c.w.prets.filter((x) => x !== pret);
    cible.opinions = cible.opinions.filter((o) => !(o.cible === a.id && o.raison === 'Dette non remboursée'));
    avis(cible, a.id, 10, 'Dette honorée', jusqua(c, 10));
    return `Vous remboursez ${pret.montant} pièces à ${n(c, cible)}.`;
  },
};

// ============================================================== Vassaux et conseil

const accorderTitre: Interaction = {
  id: 'accorder-titre', nom: 'Lui accorder un comté', categorie: 'vassaux',
  description: "Donner l'un de vos comtés : il devient votre vassal, reconnaissant pour longtemps. Votre domaine et vos revenus diminuent.",
  visible: (c, a, cible) => cible.id !== a.id && majeur(c.w, cible) && !cible.clerc && cible.prisonnierDe === undefined
    && (cible.courId === a.id || estVassalDirect(a, cible)) && comtesTenus(c.w, a).length > 1,
  parametres: [{ id: 'titre', nom: 'Comté', options: (c, a) => {
    const capitale = `c-${comtesTenus(c.w, a).sort((x, y) => c.w.comtes[y]!.developpement - c.w.comtes[x]!.developpement)[0]}`;
    return a.titres.filter((t) => c.w.titres[t]!.rang === 'comte' && t !== capitale).map((t) => ({ valeur: t, label: `${c.w.titres[t]!.nom} (développement ${c.w.comtes[c.w.titres[t]!.comteId!]!.developpement})` }));
  } }],
  effets: (c, a, cible, p) => {
    const t = p.titre as string;
    donnerTitre(c.w, t, cible);
    cible.suzerainId = a.id;
    avis(cible, a.id, 40, `M'a accordé ${c.w.titres[t]!.nom}`, jusqua(c, 25));
    memoriser(cible, 'titre-recu', c.w.day, `A reçu ${c.w.titres[t]!.nom} de ${nomComplet(c.w, a)}`, a.id, 0.8);
    for (const id of c.w.vivants) { const x = c.w.personnages[id]!; if (x.courId === a.id && x.traits.includes('jaloux') && x.id !== cible.id) avis(x, a.id, -10, `Jalousie : terres données à ${cible.prenom}`, jusqua(c, 10)); }
    c.sim.chronicle({ kind: 'succession', text: `${nomComplet(c.w, a)} accorde ${c.w.titres[t]!.nom} à ${nomComplet(c.w, cible)}.`, characterIds: [a.id, cible.id] });
    return `${n(c, cible)} reçoit ${c.w.titres[t]!.nom} et devient votre vassal.`;
  },
};

const revoquerTitre: Interaction = {
  id: 'revoquer-titre', nom: 'Révoquer un de ses titres', categorie: 'vassaux',
  description: "Reprendre un titre à votre vassal. Sans motif (un vassal emprisonné en est un), vos autres vassaux y verront de la tyrannie. Lui et ses enfants ne l'oublieront pas.",
  visible: (c, a, cible) => estVassalDirect(a, cible),
  parametres: [{ id: 'titre', nom: 'Titre', options: (c, a, cible) => cible.titres.map((t) => ({ valeur: t, label: c.w.titres[t]!.nom })) }],
  effets: (c, a, cible, p) => {
    const t = p.titre as string;
    const nomT = c.w.titres[t]!.nom;
    donnerTitre(c.w, t, a);
    const motive = cible.prisonnierDe === a.id;
    tyrannie(c, a, motive ? -5 : -20, `Tyrannie : a dépouillé ${cible.prenom} de ${nomT}`, [cible.id]);
    avis(cible, a.id, -70, `M'a dépouillé de ${nomT}`);
    memoriser(cible, 'spolie', c.w.day, `Dépouillé de ${nomT} par ${nomComplet(c.w, a)}`, a.id, 1);
    if (!cible.titres.length) {
      delete cible.suzerainId; cible.courId = a.id;
      for (const id of c.w.vivants) { const v = c.w.personnages[id]!; if (v.suzerainId === cible.id && v.titres.length) v.suzerainId = a.id; }
    }
    c.sim.chronicle({ kind: 'succession', text: `${nomComplet(c.w, a)} révoque ${nomT} à ${nomComplet(c.w, cible)}.`, characterIds: [a.id, cible.id] });
    return `Vous reprenez ${nomT} à ${n(c, cible)}${motive ? '' : '. Vos vassaux murmurent contre cette tyrannie'}.`;
  },
};

const nommerConseil: Interaction = {
  id: 'conseil-nommer', nom: 'Le nommer au conseil', categorie: 'vassaux',
  description: "Confier un poste du conseil. Chancelier : relations et vassaux. Maréchal : armées (guerre). Intendant : revenus. Maître-espion : complots (intrigues). Chapelain : piété. La compétence du titulaire compte.",
  visible: (c, a, cible) => cible.id !== a.id && majeur(c.w, cible) && a.titres.length > 0 && cible.prisonnierDe === undefined
    && (cible.courId === a.id || estVassalDirect(a, cible) || cible.conjointId === a.id),
  parametres: [{ id: 'poste', nom: 'Poste', options: (c, a, cible) => POSTES.map((po) => {
    const actuel = perso(c.w, c.w.conseils[a.id]?.[po]);
    return { valeur: po, label: `${POSTE_NOMS[po]} — ${competence(c.w, c.r, cible, POSTE_COMPETENCE[po]).total} en ${['Diplomatie', 'Guerre', 'Gestion', 'Intrigue', 'Savoir'][POSTES.indexOf(po)]}${actuel ? ` (remplace ${actuel.prenom}, ${competence(c.w, c.r, actuel, POSTE_COMPETENCE[po]).total})` : ''}` };
  }) }],
  conditions: (c, a, cible, p) => (c.w.conseils[a.id]?.[p.poste as Poste] === cible.id ? ['Il occupe déjà ce poste.'] : []),
  effets: (c, a, cible, p) => {
    const po = p.poste as Poste;
    const cons = (c.w.conseils[a.id] ??= {});
    for (const k of POSTES) if (cons[k] === cible.id) delete cons[k];
    const ancien = perso(c.w, cons[po]);
    if (vivant(ancien)) avis(ancien, a.id, -10, `Renvoyé du poste de ${POSTE_NOMS[po].toLowerCase()}`, jusqua(c, 5));
    cons[po] = cible.id;
    memoriser(cible, 'conseil', c.w.day, `Nommé ${POSTE_NOMS[po].toLowerCase()} de ${nomComplet(c.w, a)}`, a.id, 0.5);
    return `${n(c, cible)} devient votre ${POSTE_NOMS[po].toLowerCase()}.`;
  },
};

const renvoyerConseil: Interaction = {
  id: 'conseil-renvoyer', nom: 'Le renvoyer du conseil', categorie: 'vassaux',
  description: 'Retirer ce conseiller de son poste. Il le prendra mal.',
  visible: (c, a, cible) => POSTES.some((po) => c.w.conseils[a.id]?.[po] === cible.id),
  effets: (c, a, cible) => {
    const cons = c.w.conseils[a.id]!;
    for (const po of POSTES) if (cons[po] === cible.id) delete cons[po];
    avis(cible, a.id, -15, 'Renvoyé du conseil', jusqua(c, 8));
    return `${n(c, cible)} quitte votre conseil.`;
  },
};

const aideOr: Interaction = {
  id: 'aide-or', nom: 'Réclamer une aide en or', categorie: 'vassaux',
  description: "Demander à votre vassal une contribution exceptionnelle. Les loyaux paient, les avares rechignent ; un refus vous fâchera.",
  visible: (c, a, cible) => estVassalDirect(a, cible),
  parametres: [{ id: 'part', nom: 'Montant', options: (c, a, cible) => [0.2, 0.4].map((x) => ({ valeur: x, label: `${Math.round(x * 100)} % de son trésor (${Math.floor(cible.or * x)} pièces)` })) }],
  conditions: (c, a, cible) => (cible.or < 10 ? ['Son trésor est presque vide.'] : []),
  decideur: (c, a, cible) => cible,
  acceptation: (c, a, cible, p) => [
    { source: 'Son opinion de vous', valeur: op(c, cible, a) / 2 },
    { source: 'Loyauté', valeur: axe(c.r, cible, 'loyaute') * 8 },
    { source: 'Avarice', valeur: -axe(c.r, cible, 'cupidite') * 8 },
    { source: 'Montant demandé', valeur: -(p.part as number) * 40 },
    { source: 'Devoir de vassal', valeur: 8 },
  ],
  proposition: (c, a, cible, p) => `${n(c, a)}, votre suzerain, réclame une aide de ${Math.floor(cible.or * (p.part as number))} pièces d'or.`,
  refus: (c, a, cible, p, d) => { if (d.id === cible.id) avis(a, cible.id, -15, "M'a refusé son aide", jusqua(c, 10)); },
  effets: (c, a, cible, p) => {
    const m = Math.floor(cible.or * (p.part as number));
    cible.or -= m; a.or += m;
    avis(cible, a.id, -5, 'Aide exceptionnelle versée', jusqua(c, 5));
    return `${n(c, cible)} vous verse ${m} pièces d'or.`;
  },
};

const libererVassal: Interaction = {
  id: 'liberer-vassal', nom: 'Le libérer de son serment', categorie: 'vassaux',
  description: "Rendre ce vassal indépendant. Il vous en sera très reconnaissant, mais vous perdez ses impôts et votre prestige en souffre.",
  visible: (c, a, cible) => estVassalDirect(a, cible),
  cout: () => ({ prestige: 100 }),
  effets: (c, a, cible) => { delete cible.suzerainId; avis(cible, a.id, 40, "M'a rendu ma liberté", jusqua(c, 30)); return `${n(c, cible)} est désormais indépendant.`; },
};

// ============================================================== Diplomatie

const proposerAlliance: Interaction = {
  id: 'alliance', nom: 'Proposer une alliance', categorie: 'diplomatie',
  description: "Les alliés se soutiendront dans leurs guerres (dès la phase de guerre). Plus facile entre familles unies par le mariage.",
  visible: (c, a, cible) => cible.id !== a.id && a.titres.length > 0 && cible.titres.length > 0 && !allies(c, a, cible) && !estVassalDirect(a, cible) && !estVassalDirect(cible, a),
  conditions: (c, a) => (c.w.alliances.filter((al) => al.a === a.id || al.b === a.id).length >= 4 ? ['Vous avez déjà quatre alliés.'] : []),
  decideur: (c, a, cible) => cible,
  acceptation: (c, a, cible) => {
    const lien = [a, ...a.enfants.map((id) => c.w.personnages[id]!)].some((x) => x.conjointId !== undefined && (perso(c.w, x.conjointId)?.pereId === cible.id || x.conjointId === cible.id || perso(c.w, x.conjointId)?.mereId === cible.id))
      || [cible, ...cible.enfants.map((id) => c.w.personnages[id]!)].some((x) => x.conjointId !== undefined && (perso(c.w, x.conjointId)?.pereId === a.id || perso(c.w, x.conjointId)?.mereId === a.id));
    return [
      { source: 'Son opinion de vous', valeur: op(c, cible, a) / 2 },
      { source: 'Familles unies par mariage', valeur: lien || famillesProches(c.w, a, cible) ? 25 : 0 },
      { source: 'Votre puissance comparée', valeur: (rangMax(c.w, a) - rangMax(c.w, cible)) * 6 + (comtesTenus(c.w, a).length - comtesTenus(c.w, cible).length) * 2 },
      { source: 'Une alliance engage', valeur: -20 },
    ];
  },
  proposition: (c, a) => `${n(c, a)} vous propose une alliance.`,
  effets: (c, a, cible) => { c.w.alliances.push({ a: Math.min(a.id, cible.id), b: Math.max(a.id, cible.id), depuis: c.w.day }); return `${n(c, cible)} devient votre allié.`; },
};

const romprAlliance: Interaction = {
  id: 'rompre-alliance', nom: "Rompre l'alliance", categorie: 'diplomatie',
  description: 'Trahir sa confiance. Cela vous coûte du prestige et il ne l’oubliera pas.',
  visible: (c, a, cible) => allies(c, a, cible),
  cout: () => ({ prestige: 100 }),
  effets: (c, a, cible) => {
    c.w.alliances = c.w.alliances.filter((al) => !((al.a === a.id && al.b === cible.id) || (al.a === cible.id && al.b === a.id)));
    avis(cible, a.id, -40, 'A rompu notre alliance', jusqua(c, 25));
    return `L'alliance avec ${n(c, cible)} est rompue.`;
  },
};

// ============================================================== Justice

const peutJuger = (a: Character, cible: Character) => cible.id !== a.id && a.titres.length > 0 && (cible.courId === a.id || estVassalDirect(a, cible));

const emprisonner: Interaction = {
  id: 'emprisonner', nom: 'Le faire emprisonner', categorie: 'justice',
  description: "Jeter ce personnage au cachot. Sans motif, c'est un acte de tyrannie que vos vassaux et sa famille ne pardonneront pas. Un prisonnier ne peut plus agir.",
  visible: (c, a, cible) => peutJuger(a, cible) && cible.prisonnierDe === undefined,
  effets: (c, a, cible) => {
    cible.prisonnierDe = a.id;
    if (cible.titres.length) tyrannie(c, a, -20, `Tyrannie : a emprisonné ${cible.prenom} sans motif`, [cible.id]);
    avis(cible, a.id, -60, "M'a emprisonné");
    memoriser(cible, 'emprisonne', c.w.day, `Emprisonné par ${nomComplet(c.w, a)}`, a.id, 1);
    for (const id of [cible.pereId, cible.mereId, cible.conjointId, ...cible.enfants]) { const k = perso(c.w, id); if (vivant(k) && k.id !== a.id) avis(k, a.id, -25, `A emprisonné ${cible.prenom}`, jusqua(c, 20)); }
    if (axe(c.r, a, 'compassion') > 0) a.tension += 15;
    notifierSiJoueur(c, `${n(c, cible)} est jeté au cachot par ${n(c, a)}.`, [cible.id, a.id], true);
    return `${n(c, cible)} est emprisonné.`;
  },
};

const liberer: Interaction = {
  id: 'liberer', nom: 'Le libérer', categorie: 'justice',
  description: 'Rendre sa liberté à votre prisonnier. Il en sera un peu moins amer.',
  visible: (c, a, cible) => cible.prisonnierDe === a.id,
  effets: (c, a, cible) => { delete cible.prisonnierDe; avis(cible, a.id, 20, 'M’a libéré', jusqua(c, 10)); memoriser(cible, 'libere', c.w.day, `Libéré par ${nomComplet(c.w, a)}`, a.id, 0.5); return `${n(c, cible)} est libre.`; },
};

const exiler: Interaction = {
  id: 'exiler', nom: "L'exiler", categorie: 'justice',
  description: 'Chasser définitivement ce personnage de vos terres. Il disparaît de la scène ; sa famille vous en voudra.',
  visible: (c, a, cible) => !cible.titres.length && (cible.prisonnierDe === a.id || cible.courId === a.id) && cible.id !== a.conjointId && cible.pereId !== a.id && cible.mereId !== a.id,
  effets: (c, a, cible) => {
    for (const id of [cible.pereId, cible.mereId, cible.conjointId, ...cible.enfants]) { const k = perso(c.w, id); if (vivant(k) && k.id !== a.id) avis(k, a.id, -20, `A exilé ${cible.prenom}`, jusqua(c, 20)); }
    delete cible.prisonnierDe; delete cible.courId; cible.horsScene = c.w.day;
    c.w.vivants = c.w.vivants.filter((id) => id !== cible.id);
    c.w.relations = c.w.relations.filter((r) => r.a !== cible.id && r.b !== cible.id);
    memoriser(cible, 'exil', c.w.day, `Exilé par ${nomComplet(c.w, a)}`, a.id, 1);
    return `${n(c, cible)} prend le chemin de l'exil.`;
  },
};

const executer_: Interaction = {
  id: 'executer', nom: 'Le faire exécuter', categorie: 'justice',
  description: "Mettre à mort votre prisonnier. Ses enfants hériteront de leur haine, vos vassaux craindront votre cruauté ; un seigneur compatissant en sera tourmenté.",
  visible: (c, a, cible) => cible.prisonnierDe === a.id,
  effets: (c, a, cible) => {
    const nomV = nomComplet(c.w, cible);
    for (const id of [cible.pereId, cible.mereId, cible.conjointId, ...cible.enfants, ...c.w.vivants.filter((v) => c.w.personnages[v]!.maisonId === cible.maisonId && cible.maisonId)]) {
      const k = perso(c.w, id);
      if (vivant(k) && k.id !== a.id && k.id !== cible.id) { avis(k, a.id, -60, `A fait exécuter ${cible.prenom}`); memoriser(k, 'execution', c.w.day, `Exécution de ${nomV} par ${nomComplet(c.w, a)}`, a.id, 1); }
    }
    tyrannie(c, a, cible.titres.length ? -25 : -10, `Cruauté : exécution de ${cible.prenom}`);
    if (axe(c.r, a, 'compassion') > 0) a.tension += 40;
    mourir(c.sim, c.r, cible, `exécuté sur ordre de ${nomComplet(c.w, a)}`);
    return `${nomV} est exécuté.`;
  },
};

enregistrer(cadeau, emissaire, amitie, reconcilier, emprunter, rembourser,
  accorderTitre, revoquerTitre, nommerConseil, renvoyerConseil, aideOr, libererVassal,
  proposerAlliance, romprAlliance, emprisonner, liberer, exiler, executer_);

export { titrePrincipal };
