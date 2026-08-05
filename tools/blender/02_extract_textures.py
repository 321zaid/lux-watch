"""Extract all images from a GLB to PNG."""
import bpy
import os
import sys

SRC = sys.argv[sys.argv.index("--") + 1]
OUT = sys.argv[sys.argv.index("--") + 2]

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)

os.makedirs(OUT, exist_ok=True)
for img in bpy.data.images:
    res = f"{img.size[0]}x{img.size[1]}"
    path = os.path.join(OUT, f"{res}_{img.name}.png")
    img.filepath_raw = path
    img.filepath = path
    img.save()
    print("saved", path, img.size[0], img.size[1])