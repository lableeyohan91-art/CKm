#!/usr/bin/env python3
"""
Génère la géométrie de la carte à partir des données Natural Earth (domaine public).

Entrées :
  - ne_10m_land.geojson et ne_10m_rivers_lake_centerlines.geojson
    (dépôt officiel https://github.com/nvkelso/natural-earth-vector, dossier geojson/)
  - app/data/scenarios/1066/carte.json (chefs-lieux des comtés)
  - app/data/scenarios/1066/terres.json (masques : frontières de carte, pas de rivage)

Sortie :
  - app/data/scenarios/1066/geometrie.json : contours des comtés (Voronoï découpé par
    les vraies côtes), terres, fleuves principaux, voisinages calculés.

Usage :
  pip install shapely
  python3 -I outils/carte/generer_geometrie.py DOSSIER_NATURAL_EARTH
"""
import json
import sys
from pathlib import Path

from shapely.geometry import LineString, MultiLineString, MultiPoint, Point, Polygon, mapping, shape
from shapely.ops import unary_union, voronoi_diagram

RACINE = Path(__file__).resolve().parents[2]
SCEN = RACINE / "app" / "data" / "scenarios" / "1066"
TOLERANCE = 0.012          # simplification des contours (degrés, ~1 km)
FLEUVES = {"Loire", "Seine", "Garonne", "Dordogne", "Somme", "Escaut", "Schelde", "Scheldt", "Thames", "Vienne",
           "Marne", "Oise", "Saône", "Saone", "Yonne", "Charente", "Lot", "Tarn", "Allier", "Cher", "Sarthe",
           "Mayenne", "Vilaine", "Orne", "Meuse", "Aisne", "Indre", "Creuse", "Loir", "Severn", "Lys", "Aube", "Rhône", "Rhone"}


def arrondir(coords):
    return [[round(x, 3), round(y, 3)] for x, y in coords]


def polygones(geom):
    """Liste de polygones (anneau extérieur seulement : pas de lacs à cette échelle)."""
    if geom.is_empty:
        return []
    geoms = getattr(geom, "geoms", [geom])
    out = []
    for g in geoms:
        if isinstance(g, Polygon) and g.area > 0.002:
            out.append(arrondir(g.exterior.coords))
    return out


def main(dossier_ne: str) -> None:
    ne = Path(dossier_ne)
    terres_ne = [shape(f["geometry"]) for f in json.loads((ne / "ne_10m_land.geojson").read_text())["features"]]
    carte = json.loads((SCEN / "carte.json").read_text())
    masques = json.loads((SCEN / "terres.json").read_text())

    comtes = {c["id"]: c for c in carte["comtes"]}
    masque_de = {cid: m["id"] for m in masques["masques"] for cid in m["comtes"]}
    sieges = {cid: Point(c["lon"], c["lat"]) for cid, c in comtes.items()}

    # 1. Terres de la zone jouable, découpées en morceaux (continent, îles, Grande-Bretagne)
    zone = unary_union([Polygon(m["contour"]) for m in masques["masques"]])
    terre = unary_union([t.intersection(zone) for t in terres_ne if t.intersects(zone)]).buffer(0)
    morceaux = [g for g in getattr(terre, "geoms", [terre]) if g.area > 0.002]
    # 2. Chaque morceau rejoint le masque du chef-lieu le plus proche, et seulement s'il est dans ce masque
    par_masque = {m["id"]: [] for m in masques["masques"]}
    for g in morceaux:
        proche = min(sieges, key=lambda cid: g.distance(sieges[cid]))
        mid = masque_de[proche]
        poly = Polygon(next(m["contour"] for m in masques["masques"] if m["id"] == mid))
        part = g.intersection(poly)
        if not part.is_empty:
            par_masque[mid].append(part)
    sortie_terres, sortie_comtes, toutes_terres = [], {}, []
    for m in masques["masques"]:
        terre_m = unary_union(par_masque[m["id"]]).simplify(TOLERANCE, preserve_topology=True)
        toutes_terres.append(terre_m)
        sortie_terres.extend(polygones(terre_m))
        ids = m["comtes"]
        pts = MultiPoint([sieges[i] for i in ids])
        cellules = voronoi_diagram(pts, envelope=Polygon(m["contour"]).envelope.buffer(2))
        for cid in ids:
            cell = next(c for c in cellules.geoms if c.contains(sieges[cid]))
            z = cell.intersection(terre_m)
            if z.is_empty:
                raise SystemExit(f"Le chef-lieu de {cid} est en mer : vérifiez ses coordonnées.")
            sortie_comtes[cid] = {"polygones": polygones(z), "zone": z}

    # Voisinages calculés (frontière commune de plus de ~2 km)
    voisins = {}
    for a, za in sortie_comtes.items():
        voisins[a] = sorted(b for b, zb in sortie_comtes.items()
                            if b != a and za["zone"].boundary.intersection(zb["zone"].buffer(0.004)).length > 0.03)
    # comparaison avec les voisinages déclarés
    for c in carte["comtes"]:
        declares, calcules = set(c["voisins"]), set(voisins[c["id"]])
        if declares != calcules:
            print(f"{c['id']:14} déclarés en plus : {sorted(declares - calcules)}  calculés en plus : {sorted(calcules - declares)}")

    # Fleuves principaux, découpés par les terres
    fleuves = []
    region = unary_union(toutes_terres)
    for f in json.loads((ne / "ne_10m_rivers_lake_centerlines.geojson").read_text())["features"]:
        nom = (f["properties"].get("name") or "").strip()
        if nom not in FLEUVES:
            continue
        g = shape(f["geometry"]).intersection(region)
        if g.is_empty:
            continue
        lignes = [g] if isinstance(g, LineString) else list(getattr(g, "geoms", []))
        for l in lignes:
            if isinstance(l, LineString) and l.length > 0.05:
                fleuves.append({"nom": nom, "trace": arrondir(l.simplify(TOLERANCE).coords)})

    out = {
        "source": "Natural Earth 1:10m (domaine public), https://www.naturalearthdata.com — traité par outils/carte/generer_geometrie.py",
        "terres": sortie_terres,
        "comtes": {k: v["polygones"] for k, v in sortie_comtes.items()},
        "voisinsCalcules": voisins,
        "fleuves": fleuves,
    }
    (SCEN / "geometrie.json").write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")))
    taille = (SCEN / "geometrie.json").stat().st_size
    print(f"geometrie.json : {len(sortie_comtes)} comtés, {len(sortie_terres)} terres, {len(fleuves)} tronçons de fleuves, {taille // 1024} Ko")


if __name__ == "__main__":
    main(sys.argv[1])
