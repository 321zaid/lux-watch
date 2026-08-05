"""Render studio shots of the debranded watch for catalog imagery.
Each shot is a transparent PNG (1024x1024) with cinematic studio lighting.
"""
import bpy
import sys
import os
from mathutils import Vector

SRC = sys.argv[sys.argv.index("--") + 1]
OUT_DIR = sys.argv[sys.argv.index("--") + 2]

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
scene.eevee.taa_render_samples = 48
scene.render.resolution_x = 1024
scene.render.resolution_y = 1024
scene.render.film_transparent = True
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGBA"
scene.world = bpy.data.worlds.new("studio")
scene.world.use_nodes = True
bg = scene.world.node_tree.nodes["Background"]
bg.inputs[0].default_value = (0.0, 0.0, 0.0, 1.0)
bg.inputs[1].default_value = 0.6

TARGET = Vector((0.0, 0.0, 0.045))

def add_area(name, color, energy, pos, size=0.35):
    l = bpy.data.lights.new(name, "AREA")
    l.energy = energy
    l.color = color
    l.size = size
    o = bpy.data.objects.new(name, l)
    scene.collection.objects.link(o)
    o.location = pos
    t = bpy.data.objects.new("tgt_" + name, None)
    scene.collection.objects.link(t)
    t.location = TARGET
    c = o.constraints.new("TRACK_TO")
    c.target = t
    c.track_axis = "TRACK_NEGATIVE_Z"
    c.up_axis = "UP_Y"
    return o

add_area("Key", (1.0, 0.97, 0.92), 900, (0.55, 0.75, 0.55), 0.9)
add_area("Rim", (0.85, 0.9, 1.0), 600, (-0.75, 0.55, 0.35), 0.6)
add_area("Top", (1.0, 0.98, 0.95), 400, (0.2, -0.4, 0.9), 1.2)
add_area("Under", (0.9, 0.88, 0.85), 250, (0.0, 0.2, -0.6), 1.0)

cam_data = bpy.data.cameras.new("cam")
cam_obj = bpy.data.objects.new("cam", cam_data)
scene.collection.objects.link(cam_obj)
cam_obj.data.lens = 60
scene.camera = cam_obj

SHOTS = {
    "shot-front.png": ((0.0, 0.30, 0.05), 60),
    "shot-angle.png": ((0.17, 0.20, 0.13), 55),
    "shot-profile.png": ((0.30, 0.0, 0.05), 55),
    "shot-crown.png": ((0.19, 0.14, 0.12), 70),
    "shot-bracelet.png": ((0.0, -0.34, 0.06), 55),
    "shot-caseback.png": ((0.0, -0.30, 0.05), 60),
}

for fname, (cam_pos, lens) in SHOTS.items():
    cam_obj.location = cam_pos
    cam_data.lens = lens
    direction = TARGET - cam_obj.location
    cam_obj.rotation_euler = Vector((0, 0, -1)).rotation_difference(direction.normalized()).to_euler()
    scene.render.filepath = os.path.join(OUT_DIR, fname)
    bpy.ops.render.render(write_still=True)
    print("SHOT", fname)
