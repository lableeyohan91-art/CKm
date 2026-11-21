import { addMonths, formatDate, isFirstOfMonth, isFirstOfYear } from '../engine/calendar';
import { Simulation } from '../engine/sim';
import { loadData, type GameData } from '../data/load';
import { decodeSave, encodeSave, toSaveFile } from '../save/format';
import type { World } from '../model/world';
import { buildRegles, type Regles } from '../rules/regles';
import { construireMonde } from '../scenario/build';
import { systemesDemographie } from '../systems/demographie';
import { systemesEconomie } from '../systems/economie';
import { systemesRelations } from '../systems/relations';
import { systemesLiens } from '../systems/liens';
import { systemeIA } from '../ai/ia';
import { JournalIA } from '../ai/journal';

export interface Partie { sim: Simulation; regles: Regles; journal: JournalIA }

/**
 * Assemble une partie : données + monde + systèmes.
 * Utilisé par le worker et par les simulations sans interface (tests, outils).
 * L'ordre d'enregistrement des systèmes fait partie des règles (déterminisme).
 */
export function newGame(seed: string, data: GameData = loadData()): Partie {
  return build(construireMonde(seed, data), data);
}

export async function loadGame(bytes: Uint8Array, data: GameData = loadData()): Promise<Partie> {
  return build((await decodeSave(bytes)).world, data);
}

export function build(world: World, data: GameData = loadData()): Partie {
  const sim = new Simulation(world);
  const regles = buildRegles(data);
  const journal = new JournalIA();
  systemesDemographie(sim, regles);
  systemesEconomie(sim);
  systemesRelations(sim, regles);
  systemesLiens(sim, regles);
  systemeIA(sim, regles, journal);
  return { sim, regles, journal };
}

export async function exportGame(sim: Simulation, label: string): Promise<Uint8Array> {
  return encodeSave(toSaveFile(sim.sync(), label));
}

export { addMonths, formatDate, isFirstOfMonth, isFirstOfYear };
