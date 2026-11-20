import type { FromWorker, ToWorker, WorldView } from './protocol';

type Listener = (m: FromWorker) => void;

/** Côté interface : envoie des commandes au worker et diffuse ses messages. */
export class SimClient {
  private worker: Worker;
  private listeners = new Set<Listener>();
  private nextRequest = 1;
  private pending = new Map<number, (r: { bytes: Uint8Array; dateLabel: string }) => void>();
  lastView: WorldView | null = null;

  constructor() {
    this.worker = new Worker(new URL('./sim.worker.ts', import.meta.url), { type: 'module' });
    this.worker.onmessage = (e: MessageEvent<FromWorker>) => {
      const m = e.data;
      if (m.type === 'vue') this.lastView = m.view;
      if (m.type === 'exporte') { this.pending.get(m.requestId)?.(m); this.pending.delete(m.requestId); }
      for (const l of this.listeners) l(m);
    };
  }

  send(m: ToWorker, transfer: Transferable[] = []): void { this.worker.postMessage(m, transfer); }

  subscribe(l: Listener): () => void { this.listeners.add(l); return () => this.listeners.delete(l); }

  exportSave(label: string): Promise<{ bytes: Uint8Array; dateLabel: string }> {
    const requestId = this.nextRequest++;
    return new Promise((resolve) => { this.pending.set(requestId, resolve); this.send({ type: 'exporter', requestId, label }); });
  }
}
