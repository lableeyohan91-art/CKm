import { openDB, type IDBPDatabase } from 'idb';

/** Emplacements de sauvegarde dans IndexedDB (fonctionne hors ligne). */
export interface SaveSlot {
  slot: string;          // « auto », « 1 », « 2 », « 3 »…
  label: string;
  savedAt: string;
  dateLabel: string;     // date dans le jeu, pour l'affichage
  bytes: Uint8Array;
}

const DB = 'ckm', STORE = 'saves';

function db(): Promise<IDBPDatabase> {
  return openDB(DB, 1, { upgrade(d) { if (!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE, { keyPath: 'slot' }); } });
}

export async function putSlot(s: SaveSlot): Promise<void> { await (await db()).put(STORE, s); }
export async function getSlot(slot: string): Promise<SaveSlot | undefined> { return (await db()).get(STORE, slot); }
export async function deleteSlot(slot: string): Promise<void> { await (await db()).delete(STORE, slot); }
export async function listSlots(): Promise<Omit<SaveSlot, 'bytes'>[]> {
  const all = (await (await db()).getAll(STORE)) as SaveSlot[];
  return all.map(({ bytes: _b, ...meta }) => meta).sort((a, b) => a.slot.localeCompare(b.slot));
}
