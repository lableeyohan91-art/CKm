import { addMonths, formatDate, fromCalendar, isFirstOfYear, isFirstOfMonth } from '../engine/calendar';
import { createWorld, Simulation } from '../engine/sim';
import { loadData, type GameData } from '../data/load';
import { decodeSave, encodeSave, toSaveFile } from '../save/format';
import type { World } from '../model/world';

/**
 * Assemble une partie : données + monde + systèmes.
 * Utilisé par le worker et par les simulations sans interface (tests, outils).
 */
export function newGame(seed: string, data: GameData = loadData()): Simulation {
  const d = data.temps.dateDeDepart;
  return build(createWorld(seed, fromCalendar(d.annee, d.mois, d.jour)));
}

export async function loadGame(bytes: Uint8Array): Promise<Simulation> {
  return build((await decodeSave(bytes)).world);
}

function build(world: World): Simulation {
  const sim = new Simulation(world);
  // Les systèmes de jeu (démographie, économie, IA…) seront enregistrés ici, phase 1.
  return sim;
}

export async function exportGame(sim: Simulation, label: string): Promise<Uint8Array> {
  return encodeSave(toSaveFile(sim.sync(), label));
}

export { addMonths, formatDate, isFirstOfMonth, isFirstOfYear };
