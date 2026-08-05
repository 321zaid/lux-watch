"""Rasterize per-mesh UV coverage at MX=128 so I can see island shapes per mesh in ASCII."""
import bpy
import numpy as np
import sys

SRC = sys.argv[sys.argv.index("--") + 1]
NAMES = sys.argv[sys.argv.index("--") + 2].split(",")
MX = int(sys.argv[sys.argv.index("--") + 3])

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)

def coverage_matrix(obj, mx):
    me = obj.data
    uv0 = me.uv_layers[0]
    mask = np.zeros((mx, mx), dtype=bool)
    lut = {}
    tris = []
    for p in me.polygons:
        loop_ids = list(p.loop_indices)
        for i in range(1, len(loop_ids) - 1):
            tris.append([loop_ids[0], loop_ids[i], loop_ids[i + 1]])
    for tri in tris:
        pts = [uv0.data[i].uv for i in tri]
        xs = [uv.x * mx for uv in pts]
        ys = [uv.y * mx for uv in pts]
        xmin, xmax = max(0.0, min(xs) - 1), min(mx, max(xs) + 1)
        ymin, ymax = max(0.0, min(ys) - 1), min(mx, max(ys) + 1)
        x0, x1 = int(xmin), int(np.ceil(xmax))
        y0, y1 = int(ymin), int(np.ceil(ymax))
        p0, p1, p2 = pts
        for yy in range(y0, y1):
            for xx in range(x0, x1):
                u = (xx + 0.5) / mx
                v = (yy + 0.5) / mx
                d1 = sign(u, v, p0, p1)
                d2 = sign(u, v, p1, p2)
                d3 = sign(u, v, p2, p0)
                has_neg = (d1 < 0) or (d2 < 0) or (d3 < 0)
                has_pos = (d1 > 0) or (d2 > 0) or (d3 > 0)
                if not (has_neg and has_pos):
                    mask[mx - 1 - yy, xx] = True
    return mask

def sign(px, py, v1, v2):
    return (px - v2[0]) * (v1[1] - v2[1]) - (v1[0] - v2[0]) * (py - v2[1])

def show(mask, cols, rows):
    H, W = mask.shape
    out = []
    for r in range(rows):
        line = []
        for c in range(cols):
            sub = mask[int(r * H / rows):int((r + 1) * H / rows), int(c * W / cols):int((c + 1) * W / cols)]
            line.append("#" if sub.any() else ".")
        out.append("".join(line))
    return "\n".join(out)

for name in NAMES:
    obj = bpy.data.objects.get(name)
    if obj is None:
        print(f"MISSING {name}")
        continue
    mask = coverage_matrix(obj, MX)
    print(f"===== {name} (N={mask.sum()}px @ {MX}) =====")
    print(show(mask, 96, 48))
    np.save(rf"C:\my web\watch\tools\blender\out\cov_{name}.npy", mask)
    print()