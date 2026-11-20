import type { Character } from '../model/entities';
import type { World } from '../model/world';
import { axe, famillesProches, type Part } from './personnage';
import type { Regles } from './regles';

/**
 * Opinion de `de` envers `vers`, de −100 à +100, avec le détail de chaque source.
 * Calculée à la demande (jamais stockée en tableau n×n) : traits, famille,
 * relations, souvenirs et avis datés.
 */
export function opinion(w: World, r: Regles, de: Character, vers: Character): { total: number; parts: Part[] } {
  const parts: Part[] = [];
  const add = (source: string, valeur: number) => { if (valeur) parts.push({ source, valeur }); };

  // Traits
  for (const t of de.traits) {
    const def = r.perso.get(t); if (!def) continue;
    if (vers.traits.includes(t)) add(`Tous deux ${def.nom.toLowerCase()}s`, 5);
    else if (def.oppose && vers.traits.includes(def.oppose)) add(`${def.nom} contre ${r.perso.get(def.oppose)?.nom.toLowerCase()}`, -10);
  }
  if (de.traits.includes('jaloux') && vers.titres.length > de.titres.length) add('Jalousie', -10);

  // Famille
  const lien = famillesProches(w, de, vers);
  if (lien === 'conjoint') add('Conjoint', 20);
  else if (lien === 'parent' || lien === 'enfant') add(lien === 'parent' ? 'Parent' : 'Enfant', 20);
  else if (lien === 'fratrie') add('Frère ou sœur', 10);
  else if (de.maisonId && de.maisonId === vers.maisonId) add('Même maison', 5);

  // Liens féodaux
  if (de.suzerainId === vers.id && de.titres.length > 0) {
    const amb = axe(r, de, 'ambition');
    add('Vassal ambitieux', amb > 0 ? -6 * amb : 0);
    add('Vassal loyal', axe(r, de, 'loyaute') > 0 ? 10 : 0);
  }

  // Culture et religion
  if (de.cultureId !== vers.cultureId) add('Culture différente', -5);
  if (de.religionId !== vers.religionId) add('Religion différente', -25);

  // Relations personnelles
  for (const rel of w.relations) {
    if ((rel.a === de.id && rel.b === vers.id) || (rel.b === de.id && rel.a === vers.id)) add(rel.type === 'ami' ? 'Ami' : 'Rival', rel.type === 'ami' ? 40 : -50);
  }

  // Avis datés
  for (const o of de.opinions) if (o.cible === vers.id && (o.jusqua === undefined || o.jusqua > w.day)) add(o.raison, o.valeur);

  // Souvenirs liés à cette personne
  for (const m of de.memoires) {
    if (m.autre !== vers.id) continue;
    if (m.type === 'desherite') add(m.texte, Math.round(-25 * m.intensite));
  }

  const total = Math.max(-100, Math.min(100, parts.reduce((s, p) => s + p.valeur, 0)));
  return { total, parts };
}

export const opinionTotal = (w: World, r: Regles, de: Character, vers: Character): number => opinion(w, r, de, vers).total;
