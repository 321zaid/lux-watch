"""Single final pass: import GLB, merge meshes by material, decimate to ~32k tris total,
apply the debranded/clean textures (dial base stays 2048; ORM/normal/glass downscaled to 1024),
center the watch at the origin, and export a web-ready GLB (Draco-compressed geometry).

Compatible with Blender 5.x (calc_normals_split was removed).
"""
import bpy
import os
import sys
from mathutils import Vector

SRC = sys.argv[sys.argv.index("--") + 1]
CLEAN_DIR = sys.argv[sys.argv.index("--") + 2]
DST = sys.argv[sys.argv.index("--") + 3]

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)

# ---- merge meshes by material (target: 2 draw calls) ----
mat_map = {}
for obj in bpy.data.objects:
    if obj.type != "MESH":
        continue
    mat = obj.data.materials[0] if obj.data.materials else None
    key = mat.name if mat else "unknown"
    mat_map.setdefault(key, []).append(obj)

merged = []
for key, objs in mat_map.items():
    if len(objs) == 1:
        merged.append(objs[0])
        continue
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    merged.append(objs[0])

meshes = [o for o in merged if o is not None and o.name in bpy.data.objects]
total = sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in meshes)
print("BEFORE tris:", total)

# ---- decimate toward shared budget (32k) ----
budget = 32000
for o in meshes:
    tris = sum(len(p.vertices) - 2 for p in o.data.polygons)
    if tris <= 1000:
        continue
    ratio = min(0.9, max(0.1, budget / max(total, 1)))
    mod = o.modifiers.new("dec", "DECIMATE")
    mod.decimate_type = "COLLAPSE"
    mod.ratio = ratio
    bpy.context.view_layer.objects.active = o
    bpy.ops.object.modifier_apply(modifier="dec")

new_total = sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in meshes)
print("AFTER tris:", new_total)

# ---- smooth shading + validate (normals recompute automatically on export) ----
for o in meshes:
    me = o.data
    for p in me.polygons:
        p.use_smooth = True
    me.validate(verbose=False)

# ---- load + downscale textures ----
def load_tex(rel_path, scale_to=None):
    p = os.path.join(CLEAN_DIR, rel_path)
    if not os.path.exists(p):
        p = os.path.join(os.path.dirname(CLEAN_DIR), rel_path)
    img = bpy.data.images.load(p, check_existing=True)
    if scale_to:
        img.scale(scale_to[0], scale_to[1])
        print("scaled", rel_path, "->", scale_to)
    return img

TEX_MAP = {
    "metal": {
        "files": ["metal-base.png", "metal-orm.png", "metal-normal.png"],
        "scales": [None, (1024, 1024), (1024, 1024)],
    },
    "Glass": {
        "files": ["../textures_2048/2048x2048_Image_3.png",
                  "../textures_2048/2048x2048_Image_4.png",
                  "../textures_2048/2048x2048_Image_5.png"],
        "scales": [(1024, 1024), (1024, 1024), (1024, 1024)],
    },
}

for mat in bpy.data.materials:
    if mat.name not in TEX_MAP:
        continue
    if not mat.node_tree:
        continue
    cfg = TEX_MAP[mat.name]
    pix = mat.node_tree.nodes
    img_nodes = [n for n in pix if n.type == "TEX_IMAGE"]
    imgs = [load_tex(f, s) for f, s in zip(cfg["files"], cfg["scales"])]
    for i, n in enumerate(img_nodes[:3]):
        n.image = imgs[i]
    print("textured material:", mat.name)

# ---- center at origin ----
bbox = []
for o in meshes:
    for v in o.bound_box:
        bbox.append(o.matrix_world @ Vector(v))
cx = sum(v[0] for v in bbox) / len(bbox)
cy = sum(v[1] for v in bbox) / len(bbox)
cz = sum(v[2] for v in bbox) / len(bbox)
for o in meshes:
    o.location.x -= cx
    o.location.y -= cy
    o.location.z -= cz

# ---- export ----
bpy.ops.export_scene.gltf(
    filepath=DST,
    export_format="GLB",
    use_selection=False,
    export_apply=True,
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6,
    export_vertex_color="NONE",
    export_morph=False,
    export_animations=False,
    export_image_format="AUTO",
    export_texcoords=True,
    export_normals=True,
    export_materials="EXPORT",
)
print("EXPORTED", DST)
