import { useEffect, useState } from 'react';
import type { SimClient } from '../../worker/client';
import type { Fiche as F } from '../../worker/vues';
import { Explain, useGuide } from '../guide';
import { PersoLien, Section, Valeur } from '../composants/communs';
import { Portrait } from '../composants/Portrait';

const AMBITIONS: Record<string, string> = { puissance: 'Accroître sa puissance', richesse: "S'enrichir", piete: 'Vivre pieusement', amitie: "Se faire des amis", famille: 'Fonder une grande famille' };
const RANGS: Record<string, string> = { royaume: 'Royaume', duche: 'Duché', comte: 'Comté' };

export function Fiche({ client, id, jour, onPerso }: { client: SimClient; id: number; jour: number; onPerso: (id: number) => void }) {
  const [f, setF] = useState<F | null>(null);
  const { expliquer } = useGuide();
  useEffect(() => { let ok = true; client.demander<F | null>({ quoi: 'fiche', id }).then((x) => { if (ok) setF(x); }); return () => { ok = false; }; }, [client, id, jour]);
  if (!f) return <p className="muted">Chargement…</p>;
  const r = f.resume;
  const liste = (t: string, ps: { id: number }[] | undefined, aide?: string) => ps && ps.length > 0 && (
    <div className="liste"><h3>{t} {aide && <Explain id={aide} />}</h3>{(ps as F['enfants']).map((p) => <PersoLien key={p.id} p={p} onOpen={onPerso} />)}</div>
  );
  return (
    <div className="fiche">
      <section className="panel entete">
        <Portrait graine={r.portrait} sexe={r.sexe} age={r.age} rang={r.rang} taille={88} mort={!r.vivant} />
        <div>
          <h1>{f.nomComplet}{r.joueur && <span className="tag">vous</span>}</h1>
          <p className="muted">{r.vivant ? `${r.age} ans, né${r.sexe === 'f' ? 'e' : ''} le ${f.naissance}` : `${f.naissance} – ${f.deces ?? '?'}${f.cause ? ` (${f.cause})` : ''}`}
            {f.incertain && <> · <button className="link" onClick={() => expliquer('Donnée historique incertaine', <p>Les sources ne donnent pas avec certitude la date de naissance ou la filiation de ce personnage. Le jeu utilise l’hypothèse la plus courante.</p>)}>date incertaine</button></>}</p>
          {f.horsScene && <p className="muted">A quitté la scène <Explain id="hors-scene" /></p>}
          {f.clerc && <p className="muted">A prononcé ses vœux religieux <Explain id="clerc" /></p>}
          {f.titres.length > 0 && <p>{f.titres.map((t) => t.nom).join(' · ')}</p>}
        </div>
      </section>

      {(f.opinionDuJoueur || f.opinionEnversJoueur) && (
        <Section titre="Vous et lui" aide={<Explain id="opinion" />}>
          <dl className="kv">
            {f.opinionEnversJoueur && <><dt>Son opinion de vous</dt><dd><Valeur titre="Son opinion de vous" v={f.opinionEnversJoueur} signeTotal glossaire="opinion" /></dd></>}
            {f.opinionDuJoueur && <><dt>Votre opinion de lui</dt><dd><Valeur titre="Votre opinion" v={f.opinionDuJoueur} signeTotal glossaire="opinion" /></dd></>}
          </dl>
        </Section>
      )}

      <Section titre="Compétences" aide={<Explain id="competences" />}>
        <div className="grille-comp">
          {f.competences.map((c) => <div key={c.id} className="comp"><span>{c.nom}</span><Valeur titre={c.nom} v={c.valeur} glossaire={`comp-${c.id}`} /></div>)}
        </div>
        <dl className="kv" style={{ marginTop: 10 }}>
          <dt>Santé <Explain id="sante" /></dt><dd><Valeur titre="Santé" v={f.sante} glossaire="sante" />{f.malade ? ' · malade' : ''}</dd>
          <dt>Or <Explain id="or" /></dt><dd>{f.or}{f.budget && <> · <Valeur titre="Budget mensuel" v={f.budget} signeTotal glossaire="or" /> par mois</>}</dd>
          <dt>Prestige <Explain id="prestige" /></dt><dd>{f.prestige}</dd>
          <dt>Piété <Explain id="piete" /></dt><dd>{f.piete}</dd>
          {f.ambition && <><dt>Ambition <Explain id="ambition" /></dt><dd>{AMBITIONS[f.ambition] ?? f.ambition}</dd></>}
        </dl>
      </Section>

      <Section titre="Caractère" aide={<Explain id="traits" />}>
        <div className="chips">
          {f.traits.length === 0 && <span className="muted">Encore trop jeune pour que son caractère se dessine.</span>}
          {f.traits.map((t) => <button key={t.id} className={`chip ${t.type}`} onClick={() => expliquer(t.nom, <p>{t.description}</p>, ['traits'])}>{t.nom}</button>)}
        </div>
      </Section>

      {(f.suzerain || f.cour || f.vassaux.length > 0 || f.heritier) && (
        <Section titre="Féodalité" aide={<Explain id="vassal" />}>
          {f.suzerain && <><h3>Suzerain</h3><PersoLien p={f.suzerain} onOpen={onPerso} /></>}
          {f.souverain && f.souverain.id !== f.suzerain?.id && f.souverain.id !== r.id && <><h3>Souverain</h3><PersoLien p={f.souverain} onOpen={onPerso} /></>}
          {f.cour && <><h3>Vit à la cour de</h3><PersoLien p={f.cour} onOpen={onPerso} /></>}
          {f.heritier && <><h3>Héritier <Explain id="heritier" /></h3><PersoLien p={f.heritier} onOpen={onPerso} /></>}
          {f.partage && (
            <div className="note-partage"><h3>Partage prévu à sa mort <Explain id="succession-partage" /></h3>
              <ul>{f.partage.map((x, i) => <li key={i}>{x.titre} → {x.heritier.nom}</li>)}</ul></div>
          )}
          {liste('Vassaux', f.vassaux)}
        </Section>
      )}

      <Section titre="Famille">
        {f.conjoint && <><h3>Conjoint</h3><PersoLien p={f.conjoint} onOpen={onPerso} /></>}
        {liste('Parents', f.parents)}
        {liste('Enfants', f.enfants)}
        {liste('Frères et sœurs', f.fratrie)}
        {liste('Veuvages', f.anciensConjoints)}
        {!f.conjoint && !f.parents.length && !f.enfants.length && !f.fratrie.length && <p className="muted">Aucune famille connue.</p>}
      </Section>

      {(f.amis.length > 0 || f.rivaux.length > 0) && (
        <Section titre="Relations" aide={<Explain id="relations" />}>
          {liste('Amis', f.amis)}{liste('Rivaux', f.rivaux)}
        </Section>
      )}

      {f.titres.length > 0 && (
        <Section titre="Titres">
          <ul className="titres">{f.titres.map((t) => <li key={t.id}><span className="muted">{RANGS[t.rang]}</span> {t.nom}</li>)}</ul>
        </Section>
      )}

      {f.memoires.length > 0 && (
        <Section titre="Souvenirs" aide={<Explain id="memoire" />}>
          <ul className="souvenirs">{f.memoires.map((m, i) => <li key={i}><span className="muted">{m.date}</span> {m.texte}</li>)}</ul>
        </Section>
      )}
    </div>
  );
}
