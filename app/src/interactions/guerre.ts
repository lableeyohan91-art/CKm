import type { Character, MotifGuerre } from '../model/entities';
import { opinionTotal } from '../rules/opinion';
import { empechementsGuerre, enGuerreContre, levee, motifs, camp, sousLaCouronneDe } from '../rules/guerre';
import { axe, comtesTenus, competence, perso, rangMax, vivant, type Part } from '../rules/personnage';
import { avis } from '../systems/monde';
import { declarerGuerre, finirGuerre } from '../systems/guerre';
import { enregistrer, n, type C, type Interaction, type Params } from './moteur';

/** Interactions de guerre : déclarer, proposer la paix. */

const chefs = (c: C, a: Character, cible: Character) => {
  const g = enGuerreContre(c.w, a.id, cible.id);
  return g && [g.attaquant, g.defenseur].includes(a.id) && [g.attaquant, g.defenseur].includes(cible.id) ? g : undefined;
};

const lireMotif = (p: Params): { motif: MotifGuerre; titre: string } => {
  const [motif, titre] = String(p.motif).split('|') as [MotifGuerre, string];
  return { motif, titre };
};

const declarer: Interaction = {
  id: 'declarer-guerre', nom: 'Déclarer la guerre', categorie: 'guerre',
  description: "Prendre par les armes un titre que vous revendiquez, ou un comté qui relève de droit de votre duché ou royaume. Vos alliés et les siens seront appelés. Une revendication faible coûte du prestige.",
  visible: (c, a, cible) => cible.id !== a.id && a.titres.length > 0 && cible.titres.length > 0 && motifs(c.w, a, cible).length > 0,
  parametres: [{
    id: 'motif', nom: 'Motif',
    options: (c, a, cible) => motifs(c.w, a, cible).map((m) => ({ valeur: `${m.motif}|${m.titre}`, label: m.texte })),
  }],
  conditions: (c, a, cible) => empechementsGuerre(c.w, a, cible),
  cout: (c, a, cible, p) => {
    const { motif, titre } = lireMotif(p);
    if (motif === 'dejure') return { prestige: 50 };
    return a.revendications.find((r) => r.titre === titre)?.forte ? {} : { prestige: 100 };
  },
  effets: (c, a, cible, p) => {
    const { motif, titre } = lireMotif(p);
    const g = declarerGuerre(c.sim, c.r, a, cible, motif, titre);
    const alliesA = g.attaquants.length - 1, alliesD = g.defenseurs.length - 1;
    return `La guerre est déclarée. Vos alliés à vos côtés : ${alliesA}. Ses alliés : ${alliesD}. Votre ost (${levee(c.w, c.r, a).total} hommes) se rassemble.`;
  },
};

type Paix = 'blanche' | 'capitulation' | 'exiger';

const paix: Interaction = {
  id: 'proposer-paix', nom: 'Proposer la paix', categorie: 'guerre',
  description: "Négocier la fin de la guerre : une paix blanche (chacun garde ses terres), votre capitulation (vous cédez), ou exiger sa reddition. Il accepte selon le score de guerre et la durée du conflit.",
  visible: (c, a, cible) => !!chefs(c, a, cible),
  parametres: [{
    id: 'type', nom: 'Conditions',
    options: (c, a, cible) => {
      const g = chefs(c, a, cible)!;
      const cede = camp(g, a.id) === 'att' ? 'renoncer à votre motif et verser un tribut' : `céder ${c.w.titres[g.titre]!.nom}`;
      const exige = camp(g, a.id) === 'att' ? `exiger ${c.w.titres[g.titre]!.nom}` : 'exiger sa renonciation et un tribut';
      return [
        { valeur: 'blanche', label: 'Paix blanche' },
        { valeur: 'exiger', label: `Reddition : ${exige}` },
        { valeur: 'capitulation', label: `Capituler : ${cede}` },
      ];
    },
  }],
  decideur: (c, a, cible) => cible,
  acceptation: (c, a, cible, p, d) => {
    const g = chefs(c, a, cible)!;
    const s = camp(g, d.id) === 'att' ? g.score : -g.score;   // score vu par celui qui décide
    const mois = (c.w.day - g.debut) / 30;
    const type = p.type as Paix;
    const parts: Part[] = [];
    if (type === 'capitulation') return [{ source: 'Vous vous rendez', valeur: 100 }];
    parts.push({ source: `Score de guerre (${s > 0 ? '+' : ''}${s} pour lui)`, valeur: type === 'blanche' ? -s : -s - 30 });
    parts.push({ source: 'Lassitude de la guerre', valeur: Math.min(30, mois) });
    if (type === 'blanche') parts.push({ source: 'Guerre à peine commencée', valeur: mois < 6 ? -25 : 0 });
    if (type === 'exiger') parts.push({ source: 'Céder est humiliant', valeur: -20 + axe(c.r, d, 'audace') * -5 });
    parts.push({ source: 'Son opinion de vous', valeur: opinionTotal(c.w, c.r, d, a) / 10 });
    return parts;
  },
  proposition: (c, a, cible, p) => {
    const t = p.type as Paix;
    return `${n(c, a)} vous propose ${t === 'blanche' ? 'une paix blanche' : t === 'capitulation' ? 'sa capitulation' : 'de vous rendre'}.`;
  },
  effets: (c, a, cible, p) => {
    const g = chefs(c, a, cible)!;
    const t = p.type as Paix;
    const aAtt = camp(g, a.id) === 'att';
    const issue = t === 'blanche' ? 'blanche' : (t === 'exiger') === aAtt ? 'victoire' : 'defaite';
    finirGuerre(c.sim, c.r, g, issue);
    return t === 'blanche' ? 'La paix est signée : chacun garde ses terres.' : t === 'exiger' ? `${n(c, cible)} se rend.` : 'Vous avez capitulé.';
  },
};

/** Titres de la cible qu'on peut revendiquer : ses comtés voisins de vos terres, et son titre le plus haut s'il n'est pas au-dessus du vôtre. */
export function titresForgeables(c: C, a: Character, cible: Character): string[] {
  const mesComtes = new Set(comtesTenus(c.w, a));
  const voisins = new Set([...mesComtes].flatMap((k) => c.w.comtes[k]!.voisins));
  const out = cible.titres.filter((t) => c.w.titres[t]!.rang === 'comte' && voisins.has(t.slice(2)));
  const haut = [...cible.titres].sort((x, y) => rangTitre(c, y) - rangTitre(c, x))[0];
  if (haut && !out.includes(haut) && rangTitre(c, haut) > 1 && rangTitre(c, haut) <= rangMax(c.w, a) && out.length) out.push(haut);
  return out.filter((t) => !a.revendications.some((r) => r.titre === t));
}
const rangTitre = (c: C, t: string) => ({ comte: 1, duche: 2, royaume: 3 } as Record<string, number>)[c.w.titres[t]!.rang] ?? 1;

const forger: Interaction = {
  id: 'forger-revendication', nom: 'Forger une revendication', categorie: 'guerre',
  description: "Votre chancelier fouille les archives (et invente au besoin) pour vous trouver des droits sur une terre voisine. Réussite selon sa diplomatie : vous obtenez une revendication faible, donc un motif de guerre. Échec : la cible l'apprend et vous en veut.",
  visible: (c, a, cible) => cible.id !== a.id && a.titres.length > 0 && cible.titres.length > 0 && !sousLaCouronneDe(c.w, cible, a) && titresForgeables(c, a, cible).length > 0,
  parametres: [{ id: 'titre', nom: 'Titre visé', options: (c, a, cible) => titresForgeables(c, a, cible).map((t) => ({ valeur: t, label: c.w.titres[t]!.nom })) }],
  conditions: (c, a) => (a.memoires.some((m) => m.type === 'intrigue' && m.texte.startsWith('Revendication forgée') && m.jour > c.w.day - 365) ? ['Votre chancelier est encore à l’œuvre (une fois par an).'] : []),
  cout: (c, a, cible, p) => ({ or: rangTitre(c, p.titre as string) * 50 }),
  effets: (c, a, cible, p) => {
    const t = p.titre as string;
    const ch = perso(c.w, c.w.conseils[a.id]?.chancelier);
    const agent = vivant(ch) ? ch : a;
    const chance = Math.min(0.9, 0.35 + competence(c.w, c.r, agent, 'dip').total * 0.025);
    a.memoires.push({ type: 'intrigue', jour: c.w.day, texte: `Revendication forgée sur ${c.w.titres[t]!.nom}`, intensite: 0.2 });
    if (c.sim.rng.chance(chance)) {
      a.revendications.push({ titre: t, forte: false, origine: `Forgée par ${agent.prenom}` });
      return `${n(c, agent)} vous trouve des droits sur ${c.w.titres[t]!.nom} : vous avez désormais une revendication faible (motif de guerre).`;
    }
    avis(cible, a.id, -25, `A tenté de forger des droits sur ${c.w.titres[t]!.nom}`, c.w.day + 365 * 10);
    return `${n(c, agent)} échoue (${Math.round(chance * 100)} % de chances) et ${n(c, cible)} l'apprend : opinion −25.`;
  },
};

enregistrer(declarer, paix, forger);
