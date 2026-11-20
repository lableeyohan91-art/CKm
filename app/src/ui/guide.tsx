import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Glossaire } from '../data/schemas';

/**
 * Accompagnement du joueur.
 * - <Explain id="…"/> : bouton « i » qui ouvre une explication du glossaire (toucher ou clavier).
 * - <Tip id="…"> : conseil affiché la première fois, puis masqué (mémorisé dans le navigateur).
 */
interface GuideApi { open(id: string): void }
const GuideCtx = createContext<GuideApi>({ open: () => {} });

export function GuideProvider({ glossaire, children }: { glossaire: Glossaire; children: ReactNode }) {
  const [current, setCurrent] = useState<string | null>(null);
  const entry = glossaire.find((g) => g.id === current);
  useEffect(() => {
    if (!current) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setCurrent(null); };
    addEventListener('keydown', onKey); return () => removeEventListener('keydown', onKey);
  }, [current]);
  return (
    <GuideCtx.Provider value={{ open: setCurrent }}>
      {children}
      {entry && (
        <div className="sheet-backdrop" onClick={() => setCurrent(null)}>
          <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title" onClick={(e) => e.stopPropagation()}>
            <h3 id="sheet-title">{entry.titre}</h3>
            <p>{entry.texte}</p>
            {entry.voirAussi.length > 0 && (
              <div className="see"><span className="muted">Voir aussi :</span>
                {entry.voirAussi.map((v) => (
                  <button key={v} className="btn" onClick={() => setCurrent(v)}>{glossaire.find((g) => g.id === v)?.titre ?? v}</button>
                ))}
              </div>
            )}
            <div className="actions" style={{ marginTop: 14 }}><button className="btn primary" onClick={() => setCurrent(null)} autoFocus>Compris</button></div>
          </div>
        </div>
      )}
    </GuideCtx.Provider>
  );
}

export function Explain({ id, label }: { id: string; label?: string }) {
  const { open } = useContext(GuideCtx);
  return <button className="info" aria-label={`Explication : ${label ?? id}`} onClick={() => open(id)}>i</button>;
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
