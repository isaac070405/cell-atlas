#!/usr/bin/env python3
"""Convert TotalSegmentator label masks into one named, coloured GLB per subject.

Dataset: https://doi.org/10.5281/zenodo.22688904 (CC BY 4.0, Wasserthal et al.,
Radiology: AI 2023, doi:10.1148/ryai.230024). Credit the paper when meshes ship.

Expected subject layout (as in the dataset zip):
    sXXXX/ct.nii.gz
    sXXXX/segmentations/<label>.nii.gz

Pipeline per label: load mask, reorient to RAS, crop to bounding box, keep the
largest connected component, Gaussian-smooth the mask, marching cubes at 0.5,
Taubin smoothing, quadric decimation, then convert millimetres in RAS to
metres in three.js axes (x = -R, y = S, z = A, so the body faces +z, y up).

Usage:
    python totalsegmentator_to_glb.py --subject path/to/s0011 --out out/
    python totalsegmentator_to_glb.py --dataset path/to/Totalsegmentator_dataset_v300 \
        --count 5 --out out/ --faces 6000
"""
import argparse
import csv
import re
import sys
from pathlib import Path

import numpy as np
import nibabel as nib
import trimesh
from scipy import ndimage
from skimage import measure

# Body system by label-name pattern. First match wins. Edit to match the wiki systems.
SYSTEMS = [
    ("skeletal", r"^(vertebrae_|rib_|sternum|costal_cartilages|sacrum|hip_|femur_|humerus_|scapula_|clavicula_|skull|face)", (232, 220, 196)),
    ("muscular", r"^(gluteus_|iliopsoas_|autochthon_)", (178, 60, 60)),
    ("circulatory", r"^(heart|aorta|inferior_vena_cava|superior_vena_cava|portal_vein|pulmonary_|iliac_|brachiocephalic_|subclavian_|common_carotid_|atrial_appendage)", (200, 30, 45)),
    ("respiratory", r"^(lung_|trachea)", (240, 170, 170)),
    ("digestive", r"^(esophagus|stomach|duodenum|small_bowel|colon|liver|gallbladder|pancreas)", (150, 90, 50)),
    ("urinary", r"^(kidney_|urinary_bladder)", (170, 110, 60)),
    ("endocrine", r"^(adrenal_gland_|thyroid_gland)", (230, 190, 60)),
    ("nervous", r"^(brain|spinal_cord)", (230, 215, 120)),
    ("lymphatic", r"^spleen", (120, 60, 110)),
]
OTHER = ("other", (160, 160, 160))


def classify(label):
    for name, pattern, rgb in SYSTEMS:
        if re.match(pattern, label):
            return name, rgb
    return OTHER


def largest_component(mask):
    lab, n = ndimage.label(mask)
    if n <= 1:
        return mask
    sizes = ndimage.sum(mask, lab, range(1, n + 1))
    return lab == (1 + int(np.argmax(sizes)))


def mask_to_mesh(img, args):
    img = nib.as_closest_canonical(img)  # RAS+ axes
    data = np.asarray(img.dataobj) > 0
    if data.sum() < args.min_voxels:
        return None, int(data.sum())
    idx = np.argwhere(data)
    lo = np.maximum(idx.min(0) - 3, 0)
    hi = np.minimum(idx.max(0) + 4, data.shape)
    sub = data[tuple(slice(a, b) for a, b in zip(lo, hi))]
    sub = largest_component(sub)
    voxels = int(sub.sum())
    vol = ndimage.gaussian_filter(sub.astype(np.float32), args.mask_sigma)
    if vol.max() <= 0.5:
        return None, voxels
    verts, faces, _, _ = measure.marching_cubes(vol, level=0.5)
    verts = verts + lo  # back to full-volume voxel indices
    verts = nib.affines.apply_affine(img.affine, verts)  # mm, RAS
    # RAS mm -> three.js metres: x=-R, y=S, z=A (proper rotation, det +1).
    verts = np.column_stack([-verts[:, 0], verts[:, 2], verts[:, 1]]) / 1000.0
    mesh = trimesh.Trimesh(verts, faces, process=True)
    if args.smooth_iters > 0:
        trimesh.smoothing.filter_taubin(mesh, iterations=args.smooth_iters)
    if args.faces and len(mesh.faces) > args.faces:
        try:
            mesh = mesh.simplify_quadric_decimation(face_count=args.faces)
        except Exception as exc:  # fast_simplification missing or failed
            print(f"  decimation skipped: {exc}", file=sys.stderr)
    mesh.fix_normals()
    return mesh, voxels


def process_subject(subject, out_dir, args):
    seg_dir = subject / "segmentations"
    files = sorted(seg_dir.glob("*.nii.gz"))
    if args.only:
        files = [f for f in files if re.search(args.only, f.name.removesuffix(".nii.gz"))]
    if not files:
        print(f"{subject.name}: no segmentation files found", file=sys.stderr)
        return
    scene = trimesh.Scene()
    rows = []
    for f in files:
        label = f.name.removesuffix(".nii.gz")
        img = nib.load(str(f))
        mesh, voxels = mask_to_mesh(img, args)
        if mesh is None:
            rows.append([label, "", voxels, "", 0, "skipped"])
            continue
        system, rgb = classify(label)
        mesh.visual.face_colors = np.tile(list(rgb) + [255], (len(mesh.faces), 1))
        scene.add_geometry(mesh, node_name=label, geom_name=label)
        ml = voxels * float(np.prod(img.header.get_zooms()[:3])) / 1000.0
        rows.append([label, system, voxels, round(ml, 2), len(mesh.faces), "ok"])
        print(f"  {label:42s} {system:12s} {len(mesh.faces):6d} faces")
    out_dir.mkdir(parents=True, exist_ok=True)
    glb = out_dir / f"{subject.name}.glb"
    scene.export(str(glb))
    with open(out_dir / f"{subject.name}_manifest.csv", "w", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["label", "system", "voxels", "volume_ml", "faces", "status"])
        w.writerows(rows)
    print(f"{subject.name}: wrote {glb} ({sum(r[5] == 'ok' for r in rows)} meshes)")


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    src = p.add_mutually_exclusive_group(required=True)
    src.add_argument("--subject", type=Path, help="one subject folder (contains segmentations/)")
    src.add_argument("--dataset", type=Path, help="extracted dataset folder with sXXXX subfolders")
    p.add_argument("--count", type=int, default=3, help="subjects to convert with --dataset (default 3)")
    p.add_argument("--out", type=Path, default=Path("out"))
    p.add_argument("--only", help="regex on label names, e.g. '^(liver|kidney_)'")
    p.add_argument("--faces", type=int, default=8000, help="max faces per label (0 = no decimation)")
    p.add_argument("--mask-sigma", type=float, default=0.8, help="Gaussian sigma in voxels")
    p.add_argument("--smooth-iters", type=int, default=15, help="Taubin iterations (0 = off)")
    p.add_argument("--min-voxels", type=int, default=50)
    args = p.parse_args()

    if args.subject:
        subjects = [args.subject]
    else:
        subjects = sorted(d for d in args.dataset.glob("s*") if (d / "segmentations").is_dir())[: args.count]
    for s in subjects:
        print(f"{s.name}")
        process_subject(s, args.out, args)


if __name__ == "__main__":
    main()
