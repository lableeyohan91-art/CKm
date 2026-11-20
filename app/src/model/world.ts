import type { Day } from '../engine/calendar';
import type { RngState } from '../engine/rng';
import type { Character, County, Dynasty, House, Notification, Relation, Title } from './entities';

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
  stats: { daysSimulated: number; naissances: number; deces: number; mariages: number; successions: number };

  // --- Phase 1 : monde vivant ---
  personnages: Record<number, Character>;
  vivants: number[];                      // identifiants des vivants, ordre croissant
  dynasties: Record<string, Dynasty>;
  maisons: Record<string, House>;
  titres: Record<string, Title>;
  comtes: Record<string, County>;
  relations: Relation[];
  joueurId: number | null;                // null : mode observateur
  finDePartie?: string;
  notifications: Notification[];
}

/** v1 : version d'essai 0.0.1 (monde vide). v2 : monde vivant (phase 1). */
export const WORLD_SCHEMA_VERSION = 2;
