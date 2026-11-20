import { WORLD_SCHEMA_VERSION, type World } from '../model/world';

/**
 * Format de sauvegarde, versionné. À chaque changement incompatible du monde :
 * 1. incrémenter WORLD_SCHEMA_VERSION ;
 * 2. ajouter la migration « ancienne version → nouvelle » dans MIGRATIONS ;
 * 3. ajouter un test de migration.
 */
export interface SaveFile {
  format: 'ckm-save';
  schemaVersion: number;
  savedAt: string;      // métadonnée uniquement, n'influence pas la simulation
  label: string;
  world: World;
}

export type Migration = (world: Record<string, unknown>) => Record<string, unknown>;

/** Clé = version de départ. MIGRATIONS[1] transforme une sauvegarde v1 en v2. */
export const MIGRATIONS: Record<number, Migration> = {
  1: () => { throw new SaveError("Sauvegarde de la version d'essai 0.0.1 (monde vide) : elle ne peut pas être reprise. Commencez une nouvelle partie."); },
};

export class SaveError extends Error {}

export function migrate(raw: unknown, migrations: Record<number, Migration> = MIGRATIONS,
  target: number = WORLD_SCHEMA_VERSION): SaveFile {
  if (!raw || typeof raw !== 'object' || (raw as SaveFile).format !== 'ckm-save') {
    throw new SaveError("Ce fichier n'est pas une sauvegarde du jeu.");
  }
  const save = raw as SaveFile;
  let v = save.schemaVersion;
  if (v > target) throw new SaveError(`Sauvegarde créée par une version plus récente du jeu (v${v}).`);
  let world = save.world as unknown as Record<string, unknown>;
  while (v < target) {
    const m = migrations[v];
    if (!m) throw new SaveError(`Aucune migration depuis la version ${v}.`);
    try { world = m(world); } catch (e) { throw e instanceof SaveError ? e : new SaveError(`Migration v${v} impossible : ${String(e)}`); }
    v++;
    world.schemaVersion = v;
  }
  return { ...save, schemaVersion: v, world: world as unknown as World };
}

export function toSaveFile(world: World, label: string, now = new Date()): SaveFile {
  return { format: 'ckm-save', schemaVersion: world.schemaVersion, savedAt: now.toISOString(), label,
    world: structuredClone(world) };
}

async function pipe(data: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const out = new Blob([data]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(out).arrayBuffer());
}

/** Sauvegarde → octets compressés (gzip). */
export async function encodeSave(save: SaveFile): Promise<Uint8Array> {
  return pipe(new TextEncoder().encode(JSON.stringify(save)), new CompressionStream('gzip'));
}

/** Octets (compressés ou JSON brut) → sauvegarde migrée à la version courante. */
export async function decodeSave(bytes: Uint8Array): Promise<SaveFile> {
  let text: string;
  if (bytes[0] === 0x1f && bytes[1] === 0x8b) text = new TextDecoder().decode(await pipe(bytes, new DecompressionStream('gzip')));
  else text = new TextDecoder().decode(bytes);
  let raw: unknown;
  try { raw = JSON.parse(text); } catch { throw new SaveError('Fichier de sauvegarde illisible.'); }
  return migrate(raw);
}
