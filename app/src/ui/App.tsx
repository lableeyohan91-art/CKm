import { useCallback, useEffect, useMemo, useState } from 'react';
import { loadData } from '../data/load';
import { SimClient } from '../worker/client';
import type { Speed, WorldView } from '../worker/protocol';
import { deleteSlot, getSlot, listSlots, putSlot, type SaveSlot } from '../save/storage';
import { Explain, GuideProvider, Tip } from './guide';

const data = loadData();
const SPEEDS: Speed[] = [1, 2, 3, 4, 5];
type SlotMeta = Omit<SaveSlot, 'bytes'>;

function download(bytes: Uint8Array, name: string) {
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/gzip' }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function App() {
  const client = useMemo(() => new SimClient(), []);
  const [view, setView] = useState<WorldView | null>(null);
  const [slots, setSlots] = useState<SlotMeta[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dev, setDev] = useState(false);

  const refreshSlots = useCallback(() => { listSlots().then(setSlots).catch(() => setSlots([])); }, []);

  useEffect(() => {
    const off = client.subscribe((m) => {
      if (m.type === 'vue') setView(m.view);
      if (m.type === 'erreur') setError(m.message);
      if (m.type === 'sauvegardeAuto') {
        putSlot({ slot: 'auto', label: 'Sauvegarde automatique', savedAt: new Date().toISOString(), dateLabel: m.dateLabel, bytes: m.bytes })
          .then(refreshSlots).catch(() => setError("La sauvegarde automatique a échoué : exportez votre partie dans un fichier."));
      }
    });
    refreshSlots();
    // Reprend la sauvegarde automatique si elle existe, sinon nouvelle partie.
    getSlot('auto').then((s) => {
      if (s) client.send({ type: 'charger', bytes: s.bytes });
      else client.send({ type: 'nouvelle', seed: `partie-${Date.now().toString(36)}` });
    }).catch(() => client.send({ type: 'nouvelle', seed: `partie-${Date.now().toString(36)}` }));
    return off;
  }, [client, refreshSlots]);

  const paused = view?.paused ?? true;

  async function saveTo(slot: string) {
    const { bytes, dateLabel } = await client.exportSave(`Emplacement ${slot}`);
    await putSlot({ slot, label: `Emplacement ${slot}`, savedAt: new Date().toISOString(), dateLabel, bytes });
    refreshSlots();
  }
  async function loadFrom(slot: string) {
    const s = await getSlot(slot); if (s) client.send({ type: 'charger', bytes: s.bytes });
  }
  async function exportFile() {
    const { bytes, dateLabel } = await client.exportSave('Export');
    download(bytes, `ckm-${dateLabel.replace(/\s+/g, '-')}.ckm`);
  }
  function importFile(file: File) {
    file.arrayBuffer().then((b) => client.send({ type: 'charger', bytes: new Uint8Array(b) }));
  }

  return (
    <GuideProvider glossaire={data.glossaire}>
      <div className="app">
        <header className="topbar gutter">
          <div className="row">
            <div className="date">{view?.dateLabel ?? 'Chargement…'}<small>{paused ? 'En pause' : `Vitesse ${view?.speed}`}</small></div>
            <Explain id="date" label="la date" />
            <button className={`btn${paused ? ' primary' : ''}`} onClick={() => client.send({ type: 'pause', paused: !paused })}
              aria-label={paused ? 'Reprendre le temps' : 'Mettre en pause'}>{paused ? '▶ Reprendre' : '❚❚ Pause'}</button>
          </div>
          <div className="time">
            <div className="speeds" role="group" aria-label="Vitesse">
              {SPEEDS.map((s) => (
                <button key={s} aria-pressed={view?.speed === s} onClick={() => client.send({ type: 'vitesse', speed: s })}>{s}</button>
              ))}
            </div>
            <Explain id="vitesse" label="les vitesses" />
            <button className="btn" onClick={() => client.send({ type: 'avancer', days: 1 })}>+1 jour</button>
            <button className="btn" onClick={() => client.send({ type: 'avancerMois' })}>+1 mois</button>
          </div>
        </header>

        <main className="gutter">
          {error && <div className="error" role="alert">{error} <button className="btn" onClick={() => setError(null)}>Fermer</button></div>}

          <Tip id="bienvenue">
            <p><b>Bienvenue.</b> Ceci est la toute première version du jeu : seules les fondations existent pour l'instant (le temps, les sauvegardes). La carte, les personnages et les dynasties arrivent à l'étape suivante.</p>
            <p>Partout où vous voyez un <b>i</b>, touchez-le pour obtenir une explication.</p>
          </Tip>

          <section className="panel" aria-labelledby="h-save">
            <h2 id="h-save">Sauvegardes <Explain id="sauvegarde" label="les sauvegardes" /></h2>
            <div className="slots">
              {['auto', '1', '2', '3'].map((id) => {
                const s = slots.find((x) => x.slot === id);
                return (
                  <div className="slot" key={id}>
                    <div className="meta"><b>{id === 'auto' ? 'Automatique' : `Emplacement ${id}`}</b>
                      <span className="muted">{s ? `${s.dateLabel} · enregistrée le ${new Date(s.savedAt).toLocaleString('fr-FR')}` : 'Vide'}</span></div>
                    <div className="actions">
                      {id !== 'auto' && <button className="btn" onClick={() => saveTo(id)}>Sauvegarder</button>}
                      {s && <button className="btn" onClick={() => loadFrom(id)}>Charger</button>}
                      {s && id !== 'auto' && <button className="btn" onClick={() => deleteSlot(id).then(refreshSlots)}>Effacer</button>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="actions" style={{ marginTop: 12 }}>
              <button className="btn" onClick={exportFile}>Exporter dans un fichier</button>
              <label className="btn" style={{ display: 'inline-flex', alignItems: 'center' }}>Importer un fichier
                <input type="file" accept=".ckm,application/gzip,application/json" hidden id="import-save"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) importFile(f); e.target.value = ''; }} />
              </label>
              <button className="btn" onClick={() => client.send({ type: 'nouvelle', seed: `partie-${Date.now().toString(36)}` })}>Nouvelle partie</button>
            </div>
          </section>

          <section className="panel" aria-labelledby="h-dev">
            <h2 id="h-dev">Mode développeur <button className="btn" aria-pressed={dev} onClick={() => setDev(!dev)}>{dev ? 'Masquer' : 'Afficher'}</button></h2>
            {dev && view && (
              <dl className="kv">
                <dt>Graine <Explain id="graine" label="la graine" /></dt><dd>{view.seed}</dd>
                <dt>Jour interne</dt><dd>{view.day}</dd>
                <dt>Jours simulés</dt><dd>{view.daysSimulated.toLocaleString('fr-FR')}</dd>
                <dt>Vitesse mesurée</dt><dd>{view.measuredDaysPerSec.toLocaleString('fr-FR')} jours/s</dd>
              </dl>
            )}
          </section>
        </main>
      </div>
    </GuideProvider>
  );
}
