/** Messages échangés entre l'interface et le worker de simulation. */

export type Speed = 1 | 2 | 3 | 4 | 5;

export type ToWorker =
  | { type: 'nouvelle'; seed: string }
  | { type: 'charger'; bytes: Uint8Array }
  | { type: 'pause'; paused: boolean }
  | { type: 'vitesse'; speed: Speed }
  | { type: 'avancer'; days: number }
  | { type: 'avancerMois' }
  | { type: 'exporter'; requestId: number; label: string };

/** Vue envoyée à l'interface : jamais l'état complet, seulement ce qu'il faut afficher. */
export interface WorldView {
  day: number;
  dateLabel: string;
  paused: boolean;
  speed: Speed;
  seed: string;
  daysSimulated: number;
  /** jours simulés par seconde réelle, mesurés (mode développeur) */
  measuredDaysPerSec: number;
}

export type FromWorker =
  | { type: 'vue'; view: WorldView }
  | { type: 'exporte'; requestId: number; bytes: Uint8Array; dateLabel: string }
  | { type: 'sauvegardeAuto'; bytes: Uint8Array; dateLabel: string }
  | { type: 'erreur'; message: string };
