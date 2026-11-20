import { useEffect, useState } from 'react';
import type { SimClient } from '../../worker/client';
import { Explain } from '../guide';

interface Entree { date: string; annee: number; type: string; texte: string; persos: number[] }
const ICONES: Record<string, string> = { naissance: '✦', deces: '✝', mariage: '⚭', succession: '♔', systeme: '❧', guerre: '⚔', autre: '·' };

export function Chronique({ client, jour, onPerso, joueur }: { client: SimClient; jour: number; onPerso: (id: number) => void; joueur: boolean }) {
  const [filtre, setFiltre] = useState<'tout' | 'joueur'>(joueur ? 'joueur' : 'tout');
  const [liste, setListe] = useState<Entree[]>([]);
  useEffect(() => { client.demander<Entree[]>({ quoi: 'chronique', filtre }).then(setListe); }, [client, filtre, Math.floor(jour / 30)]);
  let annee = 0;
  return (
    <section className="panel">
      <h2>Chronique <Explain id="chronique" /></h2>
      {joueur && <div className="modes"><button className="btn" aria-pressed={filtre === 'joueur'} onClick={() => setFiltre('joueur')}>Ma dynastie</button><button className="btn" aria-pressed={filtre === 'tout'} onClick={() => setFiltre('tout')}>Tout le monde</button></div>}
      {liste.length === 0 && <p className="muted">Rien encore à raconter.</p>}
      <ol className="chronique">
        {liste.map((e, i) => {
          const titre = e.annee !== annee ? (annee = e.annee) : null;
          return (
            <li key={i}>
              {titre && <h3 className="annee">{titre}</h3>}
              <button className="entree" onClick={() => e.persos[0] !== undefined && onPerso(e.persos[0])} disabled={!e.persos.length}>
                <span className="ico" aria-hidden="true">{ICONES[e.type] ?? '·'}</span>
                <span><span className="muted">{e.date}</span><br />{e.texte}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
