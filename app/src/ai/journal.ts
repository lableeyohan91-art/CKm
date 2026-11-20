/** Journal des décisions de l'IA (mode développeur). Non sauvegardé. */
export interface Decision {
  jour: number;
  acteur: number;
  action: string;
  cible?: number;
  score: number;
  raisons: { source: string; valeur: number }[];
  alternatives: { action: string; cible?: number; score: number }[];
}

export class JournalIA {
  private entries: Decision[] = [];
  constructor(private readonly max = 500, public actif = true) {}
  add(d: Decision): void { if (!this.actif) return; this.entries.push(d); if (this.entries.length > this.max) this.entries.splice(0, this.entries.length - this.max); }
  pour(acteur: number): Decision[] { return this.entries.filter((d) => d.acteur === acteur); }
  tout(): Decision[] { return [...this.entries]; }
}
