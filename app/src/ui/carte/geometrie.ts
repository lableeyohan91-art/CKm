/**
 * Géométrie de la carte : contours des comtés pré-calculés à partir de Natural Earth
 * (outils/carte/generer_geometrie.py). Ici, on se contente de les projeter.
 */
export type Pt = [number, number];
export interface ComteGeo { id: string; path: string; label: Pt }
export interface CarteGeo { largeur: number; hauteur: number; comtes: ComteGeo[]; terres: string[]; fleuves: string[] }

const LAT0 = 48, K = 100;
export const projeter = (lon: number, lat: number): Pt => [(lon + 6.2) * Math.cos((LAT0 * Math.PI) / 180) * K, (52.6 - lat) * K];

const anneau = (pts: [number, number][]) => `M${pts.map(([lon, lat]) => projeter(lon, lat).map((v) => v.toFixed(1)).join(',')).join('L')}Z`;
const ligne = (pts: [number, number][]) => `M${pts.map(([lon, lat]) => projeter(lon, lat).map((v) => v.toFixed(1)).join(',')).join('L')}`;

function aire(pts: [number, number][]): number {
  let a = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i]!, q = pts[(i + 1) % pts.length]!; a += p[0] * q[1] - q[0] * p[1]; } return Math.abs(a / 2);
}
function centroide(pts: [number, number][]): Pt {
  let a = 0, x = 0, y = 0;
  for (let i = 0; i < pts.length; i++) { const p = pts[i]!, q = pts[(i + 1) % pts.length]!; const f = p[0] * q[1] - q[0] * p[1]; a += f; x += (p[0] + q[0]) * f; y += (p[1] + q[1]) * f; }
  return a ? [x / (3 * a), y / (3 * a)] : pts[0]!;
}

export interface GeometrieDonnees {
  terres: [number, number][][];
  comtes: Record<string, [number, number][][]>;
  fleuves: { nom: string; trace: [number, number][] }[];
}

export function construireCarte(g: GeometrieDonnees): CarteGeo {
  const [largeur, hauteur] = projeter(6.6, 42.5);
  const comtes = Object.entries(g.comtes).map(([id, polys]) => {
    const principal = [...polys].sort((a, b) => aire(b) - aire(a))[0]!;
    const [lon, lat] = centroide(principal);
    return { id, path: polys.map(anneau).join(''), label: projeter(lon, lat) };
  });
  return { largeur, hauteur, comtes, terres: g.terres.map(anneau), fleuves: g.fleuves.map((f) => ligne(f.trace)) };
}
