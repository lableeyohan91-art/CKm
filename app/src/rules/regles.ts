import type { GameData } from '../data/load';
import type { Traits } from '../data/schemas';

export type TraitPerso = Traits['personnalite'][number];
export type TraitInne = Traits['innes'][number];

/** Données de règles indexées pour un accès rapide pendant la simulation. */
export interface Regles {
  data: GameData;
  perso: Map<string, TraitPerso>;
  innes: Map<string, TraitInne>;
  education: Map<string, Traits['education'][number]>;
  axes: string[];
}

export function buildRegles(data: GameData): Regles {
  return {
    data,
    perso: new Map(data.traits.personnalite.map((t) => [t.id, t])),
    innes: new Map(data.traits.innes.map((t) => [t.id, t])),
    education: new Map(data.traits.education.map((t) => [t.id, t])),
    axes: data.traits.axes,
  };
}

export function traitName(r: Regles, id: string): string {
  return r.perso.get(id)?.nom ?? r.innes.get(id)?.nom ?? r.education.get(id)?.nom ?? id;
}
