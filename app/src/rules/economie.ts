import type { Character } from '../model/entities';
import type { World } from '../model/world';
import { comtesTenus, type Part } from './personnage';

export const TAUX_REVENU = 0.1;      // or par point de développement et par mois
export const IMPOT_VASSAL = 0.2;     // part des revenus de domaine versée au suzerain

export function revenuDomaine(w: World, c: Character): number {
  let s = 0;
  for (const id of comtesTenus(w, c)) { const k = w.comtes[id]!; s += k.developpement * TAUX_REVENU * (k.controle / 100); }
  return s;
}

/** Budget mensuel détaillé (pour l'économie et pour les explications). */
export function budget(w: World, c: Character): { solde: number; parts: Part[] } {
  const parts: Part[] = [];
  const dom = revenuDomaine(w, c);
  if (dom) parts.push({ source: 'Revenus de vos terres', valeur: dom });
  if (c.suzerainId !== undefined && c.titres.length) parts.push({ source: 'Impôt versé au suzerain', valeur: -dom * IMPOT_VASSAL });
  let impots = 0;
  for (const id of w.vivants) {
    const v = w.personnages[id]!;
    if (v.suzerainId === c.id && v.titres.length) impots += revenuDomaine(w, v) * IMPOT_VASSAL;
  }
  if (impots) parts.push({ source: 'Impôts de vos vassaux', valeur: impots });
  if (c.titres.length) {
    const courtisans = w.vivants.reduce((n, id) => n + (w.personnages[id]!.courId === c.id ? 1 : 0), 0);
    parts.push({ source: 'Entretien de la cour', valeur: -(0.3 + courtisans * 0.08) });
  }
  const solde = parts.reduce((s, p) => s + p.valeur, 0);
  return { solde, parts: parts.map((p) => ({ ...p, valeur: Math.round(p.valeur * 100) / 100 })) };
}
