import bpy, numpy as np, sys
from collections import deque
SRC = sys.argv[sys.argv.index("--") + 1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)
obj = bpy.data.objects.get("defaultMaterial.006")
print("obj:", obj)
me = obj.data
uv = me.uv_layers[0]
print("uv layer:", uv, "loops:", len(uv.data))
RES = 512

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
    cnt = 0
    for tri in tris:
        pts = [uv.data[i].uv for i in tri]
        (ax, ay), (bx, by), (cx, cy) = [(u.x, u.y) for u in pts]
        xs = [ax*res, bx*res, cx*res]
        ys = [ay*res, by*res, cy*res]
        x0, x1 = max(0, int(min(xs))-2), min(res, int(max(xs))+3)
        y0, y1 = max(0, int(min(ys))-2), min(res, int(max(ys))+3)
        for yy in range(y0, y1):
            for xx in range(x0, x1):
                u, v = xx+0.5, yy+0.5
                d1 = sign(u, v, ax, ay, bx, by)
                d2 = sign(u, v, bx, by, cx, cy)
                d3 = sign(u, v, cx, cy, ax, ay)
                neg = (d1 < 0) or (d2 < 0) or (d3 < 0)
                pos = (d1 > 0) or (d2 > 0) or (d3 > 0)
                if not (neg and pos):
                    mask[res-1-yy, xx] = True
        cnt += 1
    return mask

m = uv_mask_mesh(obj, RES)
print("sum:", m.sum())