/// <reference lib="webworker" />
import { loadData } from '../data/load';
import { toCalendar } from '../engine/calendar';
import { addMonths, exportGame, formatDate, isFirstOfMonth, isFirstOfYear, loadGame, newGame, type Partie } from './game';
import type { Demande, FromWorker, Speed, ToWorker, WorldView } from './protocol';
import { resume, vueCarte, vueChronique, vueDynastie, vueFiche, vueIA, vueJouables, vueStats } from './vues';

declare const self: DedicatedWorkerGlobalScope;

const data = loadData();
const TICK_MS = 50;
let partie: Partie | null = null;
let paused = true;
let speed: Speed = 2;
let carry = 0;
let measured = 0;
let lastView = 0;
let notifLues = 0;          // nombre de notifications déjà vues par le joueur
let importantesVues = 0;    // pour la pause automatique

const post = (m: FromWorker, transfer: Transferable[] = []) => self.postMessage(m, transfer);

function view(): WorldView | null {
  if (!partie) return null;
  const w = partie.sim.world;
  const c = toCalendar(w.day);
  const j = w.joueurId !== null ? w.personnages[w.joueurId] : undefined;
  return {
    day: w.day, dateLabel: formatDate(w.day), mois: c.year * 12 + c.month, paused, speed, seed: w.seed,
    daysSimulated: w.stats.daysSimulated, measuredDaysPerSec: Math.round(measured),
    joueur: j ? resume(w, j) : null, enCours: w.flags.enCours === true, notifNonLues: Math.max(0, w.notifications.length - notifLues),
    ...(w.finDePartie ? { finDePartie: w.finDePartie } : {}), vivants: w.vivants.length,
  };
}
function pushView() { const v = view(); if (v) post({ type: 'vue', view: v }); }

async function autosaveIfDue() {
  if (!partie || partie.sim.world.flags.enCours !== true) return;
  const mode = data.temps.sauvegardeAuto, d = partie.sim.world.day;
  if (mode === 'aucune') return;
  if (mode === 'annuelle' ? isFirstOfYear(d) : isFirstOfMonth(d)) {
    const bytes = await exportGame(partie.sim, 'Sauvegarde automatique');
    post({ type: 'sauvegardeAuto', bytes, dateLabel: formatDate(d) }, [bytes.buffer]);
  }
}

/** Avance de n jours ; s'arrête et met en pause si un événement important concerne le joueur. */
function runDays(n: number) {
  if (!partie) return;
  const w = partie.sim.world;
  for (let i = 0; i < n; i++) {
    partie.sim.step(); void autosaveIfDue();
    const imp = w.notifications.filter((x) => x.important).length;
    if (imp > importantesVues || w.finDePartie) {
      importantesVues = imp;
      const last = [...w.notifications].reverse().find((x) => x.important);
      paused = true;
      if (last) post({ type: 'alerte', texte: last.texte });
      break;
    }
  }
}

function repondre(d: Demande): unknown {
  if (!partie) return null;
  switch (d.quoi) {
    case 'carte': return vueCarte(partie);
    case 'fiche': return vueFiche(partie, d.id);
    case 'jouables': return vueJouables(partie);
    case 'dynastie': return vueDynastie(partie, d.id);
    case 'chronique': return vueChronique(partie, d.filtre);
    case 'notifications': { const w = partie.sim.world; return [...w.notifications].reverse().map((n) => ({ ...n, date: formatDate(n.jour) })); }
    case 'ia': return vueIA(partie, d.id);
    case 'stats': return vueStats(partie);
  }
}

function demarrer(p: Partie) {
  partie = p; paused = true; carry = 0;
  notifLues = p.sim.world.notifications.length;
  importantesVues = p.sim.world.notifications.filter((x) => x.important).length;
}

setInterval(() => {
  if (!partie || paused || partie.sim.world.flags.enCours !== true) return;
  const t0 = performance.now();
  carry += (data.temps.joursParSeconde[speed - 1] as number) * TICK_MS / 1000;
  const days = Math.floor(carry); carry -= days;
  runDays(days);
  const dt = performance.now() - t0;
  if (days > 0 && dt > 0) measured = measured * 0.8 + (days / dt) * 1000 * 0.2;
  const now = performance.now();
  if (now - lastView > 100 || paused) { lastView = now; pushView(); }
}, TICK_MS);

self.onmessage = async (e: MessageEvent<ToWorker>) => {
  const m = e.data;
  try {
    switch (m.type) {
      case 'nouvelle': demarrer(newGame(m.seed, data)); break;
      case 'charger': demarrer(await loadGame(m.bytes, data)); break;
      case 'pause': paused = m.paused; break;
      case 'vitesse': speed = m.speed; break;
      case 'avancer': runDays(m.days); break;
      case 'avancerMois': if (partie) runDays(addMonths(partie.sim.world.day, 1) - partie.sim.world.day); break;
      case 'incarner': {
        if (!partie) break;
        const w = partie.sim.world;
        w.joueurId = m.id; w.flags.enCours = true; delete w.finDePartie;
        notifLues = w.notifications.length; importantesVues = w.notifications.filter((x) => x.important).length;
        break;
      }
      case 'notificationsLues': if (partie) notifLues = partie.sim.world.notifications.length; break;
      case 'exporter': {
        if (!partie) throw new Error('Aucune partie en cours.');
        const bytes = await exportGame(partie.sim, m.label);
        post({ type: 'exporte', requestId: m.requestId, bytes, dateLabel: formatDate(partie.sim.world.day) }, [bytes.buffer]);
        break;
      }
      case 'demande': post({ type: 'reponse', requestId: m.requestId, data: repondre(m.demande) }); return;
    }
  } catch (err) {
    post({ type: 'erreur', message: err instanceof Error ? err.message : String(err) });
  }
  pushView();
};
