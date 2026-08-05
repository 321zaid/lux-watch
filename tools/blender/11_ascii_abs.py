"""ASCII with absolute brightness (0..1) - no per-crop normalization."""
import bpy
import numpy as np
import sys

IMG = sys.argv[sys.argv.index("--") + 1]
COLS = int(sys.argv[sys.argv.index("--") + 2])
ROWS = int(sys.argv[sys.argv.index("--") + 3])
REGION = sys.argv[sys.argv.index("--") + 4]

img = bpy.data.images.load(IMG, check_existing=True)
w, h = img.size
px = np.empty(w * h * 4, dtype=np.float32)
img.pixels.foreach_get(px)
px = px.reshape(h, w, 4)
lum = np.clip(px[..., :3] @ np.array([0.2126, 0.7152, 0.0722]), 0, 1)

RAMPS = " .:-=+*#%@"

u0, v0, u1, v1 = [float(x) for x in REGION.split(",")]
x0, x1 = int(u0 * w), max(int(u1 * w), int(u0 * w) + 1)
y0, y1 = int((1 - v1) * h), max(int((1 - v0) * h), int((1 - v1) * h) + 1)
sub = lum[y0:y1, x0:x1]
H, W = sub.shape
out = []
for r in range(ROWS):
    ya = int(r * H / ROWS)
    yb = int((r + 1) * H / ROWS)
    line = []
    for c in range(COLS):
        xa = int(c * W / COLS)
        xb = int((c + 1) * W / COLS)
        v = sub[ya:yb, xa:xb].mean()
        idx = min(int(v * (len(RAMPS) - 1)), len(RAMPS) - 1)
        line.append(RAMPS[idx])
    out.append("".join(line))
print(f"REGION {REGION} lum 0..1")
print("\n".join(out))