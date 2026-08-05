"""Render a texture's luminance as ASCII to inspect structure (dial, logo, islands) without vision."""
import bpy
import numpy as np
import sys

IMG = sys.argv[sys.argv.index("--") + 1]
COLS = int(sys.argv[sys.argv.index("--") + 2])
ROWS = int(sys.argv[sys.argv.index("--") + 3])
REGION = sys.argv[sys.argv.index("--") + 4] if len(sys.argv[sys.argv.index("--") + 1:]) > 3 else None

img = bpy.data.images.load(IMG, check_existing=True)
w, h = img.size
px = np.empty(w * h * 4, dtype=np.float32)
img.pixels.foreach_get(px)
px = px.reshape(h, w, 4)
lum = np.clip(px[..., :3] @ np.array([0.2126, 0.7152, 0.0722]), 0, 1)

RAMPS = " .:-=+*#%@"

def ascii_render(arr, rows, cols):
    H, W = arr.shape
    out = []
    for r in range(rows):
        y0 = int(r * H / rows)
        y1 = int((r + 1) * H / rows)
        line = []
        for c in range(cols):
            x0 = int(c * W / cols)
            x1 = int((c + 1) * W / cols)
            v = arr[y0:y1, x0:x1].mean()
            idx = min(int(v * (len(RAMPS) - 1)), len(RAMPS) - 1)
            line.append(RAMPS[idx])
        out.append("".join(line))
    return "\n".join(out)

if REGION:
    u0, v0, u1, v1 = [float(x) for x in REGION.split(",")]
    x0, x1 = int(u0 * w), max(int(u1 * w), int(u0 * w) + 1)
    y0, y1 = int((1 - v1) * h), max(int((1 - v0) * h), int((1 - v1) * h) + 1)
    sub = lum[y0:y1, x0:x1]
    # normalize for readability
    lo, hi = np.percentile(sub, 2), np.percentile(sub, 98)
    sub = np.clip((sub - lo) / max(hi - lo, 1e-6), 0, 1)
    print(f"REGION {REGION} -> px x[{x0}:{x1}] y[{y0}:{y1}]")
    print(ascii_render(sub, ROWS, COLS))
else:
    print(ascii_render(lum, ROWS, COLS))