"""Render the watch from a given camera via EEVEE to a PNG for ASCII inspection."""
import bpy
import sys
from mathutils import Vector

SRC = sys.argv[sys.argv.index("--") + 1]
OUT = sys.argv[sys.argv.index("--") + 2]
CX, CY, CZ = [float(x) for x in sys.argv[sys.argv.index("--") + 3].split(",")]
TX, TY, TZ = [float(x) for x in sys.argv[sys.argv.index("--") + 4].split(",")]
LENS = float(sys.argv[sys.argv.index("--") + 5]) if len(sys.argv[sys.argv.index("--"):]) > 5 else 50

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)

for mat in bpy.data.materials:
    mat.use_nodes = True
    for nd in mat.node_tree.nodes:
        if nd.type == "TEX_IMAGE":
            try:
                nd.image.colorspace_settings.name = "sRGB"
            except Exception:
                pass

scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE"
scene.eevee.taa_render_samples = 32
scene.render.resolution_x = 1400
scene.render.resolution_y = 1000
scene.render.film_transparent = True
scene.render.image_settings.file_format = "PNG"
scene.render.filepath = OUT

cam_data = bpy.data.cameras.new("cam")
cam_obj = bpy.data.objects.new("cam", cam_data)
scene.collection.objects.link(cam_obj)
cam_obj.location = (CX, CY, CZ)
cam_data.lens = LENS
cam_obj.rotation_euler = Vector((0, 0, -1)).rotation_difference((Vector((TX, TY, TZ)) - cam_obj.location).normalized()).to_euler()
scene.camera = cam_obj

def add_area(name, color, energy, pos):
    l = bpy.data.lights.new(name, "AREA")
    l.energy = energy
    l.color = color
    l.size = 1.2
    o = bpy.data.objects.new(name, l)
    scene.collection.objects.link(o)
    o.location = pos
    # point toward origin
    cons = o.constraints.new("TRACK_TO")
    cons.target = cam_obj  # temporary; replaced below
    cons.track_axis = "TRACK_NEGATIVE_Z"
    cons.up_axis = "UP_Y"
    return o

# add a target at origin
target = bpy.data.objects.new("target", None)
scene.collection.objects.link(target)

add_area("Key", (1.0, 0.96, 0.90), 220, (0.8, 1.1, -0.3))
add_area("Fill", (0.72, 0.78, 1.0), 80, (-1.0, 0.2, 0.6))
add_area("Rim", (1.0, 1.0, 1.0), 400, (0.2, 1.4, -1.1))
add_area("Top", (1.0, 0.97, 0.93), 150, (0.4, -0.4, 1.2))

for o in scene.objects:
    if o.name in {"Vector", "Fill", "Rim", "Top"}:
        for cons in o.constraints:
            cons.target = target

bpy.ops.render.render(write_still=True)
print("RENDERED_TO", scene.render.filepath)
print("CAM_LOC", cam_obj.location, "LENS", cam_data.lens, "WATCH_IS_RENDERED")