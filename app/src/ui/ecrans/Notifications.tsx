import { useEffect, useState } from 'react';
import type { SimClient } from '../../worker/client';
import type { PersoResume } from '../../worker/vues';
import { PersoLien } from '../composants/communs';

interface N { date: string; texte: string; important: boolean; persos?: number[] }
interface Prop { id: number; texte: string; date: string; limite: string; interaction: string; acteur: PersoResume; cible: PersoResume; membre?: PersoResume }
interface Resultat { ok: boolean; accepte?: boolean; texte: string }

export function Notifications({ client, jour, onPerso, version, onFait }: { client: SimClient; jour: number; onPerso: (id: number) => void; version: number; onFait: () => void }) {
  const [liste, setListe] = useState<N[]>([]);
  const [props, setProps] = useState<Prop[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    client.demander<N[]>({ quoi: 'notifications' }).then(setListe);
    client.demander<Prop[]>({ quoi: 'propositions' }).then(setProps);
    client.send({ type: 'notificationsLues' });
  }, [client, jour, version]);
  const repondre = async (id: number, accepte: boolean) => {
    const r = await client.commande<Resultat>({ type: 'repondre', proposition: id, accepte });
    setMsg(r.texte); onFait();
  };
  return (
    <>
      {msg && <div className="panel"><p>{msg}</p><button className="btn" onClick={() => setMsg(null)}>Fermer</button></div>}
      {props.length > 0 && (
        <section className="panel propositions">
          <h2>Propositions en attente</h2>
          {props.map((p) => (
            <div key={p.id} className="proposition">
              <p><b>{p.interaction}</b> — {p.texte}</p>
              <PersoLien p={p.acteur} onOpen={onPerso} detail="propose" />
              {p.membre && p.membre.id !== p.acteur.id && <PersoLien p={p.membre} onOpen={onPerso} detail="de sa famille" />}
              <PersoLien p={p.cible} onOpen={onPerso} detail="concerné" />
              <p className="muted">Réponse attendue avant le {p.limite}. Ouvrez les fiches pour juger du parti.</p>
              <div className="actions"><button className="btn" onClick={() => repondre(p.id, false)}>Refuser</button><button className="btn primary" onClick={() => repondre(p.id, true)}>Accepter</button></div>
            </div>
          ))}
        </section>
      )}
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
    </>
  );
}
