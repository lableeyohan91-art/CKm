import { useEffect, useState } from 'react';
import type { SimClient } from '../../worker/client';
import type { Noeud } from '../../worker/vues';
import { Explain, Tip } from '../guide';
import { Portrait } from '../composants/Portrait';

function Branche({ n, onPerso }: { n: Noeud; onPerso: (id: number) => void }) {
  const [ouvert, setOuvert] = useState(true);
  const p = n.p;
  return (
    <li>
      <div className={`noeud${p.vivant ? '' : ' mort'}${p.joueur ? ' joueur' : ''}`}>
        {n.enfants.length > 0 && <button className="pli" aria-label={ouvert ? 'Replier' : 'Déplier'} aria-expanded={ouvert} onClick={() => setOuvert(!ouvert)}>{ouvert ? '−' : '+'}</button>}
        <button className="noeud-btn" onClick={() => onPerso(p.id)}>
          <Portrait graine={p.portrait} sexe={p.sexe} age={p.age} rang={p.rang} taille={32} mort={!p.vivant} app={p.app} />
          <span><b>{p.nom}</b>{n.batard && <span className="tag">bâtard</span>}{p.joueur && <span className="tag">vous</span>}<br />
            <span className="muted">{p.vivant ? `${p.age} ans` : `† ${p.mort}`}{p.titre ? ` · ${p.titre}` : ''}{n.conjoint ? ` · ⚭ ${n.conjoint.nom}` : ''}</span></span>
        </button>
      </div>
      {ouvert && n.enfants.length > 0 && <ul>{n.enfants.map((e) => <Branche key={e.p.id} n={e} onPerso={onPerso} />)}</ul>}
    </li>
  );
}

export function Dynastie({ client, id, jour, onPerso }: { client: SimClient; id: number | null; jour: number; onPerso: (id: number) => void }) {
  const [arbre, setArbre] = useState<Noeud | null>(null);
  useEffect(() => { if (id !== null) client.demander<Noeud | null>({ quoi: 'dynastie', id }).then(setArbre); }, [client, id, Math.floor(jour / 30)]);
  if (id === null) return <p className="muted">En mode observateur, ouvrez la fiche d’un personnage pour explorer sa famille.</p>;
  return (
    <div>
      <Tip id="dynastie"><p>Votre maison, depuis son plus ancien ancêtre connu. Les vivants sont en couleur. Touchez un nom pour ouvrir sa fiche.</p></Tip>
      <section className="panel"><h2>Arbre de la maison <Explain id="dynastie" /></h2>
        {arbre ? <ul className="arbre"><Branche n={arbre} onPerso={onPerso} /></ul> : <p className="muted">Chargement…</p>}
      </section>
    </div>
  );
}
