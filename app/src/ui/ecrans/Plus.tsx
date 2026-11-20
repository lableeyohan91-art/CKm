import { Fragment, useCallback, useEffect, useState } from 'react';
import type { SimClient } from '../../worker/client';
import type { WorldView } from '../../worker/protocol';
import type { PersoResume } from '../../worker/vues';
import { deleteSlot, getSlot, listSlots, putSlot, type SaveSlot } from '../../save/storage';
import { Explain } from '../guide';
import { PersoLien } from '../composants/communs';

type SlotMeta = Omit<SaveSlot, 'bytes'>;
interface DecisionVue { date: string; acteur: PersoResume; action: string; score: number; cible?: PersoResume; raisons: { source: string; valeur: number }[]; alternatives: { action: string; score: number; cible?: string }[] }

function download(bytes: Uint8Array, name: string) {
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/gzip' }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function Plus({ client, view, onPerso, slotsVersion }: { client: SimClient; view: WorldView; onPerso: (id: number) => void; slotsVersion: number }) {
  const [slots, setSlots] = useState<SlotMeta[]>([]);
  const [dev, setDev] = useState(false);
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [ia, setIa] = useState<DecisionVue[]>([]);
  const refresh = useCallback(() => { listSlots().then(setSlots).catch(() => setSlots([])); }, []);
  useEffect(refresh, [refresh, slotsVersion]);
  useEffect(() => {
    if (!dev) return;
    client.demander<Record<string, number>>({ quoi: 'stats' }).then(setStats);
    client.demander<DecisionVue[]>({ quoi: 'ia' }).then(setIa);
  }, [client, dev, Math.floor(view.day / 30)]);

  async function saveTo(slot: string) {
    const { bytes, dateLabel } = await client.exportSave(`Emplacement ${slot}`);
    await putSlot({ slot, label: `Emplacement ${slot}`, savedAt: new Date().toISOString(), dateLabel, bytes });
    refresh();
  }
  return (
    <div className="plus">
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
                  {id !== 'auto' && view.enCours && <button className="btn" onClick={() => saveTo(id)}>Sauvegarder</button>}
                  {s && <button className="btn" onClick={() => getSlot(id).then((x) => x && client.send({ type: 'charger', bytes: x.bytes }))}>Charger</button>}
                  {s && id !== 'auto' && <button className="btn" onClick={() => deleteSlot(id).then(refresh)}>Effacer</button>}
                </div>
              </div>
            );
          })}
        </div>
        <div className="actions" style={{ marginTop: 12 }}>
          <button className="btn" onClick={async () => { const { bytes, dateLabel } = await client.exportSave('Export'); download(bytes, `ckm-${dateLabel.replace(/\s+/g, '-')}.ckm`); }}>Exporter dans un fichier</button>
          <label className="btn" style={{ display: 'inline-flex', alignItems: 'center' }}>Importer un fichier
            <input type="file" accept=".ckm,application/gzip,application/json" hidden id="import-save"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) f.arrayBuffer().then((b) => client.send({ type: 'charger', bytes: new Uint8Array(b) })); e.target.value = ''; }} />
          </label>
          <button className="btn" onClick={() => client.send({ type: 'nouvelle', seed: `partie-${Date.now().toString(36)}` })}>Nouvelle partie</button>
        </div>
      </section>

      <section className="panel" aria-labelledby="h-dev">
        <h2 id="h-dev">Mode développeur <button className="btn" aria-pressed={dev} onClick={() => setDev(!dev)}>{dev ? 'Masquer' : 'Afficher'}</button></h2>
        {dev && (
          <>
            <dl className="kv">
              <dt>Graine <Explain id="graine" label="la graine" /></dt><dd>{view.seed}</dd>
              <dt>Jour interne</dt><dd>{view.day}</dd>
              <dt>Vitesse mesurée</dt><dd>{view.measuredDaysPerSec.toLocaleString('fr-FR')} jours/s</dd>
              {stats && Object.entries(stats).map(([k, v]) => <Fragment key={k}><dt>{k}</dt><dd>{v.toLocaleString('fr-FR')}</dd></Fragment>)}
            </dl>
            <div className="actions" style={{ marginTop: 10 }}>
              <button className="btn" onClick={() => client.send({ type: 'avancer', days: 365 * 10 })}>Avancer de 10 ans</button>
              <button className="btn" onClick={() => client.send({ type: 'incarner', id: null })}>Passer en observateur</button>
            </div>
            <h3>Dernières décisions de l’IA <Explain id="ia" /></h3>
            <ul className="decisions">
              {ia.map((d, i) => (
                <li key={i}>
                  <PersoLien p={d.acteur} onOpen={onPerso} detail={<>{d.action}{d.cible ? ` → ${d.cible.nom}` : ''} (score {d.score})</>} />
                  <details><summary>Pourquoi ?</summary>
                    <ul>{d.raisons.map((r, j) => <li key={j}>{r.source} : {r.valeur > 0 ? '+' : ''}{r.valeur}</li>)}</ul>
                    <p className="muted">Autres options : {d.alternatives.map((a) => `${a.action}${a.cible ? ` (${a.cible})` : ''} ${a.score}`).join(' · ')}</p>
                  </details>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
