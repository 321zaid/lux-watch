"""Print world-space center/radius of each mesh, esp. flat discs, to identify dial/crystal/caseback."""
import bpy
import sys
from mathutils import Vector

SRC = sys.argv[sys.argv.index("--") + 1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)

rows = []
for obj in bpy.data.objects:
    if obj.type != "MESH":
        continue
    me = obj.data
    tris = sum(len(p.vertices) - 2 for p in me.polygons)
    center = Vector((0, 0, 0))
    world = obj.matrix_world
    for v in me.vertices:
        center += world @ v.co
    center /= len(me.vertices)
    mat_name = me.materials[0].name if me.materials and me.materials[0] else "?"

    total_area = 0.0
    weighted_norm = Vector((0, 0, 0))
    for p in me.polygons:
        a = p.area
        total_area += a
        weighted_norm += (world.to_3x3() @ p.normal) * a
    if total_area > 0:
        weighted_norm /= total_area
        weighted_norm.normalize()

    rows.append(f"{obj.name:34s} tris={tris:6d} mat={mat_name:8s} center=({center.x:+.4f},{center.y:+.4f},{center.z:+.4f}) avgN=({weighted_norm.x:+.3f},{weighted_norm.y:+.3f},{weighted_norm.z:+.3f})")

rows.sort()
print("\n".join(rows))
with open(r"C:\my web\watch\tools\blender\out\world_centers.txt", "w") as f:
    f.write("\n".join(rows))