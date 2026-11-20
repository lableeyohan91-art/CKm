/**
 * File de priorité (tas binaire) pour les événements datés.
 * À date égale, l'ordre d'insertion est conservé : indispensable au déterminisme.
 */
export interface Dated { day: number; seq: number }

export class DatedQueue<T extends Dated> {
  private items: T[] = [];

  constructor(initial: T[] = []) { for (const it of initial) this.push(it); }

  get size(): number { return this.items.length; }

  private less(a: T, b: T): boolean { return a.day < b.day || (a.day === b.day && a.seq < b.seq); }

  push(item: T): void {
    const h = this.items; h.push(item);
    let i = h.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (!this.less(h[i] as T, h[p] as T)) break;
      [h[i], h[p]] = [h[p] as T, h[i] as T]; i = p;
    }
  }

  peek(): T | undefined { return this.items[0]; }

  pop(): T | undefined {
    const h = this.items;
    if (h.length === 0) return undefined;
    const top = h[0] as T, last = h.pop() as T;
    if (h.length > 0) {
      h[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1; let m = i;
        if (l < h.length && this.less(h[l] as T, h[m] as T)) m = l;
        if (r < h.length && this.less(h[r] as T, h[m] as T)) m = r;
        if (m === i) break;
        [h[i], h[m]] = [h[m] as T, h[i] as T]; i = m;
      }
    }
    return top;
  }

  /** Retire tous les éléments dus au plus tard à `day`, dans l'ordre. */
  popDue(day: number): T[] {
    const out: T[] = [];
    while (this.items.length > 0 && (this.items[0] as T).day <= day) out.push(this.pop() as T);
    return out;
  }

  /** Copie triée, pour la sauvegarde. */
  toArray(): T[] { return [...this.items].sort((a, b) => a.day - b.day || a.seq - b.seq); }
}
