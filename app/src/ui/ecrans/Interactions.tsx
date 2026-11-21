import { useEffect, useState } from 'react';
import type { SimClient } from '../../worker/client';
import type { EvaluationVue, InteractionVue } from '../../worker/vues';
import { Explain } from '../guide';

type Params = Record<string, string | number | boolean>;
interface Resultat { ok: boolean; accepte?: boolean; enAttente?: boolean; texte: string }

const signe = (v: number) => (v > 0 ? `+${v}` : `${v}`);

function Cout({ c }: { c: EvaluationVue['cout'] }) {
  const items = [c.or ? `${c.or} or` : '', c.prestige ? `${c.prestige} prestige` : '', c.piete ? `${c.piete} piété` : ''].filter(Boolean);
  return items.length ? <p className="cout">Coût : {items.join(' · ')}</p> : null;
}

function Prevision({ ev }: { ev: EvaluationVue }) {
  if (!ev.possible) return <ul className="raisons-non">{ev.raisons.map((r, i) => <li key={i}>{r}</li>)}</ul>;
  if (!ev.acceptation || !ev.decideur) return <p className="verdict ok">Vous décidez seul.</p>;
  const a = ev.acceptation;
  return (
    <div>
      <p className={`verdict ${a.accepte ? 'ok' : 'ko'}`}>{ev.decideur.nom} {a.accepte ? 'acceptera' : 'refusera'} <span className="muted">(score {signe(a.score)})</span></p>
      <table className="detail"><tbody>
        {a.parts.map((p, i) => <tr key={i}><td>{p.source}</td><td className={p.valeur >= 0 ? 'pos' : 'neg'}>{signe(p.valeur)}</td></tr>)}
        <tr className="tot"><td>Total (accepte au-dessus de 0)</td><td>{signe(a.score)}</td></tr>
      </tbody></table>
    </div>
  );
}

function Fenetre({ client, cible, it, onClose, onFait }: { client: SimClient; cible: number; it: InteractionVue; onClose: () => void; onFait: () => void }) {
  const [params, setParams] = useState<Params>(it.params);
  const [ev, setEv] = useState<EvaluationVue>(it.evaluation);
  const [res, setRes] = useState<Resultat | null>(null);
  const [envoi, setEnvoi] = useState(false);
  useEffect(() => {
    if (JSON.stringify(params) === JSON.stringify(it.params)) { setEv(it.evaluation); return; }
    client.demander<EvaluationVue | null>({ quoi: 'evaluer', id: it.id, cible, params }).then((e) => e && setEv(e));
  }, [client, it, cible, params]);
  const decision = !!ev.acceptation;
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="it-titre" onClick={(e) => e.stopPropagation()}>
        <h3 id="it-titre">{it.nom}</h3>
        <p className="muted">{it.description}</p>
        {res ? (
          <>
            <p className={`verdict ${res.accepte === false || !res.ok ? 'ko' : 'ok'}`}>{res.texte}</p>
            <div className="actions"><button className="btn primary" autoFocus onClick={() => { onFait(); onClose(); }}>Fermer</button></div>
          </>
        ) : (
          <>
            {it.parametres.map((prm) => (
              <label key={prm.id} className="champ">
                <span>{prm.nom}</span>
                <select id={`prm-${it.id}-${prm.id}`} value={String(params[prm.id])}
                  onChange={(e) => {
                    const o = prm.options.find((x) => String(x.valeur) === e.target.value);
                    if (o) setParams({ ...params, [prm.id]: o.valeur });
                  }}>
                  {prm.options.map((o) => <option key={String(o.valeur)} value={String(o.valeur)}>{o.label}</option>)}
                </select>
              </label>
            ))}
            <Cout c={ev.cout} />
            <Prevision ev={ev} />
            <div className="actions" style={{ marginTop: 12 }}>
              <button className="btn" onClick={onClose}>Annuler</button>
              <button className="btn primary" disabled={!ev.possible || envoi} onClick={async () => {
                setEnvoi(true);
                const r = await client.commande<Resultat>({ type: 'interagir', id: it.id, cible, params });
                setRes(r); setEnvoi(false);
              }}>{decision ? (ev.acceptation!.accepte ? 'Proposer' : 'Proposer quand même') : 'Confirmer'}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function Interactions({ client, cible, version, onFait }: { client: SimClient; cible: number; version: number; onFait: () => void }) {
  const [liste, setListe] = useState<InteractionVue[] | null>(null);
  const [ouverte, setOuverte] = useState<InteractionVue | null>(null);
  useEffect(() => { client.demander<InteractionVue[]>({ quoi: 'interactions', cible }).then(setListe); }, [client, cible, version]);
  if (!liste) return null;
  if (!liste.length) return <p className="muted">Aucune interaction possible avec ce personnage pour l’instant.</p>;
  const cats = [...new Set(liste.map((i) => i.categorieNom))];
  return (
    <div className="interactions">
      {cats.map((cat) => (
        <div key={cat}>
          <h3>{cat}</h3>
          <div className="it-liste">
            {liste.filter((i) => i.categorieNom === cat).map((i) => {
              const ev = i.evaluation;
              const etat = !ev.possible ? 'impossible' : ev.acceptation ? (ev.acceptation.accepte ? 'acceptera' : 'refusera') : 'possible';
              return (
                <button key={i.id} className={`it ${etat}`} onClick={() => setOuverte(i)}>
                  <b>{i.nom}</b>
                  <span className="muted">{!ev.possible ? ev.raisons[0] : ev.acceptation ? (ev.acceptation.accepte ? 'Acceptera' : 'Refusera') : 'Vous décidez'}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <p className="muted petit">Touchez une interaction pour voir son coût et les raisons de la décision. <Explain id="interactions" /></p>
      {ouverte && <Fenetre client={client} cible={cible} it={ouverte} onClose={() => setOuverte(null)} onFait={onFait} />}
    </div>
  );
}
