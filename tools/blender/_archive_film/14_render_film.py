"""Render the cinematic film beats of the debranded watch as 16:9 stills.

Phase 1 builds stills for every beat so the look can be approved before the
full camera-path render. The SHOTS table mirrors the R3F scene (same positions,
targets, vertical fovs) with the model normalized to the same 1.7-unit axis.
The dial faces each camera (matching the R3F yaw/pitch tune).

Usage:
  blender --background --factory-startup --python 14_render_film.py -- <glb> <out_dir>
"""
import bpy
import sys
import os
from math import radians, tan
from mathutils import Vector, Euler

ARGS = sys.argv[sys.argv.index("--") + 1:]
SRC = ARGS[0]
OUT_DIR = ARGS[1]

# t, pos, target, vertical fov — same sequence as the R3F film.
SHOTS = [
    (0.00, (3.6, 1.5, 3.6), (0.0, 0.0, 0.0), 31),
    (0.12, (2.9, 0.4, 2.9), (0.0, 0.05, 0.0), 30),
    (0.28, (2.7, 0.6, 1.95), (0.18, 0.12, 0.0), 28),
    (0.38, (0.2, 0.35, 2.4), (0.0, 0.0, 0.0), 26),
    (0.46, (3.3, 1.1, 1.9), (0.05, 0.02, 0.0), 29),
    (0.52, (-2.2, -0.2, 2.2), (0.0, 0.06, 0.0), 27),
    (0.64, (0.65, 0.8, 1.55), (0.05, 0.03, 0.0), 24),
    (0.72, (0.0, 0.35, 2.2), (0.0, 0.0, 0.0), 27),
    (0.80, (0.0, 0.35, 2.2), (0.0, 0.0, 0.0), 27),
    (0.87, (0.0, 0.33, 2.5), (0.0, 0.0, 0.0), 25),
    (0.94, (0.0, 0.33, 2.65), (0.0, 0.0, 0.0), 24),
    (1.00, (0.0, 0.33, 2.7), (0.0, 0.0, 0.0), 24),
]

# Per-beat dial yaw offset in degrees (rotation around world +Z, CCW positive).
# Beats 3 (crown reveal) and 6 (reflection sweep) are deliberately off-dial:
# R3F WATCH_YAW puts the crown beat ~25.6 deg off axis and the reflection
# sweep ~55.3 deg into a raking glass angle. Every other beat stays dial-on.
YAW_OFFSET = {2: -25.6, 5: 55.3}
# Side variants of the two off-dial beats so a reviewer can pick the flank.
VARIANTS = [
    (2, -25.6, "beat-028-vA.png"),
    (2, 25.6, "beat-028-vB.png"),
    (5, -55.3, "beat-052-vA.png"),
    (5, 55.3, "beat-052-vB.png"),
]

# Sensor math: R3F fov is vertical; Blender lens with sensor_fit=VERTICAL maps
# lens = (sensor_h/2) / tan(vfov/2) where sensor_h = 36 * 9/16 for a 16:9 frame.
SENSOR_W = 36.0
SENSOR_H = SENSOR_W * (9.0 / 16.0)
RES_W = 1920
RES_H = 1080


def lens_for(vfov_deg):
    return (SENSOR_H / 2.0) / tan(radians(vfov_deg) / 2.0)


bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)

# Normalize model longest axis to 1.7 and center it.
watch = None
for obj in bpy.data.objects:
    if obj.type == "MESH":
        watch = obj
        break
assert watch, "no mesh in GLB"
depsgraph = bpy.context.evaluated_depsgraph_get()
bbox = [watch.matrix_world @ Vector(v) for v in watch.bound_box]
min_c = Vector((min(v[i] for v in bbox) for i in range(3)))
max_c = Vector((max(v[i] for v in bbox) for i in range(3)))
size = max_c - min_c
longest = max(size)
s = 1.7 / longest
watch.scale = (s, s, s)
watch.location = -(((min_c + max_c) / 2.0) * s)
bpy.context.view_layer.update()

for mat in bpy.data.materials:
    if not mat.use_nodes:
        continue
    for nd in mat.node_tree.nodes:
        if nd.type == "TEX_IMAGE":
            try:
                nd.image.colorspace_settings.name = "sRGB"
            except Exception:
                pass

scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE"
if hasattr(scene.eevee, "use_raytracing"):
    scene.eevee.use_raytracing = True
    scene.eevee.ray_tracing_method = "SCREEN"
scene.eevee.taa_render_samples = 32
scene.render.resolution_x = RES_W
scene.render.resolution_y = RES_H
scene.render.film_transparent = False
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGB"
scene.world = bpy.data.worlds.new("film")
scene.world.use_nodes = True
bg = scene.world.node_tree.nodes["Background"]
bg.inputs[0].default_value = (0.012, 0.012, 0.016, 1.0)  # near-black navy
bg.inputs[1].default_value = 0.6

TARGET = Vector((0.0, 0.0, 0.0))


def add_area(name, color, energy, pos, size=1.0):
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


add_area("Key", (1.0, 0.95, 0.88), 2400, (4.0, 2.2, 2.5), 3.0)       # warm key
add_area("CoolFill", (0.82, 0.9, 1.0), 1100, (-3.5, 0.4, 2.2), 2.5)  # cool fill
add_area("RimBack", (0.88, 0.93, 1.0), 1600, (0.6, 1.4, -3.5), 3.0)  # silhouette rim
add_area("Under", (0.9, 0.87, 0.84), 700, (0.0, -1.6, 2.0), 2.2)     # bounce

cam_data = bpy.data.cameras.new("film")
cam_obj = bpy.data.objects.new("film_cam", cam_data)
scene.collection.objects.link(cam_obj)
cam_data.sensor_width = SENSOR_W
cam_data.sensor_height = SENSOR_H
cam_data.sensor_fit = "VERTICAL"
scene.camera = cam_obj


def point_dial_at_cam(yaw_offset_deg=0.0):
    """The dial normal (+Y in Blender space) tracks the camera, matching the
    R3F tune where the dial faces each shot. A nonzero offset swings the dial
    around world +Z to keep side-profile beats (crown, reflection sweep)
    off-axis like the R3F scene's WATCH_YAW keyframes."""
    direction = (cam_obj.location - watch.location).normalized()
    if yaw_offset_deg:
        direction = Euler((0.0, 0.0, radians(yaw_offset_deg))).to_quaternion() @ direction
    watch.rotation_euler = direction.to_track_quat("Y", "Z").to_euler()


def key_shot(idx, yaw_offset_deg=0.0):
    t, pos, target, vfov = SHOTS[idx]
    cam_obj.location = Vector(pos)
    cam_data.lens = lens_for(vfov)
    direction = Vector(target) - cam_obj.location
    cam_obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    point_dial_at_cam(yaw_offset_deg)


os.makedirs(OUT_DIR, exist_ok=True)
for idx in range(len(SHOTS)):
    if idx in YAW_OFFSET:
        continue  # off-dial beats render as side variants below
    t, pos, target, vfov = SHOTS[idx]
    key_shot(idx)
    name = "beat-{0:03d}".format(int(round(t * 100)))
    scene.render.filepath = os.path.join(OUT_DIR, name + ".png")
    bpy.ops.render.render(write_still=True)
    print("SHOT", name, "pos", pos, "lens", round(cam_data.lens, 1))

for idx, off, fname in VARIANTS:
    key_shot(idx, off)
    scene.render.filepath = os.path.join(OUT_DIR, fname)
    bpy.ops.render.render(write_still=True)
    print("SHOT", fname, "yaw_off", off)