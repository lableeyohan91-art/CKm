import temps from '../../data/balance/temps.json';
import glossaire from '../../data/guide/glossaire.json';
import { GlossaireSchema, TempsSchema, type Glossaire, type Temps } from './schemas';

/** Données validées. Une erreur ici bloque le démarrage avec un message clair. */
export interface GameData { temps: Temps; glossaire: Glossaire }

export function loadData(): GameData {
  return { temps: TempsSchema.parse(temps), glossaire: GlossaireSchema.parse(glossaire) };
}
