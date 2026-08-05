"""Debrand the metal maps (base/ORM/normal) by:
  1) Redesigning the dial face (mesh defaultMaterial.006 UV island) with a clean, brand-neutral luxury dial.
  2) Inpainting other small text-like clusters across the whole atlas (case/bezel/caseback engravings).
  3) Flattening ORM + normal in the dial face so no embossed wordmark reads through.
Works purely in texture space; fully deterministic + verifiable via ASCII inspection.
"""
import bpy
import numpy as np
import os
import sys
from collections import deque

SRC_GLB = sys.argv[sys.argv.index("--") + 1]
TEX_DIR = sys.argv[sys.argv.index("--") + 2]
OUT_DIR = sys.argv[sys.argv.index("--") + 3]

rng = np.random.default_rng(3)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC_GLB)

RES = 2048

def sign(px, py, ax, ay, bx, by):
    return (px - bx) * (ay - by) - (ax - bx) * (py - by)

def uv_mask_mesh(obj, res):
    me = obj.data
    uv = me.uv_layers[0]
    mask = np.zeros((res, res), dtype=bool)
    tris = []
    for p in me.polygons:
        li = list(p.loop_indices)
        for i in range(1, len(li) - 1):
            tris.append([li[0], li[i], li[i + 1]])
    for tri in tris:
        pts = [uv.data[i].uv for i in tri]
        (ax, ay), (bx, by), (cx, cy) = [(u.x, u.y) for u in pts]
        xs = [ax * res, bx * res, cx * res]
        ys = [ay * res, by * res, cy * res]
        x0, x1 = max(0, int(min(xs)) - 2), min(res, int(max(xs)) + 3)
        y0, y1 = max(0, int(min(ys)) - 2), min(res, int(max(ys)) + 3)
        for yy in range(y0, y1):
            for xx in range(x0, x1):
                u, v = (xx + 0.5) / res, (yy + 0.5) / res
                d1 = sign(u, v, ax, ay, bx, by)
                d2 = sign(u, v, bx, by, cx, cy)
                d3 = sign(u, v, cx, cy, ax, ay)
                neg = (d1 < 0) or (d2 < 0) or (d3 < 0)
                pos = (d1 > 0) or (d2 > 0) or (d3 > 0)
                if not (neg and pos):
                    mask[res - 1 - yy, xx] = True
    return mask

def largest_island(mask):
    RES = mask.shape[0]
    visited = np.zeros_like(mask)
    islands = []
    for y0 in range(RES):
        for x0 in range(RES):
            if mask[y0, x0] and not visited[y0, x0]:
                comp = []
                q = deque([(y0, x0)])
                visited[y0, x0] = True
                while q:
                    cy, cx = q.popleft()
                    comp.append((cy, cx))
                    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        ny, nx = cy + dy, cx + dx
                        if 0 <= ny < RES and 0 <= nx < RES and mask[ny, nx] and not visited[ny, nx]:
                            visited[ny, nx] = True
                            q.append((ny, nx))
                if len(comp) >= 50:
                    islands.append(np.array(comp))
    islands.sort(key=len, reverse=True)
    return islands

dial_mask_full = uv_mask_mesh(bpy.data.objects["defaultMaterial.006"], RES)
dial_islands = largest_island(dial_mask_full)
island = np.zeros((RES, RES), dtype=bool)
big = dial_islands[0]
for (y, x) in big:
    island[y, x] = True

ys = big[:, 0]; xs = big[:, 1]
cy, cx = ys.mean(), xs.mean()
y0f, y1f, x0f, x1f = ys.min(), ys.max(), xs.min(), xs.max()
radius = max((y1f - y0f), (x1f - x0f)) / 2 * 0.90
print(f"DIAL island px={len(big)} center=({cx:.0f},{cy:.0f}) radius={radius:.0f} bbox y[{y0f}:{y1f}] x[{x0f}:{x1f}]")

YY, XX = np.mgrid[0:RES, 0:RES].astype(float)
d = np.sqrt((XX - cx) ** 2 + (YY - cy) ** 2)
noise = rng.normal(0, 1, (RES, RES))

rf = max(radius, 1.0)
base_r = np.clip(0.10 - 0.04 * (d / rf) + 0.015 * noise, 0, 1)
base_g = np.clip(0.11 - 0.045 * (d / rf) + 0.015 * noise, 0, 1)
base_b = np.clip(0.16 - 0.06 * (d / rf) + 0.015 * noise, 0, 1)

def paint(px, py, r, g, b):
    if 0 <= px < RES and 0 <= py < RES and island[py, px]:
        base_r[py, px] = r
        base_g[py, px] = g
        base_b[py, px] = b

# applied gold baton indices at 12/3/6/9
gold = (0.80, 0.63, 0.36)
for (ux, uy, r0f, r1f) in [(0, 1, 0.10, 1.35), (0, -1, 0.10, 1.35), (1, 0, 0.16, 1.42), (-1, 0, 0.16, 1.42)]:
    for rr in np.linspace(radius * r0f, radius * r1f, 60):
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1), (0, 0), (-2, 0), (2, 0), (0, -2), (0, 2)):
            paint(int(cx + rr * ux) + dx, int(cy - rr * uy) + dy, *gold)

# minute track ticks
for k in range(60):
    a = 2 * np.pi * k / 60 - np.pi / 2
    big_tick = k % 5 == 0
    r0 = radius * (0.88 if big_tick else 0.925)
    c = (0.6, 0.55, 0.7) if big_tick else (0.32, 0.3, 0.4)
    for rr in np.linspace(r0, radius * 0.98, 14):
        paint(int(cx + rr * np.cos(a)), int(cy + rr * np.sin(a)), *c)

# ---- stitch into the existing base texture ----
def load_flat(path):
    img = bpy.data.images.load(path, check_existing=True)
    arr = np.empty(RES * RES * 4, dtype=np.float32)
    img.pixels.foreach_get(arr)
    arr = arr.reshape(RES, RES, 4)
    bpy.data.images.remove(img)
    return arr

base_px = load_flat(os.path.join(TEX_DIR, "2048x2048_Image_0.png"))
rgb = np.stack([base_r, base_g, base_b], axis=2)
base_px[..., :3] = np.where(island[..., None], rgb, base_px[..., :3])

# inpaint small text-like clusters anywhere (excluding dial island) that look like glyph clusters
lum = np.clip(base_px[..., :3] @ np.array([0.2126, 0.7152, 0.0722]), 0, 1)
gy, gx = np.gradient(lum)
g = np.sqrt(gx * gx + gy * gy)
edge = g > np.percentile(g, 97)
edge &= ~island
visited = np.zeros_like(edge)
n_out = 0
for y0 in range(RES):
    for x0 in range(RES):
        if edge[y0, x0] and not visited[y0, x0]:
            comp = []
            q = deque([(y0, x0)])
            visited[y0, x0] = True
            while q:
                cy, cx = q.popleft()
                comp.append((cy, cx))
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ny, nx = cy + dy, cx + dx
                    if 0 <= ny < RES and 0 <= nx < RES and edge[ny, nx] and not visited[ny, nx]:
                        visited[ny, nx] = True
                        q.append((ny, nx))
            if 20 <= len(comp) <= 3000:
                pts = np.array(comp)
                y0c, x0c = pts[:, 0].min(), pts[:, 1].min()
                y1c, x1c = pts[:, 0].max(), pts[:, 1].max()
                bw, bh = x1c - x0c, y1c - y0c
                if bw * bh <= 900 and not (x0c <= 6 or y0c <= 6 or x1c >= RES - 7 or y1c >= RES - 7):
                    pad = 8
                    s = base_px[max(0, y0c - pad):min(RES, y1c + pad + 1), max(0, x0c - pad):min(RES, x1c + pad + 1)]
                    avg = s[..., :3].mean(axis=(0, 1))
                    base_px[y0c:y1c + 1, x0c:x1c + 1, :3] = np.clip(avg * rng.uniform(0.97, 1.03), 0, 1)
                    n_out += 1
print("INPAINTED clusters:", n_out)

def write_png(dst, arr):
    oi = bpy.data.images.new("oi_" + dst, RES, RES, alpha=True)
    oi.pixels[:] = arr.reshape(-1)
    oi.filepath_raw = dst
    oi.filepath = dst
    oi.save()
    bpy.data.images.remove(oi)

write_png(os.path.join(OUT_DIR, "metal-base.png"), base_px)

# ---- flatten ORM + normal in the dial island ----
for src, dst, mode in [("2048x2048_Image_1.png", "metal-orm.png", "orm"), ("2048x2048_Image_2.png", "metal-normal.png", "normal")]:
    arr = load_flat(os.path.join(TEX_DIR, src))
    if mode == "orm":
        mm = arr.copy()
        not_island = ~island
        avg = mm[..., :3][not_island].mean(axis=0)
        arr[island, :3] = avg
    else:
        arr[island, :3] = np.array([0.5, 0.5, 1.0])
    write_png(os.path.join(OUT_DIR, dst), arr)

print("DONE")