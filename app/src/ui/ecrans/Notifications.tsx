import { useEffect, useState } from 'react';
import type { SimClient } from '../../worker/client';

interface N { date: string; texte: string; important: boolean; persos?: number[] }

export function Notifications({ client, jour, onPerso }: { client: SimClient; jour: number; onPerso: (id: number) => void }) {
  const [liste, setListe] = useState<N[]>([]);
  useEffect(() => { client.demander<N[]>({ quoi: 'notifications' }).then(setListe); client.send({ type: 'notificationsLues' }); }, [client, jour]);
  return (
    <section className="panel">
      <h2>Nouvelles</h2>
      {liste.length === 0 && <p className="muted">Aucune nouvelle pour l’instant. Elles concernent votre personnage, sa famille et ses vassaux.</p>}
      <ul className="notifs">
        {liste.map((n, i) => (
          <li key={i} className={n.important ? 'important' : ''}>
            <button className="entree" onClick={() => n.persos?.[0] !== undefined && onPerso(n.persos[0])}>
              <span className="muted">{n.date}</span><br />{n.texte}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
