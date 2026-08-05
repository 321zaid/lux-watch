"""Print UV bbox of each mesh and per-mesh top-N UV islands (connected components of UV coverage)."""
import bpy
import numpy as np
import sys
from collections import deque

SRC = sys.argv[sys.argv.index("--") + 1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)

MX = 512

def pit(px, py, ax, ay, bx, by):
    return (px - bx) * (ay - by) - (ax - bx) * (py - by)

def coverage_matrix(obj, mx):
    me = obj.data
    uv0 = me.uv_layers[0]
    mask = np.zeros((mx, mx), dtype=bool)
    tris = []
    for p in me.polygons:
        loop_ids = list(p.loop_indices)
        for i in range(1, len(loop_ids) - 1):
            tris.append([loop_ids[0], loop_ids[i], loop_ids[i + 1]])
    for tri in tris:
        pts = [uv0.data[i].uv for i in tri]
        (ax, ay), (bx, by), (cx, cy) = [(uv.x, uv.y) for uv in pts]
        xs = [ax * mx, bx * mx, cx * mx]
        ys = [ay * mx, by * mx, cy * mx]
        x0, x1 = max(0, int(min(xs)) - 2), min(mx, int(max(xs)) + 3)
        y0, y1 = max(0, int(min(ys)) - 2), min(mx, int(max(ys)) + 3)
        for yy in range(y0, y1):
            for xx in range(x0, x1):
                u = xx + 0.5
                v = yy + 0.5
                d1 = pit(u, v, ax, ay, bx, by)
                d2 = pit(u, v, bx, by, cx, cy)
                d3 = pit(u, v, cx, cy, ax, ay)
                neg = (d1 < 0) or (d2 < 0) or (d3 < 0)
                pos = (d1 > 0) or (d2 > 0) or (d3 > 0)
                if not (neg and pos):
                    mask[mx - 1 - yy, xx] = True
    return mask

def islands(mask):
    H, W = mask.shape
    visited = np.zeros_like(mask)
    comps = []
    for y in range(H):
        for x in range(W):
            if mask[y, x] and not visited[y, x]:
                comp = []
                q = deque([(y, x)])
                visited[y, x] = True
                while q:
                    cy, cx = q.popleft()
                    comp.append((cy, cx))
                    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        ny, nx = cy + dy, cx + dx
                        if 0 <= ny < H and 0 <= nx < W and mask[ny, nx] and not visited[ny, nx]:
                            visited[ny, nx] = True
                            q.append((ny, nx))
                if len(comp) >= 8:
                    ys = [c[0] for c in comp]; xs = [c[1] for c in comp]
                    comps.append((len(comp), (min(ys), max(ys), min(xs), max(xs))))
    comps.sort(reverse=True)
    return comps

for obj in bpy.data.objects:
    if obj.type != "MESH":
        continue
    me = obj.data
    tris = sum(len(p.vertices) - 2 for p in me.polygons)
    mat = me.materials[0].name if me.materials and me.materials[0] else "?"
    uv0 = me.uv_layers[0]
    if not uv0:
        continue
    mask = coverage_matrix(obj, MX)
    comps = islands(mask)
    us = [uv0.data[i].uv[0] for i in range(len(uv0.data))]
    vs = [uv0.data[i].uv[1] for i in range(len(uv0.data))]
    uvbb = (min(us), min(vs), max(us), max(vs))
    print(f"{obj.name:32s} mat={mat:6s} tris={tris:6d} uvbb(u{uvbb[0]:.3f},v{uvbb[1]:.3f},u{uvbb[2]:.3f},v{uvbb[3]:.3f})")
    for n, (y0, y1, x0, x1) in comps[:4]:
        print(f"    island n={n:5d} v[{y0/MX:.4f}:{y1/MX:.4f}] u[{x0/MX:.4f}:{x1/MX:.4f}]")