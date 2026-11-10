#!/usr/bin/env python3
"""Convert the feelpp/mesh.eye STEP geometry (Zenodo 15630998, GPL-3.0) to one GLB.

Input:  human_eye.stp from https://github.com/feelpp/mesh.eye (tag v1.1).
        It holds 10 solids with no names, in millimetres, optical axis along x (cornea at -x).
Output: <out>.glb with one node per solid, in metres, three.js axes
        (x right, y up, z toward viewer), optic axis rotated onto +z (cornea faces +z).
        <out>_manifest.csv lists index, name, faces, volume in mL and bounding box.

Names: pass --names names.json as {"0": "Lamina", "2": "Sclera", ...} once the
solids are identified in a viewer. Unnamed solids become solid_<index>.

Licence: the source is GPL-3.0-only. Meshes derived from it are GPL-3.0.
"""
import argparse
import csv
import json
from pathlib import Path

import numpy as np
import trimesh
from OCP.BRep import BRep_Tool
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.STEPControl import STEPControl_Reader
from OCP.TopAbs import TopAbs_FACE
from OCP.TopExp import TopExp_Explorer
from OCP.TopLoc import TopLoc_Location
from OCP.TopoDS import TopoDS, TopoDS_Iterator

face_cast = getattr(TopoDS, "Face_s", None) or TopoDS.Face
PALETTE = [(231, 76, 60), (52, 152, 219), (241, 196, 15), (46, 204, 113), (155, 89, 182),
           (230, 126, 34), (26, 188, 156), (233, 30, 99), (121, 85, 72), (96, 125, 139)]


def solid_to_mesh(shape):
    verts, faces, off = [], [], 0
    ex = TopExp_Explorer(shape, TopAbs_FACE)
    while ex.More():
        f = face_cast(ex.Current())
        loc = TopLoc_Location()
        tri = BRep_Tool.Triangulation_s(f, loc)
        if tri is not None:
            tr = loc.Transformation()
            for k in range(1, tri.NbNodes() + 1):
                p = tri.Node(k).Transformed(tr)
                verts.append((p.X(), p.Y(), p.Z()))
            rev = f.Orientation().name.endswith("REVERSED")
            for k in range(1, tri.NbTriangles() + 1):
                a, b, c = (i - 1 + off for i in tri.Triangle(k).Get())
                faces.append((a, c, b) if rev else (a, b, c))
            off += tri.NbNodes()
        ex.Next()
    return np.array(verts), np.array(faces)


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("step", type=Path, help="path to human_eye.stp")
    p.add_argument("--out", type=Path, default=Path("out/eye"), help="output path without extension")
    p.add_argument("--names", type=Path, help="JSON mapping solid index to name")
    p.add_argument("--deflection", type=float, default=0.05, help="linear deflection in mm (smaller = finer)")
    args = p.parse_args()

    names = json.loads(args.names.read_text()) if args.names else {}
    reader = STEPControl_Reader()
    if reader.ReadFile(str(args.step)) != 1:
        raise SystemExit(f"cannot read {args.step}")
    reader.TransferRoots()
    root = reader.OneShape()
    BRepMesh_IncrementalMesh(root, args.deflection, False, 0.3, True)

    # mm, x = optic axis (cornea at -x)  ->  m, three.js: x'=-y, y'=z, z'=-x. Rotation, det +1.
    rot = np.array([[0, -1, 0], [0, 0, 1], [-1, 0, 0]], float)
    scene, rows = trimesh.Scene(), []
    it, i = TopoDS_Iterator(root), 0
    while it.More():
        v, f = solid_to_mesh(it.Value())
        mesh = trimesh.Trimesh(v @ rot.T / 1000.0, f, process=True)
        name = names.get(str(i), f"solid_{i}")
        mesh.visual.face_colors = np.tile(list(PALETTE[i % len(PALETTE)]) + [255], (len(mesh.faces), 1))
        scene.add_geometry(mesh, node_name=name, geom_name=name)
        lo, hi = (mesh.bounds * 1000).round(2)
        rows.append([i, name, len(mesh.faces), round(abs(mesh.volume) * 1e6, 1), *lo, *hi])
        print(f"{i}  {name:12s} {len(mesh.faces):6d} faces  {rows[-1][3]:8.1f} mL")
        i += 1
        it.Next()
    args.out.parent.mkdir(parents=True, exist_ok=True)
    scene.export(str(args.out.with_suffix(".glb")))
    with open(f"{args.out}_manifest.csv", "w", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["index", "name", "faces", "volume_ml", "x_min_mm", "y_min_mm", "z_min_mm", "x_max_mm", "y_max_mm", "z_max_mm"])
        w.writerows(rows)
    print(f"wrote {args.out.with_suffix('.glb')}")


if __name__ == "__main__":
    main()
