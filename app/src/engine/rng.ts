/**
 * Générateur pseudo-aléatoire déterministe (sfc32).
 * Tout le hasard du jeu passe par ici : jamais Math.random dans la simulation.
 * L'état (4 entiers 32 bits) est sauvegardé avec la partie.
 */
export type RngState = [number, number, number, number];

/** Transforme une graine texte en état initial (hachage cyrb128). */
export function seedState(seed: string): RngState {
  let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
  for (let i = 0; i < seed.length; i++) {
    const k = seed.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return [(h1 ^ h2 ^ h3 ^ h4) >>> 0, (h2 ^ h1) >>> 0, (h3 ^ h1) >>> 0, (h4 ^ h1) >>> 0];
}

export class Rng {
  private a: number; private b: number; private c: number; private d: number;

  constructor(state: RngState) {
    [this.a, this.b, this.c, this.d] = state;
    // quelques tours à vide pour bien mélanger un état neuf
    for (let i = 0; i < 12; i++) this.nextUint32();
  }

  static fromSeed(seed: string): Rng { return new Rng(seedState(seed)); }

  /** Reprend exactement un état sauvegardé (sans tours à vide). */
  static restore(state: RngState): Rng {
    const r = Object.create(Rng.prototype) as Rng;
    [r.a, r.b, r.c, r.d] = state;
    return r;
  }

  getState(): RngState { return [this.a, this.b, this.c, this.d]; }

  nextUint32(): number {
    this.a >>>= 0; this.b >>>= 0; this.c >>>= 0; this.d >>>= 0;
    let t = (this.a + this.b) | 0;
    this.a = this.b ^ (this.b >>> 9);
    this.b = (this.c + (this.c << 3)) | 0;
    this.c = (this.c << 21) | (this.c >>> 11);
    this.d = (this.d + 1) | 0;
    t = (t + this.d) | 0;
    this.c = (this.c + t) | 0;
    return t >>> 0;
  }

  /** Réel dans [0, 1[. */
  next(): number { return this.nextUint32() / 4294967296; }

  /** Entier dans [min, max] (bornes incluses). */
  int(min: number, max: number): number { return min + Math.floor(this.next() * (max - min + 1)); }

  /** Vrai avec la probabilité p (0 à 1). */
  chance(p: number): boolean { return this.next() < p; }

  pick<T>(items: readonly T[]): T {
    if (items.length === 0) throw new Error('pick() sur une liste vide');
    return items[Math.floor(this.next() * items.length)] as T;
  }

  /** Tirage pondéré : jamais uniforme si les poids diffèrent. Poids ≤ 0 ignorés. */
  weighted<T>(items: readonly T[], weight: (item: T) => number): T | undefined {
    let total = 0;
    for (const it of items) { const w = weight(it); if (w > 0) total += w; }
    if (total <= 0) return undefined;
    let roll = this.next() * total;
    for (const it of items) {
      const w = weight(it);
      if (w <= 0) continue;
      roll -= w;
      if (roll < 0) return it;
    }
    return items[items.length - 1];
  }

  /** Loi normale approchée (Box-Muller), utile pour les compétences innées. */
  normal(mean: number, sd: number): number {
    const u = Math.max(this.next(), 1e-12), v = this.next();
    return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
}
