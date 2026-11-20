import { useMemo, useRef, useState } from 'react';
import geometrie from '../../../data/scenarios/1066/geometrie.json';
import type { ComteVue } from '../../worker/vues';
import { construireCarte, type GeometrieDonnees } from '../carte/geometrie';
import { Explain, Tip } from '../guide';
import { PersoLien } from '../composants/communs';

type Mode = 'politique' | 'dynastique' | 'economique';
const MODES: { id: Mode; nom: string }[] = [{ id: 'politique', nom: 'Politique' }, { id: 'dynastique', nom: 'Dynasties' }, { id: 'economique', nom: 'Richesse' }];

/** Teintes héraldiques (émaux) attribuées de façon stable à chaque royaume, fief ou dynastie. */
const EMAUX = ['#a33b2e', '#2f5d8a', '#3f7a46', '#7a4f8f', '#b8862b', '#2e6f73', '#8f5a3c', '#5b6b2e', '#9a3f6a', '#43507f', '#b5632e', '#5f7f99', '#6f3b2e', '#4f8a6f'];
function teinte(cle: string): string { let h = 0; for (let i = 0; i < cle.length; i++) h = (h * 31 + cle.charCodeAt(i)) >>> 0; return EMAUX[h % EMAUX.length]!; }

const geo = construireCarte(geometrie as unknown as GeometrieDonnees);

export function Carte({ comtes, onPerso, joueurId }: { comtes: ComteVue[]; onPerso: (id: number) => void; joueurId: number | null }) {
  const [mode, setMode] = useState<Mode>('politique');
  const [sel, setSel] = useState<string | null>(null);
  const [vue, setVue] = useState({ x: 0, y: 0, z: 1 });
  const drag = useRef<{ x: number; y: number; vx: number; vy: number; moved: boolean } | null>(null);
  const parId = useMemo(() => new Map(comtes.map((c) => [c.id, c])), [comtes]);
  const maxDev = Math.max(...comtes.map((c) => c.developpement), 1);
  // Une couleur distincte par fief ou dynastie présents (attribution stable par ordre alphabétique)
  const palette = useMemo(() => {
    const cles = [...new Set(comtes.flatMap((c) => [c.dynastieId ? `d:${c.dynastieId}` : '', c.grandFief ? `g:${c.grandFief.id}` : '']).filter(Boolean))];
    const m = new Map<string, string>();
    for (const prefixe of ['d:', 'g:']) cles.filter((k) => k.startsWith(prefixe)).sort().forEach((k, i) => m.set(k, i < EMAUX.length ? EMAUX[i]! : teinte(k)));
    return m;
  }, [comtes]);

  const couleur = (c: ComteVue | undefined): string => {
    if (!c) return 'var(--rule)';
    if (mode === 'economique') { const t = c.developpement / maxDev; return `hsl(42 ${30 + t * 45}% ${82 - t * 42}%)`; }
    if (mode === 'dynastique') return c.dynastieId ? palette.get(`d:${c.dynastieId}`)! : 'var(--rule)';
    return c.grandFief ? palette.get(`g:${c.grandFief.id}`)! : 'var(--rule)';
  };
  const choisi = sel ? parId.get(sel) : undefined;
  const W = geo.largeur, H = geo.hauteur;
  const vw = W / vue.z, vh = H / vue.z;
  const zoom = (f: number) => setVue((v) => { const z = Math.min(4, Math.max(1, v.z * f)); const cx = v.x + W / v.z / 2, cy = v.y + H / v.z / 2; return clampVue({ z, x: cx - W / z / 2, y: cy - H / z / 2 }); });
  const clampVue = (v: { x: number; y: number; z: number }) => ({ z: v.z, x: Math.min(Math.max(v.x, 0), W - W / v.z), y: Math.min(Math.max(v.y, 0), H - H / v.z) });

  return (
    <div className="carte-ecran">
      <Tip id="carte"><p>Voici la France et le sud de l’Angleterre en 1066 (côtes et fleuves réels, d’après Natural Earth). Chaque zone est un <b>comté</b>. Touchez-en un pour savoir qui le tient. Les couleurs changent selon le mode choisi en haut.</p></Tip>
      <div className="modes" role="group" aria-label="Mode de carte">
        {MODES.map((m) => <button key={m.id} className="btn" aria-pressed={mode === m.id} onClick={() => setMode(m.id)}>{m.nom}</button>)}
        <Explain id="carte-modes" label="les modes de carte" />
        <span style={{ flex: 1 }} />
        <button className="btn" onClick={() => zoom(1.5)} aria-label="Zoomer">+</button>
        <button className="btn" onClick={() => zoom(1 / 1.5)} aria-label="Dézoomer">−</button>
      </div>
      <div className="carte-cadre">
        <svg viewBox={`${vue.x} ${vue.y} ${vw} ${vh}`} className="carte" role="img" aria-label="Carte des comtés"
          onPointerDown={(e) => { drag.current = { x: e.clientX, y: e.clientY, vx: vue.x, vy: vue.y, moved: false }; }}
          onPointerMove={(e) => {
            const d = drag.current; if (!d || vue.z === 1) return;
            const svg = e.currentTarget.getBoundingClientRect();
            const dx = (e.clientX - d.x) * (vw / svg.width), dy = (e.clientY - d.y) * (vh / svg.height);
            if (Math.abs(dx) + Math.abs(dy) > 2) d.moved = true;
            setVue(clampVue({ z: vue.z, x: d.vx - dx, y: d.vy - dy }));
          }}
          onPointerUp={() => { setTimeout(() => { drag.current = null; }, 0); }}
          onWheel={(e) => zoom(e.deltaY < 0 ? 1.15 : 1 / 1.15)}>
          <rect x={-100} y={-100} width={W + 200} height={H + 200} className="mer" />
          {geo.terres.map((d, i) => <path key={i} d={d} className="terre" />)}
          {geo.comtes.map((g) => {
            const c = parId.get(g.id);
            const joueur = joueurId !== null && c?.titulaire?.id === joueurId;
            return <path key={g.id} d={g.path} fill={couleur(c)} className={`comte${sel === g.id ? ' sel' : ''}${joueur ? ' joueur' : ''}`}
              onClick={() => { if (!drag.current?.moved) setSel(g.id); }} role="button" tabIndex={0} aria-label={c?.nom}
              onKeyDown={(e) => { if (e.key === 'Enter') setSel(g.id); }} />;
          })}
          {geo.fleuves.map((d, i) => <path key={`f${i}`} d={d} className="fleuve" />)}
          {geo.comtes.map((g) => <text key={`t${g.id}`} x={g.label[0]} y={g.label[1]} className="lbl" style={{ fontSize: 11 / Math.sqrt(vue.z) }}>{parId.get(g.id)?.nom}</text>)}
        </svg>
      </div>
      {choisi && (
        <div className="panel comte-info">
          <h2>{choisi.nom} <button className="btn" onClick={() => setSel(null)} aria-label="Fermer">✕</button></h2>
          {choisi.titulaire && <PersoLien p={choisi.titulaire} onOpen={onPerso} />}
          <dl className="kv">
            <dt>Relève de</dt><dd>{choisi.grandFief?.nom ?? '—'}{choisi.souverain && choisi.souverain.id !== choisi.grandFief?.id ? `, ${choisi.souverain.nom}` : ''}</dd>
            <dt>De droit</dt><dd>{choisi.dejure}{choisi.royaume ? `, ${choisi.royaume}` : ''}</dd>
            <dt>Dynastie</dt><dd>{choisi.dynastieNom ?? '—'}</dd>
            <dt>Développement <Explain id="developpement" /></dt><dd>{choisi.developpement} (≈ {choisi.revenu} or par mois)</dd>
            <dt>Terrain</dt><dd>{choisi.terrain}</dd>
            <dt>Culture</dt><dd>{choisi.culture}</dd>
          </dl>
        </div>
      )}
    </div>
  );
}
