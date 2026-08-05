"""Per-mesh geometry + UV stats to identify the dial mesh and its atlas region."""
import bpy
import json
import sys
from mathutils import Vector

SRC = sys.argv[sys.argv.index("--") + 1]

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)

stats = []
for obj in bpy.data.objects:
    if obj.type != "MESH":
        continue
    me = obj.data
    tris = sum(len(p.vertices) - 2 for p in me.polygons)
    bbox = [obj.matrix_world @ Vector(v) for v in obj.bound_box]
    dims = [max(a[i] for a in bbox) - min(a[i] for a in bbox) for i in range(3)]

    area_world = 0.0
    norm_counts = {}
    for p in me.polygons:
        area_world += p.area
        n = (obj.matrix_world.to_3x3() @ p.normal).normalized()
        key = (round(n.x, 3), round(n.y, 3), round(n.z, 3))
        norm_counts[key] = norm_counts.get(key, 0) + p.area

    dominant = max(norm_counts.items(), key=lambda kv: kv[1])[0]
    planar_ratio = max(norm_counts.values()) / max(area_world, 1e-9)

    uv_bbox = None
    uv0 = me.uv_layers[0] if me.uv_layers else None
    if uv0:
        xs, ys = [], []
        for p in me.polygons:
            for li in p.loop_indices:
                u, v = uv0.data[li].uv
                xs.append(u)
                ys.append(v)
        uv_bbox = [min(xs), min(ys), max(xs), max(ys)]

    stats.append({
        "name": obj.name,
        "tris": tris,
        "dims": [round(d, 3) for d in dims],
        "world_area": round(area_world, 3),
        "dominant_normal": dominant,
        "planar_ratio": round(planar_ratio, 3),
        "uv_bbox": [round(x, 4) for x in uv_bbox] if uv_bbox else None,
    })

with open(r"C:\my web\watch\tools\blender\out\mesh_stats.json", "w") as f:
    json.dump(stats, f, indent=2)
print(json.dumps(stats, indent=2))