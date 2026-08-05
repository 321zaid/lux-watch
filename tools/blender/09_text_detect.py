"""Detect text-like clusters in the metal baseColor texture: busy (high local contrast) pixel clusters.
Prints ASCII of the most text-dense UV region and the bounding boxes of glyph blobs."""
import bpy
import numpy as np
import sys
from collections import deque

IMG = sys.argv[sys.argv.index("--") + 1]
REGION = sys.argv[sys.argv.index("--") + 2]  # "u0,v0,u1,v1"

img = bpy.data.images.load(IMG, check_existing=True)
w, h = img.size
px = np.empty(w * h * 4, dtype=np.float32)
img.pixels.foreach_get(px)
px = px.reshape(h, w, 4)
lum = np.clip(px[..., :3] @ np.array([0.2126, 0.7152, 0.0722]), 0, 1)

u0, v0, u1, v1 = [float(x) for x in REGION.split(",")]
x0, x1 = int(u0 * w), max(int(u1 * w), int(u0 * w) + 1)
y0, y1 = int((1 - v1) * h), max(int((1 - v0) * h), int((1 - v1) * h) + 1)
sub = lum[y0:y1, x0:x1]

# local gradient magnitude
gy, gx = np.gradient(sub)
g = np.sqrt(gx * gx + gy * gy)
thr = np.percentile(g, 92)
edge = g > thr

H, W = edge.shape
visited = np.zeros_like(edge)
clusters = []
for yy in range(H):
    for xx in range(W):
        if edge[yy, xx] and not visited[yy, xx]:
            c = []
            q = deque([(yy, xx)])
            visited[yy, xx] = True
            while q:
                cy, cx = q.popleft()
                c.append((cy, cx))
                for dy, dx in ((1,0),(-1,0),(0,1),(0,-1),(1,1),(1,-1),(-1,1),(-1,-1)):
                    ny, nx = cy+dy, cx+dx
                    if 0 <= ny < H and 0 <= nx < W and edge[ny, nx] and not visited[ny, nx]:
                        visited[ny, nx] = True
                        q.append((ny, nx))
            if len(c) >= 4:
                ys = [p[0] for p in c]; xs = [p[1] for p in c]
                clusters.append((len(c), (min(ys), max(ys), min(xs), max(xs))))

clusters.sort(reverse=True)
print(f"REGION uv({u0},{v0},{u1},{v1}) image px x[{x0}:{x1}] y[{y0}:{y1}] clusters={len(clusters)}")
for n, (a, b, c, d) in clusters[:40]:
    # convert to uv
    uv_y0 = 1 - (y0 + a) / h
    uv_y1 = 1 - (y0 + b) / h
    uv_x0 = (x0 + c) / w
    uv_x1 = (x0 + d) / w
    print(f"  n={n:5d} size={b-a+1}x{d-c+1} uv(u{uv_x0:.4f}..{uv_x1:.4f}, v{uv_y1:.4f}..{uv_y0:.4f})")