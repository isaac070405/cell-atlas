#!/usr/bin/env python3
"""Turn a skull-stripped T1w brain template (e.g. tpl-mni_T1w.nii.gz) into a GLB.

Parts written, one node each, in metres, three.js axes (x = patient left, y up, z anterior),
centred on the brain's bounding box, scaled to fit --fit:
    cortex_left, cortex_right      grey plus white matter surface (pial-like), cerebrum only
    white_matter_left, _right      white matter surface
    cerebellum                     both hemispheres
The brainstem is cut away (the viewer draws its own) and is not exported.

Method: multi-Otsu splits the intensity into CSF, grey and white matter. Brain mask = grey + white
with holes filled. Marker watershed on the distance map separates cerebrum, cerebellum and brainstem
from seed points placed at fixed fractions of the brain bounding box (check with --debug-png).
Marching cubes, Taubin smoothing and quadric decimation give the surfaces.

Usage:
    python mni_brain_to_glb.py tpl-mni_T1w.nii.gz --out out/mni_brain --debug-png
"""
import argparse
import json
from pathlib import Path

import nibabel as nib
import numpy as np
import trimesh
from scipy import ndimage
from skimage import filters, measure, morphology, segmentation

# Landmarks in voxel indices of tpl-mni_T1w.nii.gz after reorientation to RAS (y posterior to
# anterior, z inferior to superior), read from a mid-sagittal and a lateral sagittal slice.
# Other templates need new values (check them with --debug-png).
CEREBELLUM_TOP = [(22, 35), (35, 50), (55, 58), (75, 55), (92, 42)]   # (y, z) roof line of the cerebellum
CEREBELLUM_ELLIPSOID = ((None, 56, 30), (53, 33, 30))                   # centre (x = midline, y, z) and semi-axes in voxels
STEM_HALF_WIDTH = 15                                                    # voxels either side of the midline
STEM_BACK = (52, 0.4)                                                   # y >= 52 + 0.4 z
STEM_FRONT = (74, 0.3)                                                  # y <= 74 + 0.3 z
STEM_TOP_Z = 66


def largest(mask):
    lab, n = ndimage.label(mask)
    if n <= 1:
        return mask
    return lab == 1 + int(np.argmax(ndimage.sum(mask, lab, range(1, n + 1))))


def surface(mask, zoom, args, lo, mid_x):
    vol = ndimage.gaussian_filter(np.pad(mask.astype(np.float32), 2), args.sigma)
    v, f, _, _ = measure.marching_cubes(vol, 0.5)
    v = (v - 2) * zoom  # voxel axes in mm; the template's oblique affine would tilt the head by ~18 degrees
    m = trimesh.Trimesh(v, f, process=True)
    trimesh.smoothing.filter_taubin(m, iterations=args.smooth)
    if args.faces and len(m.faces) > args.faces:
        m = m.simplify_quadric_decimation(face_count=args.faces)
    # RAS mm -> viewer metres. x = -(R - mid), y = S - lo_z, z = A - lo_y
    p = (m.vertices - np.array([mid_x, lo[1], lo[2]])) * args.k  # lo = (unused, AP centre, height centre)
    m = trimesh.Trimesh(np.column_stack([-p[:, 0], p[:, 2], p[:, 1]]), m.faces, process=False)
    m.fix_normals()
    return m


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("t1", type=Path)
    ap.add_argument("--out", type=Path, default=Path("out/mni_brain"))
    ap.add_argument("--faces", type=int, default=60000, help="max faces for the cortex surfaces")
    ap.add_argument("--sigma", type=float, default=0.8)
    ap.add_argument("--smooth", type=int, default=10)
    ap.add_argument("--fit", default="0.128,0.160,0.108", help="target width,length,height in metres")
    ap.add_argument("--debug-png", action="store_true")
    args = ap.parse_args()

    img = nib.as_closest_canonical(nib.load(str(args.t1)))
    d = np.asarray(img.dataobj).astype(np.float32)
    t_csf, t_wm = filters.threshold_multiotsu(d[d > 0], classes=3)
    brain = ndimage.binary_fill_holes(largest(d > t_csf))
    brain = morphology.binary_opening(brain, morphology.ball(1))
    wm = ndimage.binary_fill_holes(largest(d > t_wm))
    print(f"thresholds csf/grey {t_csf:.1f}, grey/white {t_wm:.1f}; brain {brain.sum()} voxels")

    idx = np.argwhere(brain)
    lo, hi = idx.min(0), idx.max(0)
    mid = int(round(idx[:, 0].mean()))
    X, Y, Z = np.meshgrid(np.arange(d.shape[0]), np.arange(d.shape[1]), np.arange(d.shape[2]), indexing="ij")
    stem = ((np.abs(X - mid) <= STEM_HALF_WIDTH) & (Y >= STEM_BACK[0] + STEM_BACK[1] * Z)
            & (Y <= STEM_FRONT[0] + STEM_FRONT[1] * Z) & (Z <= STEM_TOP_Z))
    roof = np.interp(Y, [p[0] for p in CEREBELLUM_TOP], [p[1] for p in CEREBELLUM_TOP])
    (_, ey, ez), (ax_, ay_, az_) = CEREBELLUM_ELLIPSOID
    ell = ((X - mid) / ax_) ** 2 + ((Y - ey) / ay_) ** 2 + ((Z - ez) / az_) ** 2 <= 1
    cerebellum = ell & (Z < roof) & ~stem
    lab_all = np.where(stem, 3, np.where(cerebellum, 2, 1)).astype(np.int32)
    del X, Y, Z

    xs = np.arange(d.shape[0])
    left_half = (xs > mid)[:, None, None]  # RAS: larger index = more Right
    # RAS+: index grows toward the Right, so index above the midline is the patient's RIGHT
    parts = {}
    cer = (lab_all == 2) & brain
    cerebrum = (lab_all == 1) & brain
    for side, half in (("right", left_half), ("left", ~left_half)):
        m = cerebrum & half
        if m.any():
            parts[f"cortex_{side}"] = (largest(m), args.faces)
        w_ = wm & (lab_all == 1) & half
        if w_.any():
            parts[f"white_matter_{side}"] = (largest(w_), args.faces // 2)
    parts["cerebellum"] = (largest(cer), args.faces // 2)

    # fit to the exported parts only (the brainstem and stray tissue are not exported)
    union = np.zeros(d.shape, bool)
    for mask, _ in parts.values():
        union |= mask
    idx = np.argwhere(union)
    lo, hi = idx.min(0), idx.max(0)
    zoom = np.array(img.header.get_zooms()[:3])
    ext = (hi - lo + 1) * zoom
    w, l, h = (float(x) for x in args.fit.split(","))
    args.k = min(w / ext[0], l / ext[1], h / ext[2])  # metres per mm
    print(f"exported extent mm {ext.round(1).tolist()}, scale {args.k * 1000:.3f}")
    lo_mm = lo * zoom
    mid_x = ((lo + hi) / 2 * zoom)[0]

    scene = trimesh.Scene()
    cols = {"cortex": (217, 179, 174), "white": (241, 236, 228), "cerebellum": (205, 160, 146)}
    for name, (mask, nf) in parts.items():
        a = argparse.Namespace(**{**vars(args), "faces": nf})
        m = surface(mask, zoom, a, np.array([0, lo_mm[1] + ext[1] / 2, lo_mm[2] + ext[2] / 2]), mid_x)
        key = "cortex" if name.startswith("cortex") else "white" if name.startswith("white") else "cerebellum"
        m.visual.face_colors = np.tile(list(cols[key]) + [255], (len(m.faces), 1))
        scene.add_geometry(m, node_name=name, geom_name=name)
        print(f"{name:18s} {len(m.faces):6d} faces  bounds mm {(m.bounds * 1000).round(0).tolist()}")
    args.out.parent.mkdir(parents=True, exist_ok=True)
    scene.export(str(args.out.with_suffix(".glb")))
    print("wrote", args.out.with_suffix(".glb"))

    # T1 volume for the viewer's axial series: uint8, C order [x][y][z] in the reoriented grid
    # (x index grows toward patient right, y toward anterior, z toward superior), plus the mapping
    # from voxel index to viewer metres, with voxel_m = metres per voxel along each axis:
    # x_v = -(i - cx) * voxel_m[0], z_v = (j - cy) * voxel_m[1], y_v = (l - cz) * voxel_m[2].
    hi_v = np.percentile(d[d > 0], 99.5)
    vol8 = np.clip(d / hi_v * 255.0, 0, 255).astype(np.uint8)
    vol8.tofile(str(args.out) + "_t1.bin")
    centre = ((lo + hi) / 2.0).tolist()
    json.dump({"shape": list(d.shape), "voxel_m": (args.k * zoom).tolist(), "centre": centre},
              open(str(args.out) + "_t1.json", "w"))
    print("wrote", str(args.out) + "_t1.bin", f"({vol8.nbytes / 1e6:.1f} MB)")

    if args.debug_png:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
        fig, ax = plt.subplots(1, 3, figsize=(15, 5))
        c = ((lo + hi) // 2).astype(int)
        for a, sl in zip(ax, (lab_all[c[0]], lab_all[:, c[1]], lab_all[:, :, c[2]])):
            a.imshow(sl.T, origin="lower", cmap="tab10", vmin=0, vmax=9)
        for a, sl in zip(ax, (d[c[0]], d[:, c[1]], d[:, :, c[2]])):
            a.imshow(sl.T, origin="lower", cmap="gray", alpha=0.35)
        fig.savefig(str(args.out) + "_labels.png", dpi=60)


if __name__ == "__main__":
    main()
