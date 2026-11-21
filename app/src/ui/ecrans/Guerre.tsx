import type { VueGuerre } from '../../worker/vues';
import { Explain, Tip } from '../guide';
import { PersoLien, Section } from '../composants/communs';

const signe = (v: number) => (v > 0 ? `+${v}` : `${v}`);

/** Écran des guerres : score, camps, forces, et accès à la négociation. */
export function Guerre({ guerre, joueurId, onPerso, onCarte }: { guerre: VueGuerre | null; joueurId: number | null; onPerso: (id: number) => void; onCarte: () => void }) {
  const toutes = guerre?.guerres ?? [];
  const miennes = toutes.filter((g) => g.monCamp);
  const autres = toutes.filter((g) => !g.monCamp);
  const mesArmees = (guerre?.armees ?? []).filter((a) => a.relation === 'mienne');
  return (
    <div>
      <Tip id="guerre">
        <p>Pour faire la guerre, il faut un <b>motif</b> : une revendication sur un titre, ou un comté qui relève de droit de votre duché ou royaume. Pas de motif ? Faites <b>forger une revendication</b> par votre chancelier (menu Interagir de la fiche d’un voisin, catégorie Guerre).</p>
        <p>Une fois la guerre déclarée, votre <b>ost</b> se lève tout seul (vos terres et une part de vos vassaux, selon leur opinion). Sur la carte, touchez votre armée (blason doré) puis un comté pour l’y envoyer. Gagnez des batailles et assiégez les comtés ennemis pour faire monter le <b>score de guerre</b> ; à +100, vous gagnez.</p>
      </Tip>
      {!miennes.length && <p className="muted">Vous n’êtes en guerre contre personne. <Explain id="guerre" label="Comment faire la guerre ?" /></p>}
      {miennes.map((g) => (
        <Section key={g.id} titre={g.nom}>
          <p className="muted">Depuis le {g.debut} ({g.mois} mois). Enjeu : {g.titre}. Vous êtes {g.monCamp === 'att' ? 'l’attaquant' : 'le défenseur'}.</p>
          <div aria-label={`Score de guerre ${signe(g.score)}`}>
            <b>Score de guerre : {signe(g.score)}</b> <Explain id="score-guerre" />
            <div className="score-barre"><span style={g.score >= 0 ? { left: '50%', width: `${g.score / 2}%` } : { right: '50%', width: `${-g.score / 2}%` }} /></div>
            <table className="detail"><tbody>
              {g.scoreParts.map((p, i) => <tr key={i}><td>{p.source}</td><td className={p.valeur >= 0 ? 'pos' : 'neg'}>{signe(p.valeur)}</td></tr>)}
            </tbody></table>
            <p className="aide">{g.score >= 100 ? 'Victoire acquise.' : g.score >= 40 ? 'Vous pouvez exiger sa reddition : il acceptera sans doute.' : g.score <= -60 ? 'La guerre tourne mal : une capitulation limiterait les pertes.' : 'Rien n’est joué : battez ses armées, assiégez ses comtés.'}</p>
          </div>
          <div className="camps">
            <div><h3>Attaquants ({g.hommes.att} h.)</h3>{g.attaquants.map((p) => <PersoLien key={p.id} p={p} onOpen={onPerso} />)}</div>
            <div><h3>Défenseurs ({g.hommes.def} h.)</h3>{g.defenseurs.map((p) => <PersoLien key={p.id} p={p} onOpen={onPerso} />)}</div>
          </div>
          {g.chef && g.adversaire !== undefined && (
            <p><button className="btn primary" onClick={() => onPerso(g.adversaire!)}>Négocier la paix</button> <span className="muted">(fiche de l’adversaire → Interagir → Guerre)</span></p>
          )}
        </Section>
      ))}
      {joueurId !== null && (
        <Section titre="Vos armées">
          {!mesArmees.length ? <p className="muted">Aucune armée levée : l’ost ne se rassemble qu’en temps de guerre.</p> : (
            <ul className="liste">
              {mesArmees.map((a) => (
                <li key={a.id}>{a.hommes} hommes, moral {a.moral} % — {a.siege ? `assiège (${a.siege.pct} %)` : a.destination ? 'en marche' : 'à l’arrêt'}{a.manuel ? '' : ' · menée par le maréchal'}</li>
              ))}
            </ul>
          )}
          {!!mesArmees.length && <button className="btn" onClick={onCarte}>Voir sur la carte</button>}
        </Section>
      )}
      {!!autres.length && (
        <Section titre="Autres guerres">
          <ul className="liste">
            {autres.map((g) => <li key={g.id}><b>{g.nom}</b> : {g.attaquants[0]?.nom} contre {g.defenseurs[0]?.nom}, score {signe(g.score)}</li>)}
          </ul>
        </Section>
      )}
    </div>
  );
}
