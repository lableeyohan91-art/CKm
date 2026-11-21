/** Messages échangés entre l'interface et le worker de simulation. */
import type { PersoResume } from './vues';

export type Speed = 1 | 2 | 3 | 4 | 5;

export type Demande =
  | { quoi: 'carte' } | { quoi: 'fiche'; id: number } | { quoi: 'jouables' } | { quoi: 'dynastie'; id: number }
  | { quoi: 'chronique'; filtre: 'tout' | 'joueur' } | { quoi: 'notifications' } | { quoi: 'ia'; id?: number } | { quoi: 'stats' }
  | { quoi: 'interactions'; cible: number } | { quoi: 'evaluer'; id: string; cible: number; params: Record<string, string | number | boolean> }
  | { quoi: 'propositions' };

export type ToWorker =
  | { type: 'nouvelle'; seed: string }
  | { type: 'charger'; bytes: Uint8Array }
  | { type: 'pause'; paused: boolean }
  | { type: 'vitesse'; speed: Speed }
  | { type: 'avancer'; days: number }
  | { type: 'avancerMois' }
  | { type: 'incarner'; id: number | null }
  | { type: 'notificationsLues' }
  | { type: 'exporter'; requestId: number; label: string }
  | { type: 'demande'; requestId: number; demande: Demande }
  | { type: 'interagir'; requestId: number; id: string; cible: number; params: Record<string, string | number | boolean> }
  | { type: 'repondre'; requestId: number; proposition: number; accepte: boolean };

/** Vue envoyée à l'interface : jamais l'état complet, seulement ce qu'il faut afficher. */
export interface WorldView {
  day: number;
  dateLabel: string;
  /** change chaque mois : l'interface recharge alors la carte */
  mois: number;
  paused: boolean;
  speed: Speed;
  seed: string;
  daysSimulated: number;
  measuredDaysPerSec: number;
  joueur: PersoResume | null;
  /** une partie a commencé (personnage choisi ou mode observateur) */
  enCours: boolean;
  notifNonLues: number;
  propositions: number;
  finDePartie?: string;
  vivants: number;
}

export type FromWorker =
  | { type: 'vue'; view: WorldView }
  | { type: 'exporte'; requestId: number; bytes: Uint8Array; dateLabel: string }
  | { type: 'reponse'; requestId: number; data: unknown }
  | { type: 'sauvegardeAuto'; bytes: Uint8Array; dateLabel: string }
  | { type: 'alerte'; texte: string }
  | { type: 'erreur'; message: string };
