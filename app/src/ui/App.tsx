import { useEffect, useMemo, useState } from 'react';
import { loadData } from '../data/load';
import { SimClient } from '../worker/client';
import type { Speed, WorldView } from '../worker/protocol';
import type { ComteVue, VueGuerre } from '../worker/vues';
import { getSlot, putSlot } from '../save/storage';
import { Explain, GuideProvider } from './guide';
import { Carte } from './ecrans/Carte';
import { Fiche } from './ecrans/Fiche';
import { Choix } from './ecrans/Choix';
import { Dynastie } from './ecrans/Dynastie';
import { Chronique } from './ecrans/Chronique';
import { Notifications } from './ecrans/Notifications';
import { Plus } from './ecrans/Plus';
import { Guerre } from './ecrans/Guerre';

const data = loadData();
const SPEEDS: Speed[] = [1, 2, 3, 4, 5];
type Onglet = 'carte' | 'personnage' | 'guerre' | 'dynastie' | 'chronique' | 'plus';
const ONGLETS: { id: Onglet; nom: string; ico: string }[] = [
  { id: 'carte', nom: 'Carte', ico: '⛬' }, { id: 'personnage', nom: 'Personnage', ico: '♔' }, { id: 'guerre', nom: 'Guerre', ico: '⚔' }, { id: 'dynastie', nom: 'Dynastie', ico: '⚜' },
  { id: 'chronique', nom: 'Chronique', ico: '❧' }, { id: 'plus', nom: 'Plus', ico: '☰' },
];

export function App() {
  const client = useMemo(() => new SimClient(), []);
  const [view, setView] = useState<WorldView | null>(null);
  const [onglet, setOnglet] = useState<Onglet>('carte');
  const [fiche, setFiche] = useState<number[]>([]);        // pile de fiches ouvertes
  const [notifs, setNotifs] = useState(false);
  const [comtes, setComtes] = useState<ComteVue[]>([]);
  const [guerre, setGuerre] = useState<VueGuerre | null>(null);
  const [alerte, setAlerte] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [slotsVersion, setSlotsVersion] = useState(0);
  const [version, setVersion] = useState(0);            // change après chaque interaction : rafraîchit les fiches
  const fait = () => setVersion((v) => v + 1);

  useEffect(() => {
    const off = client.subscribe((m) => {
      if (m.type === 'vue') setView(m.view);
      if (m.type === 'erreur') setError(m.message);
      if (m.type === 'alerte') setAlerte(m.texte);
      if (m.type === 'sauvegardeAuto') {
        putSlot({ slot: 'auto', label: 'Sauvegarde automatique', savedAt: new Date().toISOString(), dateLabel: m.dateLabel, bytes: m.bytes })
          .then(() => setSlotsVersion((v) => v + 1)).catch(() => setError("La sauvegarde automatique a échoué : exportez votre partie dans un fichier."));
      }
    });
    const nouvelle = () => client.send({ type: 'nouvelle', seed: `partie-${Date.now().toString(36)}` });
    getSlot('auto').then((s) => (s ? client.send({ type: 'charger', bytes: s.bytes }) : nouvelle())).catch(nouvelle);
    return off;
  }, [client]);

  // La carte se recharge une fois par mois de jeu
  useEffect(() => { if (view) client.demander<ComteVue[]>({ quoi: 'carte' }).then(setComtes); }, [client, view?.mois, view?.joueur?.id, view?.enCours]);

  // Les armées bougent chaque jour : vue de guerre rechargée à chaque jour de jeu tant qu'il y a des guerres
  useEffect(() => {
    if (!view) return;
    if (!view.guerres) { setGuerre(null); return; }
    client.demander<VueGuerre>({ quoi: 'guerre' }).then(setGuerre);
  }, [client, view?.day, view?.guerres, version]);

  const ouvrir = (id: number) => { setFiche((f) => [...f, id]); setNotifs(false); };
  const ficheId = fiche[fiche.length - 1];
  const paused = view?.paused ?? true;
  const jour = view?.day ?? 0;
  const joueurId = view?.joueur?.id ?? null;

  if (view && !view.enCours) {
    return (
      <GuideProvider glossaire={data.glossaire}>
        <div className="app">
          <header className="topbar gutter"><div className="row"><div className="date">CKm<small>Simulateur de dynasties médiévales</small></div></div></header>
          <main className="gutter">
            {ficheId !== undefined ? (<><button className="btn" onClick={() => setFiche((f) => f.slice(0, -1))}>← Retour au choix</button><Fiche client={client} id={ficheId} jour={jour} onPerso={ouvrir} /></>)
              : <Choix client={client} onApercu={ouvrir} />}
          </main>
        </div>
      </GuideProvider>
    );
  }

  return (
    <GuideProvider glossaire={data.glossaire}>
      <div className="app">
        <header className="topbar gutter">
          <div className="row">
            <div className="date">{view?.dateLabel ?? 'Chargement…'}<small>{view?.joueur ? view.joueur.nom : 'Mode observateur'}</small></div>
            <button className="btn cloche" onClick={() => { setNotifs(!notifs); setFiche([]); }} aria-label={`Nouvelles (${view?.notifNonLues ?? 0} non lues)`} aria-pressed={notifs}>
              ✉{!!((view?.notifNonLues ?? 0) + (view?.propositions ?? 0)) && <span className="pastille">{Math.min(99, (view?.notifNonLues ?? 0) + (view?.propositions ?? 0))}</span>}
            </button>
            <button className={`btn${paused ? ' primary' : ''}`} onClick={() => client.send({ type: 'pause', paused: !paused })}
              aria-label={paused ? 'Reprendre le temps' : 'Mettre en pause'}>{paused ? '▶' : '❚❚'}</button>
          </div>
          <div className="time">
            <div className="speeds" role="group" aria-label="Vitesse">
              {SPEEDS.map((s) => <button key={s} aria-pressed={view?.speed === s} onClick={() => client.send({ type: 'vitesse', speed: s })}>{s}</button>)}
            </div>
            <Explain id="vitesse" label="les vitesses" />
            <button className="btn" onClick={() => client.send({ type: 'avancer', days: 1 })}>+1 j</button>
            <button className="btn" onClick={() => client.send({ type: 'avancerMois' })}>+1 mois</button>
          </div>
        </header>

        <main className="gutter">
          {error && <div className="error" role="alert">{error} <button className="btn" onClick={() => setError(null)}>Fermer</button></div>}
          {view?.finDePartie && <div className="panel fin"><h2>Fin de la partie</h2><p>{view.finDePartie}</p><button className="btn primary" onClick={() => client.send({ type: 'nouvelle', seed: `partie-${Date.now().toString(36)}` })}>Nouvelle partie</button></div>}
          {notifs ? <Notifications client={client} jour={jour} onPerso={ouvrir} version={version} onFait={fait} />
            : ficheId !== undefined ? (
              <>
                <button className="btn" onClick={() => setFiche((f) => f.slice(0, -1))}>← Retour</button>
                <Fiche client={client} id={ficheId} jour={jour} onPerso={ouvrir} joueurId={joueurId} version={version} onFait={fait} />
              </>
            ) : onglet === 'carte' ? <Carte comtes={comtes} onPerso={ouvrir} joueurId={joueurId} guerre={guerre} client={client} />
            : onglet === 'guerre' ? <Guerre guerre={guerre} joueurId={joueurId} onPerso={ouvrir} onCarte={() => setOnglet('carte')} />
            : onglet === 'personnage' ? (joueurId !== null ? <Fiche client={client} id={joueurId} jour={jour} onPerso={ouvrir} joueurId={joueurId} version={version} onFait={fait} /> : <p className="muted">Mode observateur : touchez un comté de la carte pour ouvrir la fiche de son seigneur.</p>)
            : onglet === 'dynastie' ? <Dynastie client={client} id={joueurId} jour={jour} onPerso={ouvrir} />
            : onglet === 'chronique' ? <Chronique client={client} jour={jour} onPerso={ouvrir} joueur={joueurId !== null} />
            : view && <Plus client={client} view={view} onPerso={ouvrir} slotsVersion={slotsVersion} />}
        </main>

        <nav className="onglets" aria-label="Navigation">
          {ONGLETS.map((o) => (
            <button key={o.id} aria-current={onglet === o.id && !fiche.length && !notifs ? 'page' : undefined}
              onClick={() => { setOnglet(o.id); setFiche([]); setNotifs(false); }}>
              <span aria-hidden="true">{o.ico}</span>{o.nom}{o.id === 'guerre' && !!view?.mesGuerres && <span className="pastille">{view.mesGuerres}</span>}
            </button>
          ))}
        </nav>

        {alerte && (
          <div className="sheet-backdrop" onClick={() => setAlerte(null)}>
            <div className="sheet" role="alertdialog" aria-modal="true" aria-labelledby="alerte-titre" onClick={(e) => e.stopPropagation()}>
              <h3 id="alerte-titre">Nouvelle importante</h3>
              <p>{alerte}</p>
              <p className="muted">Le temps a été mis en pause pour que vous ne manquiez rien.</p>
              <div className="actions"><button className="btn primary" autoFocus onClick={() => setAlerte(null)}>Continuer</button></div>
            </div>
          </div>
        )}
      </div>
    </GuideProvider>
  );
}
