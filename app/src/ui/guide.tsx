import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Glossaire } from '../data/schemas';

/**
 * Accompagnement du joueur.
 * - <Explain id="…"/> : bouton « i » qui ouvre une explication du glossaire.
 * - expliquer(titre, contenu) : ouvre une explication calculée (détail d'une valeur).
 * - <Tip id="…"> : conseil affiché la première fois, puis masqué.
 */
interface Feuille { titre: string; contenu: ReactNode; voirAussi?: string[] }
interface GuideApi { open(id: string): void; expliquer(titre: string, contenu: ReactNode, voirAussi?: string[]): void }
const GuideCtx = createContext<GuideApi>({ open: () => {}, expliquer: () => {} });
export const useGuide = () => useContext(GuideCtx);

export function GuideProvider({ glossaire, children }: { glossaire: Glossaire; children: ReactNode }) {
  const [feuille, setFeuille] = useState<Feuille | null>(null);
  const open = (id: string) => {
    const e = glossaire.find((g) => g.id === id);
    if (e) setFeuille({ titre: e.titre, contenu: <p>{e.texte}</p>, voirAussi: e.voirAussi });
  };
  useEffect(() => {
    if (!feuille) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setFeuille(null); };
    addEventListener('keydown', onKey); return () => removeEventListener('keydown', onKey);
  }, [feuille]);
  return (
    <GuideCtx.Provider value={{ open, expliquer: (titre, contenu, voirAussi) => setFeuille({ titre, contenu, ...(voirAussi ? { voirAussi } : {}) }) }}>
      {children}
      {feuille && (
        <div className="sheet-backdrop" onClick={() => setFeuille(null)}>
          <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title" onClick={(e) => e.stopPropagation()}>
            <h3 id="sheet-title">{feuille.titre}</h3>
            {feuille.contenu}
            {!!feuille.voirAussi?.length && (
              <div className="see"><span className="muted">Voir aussi :</span>
                {feuille.voirAussi.map((v) => (
                  <button key={v} className="btn" onClick={() => open(v)}>{glossaire.find((g) => g.id === v)?.titre ?? v}</button>
                ))}
              </div>
            )}
            <div className="actions" style={{ marginTop: 14 }}><button className="btn primary" onClick={() => setFeuille(null)} autoFocus>Compris</button></div>
          </div>
        </div>
      )}
    </GuideCtx.Provider>
  );
}

export function Explain({ id, label }: { id: string; label?: string }) {
  const { open } = useGuide();
  return <button className="info" aria-label={`Explication : ${label ?? id}`} onClick={(e) => { e.stopPropagation(); open(id); }}>i</button>;
}

const seenKey = (id: string) => `ckm.conseil.${id}`;
function readSeen(id: string): boolean { try { return localStorage.getItem(seenKey(id)) === '1'; } catch { return false; } }
function writeSeen(id: string) { try { localStorage.setItem(seenKey(id), '1'); } catch { /* stockage indisponible */ } }

export function Tip({ id, children }: { id: string; children: ReactNode }) {
  const [hidden, setHidden] = useState(() => readSeen(id));
  if (hidden) return null;
  return (
    <aside className="tip" aria-label="Conseil">
      <span className="seal" aria-hidden="true">✦</span>
      <div>{children}<button className="btn" onClick={() => { writeSeen(id); setHidden(true); }}>J'ai compris</button></div>
    </aside>
  );
}
