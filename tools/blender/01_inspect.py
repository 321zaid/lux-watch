"""Inspect a GLB: meshes, tri counts, materials, images, UV bounds per mesh."""
import bpy
import json
import sys

SRC = sys.argv[sys.argv.index("--") + 1]

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)

report = {
    "scene": [],
    "images": [],
    "materials": [],
}
for img in bpy.data.images:
    report["images"].append({
        "name": img.name,
        "w": img.size[0],
        "h": img.size[1],
        "channels": img.channels,
        "filepath": img.filepath,
    })
for mat in bpy.data.materials:
    mat_info = {"name": mat.name}
    mat_info["use_nodes"] = mat.use_nodes
    nodes = []
    if mat.node_tree:
        for nd in mat.node_tree.nodes:
            if nd.type in {"TEX_IMAGE"}:
                nodes.append({"node": nd.name, "image": nd.image.name if nd.image else None})
    mat_info["texture_nodes"] = nodes
    report["materials"].append(mat_info)

meshes = []
for obj in bpy.data.objects:
    if obj.type == "MESH":
        me = obj.data
        tris = sum(len(p.vertices) - 2 for p in me.polygons)
        mat_names = [m.name if m else None for m in me.materials]
        meshes.append({
            "name": obj.name,
            "triangles": tris,
            "verts": len(me.vertices),
            "materials": mat_names,
            "has_uv": bool(me.uv_layers),
        })
report["meshes"] = meshes
report["total_triangles"] = sum(m["triangles"] for m in meshes)

with open(r"C:\my web\watch\tools\blender\out\inspect.json", "w") as f:
    json.dump(report, f, indent=2)
print(json.dumps(report, indent=2))