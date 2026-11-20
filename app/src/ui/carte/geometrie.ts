import { Delaunay } from 'd3-delaunay';

/**
 * Géométrie de la carte : chaque comté est la zone des points plus proches de son
 * chef-lieu que de tout autre (diagramme de Voronoï), découpée par le contour des terres.
 * Calculée une seule fois au chargement.
 */
export type Pt = [number, number];
export interface ComteGeo { id: string; path: string; centre: Pt; label: Pt }
export interface CarteGeo { largeur: number; hauteur: number; comtes: ComteGeo[]; terres: string[] }

const LAT0 = 48, K = 100;
export const projeter = (lon: number, lat: number): Pt => [(lon + 6.2) * Math.cos((LAT0 * Math.PI) / 180) * K, (52.6 - lat) * K];

/** Découpe un polygone (quelconque) par un polygone convexe (Sutherland–Hodgman). */
function clip(sujet: Pt[], convexe: Pt[]): Pt[] {
  let out = sujet;
  const n = convexe.length;
  // orientation du convexe
  let aire = 0; for (let i = 0; i < n; i++) { const a = convexe[i]!, b = convexe[(i + 1) % n]!; aire += a[0] * b[1] - b[0] * a[1]; }
  const sens = aire > 0 ? 1 : -1;
  for (let i = 0; i < n && out.length; i++) {
    const a = convexe[i]!, b = convexe[(i + 1) % n]!;
    const dedans = (p: Pt) => sens * ((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0])) >= 0;
    const inter = (p: Pt, q: Pt): Pt => {
      const a1 = b[1] - a[1], b1 = a[0] - b[0], c1 = a1 * a[0] + b1 * a[1];
      const a2 = q[1] - p[1], b2 = p[0] - q[0], c2 = a2 * p[0] + b2 * p[1];
      const det = a1 * b2 - a2 * b1;
      return [(b2 * c1 - b1 * c2) / det, (a1 * c2 - a2 * c1) / det];
    };
    const entree = out; out = [];
    for (let j = 0; j < entree.length; j++) {
      const p = entree[j]!, q = entree[(j + 1) % entree.length]!;
      if (dedans(q)) { if (!dedans(p)) out.push(inter(p, q)); out.push(q); }
      else if (dedans(p)) out.push(inter(p, q));
    }
  }
  return out;
}

const chemin = (pts: Pt[]) => `M${pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('L')}Z`;

function centroide(pts: Pt[]): Pt {
  let a = 0, x = 0, y = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i]!, q = pts[(i + 1) % pts.length]!;
    const f = p[0] * q[1] - q[0] * p[1]; a += f; x += (p[0] + q[0]) * f; y += (p[1] + q[1]) * f;
  }
  return a ? [x / (3 * a), y / (3 * a)] : pts[0] ?? [0, 0];
}

export function construireCarte(
  comtes: { id: string; lat: number; lon: number }[],
  terres: { id: string; contour: [number, number][] }[],
  comtesParTerre: Record<string, string[]>,
): CarteGeo {
  const [largeur, hauteur] = projeter(6.6, 42.5);
  const out: ComteGeo[] = [];
  const terresPts = terres.map((t) => ({ id: t.id, pts: t.contour.map(([lon, lat]) => projeter(lon, lat)) }));
  const autres = new Set(Object.values(comtesParTerre).flat());
  for (const t of terresPts) {
    const ici = comtes.filter((c) => (comtesParTerre[t.id] ?? []).includes(c.id) || (!autres.has(c.id) && !comtesParTerre[t.id]));
    if (!ici.length) continue;
    const pts = ici.map((c) => projeter(c.lon, c.lat));
    const vor = Delaunay.from(pts).voronoi([-50, -50, largeur + 50, hauteur + 50]);
    ici.forEach((c, i) => {
      const cell = vor.cellPolygon(i) as Pt[] | null;
      if (!cell) return;
      const poly = clip(t.pts, cell.slice(0, -1));
      if (poly.length < 3) return;
      out.push({ id: c.id, path: chemin(poly), centre: pts[i]!, label: centroide(poly) });
    });
  }
  return { largeur, hauteur, comtes: out, terres: terresPts.map((t) => chemin(t.pts)) };
}
