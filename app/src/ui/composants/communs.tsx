import type { ReactNode } from 'react';
import type { PersoResume, Valeur as V } from '../../worker/vues';
import { useGuide } from '../guide';
import { Portrait } from './Portrait';

export function PersoLien({ p, onOpen, detail }: { p: PersoResume; onOpen: (id: number) => void; detail?: ReactNode }) {
  return (
    <button className="perso" onClick={() => onOpen(p.id)}>
      <Portrait graine={p.portrait} sexe={p.sexe} age={p.age} rang={p.rang} taille={40} mort={!p.vivant} app={p.app} />
      <span className="perso-txt">
        <b>{p.nom}{p.joueur && <span className="tag">vous</span>}</b>
        <span className="muted">{p.vivant ? `${p.age} ans` : `† ${p.mort}`}{p.titre ? ` · ${p.titre}` : ''}{detail ? <> · {detail}</> : null}</span>
      </span>
    </button>
  );
}

const signe = (v: number) => (v > 0 ? `+${v}` : `${v}`);

/** Affiche une valeur ; la toucher ouvre le détail de son calcul. */
export function Valeur({ titre, v, unite = '', glossaire, signeTotal = false }: { titre: string; v: V; unite?: string; glossaire?: string; signeTotal?: boolean }) {
  const { expliquer } = useGuide();
  const total = Math.round(v.total * 100) / 100;
  return (
    <button className="valeur" onClick={() => expliquer(titre, (
      <>
        <table className="detail"><tbody>
          {v.parts.map((p, i) => <tr key={i}><td>{p.source}</td><td className={p.valeur >= 0 ? 'pos' : 'neg'}>{signe(Math.round(p.valeur * 100) / 100)}</td></tr>)}
          <tr className="tot"><td>Total</td><td>{signeTotal ? signe(total) : total}{unite}</td></tr>
        </tbody></table>
      </>
    ), glossaire ? [glossaire] : undefined)} aria-label={`${titre} : ${total}. Toucher pour le détail`}>
      <span className="v">{signeTotal ? signe(total) : total}{unite}</span>
    </button>
  );
}

export function Section({ titre, children, aide }: { titre: string; children: ReactNode; aide?: ReactNode }) {
  return <section className="panel"><h2>{titre} {aide}</h2>{children}</section>;
}
