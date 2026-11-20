import { z } from 'zod';

/** Schémas des fichiers de données : ils documentent le format et refusent les erreurs au chargement. */
export const TempsSchema = z.object({
  joursParSeconde: z.array(z.number().positive()).length(5),
  sauvegardeAuto: z.enum(['mensuelle', 'annuelle', 'aucune']),
  dateDeDepart: z.object({ annee: z.number().int(), mois: z.number().int().min(1).max(12), jour: z.number().int().min(1).max(31) }),
});
export type Temps = z.infer<typeof TempsSchema>;

export const GlossaireSchema = z.array(z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  titre: z.string().min(1),
  texte: z.string().min(1),
  voirAussi: z.array(z.string()),
})).superRefine((entries, ctx) => {
  const ids = new Set(entries.map((e) => e.id));
  if (ids.size !== entries.length) ctx.addIssue({ code: 'custom', message: 'identifiant en double dans le glossaire' });
  for (const e of entries) for (const v of e.voirAussi) {
    if (!ids.has(v)) ctx.addIssue({ code: 'custom', message: `« ${e.id} » renvoie vers « ${v} », qui n'existe pas` });
  }
});
export type Glossaire = z.infer<typeof GlossaireSchema>;
