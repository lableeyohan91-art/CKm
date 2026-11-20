/// <reference lib="webworker" />
import { loadData } from '../data/load';
import { addMonths, exportGame, formatDate, isFirstOfMonth, isFirstOfYear, loadGame, newGame } from './game';
import type { FromWorker, Speed, ToWorker, WorldView } from './protocol';
import type { Simulation } from '../engine/sim';

declare const self: DedicatedWorkerGlobalScope;

const data = loadData();
const TICK_MS = 50;
let sim: Simulation | null = null;
let paused = true;
let speed: Speed = 2;
let carry = 0;                 // fraction de jour reportée d'un tick à l'autre
let measured = 0;
let lastView = 0;

const post = (m: FromWorker, transfer: Transferable[] = []) => self.postMessage(m, transfer);

function view(): WorldView | null {
  if (!sim) return null;
  const w = sim.world;
  return { day: w.day, dateLabel: formatDate(w.day), paused, speed, seed: w.seed,
    daysSimulated: w.stats.daysSimulated, measuredDaysPerSec: Math.round(measured) };
}
function pushView() { const v = view(); if (v) post({ type: 'vue', view: v }); }

async function autosaveIfDue() {
  if (!sim) return;
  const mode = data.temps.sauvegardeAuto, d = sim.world.day;
  if (mode === 'aucune') return;
  if (mode === 'annuelle' ? isFirstOfYear(d) : isFirstOfMonth(d)) {
    const bytes = await exportGame(sim, 'Sauvegarde automatique');
    post({ type: 'sauvegardeAuto', bytes, dateLabel: formatDate(d) }, [bytes.buffer]);
  }
}

function runDays(n: number) {
  if (!sim) return;
  for (let i = 0; i < n; i++) { sim.step(); void autosaveIfDue(); }
}

setInterval(() => {
  if (!sim || paused) return;
  const t0 = performance.now();
  carry += (data.temps.joursParSeconde[speed - 1] as number) * TICK_MS / 1000;
  const days = Math.floor(carry); carry -= days;
  runDays(days);
  const dt = performance.now() - t0;
  if (days > 0 && dt > 0) measured = measured * 0.8 + (days / dt) * 1000 * 0.2;
  const now = performance.now();
  if (now - lastView > 100) { lastView = now; pushView(); }
}, TICK_MS);

self.onmessage = async (e: MessageEvent<ToWorker>) => {
  const m = e.data;
  try {
    switch (m.type) {
      case 'nouvelle': sim = newGame(m.seed, data).sim; paused = true; break;
      case 'charger': sim = (await loadGame(m.bytes, data)).sim; paused = true; break;
      case 'pause': paused = m.paused; break;
      case 'vitesse': speed = m.speed; break;
      case 'avancer': runDays(m.days); break;
      case 'avancerMois': if (sim) runDays(addMonths(sim.world.day, 1) - sim.world.day); break;
      case 'exporter': {
        if (!sim) throw new Error('Aucune partie en cours.');
        const bytes = await exportGame(sim, m.label);
        post({ type: 'exporte', requestId: m.requestId, bytes, dateLabel: formatDate(sim.world.day) }, [bytes.buffer]);
        break;
      }
    }
  } catch (err) {
    post({ type: 'erreur', message: err instanceof Error ? err.message : String(err) });
  }
  pushView();
};
