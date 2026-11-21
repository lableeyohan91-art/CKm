import type { Day } from '../engine/calendar';

export type SkillId = 'dip' | 'gue' | 'ges' | 'int' | 'sav' | 'val';
export const SKILLS: SkillId[] = ['dip', 'gue', 'ges', 'int', 'sav', 'val'];
export const SKILL_NAMES: Record<SkillId, string> = {
  dip: 'Diplomatie', gue: 'Guerre', ges: 'Gestion', int: 'Intrigue', sav: 'Savoir', val: 'Vaillance',
};
export type Skills = Record<SkillId, number>;
export type Sex = 'h' | 'f';
export type Rank = 'comte' | 'duche' | 'royaume';
export const RANK_VALUE: Record<Rank, number> = { comte: 1, duche: 2, royaume: 3 };
export type SuccessionLaw = 'partage' | 'primogeniture';

/** Avis personnel daté d'un personnage sur un autre (ex. « m'a offert un cadeau »). */
export interface OpinionMod { cible: number; valeur: number; jusqua?: Day; raison: string }

export type MemoryKind = 'mort-proche' | 'mariage' | 'cadeau-recu' | 'desherite' | 'heritage' | 'naissance-enfant' | 'veuvage'
  | 'fiancailles' | 'titre-recu' | 'spolie' | 'emprisonne' | 'libere' | 'exil' | 'execution' | 'amitie' | 'reconciliation' | 'pupille' | 'conseil' | 'pret' | 'trahison';
/** Souvenir : base des conséquences à long terme et des explications. */
export interface Memory { type: MemoryKind; jour: Day; autre?: number; intensite: number; texte: string }

export interface Character {
  id: number;
  cle?: string;                 // identifiant des données historiques
  prenom: string;
  surnom?: string;
  maisonId: string | null;
  dynastieId: string | null;
  sexe: Sex;
  naissance: Day;
  deces?: Day;
  horsScene?: Day;              // a quitté la simulation détaillée (sans lien avec une famille titrée)
  causeDeces?: string;
  incertain?: boolean;          // date ou filiation historiquement incertaine
  pereId?: number;
  mereId?: number;
  batard?: boolean;
  conjointId?: number;
  anciensConjoints: number[];
  enfants: number[];
  cultureId: string;
  religionId: string;
  competences: Skills;          // base (innée + éducation)
  traits: string[];             // personnalité + innés + éducation
  sante: number;                // 0–10, 5 = normal
  malade?: boolean;
  tension: number;
  prestige: number;
  piete: number;
  or: number;
  titres: string[];
  suzerainId?: number;          // seigneur (pour les détenteurs de titres)
  courId?: number;              // seigneur chez qui il vit (non titrés)
  clerc?: boolean;              // vœux religieux : ni mariage ni héritage
  enceinte?: { pereId: number; terme: Day };
  matrilineaire?: boolean;      // mariage : les enfants prennent la maison de la mère
  fianceId?: number;            // fiançailles : mariage automatique à la majorité des deux
  fiancesMatrilineaire?: boolean;
  tuteurId?: number;            // précepteur d'un enfant : oriente son éducation
  educationVoulue?: SkillId;    // orientation choisie par le parent
  prisonnierDe?: number;        // geôlier

  opinions: OpinionMod[];
  memoires: Memory[];
  ambition?: string;
  portrait: number;             // graine du portrait généré
}

export interface Dynasty { id: string; nom: string; maisons: string[]; gloire: number }
export interface House { id: string; nom: string; dynastieId: string; parentId?: string; fondateurId?: number }

export interface Title {
  id: string;
  nom: string;
  rang: Rank;
  comteId?: string;              // pour un titre de comté
  parentDeJure?: string;         // duché d'un comté, royaume d'un duché
  titulaireId?: number;
  succession: SuccessionLaw;
  historique: { id: number; de: Day; a?: Day }[];
}

export interface County {
  id: string;
  nom: string;
  lat: number; lon: number;
  terrain: string;
  developpement: number;
  cultureId: string;
  religionId: string;
  fort: number;
  voisins: string[];
  controle: number;              // 0–100
  mecontentement: number;        // 0–100
}

export type RelationKind = 'ami' | 'rival';
export interface Relation { a: number; b: number; type: RelationKind; depuis: Day }

export interface Notification { jour: Day; texte: string; important: boolean; persos?: number[] }

export type Poste = 'chancelier' | 'marechal' | 'intendant' | 'espion' | 'chapelain';
export const POSTES: Poste[] = ['chancelier', 'marechal', 'intendant', 'espion', 'chapelain'];
export const POSTE_NOMS: Record<Poste, string> = { chancelier: 'Chancelier', marechal: 'Maréchal', intendant: 'Intendant', espion: 'Maître-espion', chapelain: 'Chapelain' };
export const POSTE_COMPETENCE: Record<Poste, SkillId> = { chancelier: 'dip', marechal: 'gue', intendant: 'ges', espion: 'int', chapelain: 'sav' };

export interface Alliance { a: number; b: number; depuis: Day }
export interface Pret { id: number; creancier: number; debiteur: number; montant: number; echeance: Day }
/** Proposition faite au joueur par un autre personnage, en attente de réponse. */
export interface Proposition { id: number; jour: Day; jusqua: Day; interaction: string; acteur: number; cible: number; params: Record<string, string | number | boolean>; texte: string }
