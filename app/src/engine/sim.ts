import { isFirstOfMonth, isFirstOfYear, type Day } from './calendar';
import { DatedQueue } from './heap';
import { Rng, seedState } from './rng';
import { WORLD_SCHEMA_VERSION, type ChronicleEntry, type ScheduledItem, type World } from '../model/world';

export type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

/** Contexte passé aux systèmes et aux gestionnaires : seule porte d'accès au monde. */
export interface SimContext {
  readonly world: World;
  readonly rng: Rng;
  readonly day: Day;
  schedule(day: Day, kind: string, payload?: Record<string, unknown>): void;
  newId(): number;
  chronicle(entry: Omit<ChronicleEntry, 'day'>): void;
}

export interface System {
  id: string;
  frequency: Frequency;
  run(ctx: SimContext): void;
}

export type Handler = (ctx: SimContext, payload: Record<string, unknown>) => void;

export function createWorld(seed: string, startDay: Day = 0): World {
  return {
    schemaVersion: WORLD_SCHEMA_VERSION,
    seed,
    rng: new Rng(seedState(seed)).getState(),
    startDay,
    day: startDay,
    nextId: 1,
    nextSeq: 1,
    queue: [],
    chronicle: [],
    flags: {},
    stats: { daysSimulated: 0, naissances: 0, deces: 0, mariages: 0, successions: 0 },
    personnages: {}, vivants: [], dynasties: {}, maisons: {}, titres: {}, comtes: {}, relations: [],
    joueurId: null, notifications: [],
    conseils: {}, alliances: [], prets: [], propositions: [],
    guerres: [], armees: [], treves: [], occupations: {},
  };
}

/**
 * Moteur de simulation : fait avancer le monde jour par jour.
 * Ordre d'un jour : (1) traitements datés dus, (2) systèmes quotidiens,
 * (3) hebdomadaires, (4) mensuels le 1er du mois, (5) annuels le 1er janvier.
 * L'ordre d'enregistrement des systèmes est l'ordre d'exécution (déterminisme).
 */
export class Simulation {
  readonly world: World;
  readonly rng: Rng;
  private readonly queue: DatedQueue<ScheduledItem>;
  private readonly systems: System[] = [];
  private readonly handlers = new Map<string, Handler>();
  private readonly ctx: SimContext;

  constructor(world: World) {
    this.world = world;
    this.rng = Rng.restore(world.rng);
    this.queue = new DatedQueue(world.queue);
    const sim = this;
    this.ctx = {
      get world() { return sim.world; },
      get rng() { return sim.rng; },
      get day() { return sim.world.day; },
      schedule: (day, kind, payload = {}) => {
        if (day <= sim.world.day) day = sim.world.day + 1; // jamais dans le passé ni le jour même
        sim.queue.push({ day, seq: sim.world.nextSeq++, kind, payload });
      },
      newId: () => sim.world.nextId++,
      chronicle: (entry) => { sim.world.chronicle.push({ day: sim.world.day, ...entry }); },
    };
  }

  addSystem(system: System): this {
    if (this.systems.some((s) => s.id === system.id)) throw new Error(`Système en double : ${system.id}`);
    this.systems.push(system);
    return this;
  }

  on(kind: string, handler: Handler): this {
    if (this.handlers.has(kind)) throw new Error(`Gestionnaire en double : ${kind}`);
    this.handlers.set(kind, handler);
    return this;
  }

  get context(): SimContext { return this.ctx; }

  /** Avance d'un jour. */
  step(): void {
    const w = this.world;
    w.day++;
    w.stats.daysSimulated++;
    for (const item of this.queue.popDue(w.day)) {
      const h = this.handlers.get(item.kind);
      if (!h) throw new Error(`Aucun gestionnaire pour « ${item.kind} »`);
      h(this.ctx, item.payload);
    }
    const weekly = w.day % 7 === 0, monthly = isFirstOfMonth(w.day), yearly = monthly && isFirstOfYear(w.day);
    for (const s of this.systems) {
      if (s.frequency === 'daily' || (s.frequency === 'weekly' && weekly)
        || (s.frequency === 'monthly' && monthly) || (s.frequency === 'yearly' && yearly)) s.run(this.ctx);
    }
  }

  /** Avance de n jours. */
  advance(days: number): void { for (let i = 0; i < days; i++) this.step(); }

  /** Avance jusqu'à une date (incluse). */
  advanceTo(day: Day): void { while (this.world.day < day) this.step(); }

  /** Recopie l'état vivant (RNG, file) dans le monde, avant sauvegarde. */
  sync(): World {
    this.world.rng = this.rng.getState();
    this.world.queue = this.queue.toArray();
    return this.world;
  }
}
