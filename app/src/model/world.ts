import type { Day } from '../engine/calendar';
import type { RngState } from '../engine/rng';

/** Élément de la file datée : un traitement à exécuter à une date précise. */
export interface ScheduledItem {
  day: Day;
  seq: number;
  kind: string;                        // nom du gestionnaire (ex. « naissance »)
  payload: Record<string, unknown>;    // données sérialisables uniquement
}

export type ChronicleKind = 'systeme' | 'naissance' | 'deces' | 'mariage' | 'succession' | 'guerre' | 'autre';

export interface ChronicleEntry {
  day: Day;
  kind: ChronicleKind;
  text: string;
  characterIds?: number[];
  titleIds?: number[];
}

/**
 * État complet et sérialisable d'une partie.
 * Règle : uniquement des données JSON (pas de Map, de classe, de fonction).
 * Les tables d'entités (personnages, titres…) arrivent en phase 1.
 */
export interface World {
  schemaVersion: number;
  seed: string;
  rng: RngState;
  startDay: Day;
  day: Day;
  nextId: number;
  nextSeq: number;
  queue: ScheduledItem[];
  chronicle: ChronicleEntry[];
  flags: Record<string, string | number | boolean>;
  stats: { daysSimulated: number };
}

export const WORLD_SCHEMA_VERSION = 1;
