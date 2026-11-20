import { useEffect, useState } from 'react';
import type { SimClient } from '../../worker/client';
import type { Jouable } from '../../worker/vues';
import { Explain } from '../guide';
import { Portrait } from '../composants/Portrait';

export function Choix({ client, onApercu }: { client: SimClient; onApercu: (id: number) => void }) {
  const [liste, setListe] = useState<Jouable[]>([]);
  useEffect(() => { client.demander<Jouable[]>({ quoi: 'jouables' }).then(setListe); }, [client]);
  return (
    <div className="choix">
      <section className="panel intro-jeu">
        <h1>6 janvier 1066</h1>
        <p>Édouard le Confesseur est mort hier. Harold Godwinson vient d’être couronné roi d’Angleterre, et Guillaume de Normandie conteste ce choix. En France, le roi Philippe n’a que quatorze ans.</p>
        <p>Choisissez qui vous incarnerez. À sa mort, vous continuerez avec son héritier : votre véritable personnage est votre <b>dynastie</b> <Explain id="personnage-joueur" />.</p>
      </section>
      <div className="jouables">
        {liste.map((j) => (
          <div key={j.id} className="jouable panel">
            <Portrait graine={j.portrait} sexe={j.sexe} age={j.age} rang={j.titre.startsWith('Royaume') ? 3 : j.titre.startsWith('Duché') ? 2 : 1} taille={64} app={j.app} />
            <div className="jtxt">
              <b>{j.nom}</b>
              <span className="muted">{j.age} ans · difficulté {j.difficulte.toLowerCase()}</span>
              <span>{j.description}</span>
              <div className="actions">
                <button className="btn" onClick={() => onApercu(j.id)}>Voir sa fiche</button>
                <button className="btn primary" onClick={() => client.send({ type: 'incarner', id: j.id })}>Incarner</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <section className="panel">
        <h2>Mode observateur <Explain id="observateur" /></h2>
        <p className="muted">Regarder le monde évoluer sans incarner personne.</p>
        <button className="btn" onClick={() => client.send({ type: 'incarner', id: null })}>Observer le monde</button>
      </section>
    </div>
  );
}
