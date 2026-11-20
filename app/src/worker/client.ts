import type { Demande, FromWorker, ToWorker, WorldView } from './protocol';

type Listener = (m: FromWorker) => void;

/** Côté interface : envoie des commandes au worker et diffuse ses messages. */
export class SimClient {
  private worker: Worker;
  private listeners = new Set<Listener>();
  private nextRequest = 1;
  private pending = new Map<number, (r: unknown) => void>();
  lastView: WorldView | null = null;

  constructor() {
    this.worker = new Worker(new URL('./sim.worker.ts', import.meta.url), { type: 'module' });
    this.worker.onmessage = (e: MessageEvent<FromWorker>) => {
      const m = e.data;
      if (m.type === 'vue') this.lastView = m.view;
      if (m.type === 'exporte' || m.type === 'reponse') {
        this.pending.get(m.requestId)?.(m.type === 'exporte' ? m : m.data); this.pending.delete(m.requestId);
      }
      for (const l of this.listeners) l(m);
    };
  }

  send(m: ToWorker, transfer: Transferable[] = []): void { this.worker.postMessage(m, transfer); }

  subscribe(l: Listener): () => void { this.listeners.add(l); return () => this.listeners.delete(l); }

  demander<T>(demande: Demande): Promise<T> {
    const requestId = this.nextRequest++;
    return new Promise((resolve) => { this.pending.set(requestId, resolve as (r: unknown) => void); this.send({ type: 'demande', requestId, demande }); });
  }

  exportSave(label: string): Promise<{ bytes: Uint8Array; dateLabel: string }> {
    const requestId = this.nextRequest++;
    return new Promise((resolve) => { this.pending.set(requestId, resolve as (r: unknown) => void); this.send({ type: 'exporter', requestId, label }); });
  }
}
