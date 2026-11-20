import temps from '../../data/balance/temps.json';
import glossaire from '../../data/guide/glossaire.json';
import traits from '../../data/regles/traits.json';
import culturesReligions from '../../data/regles/cultures-religions.json';
import noms from '../../data/regles/noms.json';
import carte from '../../data/scenarios/1066/carte.json';
import titres from '../../data/scenarios/1066/titres.json';
import dynasties from '../../data/scenarios/1066/dynasties.json';
import personnages from '../../data/scenarios/1066/personnages.json';
import {
  CarteSchema, CulturesReligionsSchema, DynastiesSchema, GlossaireSchema, NomsSchema, PersonnagesSchema,
  TempsSchema, TitresSchema, TraitsSchema,
  type Carte, type CulturesReligions, type Dynasties, type Glossaire, type Noms, type Personnages, type Temps, type Titres, type Traits,
} from './schemas';

/** Données validées. Une erreur ici bloque le démarrage avec un message clair. */
export interface GameData {
  temps: Temps; glossaire: Glossaire; traits: Traits; culturesReligions: CulturesReligions; noms: Noms;
  scenario: { carte: Carte; titres: Titres; dynasties: Dynasties; personnages: Personnages };
}

let cache: GameData | null = null;

export function loadData(): GameData {
  if (cache) return cache;
  const data: GameData = {
    temps: TempsSchema.parse(temps), glossaire: GlossaireSchema.parse(glossaire), traits: TraitsSchema.parse(traits),
    culturesReligions: CulturesReligionsSchema.parse(culturesReligions), noms: NomsSchema.parse(noms),
    scenario: {
      carte: CarteSchema.parse(carte), titres: TitresSchema.parse(titres),
      dynasties: DynastiesSchema.parse(dynasties), personnages: PersonnagesSchema.parse(personnages),
    },
  };
  checkReferences(data);
  cache = data;
  return data;
}

/** Vérifications croisées entre fichiers (références vers des identifiants existants). */
function checkReferences(d: GameData): void {
  const errs: string[] = [];
  const traitIds = new Set([...d.traits.personnalite.map((t) => t.id), ...d.traits.innes.map((t) => t.id)]);
  const cultures = new Set(d.culturesReligions.cultures.map((c) => c.id));
  const maisons = new Set(d.scenario.dynasties.flatMap((x) => x.maisons.map((m) => m.id)));
  const comtes = new Set(d.scenario.carte.comtes.map((c) => c.id));
  const titres = new Set([...d.scenario.titres.royaumes.map((k) => k.id), ...d.scenario.titres.duches.map((x) => x.id), ...[...comtes].map((c) => `c-${c}`)]);
  const persos = new Set(d.scenario.personnages.map((p) => p.id));
  for (const c of d.scenario.carte.comtes) if (!cultures.has(c.culture)) errs.push(`comté ${c.id} : culture inconnue ${c.culture}`);
  for (const k of d.scenario.titres.royaumes) for (const x of k.duches) if (!d.scenario.titres.duches.some((y) => y.id === x)) errs.push(`${k.id} : duché inconnu ${x}`);
  for (const x of d.scenario.titres.duches) for (const c of x.comtes) if (!comtes.has(c)) errs.push(`${x.id} : comté inconnu ${c}`);
  const held = new Map<string, string>();
  for (const p of d.scenario.personnages) {
    if (p.maison && !maisons.has(p.maison)) errs.push(`${p.id} : maison inconnue ${p.maison}`);
    if (!cultures.has(p.culture)) errs.push(`${p.id} : culture inconnue ${p.culture}`);
    for (const t of [...p.traits, ...(p.innes ?? [])]) if (!traitIds.has(t)) errs.push(`${p.id} : trait inconnu ${t}`);
    for (const k of ['pere', 'mere', 'conjoint', 'suzerain', 'cour'] as const) { const v = p[k]; if (v && !persos.has(v)) errs.push(`${p.id} : ${k} inconnu ${v}`); }
    for (const t of p.titres ?? []) {
      if (!titres.has(t)) errs.push(`${p.id} : titre inconnu ${t}`);
      if (held.has(t)) errs.push(`titre ${t} attribué à ${held.get(t)} et ${p.id}`); else held.set(t, p.id);
    }
  }
  if (errs.length) throw new Error(`Données incohérentes :\n- ${errs.join('\n- ')}`);
}
