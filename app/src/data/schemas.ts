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

// ---------------------------------------------------------------- Règles
const skillsPartial = z.object({ dip: z.number(), gue: z.number(), ges: z.number(), int: z.number(), sav: z.number(), val: z.number() }).partial();
const axesPartial = z.record(z.string(), z.number());

export const TraitsSchema = z.object({
  axes: z.array(z.string()),
  personnalite: z.array(z.object({
    id: z.string(), nom: z.string(), oppose: z.string().nullable(), competences: skillsPartial, axes: axesPartial, description: z.string(),
  })),
  innes: z.array(z.object({
    id: z.string(), nom: z.string(), competences: skillsPartial, sante: z.number(), fertilite: z.number(), transmission: z.number().min(0).max(1), description: z.string(),
  })),
  education: z.array(z.object({ id: z.string(), nom: z.string(), competence: z.enum(['dip', 'gue', 'ges', 'int', 'sav']) })),
}).superRefine((t, ctx) => {
  const ids = new Set(t.personnalite.map((p) => p.id));
  for (const p of t.personnalite) {
    if (p.oppose && !ids.has(p.oppose)) ctx.addIssue({ code: 'custom', message: `trait ${p.id} : opposé inconnu ${p.oppose}` });
    for (const a of Object.keys(p.axes)) if (!t.axes.includes(a)) ctx.addIssue({ code: 'custom', message: `trait ${p.id} : axe inconnu ${a}` });
  }
});
export type Traits = z.infer<typeof TraitsSchema>;

export const CulturesReligionsSchema = z.object({
  cultures: z.array(z.object({ id: z.string(), nom: z.string(), groupe: z.string() })),
  religions: z.array(z.object({ id: z.string(), nom: z.string(), autorite: z.string() })),
});
export type CulturesReligions = z.infer<typeof CulturesReligionsSchema>;

export const NomsSchema = z.record(z.string(), z.object({ h: z.array(z.string()).min(3), f: z.array(z.string()).min(3), lieux: z.array(z.string()).min(3) }));
export type Noms = z.infer<typeof NomsSchema>;

// ---------------------------------------------------------------- Scénario
export const CarteSchema = z.object({
  comtes: z.array(z.object({
    id: z.string(), nom: z.string(), lat: z.number(), lon: z.number(), terrain: z.string(), developpement: z.number(),
    culture: z.string(), religion: z.string(), fort: z.number().int(), voisins: z.array(z.string()),
  })),
  liaisonsMaritimes: z.array(z.tuple([z.string(), z.string()])),
}).superRefine((c, ctx) => {
  const ids = new Set(c.comtes.map((x) => x.id));
  for (const x of c.comtes) for (const v of x.voisins) {
    if (!ids.has(v)) ctx.addIssue({ code: 'custom', message: `${x.id} : voisin inconnu ${v}` });
    else if (!c.comtes.find((y) => y.id === v)!.voisins.includes(x.id)) ctx.addIssue({ code: 'custom', message: `voisinage non réciproque : ${x.id} → ${v}` });
  }
});
export type Carte = z.infer<typeof CarteSchema>;

const law = z.enum(['partage', 'primogeniture']);
export const TitresSchema = z.object({
  royaumes: z.array(z.object({ id: z.string(), nom: z.string(), succession: law, duches: z.array(z.string()) })),
  duches: z.array(z.object({ id: z.string(), nom: z.string(), succession: law, comtes: z.array(z.string()) })),
  successionComtes: law,
});
export type Titres = z.infer<typeof TitresSchema>;

export const DynastiesSchema = z.array(z.object({
  id: z.string(), nom: z.string(), maisons: z.array(z.object({ id: z.string(), nom: z.string(), parent: z.string().optional() })),
}));
export type Dynasties = z.infer<typeof DynastiesSchema>;

export const PersonnagesSchema = z.array(z.object({
  id: z.string(), prenom: z.string(), surnom: z.string().optional(), maison: z.string().nullable(), sexe: z.enum(['h', 'f']),
  naissance: z.number().int(), incertain: z.boolean().optional(), pere: z.string().optional(), mere: z.string().optional(),
  batard: z.boolean().optional(), conjoint: z.string().optional(), traits: z.array(z.string()), innes: z.array(z.string()).optional(),
  culture: z.string(), titres: z.array(z.string()).optional(), suzerain: z.string().optional(), cour: z.string().optional(),
  clerc: z.boolean().optional(), competences: skillsPartial.optional(),
  revendications: z.array(z.object({ titre: z.string(), forte: z.boolean(), origine: z.string() })).optional(),
}));
export type Personnages = z.infer<typeof PersonnagesSchema>;
