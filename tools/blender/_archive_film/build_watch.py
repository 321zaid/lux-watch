"""INFINITY luxury watch scroll film — full build + render pipeline.

Builds the watch scene in Blender headless (Eevee), keyframes an 11-beat
scroll timeline (camera, watch rotation, 2000-vertex particle cloud via shape
keys, gold signature, store fade-in overlay), saves film.blend, renders 15
view stills at 1440p, renders the 240-frame animation, and compiles the MP4
with ffmpeg for scroll-triggered <video> playback.

Usage:
  blender --background --factory-startup --python build_watch.py -- [stage]
    stage: build   -> construct scene + animation, save film.blend
           stills  -> open film.blend, render the 15 still views
           anim    -> open film.blend, render 240-frame sequence, compile MP4
           all     -> build + stills + anim + compile (default)
"""
import bpy
import os
import sys
import math
import random
import subprocess
from math import radians, degrees, pi, tan, atan, atan2
from mathutils import Vector, Matrix, Euler

# ----------------------------------------------------------------------------
# CONFIG
# ----------------------------------------------------------------------------
BRAND = "INFINITY"
LOGO_PATH = r"C:\my web\watch\brand logo.png"
SIGNATURE_SVG_PATH = ""  # set later; empty -> extruded-text fallback
FPS = 30
DURATION = 8  # seconds -> 240 frames
BEATS = [0.0, 0.05, 0.15, 0.25, 0.35, 0.50, 0.60, 0.70, 0.85, 0.95, 1.0]

BASE = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE, "renders")
QUICK_CHECK_DIR = os.path.join(BASE, "quick_checks")
FRAMES_DIR = os.path.join(OUTPUT_DIR, "frames")
BLEND_PATH = os.path.join(BASE, "film.blend")
MP4_PATH = os.path.join(OUTPUT_DIR, "watch_scroll.mp4")
FFMPEG = r"C:\Users\N0860\AppData\Local\Microsoft\WinGet\Links\ffmpeg.exe"
if not os.path.exists(FFMPEG):
    FFMPEG = shutil_which("ffmpeg") if (shutil_which := __import__("shutil").which) else "ffmpeg"

STAGE = "all"
if "--" in sys.argv:
    idx = sys.argv.index("--")
    if len(sys.argv) > idx + 1:
        STAGE = sys.argv[idx + 1]

RES_W, RES_H = 2560, 1440
SENSOR_W = 36.0
SENSOR_H = SENSOR_W * (9.0 / 16.0)

CASE_R = 20.0   # mm
CASE_H = 10.0
DIAL_R = 17.0
DIAL_H = 0.5

random.seed(2026)

# ----------------------------------------------------------------------------
# HELPERS
# ----------------------------------------------------------------------------

def fr(p):
    return int(round(p * DURATION * FPS))


def lens_for(vfov_deg):
    return (SENSOR_H / 2.0) / tan(radians(vfov_deg) / 2.0)


def clear_scene():
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)


def new_mat(name, base=(1, 1, 1), metallic=0.0, rough=0.5, clearcoat=0.0,
            cc_rough=0.03, aniso=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    p = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    p.inputs["Base Color"].default_value = (*base, 1.0)
    p.inputs["Metallic"].default_value = metallic
    p.inputs["Roughness"].default_value = rough
    if "Clearcoat" in p.inputs:
        p.inputs["Clearcoat"].default_value = clearcoat
        p.inputs["Clearcoat Roughness"].default_value = cc_rough
    if "Anisotropic" in p.inputs:
        p.inputs["Anisotropic"].default_value = aniso
    return m


def add_tex(m, path, name="logo"):
    img = bpy.data.images.load(path, check_existing=True)
    nt = m.node_tree
    node = nt.nodes.new("ShaderNodeTexImage")
    node.image = img
    node.name = name
    return node


def logo_bump_mat(name, base=(0.88, 0.88, 0.9), rough=0.2):
    """Polished steel with the logo punched through a bump map."""
    m = new_mat(name, base, metallic=1.0, rough=rough)
    nt = m.node_tree
    p = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    tex = add_tex(m, LOGO_PATH)
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.22
    ramp.color_ramp.elements[1].position = 0.42
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Distance"].default_value = 0.015
    nt.links.new(tex.outputs["Color"], ramp.inputs[0])
    nt.links.new(ramp.outputs["Color"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], p.inputs["Normal"])
    return m


OP_KW = {
    "primitive_cube_add": ("size",),
    "primitive_cylinder_add": ("radius", "depth", "vertices"),
    "primitive_uv_sphere_add": ("radius", "segments", "ring_count"),
    "primitive_ico_sphere_add": ("radius", "subdivisions"),
}


def prim(op, location=(0, 0, 0), rotation=(0, 0, 0), scale=(1, 1, 1), **kw):
    allowed = OP_KW.get(op, ())
    kw = {k: v for k, v in kw.items() if k in allowed}
    getattr(bpy.ops.mesh, op)(location=location, rotation=rotation, **kw)
    o = bpy.context.object
    if scale != (1, 1, 1):
        o.scale = scale
    return o


def part(name, mat, location=(0, 0, 0), rotation=(0, 0, 0), scale=(1, 1, 1),
         op="primitive_cube_add", size=1.0, radius=1.0, depth=1.0,
         vertices=24, tag=False):
    o = prim(op, location=location, rotation=rotation, scale=scale,
             size=size, radius=radius, depth=depth, vertices=vertices)
    o.name = name
    o.parent = watch_rig
    if mat is not None:
        o.data.materials.append(mat)
    if tag:
        o["particle_source"] = True
        PARTICLE_SOURCE.append(o.name)
    return o


def link_nodes(m, a_out, b_in, a_idx=0, b_idx=0):
    m.node_tree.links.new(a_out.outputs[a_idx], b_in.inputs[b_idx])


NF = DURATION * FPS


def smoothstep(k):
    k = min(1.0, max(0.0, k))
    return k * k * (3 - 2 * k)


def eased_val(keys, p):
    """keys: [(progress, value)] — eased (smoothstep) interpolation."""
    if p <= keys[0][0]:
        return keys[0][1]
    if p >= keys[-1][0]:
        return keys[-1][1]
    for i in range(1, len(keys)):
        if p <= keys[i][0]:
            p0, v0 = keys[i - 1]
            p1, v1 = keys[i]
            k = (p - p0) / (p1 - p0) if p1 > p0 else 0.0
            return v0 + (v1 - v0) * smoothstep(k)
    return keys[-1][1]


def key_loc_eased(obj, keys):
    for f in range(NF + 1):
        obj.location = eased_val(keys, f / NF)
        obj.keyframe_insert("location", frame=f)


def key_scalar_eased(setter, keys):
    for f in range(NF + 1):
        setter(eased_val(keys, f / NF), f)


def key_rot_eased(obj, keys):
    for f in range(NF + 1):
        obj.rotation_euler = (0, 0, radians(eased_val(keys, f / NF)))
        obj.keyframe_insert("rotation_euler", frame=f)


def catmull_rom(pts, segments):
    out = []
    n = len(pts)
    for i in range(n - 1):
        p0 = pts[max(i - 1, 0)]
        p1 = pts[i]
        p2 = pts[i + 1]
        p3 = pts[min(i + 2, n - 1)]
        for s in range(segments):
            t = s / segments
            t2, t3 = t * t, t * t * t
            v = 0.5 * ((2 * p1) + (-p0 + p2) * t
                       + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2
                       + (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
            out.append(v.copy())
    return out


def flip_normals(obj):
    import bmesh
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bmesh.ops.reverse_faces(bm, faces=bm.faces)
    bm.to_mesh(obj.data)
    bm.free()


# ----------------------------------------------------------------------------
# SCENE BUILD
# ----------------------------------------------------------------------------
PARTICLE_SOURCE = []
watch_rig = None
cam_obj = None
cam_data = None
sig_rig = None
sig_mesh_obj = None
sig_verts_world = []
overlay_emission = None


def build_scene():
    global watch_rig, cam_obj, cam_data, sig_rig, sig_mesh_obj, sig_verts_world, overlay_emission
    global PARTICLE_SOURCE

    scene = bpy.context.scene
    scene.unit_settings.scale_length = 0.001  # 1 Blender unit = 1 mm
    scene.render.resolution_x = RES_W
    scene.render.resolution_y = RES_H
    scene.render.fps = FPS
    scene.render.engine = "BLENDER_EEVEE"
    if hasattr(scene.eevee, "use_raytracing"):
        scene.eevee.use_raytracing = True
        scene.eevee.ray_tracing_method = "SCREEN"
    scene.eevee.taa_render_samples = 16
    if hasattr(scene.eevee, "use_gtao"):
        scene.eevee.use_gtao = True
    if hasattr(scene.eevee, "use_bloom"):
        scene.eevee.use_bloom = True
        scene.eevee.bloom_intensity = 0.2
        scene.eevee.bloom_threshold = 0.85
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGB"
    scene.frame_start = 0
    scene.frame_end = DURATION * FPS

    scene.world = bpy.data.worlds.new("film_world")
    scene.world.use_nodes = True
    bg = scene.world.node_tree.nodes["Background"]
    bg.inputs[0].default_value = (0.039, 0.039, 0.039, 1.0)  # #0A0A0A
    bg.inputs[1].default_value = 0.1

    clear_scene()
    PARTICLE_SOURCE = []

    # -- materials -----------------------------------------------------------
    M_STEEL = new_mat("Steel_Polished", (0.878, 0.878, 0.882), 1.0, 0.08)
    M_BRUSH = new_mat("Steel_Brushed", (0.87, 0.87, 0.86), 1.0, 0.2, aniso=0.4)
    M_GOLD = new_mat("Gold_Signature", (0.9, 0.68, 0.32), 1.0, 0.2)
    M_DIAL = new_mat("Dial_Green", (0.118, 0.231, 0.184), 0.35, 0.32,
                     clearcoat=1.0, cc_rough=0.03)
    M_LUM = new_mat("Luminous", (0.02, 0.02, 0.02), 0.0, 0.6)
    lum_nt = M_LUM.node_tree
    lum_em = lum_nt.nodes.new("ShaderNodeEmission")
    lum_em.inputs["Color"].default_value = (0.76, 1.0, 0.8, 1.0)
    lum_em.inputs["Strength"].default_value = 2.0
    lum_nt.links.new(lum_em.outputs["Emission"], lum_nt.nodes["Material Output"].inputs[0])
    M_RED = new_mat("Tip_Red", (0.75, 0.2, 0.17), 0.6, 0.3)
    M_WHITE = new_mat("Date_White", (0.98, 0.98, 0.97), 0.0, 0.5)
    M_BLACK = new_mat("Date_Black", (0.04, 0.04, 0.04), 0.0, 0.6)
    M_GLASS = new_mat("Sapphire", (0.98, 0.99, 1.0), 0.0, 0.02)
    glass_nt = M_GLASS.node_tree
    glass_nt.nodes.remove(next(n for n in glass_nt.nodes if n.type == "BSDF_PRINCIPLED"))
    glass = glass_nt.nodes.new("ShaderNodeBsdfGlass")
    glass.inputs["IOR"].default_value = 1.52
    glass_nt.links.new(glass.outputs["BSDF"], glass_nt.nodes["Material Output"].inputs[0])
    M_BACKDROP = new_mat("Backdrop", (0.102, 0.102, 0.102), 0.0, 0.9)
    M_CROWN = logo_bump_mat("Crown_Cap")
    M_CLASP = logo_bump_mat("Clasp_Blade")

    # dial: radial sunburst gradient + logo stencil
    dial_nt = M_DIAL.node_tree
    dial_p = next(n for n in dial_nt.nodes if n.type == "BSDF_PRINCIPLED")
    tc = dial_nt.nodes.new("ShaderNodeTexCoord")
    sep = dial_nt.nodes.new("ShaderNodeSeparateXYZ")
    comb = dial_nt.nodes.new("ShaderNodeCombineXYZ")
    vm = dial_nt.nodes.new("ShaderNodeVectorMath")
    vm.operation = "LENGTH"
    ramp1 = dial_nt.nodes.new("ShaderNodeValToRGB")
    ramp1.color_ramp.elements[0].color = (0.086, 0.192, 0.145, 1.0)
    ramp1.color_ramp.elements[1].color = (0.16, 0.29, 0.22, 1.0)
    ramp1.color_ramp.elements[0].position = 0.15
    logo_tex = add_tex(M_DIAL, LOGO_PATH, "dial_logo")
    ramp2 = dial_nt.nodes.new("ShaderNodeValToRGB")
    ramp2.color_ramp.elements[0].position = 0.2
    ramp2.color_ramp.elements[1].position = 0.45
    mix = dial_nt.nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    mix.inputs[6].default_value = (0.925, 0.906, 0.847, 1.0)  # logo colour
    dial_nt.links.new(tc.outputs["Object"], sep.inputs[0])
    dial_nt.links.new(sep.outputs["X"], comb.inputs[0])
    dial_nt.links.new(sep.outputs["Y"], comb.inputs[1])
    dial_nt.links.new(comb.outputs["Vector"], vm.inputs[0])
    dial_nt.links.new(vm.outputs["Value"], ramp1.inputs[0])
    dial_nt.links.new(ramp1.outputs["Color"], mix.inputs[7])  # base colour
    dial_nt.links.new(logo_tex.outputs["Color"], ramp2.inputs[0])
    dial_nt.links.new(ramp2.outputs["Color"], mix.inputs[0])  # fac = alpha-ish
    dial_nt.links.new(mix.outputs[2], dial_p.inputs["Base Color"])

    # -- rig -----------------------------------------------------------------
    watch_rig = bpy.data.objects.new("Watch_Rig", None)
    scene.collection.objects.link(watch_rig)

    # -- case, bezel, crystal ------------------------------------------------
    part("Case", M_STEEL, op="primitive_cylinder_add", radius=CASE_R,
         depth=CASE_H, vertices=64, tag=True)
    part("Bezel", M_STEEL, location=(0, 0, 5.75), op="primitive_cylinder_add",
         radius=CASE_R, depth=1.5, vertices=64, tag=True)
    part("Crystal", M_GLASS, location=(0, 0, 7.0), op="primitive_cylinder_add",
         radius=16.5, depth=1.0, vertices=64)

    # -- lugs (20 mm wide, 48 mm lug-to-lug) ---------------------------------
    for sx, sy in ((1, 1), (-1, 1), (1, -1), (-1, -1)):
        part(f"Lug_{sx:+}_{sy:+}", M_STEEL, location=(sx * 7.5, sy * 20.0, 0),
             scale=(5, 4, 8))

    # -- dial + markers + date -----------------------------------------------
    part("Dial", M_DIAL, location=(0, 0, 4.75), op="primitive_cylinder_add",
         radius=DIAL_R, depth=DIAL_H, vertices=64)
    for k in range(12):
        ang = radians(30 * k)
        if k == 3:
            continue  # date window at 3 o'clock
        part(f"Marker_{k:02d}", M_STEEL,
             location=(12.5 * math.sin(ang), 12.5 * math.cos(ang), 5.15),
             rotation=(0, 0, ang), scale=(1.4, 4.0, 0.35))
    part("Date_Window", M_WHITE, location=(13.5, 0, 5.28),
         op="primitive_cylinder_add", radius=2.7, depth=0.16, vertices=24)
    bpy.ops.object.text_add(location=(13.5, 0, 5.42))
    date_txt = bpy.context.object
    date_txt.name = "Date_Num"
    date_txt.data.body = "15"
    date_txt.data.size = 2.2
    date_txt.data.extrude = 0.06
    date_txt.data.align_x = "CENTER"
    date_txt.data.align_y = "CENTER"
    date_txt.data.materials.append(M_BLACK)
    date_txt.parent = watch_rig

    # -- hands (dauphine-ish, luminous strips, red-tip seconds) --------------
    part("Hand_Hour", M_STEEL, location=(0, 3.0, 5.35), rotation=(0, 0, radians(-60)),
         scale=(2.2, 7.0, 0.25))
    part("Hand_Minute", M_STEEL, location=(0, 4.6, 5.5), rotation=(0, 0, radians(48)),
         scale=(1.9, 9.2, 0.25))
    part("Hand_Second", M_STEEL, location=(0, 2.9, 5.7), rotation=(0, 0, radians(-60)),
         scale=(0.5, 6.5, 0.15))
    part("Tip_Red", M_RED, location=(0, 5.2, 5.7), rotation=(0, 0, radians(-60)),
         scale=(0.62, 1.1, 0.18))
    part("Stripe_Hour", M_LUM, location=(0, 3.0, 5.42), rotation=(0, 0, radians(-60)),
         scale=(0.6, 5.6, 0.06))
    part("Stripe_Minute", M_LUM, location=(0, 4.6, 5.57), rotation=(0, 0, radians(48)),
         scale=(0.55, 7.6, 0.06))
    part("Stripe_Second", M_LUM, location=(0, 2.9, 5.77), rotation=(0, 0, radians(-60)),
         scale=(0.3, 5.0, 0.05))

    # -- crown (3 o'clock, knurled cylinder + engraved cap) ------------------
    part("Crown", M_BRUSH, location=(21.5, 0, 5), rotation=(0, radians(90), 0),
         op="primitive_cylinder_add", radius=2.75, depth=3.0, vertices=32, tag=True)
    part("Crown_Cap", M_CROWN, location=(23.1, 0, 5), rotation=(0, radians(90), 0),
         op="primitive_cylinder_add", radius=2.9, depth=0.5, vertices=32, tag=True)

    # -- caseback engraving ring (curved extruded text) ----------------------
    bpy.ops.curve.primitive_bezier_circle_add(radius=14.5, location=(0, 0, -5.2))
    ring = bpy.context.object
    ring.name = "Caseback_Curve"
    ring.parent = watch_rig
    bpy.ops.object.text_add(location=(0, 0, -5.1))
    cb = bpy.context.object
    cb.name = "Caseback_Text"
    cb.data.body = "INFINITY \u00b7 AUTOMATIC \u00b7 100M"
    cb.data.size = 2.4
    cb.data.extrude = 0.12
    cb.data.align_x = "CENTER"
    cb.data.follow_curve = ring
    cb.rotation_euler = (radians(180), 0, 0)
    cb.data.materials.append(M_STEEL)
    cb.parent = watch_rig

    # -- bracelet: two tapered 3-link oyster arms, catmull-rom + links -------
    ARM_A = [Vector(p) for p in ((0, 21, 0), (13, 19, -9), (16, 10, -26),
                                 (11, 1, -42), (4, 0, -58))]
    ARM_B = [Vector(p) for p in ((0, -21, 0), (-13, -19, -9), (-16, -10, -26),
                                 (-11, -1, -42), (-4, 0, -58))]
    NLINKS = 14
    for arm_tag, ctrl in (("A", ARM_A), ("B", ARM_B)):
        pts = catmull_rom(ctrl, NLINKS)
        for i in range(NLINKS):
            p0, p1 = pts[i], pts[i + 1]
            tang = (p1 - p0).normalized()
            q = tang.to_track_quat("Y", "Z")
            rot_e = q.to_euler()
            mat3 = q.to_matrix()
            w = 20.0 + (18.0 - 20.0) * (i / (NLINKS - 1))  # 20 -> 18 mm
            wc = 10.0 * (w / 20.0)
            wo = 5.0 * (w / 20.0)
            nm = f"Link_{arm_tag}_{i:02d}"
            part(f"{nm}_C", M_STEEL, location=p0, rotation=rot_e,
                 scale=(wc, 4.2, 2.4), tag=True)
            for side in (1, -1):
                off = mat3 @ Vector((side * (wc / 2 + wo / 2), 0, 0))
                part(f"{nm}_O{1 if side > 0 else 2}", M_BRUSH,
                     location=p0 + off, rotation=rot_e, scale=(wo, 4.2, 2.4), tag=True)
            for e in (1, -1):
                pq = q @ Euler((0, radians(90), 0)).to_quaternion()
                poff = mat3 @ Vector((0, e * 2.0, 0))
                part(f"Pin_{arm_tag}_{i:02d}_{'T' if e > 0 else 'B'}", M_STEEL,
                     location=p0 + poff, rotation=pq.to_euler(),
                     op="primitive_cylinder_add", radius=0.45, depth=w,
                     vertices=12)

    # -- clasp (deployant butterfly) -----------------------------------------
    part("Clasp_Blade", M_CLASP, location=(0, 0, -59), scale=(18, 38, 3))
    part("Clasp_Cover", M_STEEL, location=(0, 0, -56), scale=(18, 14, 2))

    # -- backdrop: inward-facing sphere --------------------------------------
    bpy.ops.mesh.primitive_uv_sphere_add(radius=900, location=(0, 0, -300),
                                         segments=64, ring_count=32)
    backdrop = bpy.context.object
    backdrop.name = "Backdrop"
    backdrop.data.materials.append(M_BACKDROP)
    backdrop.hide_render = False
    flip_normals(backdrop)

    # -- lighting rig (relative to watch centre) ------------------------------
    def add_area(name, energy, pos, size_x, size_y=None, color=(1, 1, 1)):
        l = bpy.data.lights.new(name, "AREA")
        l.energy = energy
        l.color = color
        l.shape = "RECTANGLE"
        l.size = size_x
        l.size_y = size_y if size_y else size_x
        o = bpy.data.objects.new(name, l)
        scene.collection.objects.link(o)
        o.location = Vector(pos)
        tgt = bpy.data.objects.new("tgt_" + name, None)
        scene.collection.objects.link(tgt)
        tgt.location = (0, 0, 0)
        c = o.constraints.new("TRACK_TO")
        c.target = tgt
        c.track_axis = "TRACK_NEGATIVE_Z"
        c.up_axis = "UP_Y"
        return o

    add_area("Key", 2000, (-500, -800, 600), 300, 300, (1.0, 0.98, 0.94))
    add_area("Rim", 800, (700, 500, 200), 200, 1000, (0.92, 0.96, 1.0))
    add_area("Fill", 1000, (400, -300, -200), 300, 300, (0.9, 0.94, 1.0))
    add_area("Under", 600, (0, -1600, 2000), 400, 400, (0.95, 0.93, 0.9))

    # -- camera + targets ------------------------------------------------------
    cam_data = bpy.data.cameras.new("Film_Camera_Data")
    cam_obj = bpy.data.objects.new("Film_Camera", cam_data)
    scene.collection.objects.link(cam_obj)
    cam_data.sensor_width = SENSOR_W
    cam_data.sensor_height = SENSOR_H
    cam_data.sensor_fit = "VERTICAL"
    cam_data.lens = 85
    cam_data.clip_start = 0.05
    cam_data.clip_end = 5000
    scene.camera = cam_obj

    targets = {}
    for nm, tp in (("Camera_Target", (0, 0, 0)), ("Tgt_Crown", (21, 0, 5)),
                   ("Tgt_Clasp", (0, 0, -59)), ("Tgt_Links", (13, 23, -12)),
                   ("Tgt_Caseback", (0, 0, -5))):
        t = bpy.data.objects.new(nm, None)
        scene.collection.objects.link(t)
        t.location = Vector(tp)
        targets[nm] = t
    cam_track = cam_obj.constraints.new("TRACK_TO")
    cam_track.target = targets["Camera_Target"]
    cam_track.track_axis = "TRACK_NEGATIVE_Z"
    cam_track.up_axis = "UP_Y"

    # ------------------------------------------------------------------------
    # ANIMATION — 11-beat timeline
    # ------------------------------------------------------------------------
    # camera location + lens keyframes (track-to handles orientation)
    cam_shot = [
        (0.00, (-283, -283, 200), 85),
        (0.05, (-283, -283, 200), 85),
        (0.15, (-315, -275, 205), 85),
        (0.25, (-135, -396, 205), 85),
        (0.35, (150, -150, 320), 85),
        (0.50, (0, -30, 350), 90),
        (0.60, (0, -30, 350), 120),
        (0.70, (-300, -300, 210), 85),
        (0.85, (-300, -300, 210), 85),
        (0.95, (-300, -300, 210), 85),
        (1.00, (-300, -300, 210), 85),
    ]
    key_loc_eased(cam_obj, [(p, Vector(loc)) for p, loc, _ in cam_shot])
    key_scalar_eased(lambda v, f: (setattr(cam_data, "lens", v),
                                   cam_data.keyframe_insert("lens", frame=f)),
                     [(p, ln) for p, _, ln in cam_shot])

    # watch rotation
    key_rot_eased(watch_rig, [(0.00, 0), (0.05, 0), (0.15, 80), (0.25, 200),
                              (0.35, 200), (0.50, 200), (0.60, 200),
                              (0.70, 205), (0.85, 210), (1.00, 215)])

    # ------------------------------------------------------------------------
    # PARTICLE CLOUD — 2000 vertices, shape-key morphs
    # ------------------------------------------------------------------------
    def sample_watch_surface(n, rot_z_deg):
        R = Matrix.Rotation(radians(rot_z_deg), 4, "Z")
        pools = []
        for nm in PARTICLE_SOURCE:
            o = bpy.data.objects[nm]
            verts = [o.matrix_world @ v.co for v in o.data.vertices]
            pools.append((len(verts), verts))
        total = sum(c for c, _ in pools)
        pts = []
        for _ in range(n):
            roll = random.random() * total
            acc = 0
            for c, verts in pools:
                acc += c
                if roll <= acc:
                    pts.append((R @ random.choice(verts)).copy())
                    break
        return pts

    def merged_icospheres(centers, radius=0.4):
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=radius,
                                              location=(0, 0, 0))
        tmp = bpy.context.object
        src_verts = [v.co.copy() for v in tmp.data.vertices]
        src_faces = [tuple(f.vertices) for f in tmp.data.polygons]
        tmp_mesh = tmp.data
        bpy.data.objects.remove(tmp, do_unlink=True)
        bpy.data.meshes.remove(tmp_mesh)
        verts, faces = [], []
        for i, c in enumerate(centers):
            base = len(verts)
            verts.extend([v + c for v in src_verts])
            faces.extend([tuple(f + base for f in face) for face in src_faces])
        mesh = bpy.data.meshes.new("Particle_Cloud_Mesh")
        mesh.from_pydata(verts, [], faces)
        return mesh

    start_pts = sample_watch_surface(2000, rot_z_deg=80)
    cloud_obj = bpy.data.objects.new("Particle_Cloud",
                                     merged_icospheres(start_pts, radius=0.4))
    scene.collection.objects.link(cloud_obj)
    cloud_obj.data.materials.append(M_LUM)
    cloud_obj.keyframe_insert("hide_render", frame=0)
    cloud_obj.hide_render = False

    # signature target geometry
    if SIGNATURE_SVG_PATH:
        print("SVG path set — import not implemented, falling back to text.")
    bpy.ops.object.text_add(location=(0, 0, 10))
    sig_txt = bpy.context.object
    sig_txt.name = "Signature_Source"
    sig_txt.data.body = "Infinity"
    sig_txt.data.size = 32
    sig_txt.data.extrude = 0.1
    sig_txt.data.align_x = "CENTER"
    sig_txt.data.align_y = "CENTER"
    sig_txt.rotation_euler = (radians(90), 0, 0)
    font_path = r"C:\Windows\Fonts\brushsci.ttf"
    if os.path.exists(font_path):
        try:
            sig_txt.data.font = bpy.data.fonts.load(font_path)
        except Exception:
            print("font load failed, using default")
    sig_txt.data.materials.append(M_GOLD)
    sig_txt.select_set(True)
    bpy.context.view_layer.objects.active = sig_txt
    bpy.ops.object.convert(target="MESH")
    sig_mesh_obj = bpy.context.object
    sig_mesh_obj.name = "Signature_Mesh"
    sig_mesh_obj.parent = None
    bpy.context.view_layer.update()

    # centre the signature on its own origin
    bpy.context.view_layer.objects.active = sig_mesh_obj
    bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
    bpy.context.view_layer.update()
    sig_verts_world = [sig_mesh_obj.matrix_world @ v.co for v in sig_mesh_obj.data.vertices]

    sig_rig = bpy.data.objects.new("Sig_Rig", None)
    scene.collection.objects.link(sig_rig)
    sig_mesh_obj.parent = sig_rig

    # per-particle key positions
    targets = [random.choice(sig_verts_world).copy() for _ in range(2000)]
    key_emit = []
    key_spiral = []
    key_converge = []
    key_land = []
    for i in range(2000):
        s = start_pts[i]
        phi = random.random() * math.tau
        out = Vector((math.cos(phi), math.sin(phi), 0.35 * random.random()))
        key_emit.append(s + out * (0.5 + random.random() * 1.5))
        r = 4.5 + random.random() * 3.0
        a = phi + 1.5 * math.tau
        key_spiral.append(Vector((r * math.cos(a), r * math.sin(a),
                                  12 + random.random() * 4)))
        key_converge.append(key_spiral[i] * 0.3 + targets[i] * 0.7)
        key_land.append(targets[i] + Vector((random.uniform(-0.05, 0.05),
                                             random.uniform(-0.05, 0.05),
                                             random.uniform(-0.05, 0.05))))

    nv = len(start_pts)
    cloud_obj.shape_key_add(name="Basis", from_mix=False)
    sk = {}
    for nm, pts in (("emit", key_emit), ("spiral", key_spiral),
                    ("converge", key_converge), ("land", key_land)):
        kb = cloud_obj.shape_key_add(name=nm, from_mix=False)
        for i in range(nv):
            kb.data[i].co = pts[i]
        sk[nm] = kb

    def key_sk(name, keys):
        kb = sk[name]
        key_scalar_eased(lambda v, f: (setattr(kb, "value", v),
                                       kb.keyframe_insert("value", frame=f)),
                         keys)

    key_sk("emit", [(0.15, 0), (0.25, 1), (0.35, 0)])
    key_sk("spiral", [(0.25, 0), (0.35, 1), (0.50, 0)])
    key_sk("converge", [(0.35, 0), (0.50, 1), (0.60, 0)])
    key_sk("land", [(0.50, 0), (0.60, 1)])
    for p in (0.60, 0.61, 0.70):
        cloud_obj.hide_render = True
        cloud_obj.keyframe_insert("hide_render", frame=fr(p))

    # ------------------------------------------------------------------------
    # SOLID SIGNATURE — reveal 0.60, shrink + fly top-left 0.70 -> 0.85
    # ------------------------------------------------------------------------
    sig_mesh_obj.keyframe_insert("hide_render", frame=0)
    sig_mesh_obj.hide_render = True
    sig_mesh_obj.hide_render = False
    sig_mesh_obj.keyframe_insert("hide_render", frame=fr(0.60))

    key_scalar_eased(
        lambda v, f: (sig_mesh_obj.scale.__setitem__(slice(None), (v, v, v)) or
                      sig_mesh_obj.keyframe_insert("scale", frame=f)),
        [(0.0, 1.0), (0.60, 1.0), (0.70, 1.0), (0.85, 0.2), (1.0, 0.2)])

    # top-left screen point at the final wide shot (lens 85, (-300,-300,210))
    cam_pos = Vector((-300, -300, 210))
    fwd = (Vector((0, 0, 0)) - cam_pos).normalized()
    right = fwd.cross(Vector((0, 0, 1))).normalized()
    up = right.cross(fwd).normalized()
    d = 1000.0
    half_h = tan(radians(degrees(2 * atan((SENSOR_H / 2) / 85))) / 2) * d
    half_w = half_h * (16.0 / 9.0)
    sig_final = cam_pos + fwd * d + right * (-0.8 * half_w) + up * (0.45 * half_h)
    key_loc_eased(sig_rig, [(0.60, Vector((0, 0, 10))), (0.70, Vector((0, 0, 10))),
                            (0.85, sig_final), (1.0, sig_final)])

    # ------------------------------------------------------------------------
    # STORE FADE-IN OVERLAY — white plane with signature hole
    # ------------------------------------------------------------------------
    from bpy_extras.object_utils import world_to_camera_view
    hx, hy, _ = world_to_camera_view(scene, cam_obj, sig_final)

    overlay = part("Overlay_Plane", None, location=(0, 0, 0))
    overlay.parent = cam_obj
    overlay.matrix_local = Matrix.Translation((0, 0, -500))
    vfov_end = 2 * atan((SENSOR_H / 2) / 85)
    ph = 2 * tan(vfov_end / 2) * 500
    pw = ph * (16.0 / 9.0)
    overlay.scale = (pw, ph, 1)

    ov_mat = bpy.data.materials.new("Overlay_White")
    ov_mat.use_nodes = True
    ov_mat.blend_method = "BLEND"
    ov_nt = ov_mat.node_tree
    for nd in list(ov_nt.nodes):
        ov_nt.nodes.remove(nd)
    out = ov_nt.nodes.new("ShaderNodeOutputMaterial")
    emission = ov_nt.nodes.new("ShaderNodeEmission")
    emission.inputs["Color"].default_value = (1, 1, 1, 1)
    emission.inputs["Strength"].default_value = 0.0
    transp = ov_nt.nodes.new("ShaderNodeBsdfTransparent")
    mixsh = ov_nt.nodes.new("ShaderNodeMixShader")
    texc = ov_nt.nodes.new("ShaderNodeTexCoord")
    sep = ov_nt.nodes.new("ShaderNodeSeparateXYZ")
    comb = ov_nt.nodes.new("ShaderNodeCombineXYZ")
    vmd = ov_nt.nodes.new("ShaderNodeVectorMath")
    vmd.operation = "DISTANCE"
    mat_hole = ov_nt.nodes.new("ShaderNodeMath")
    mat_hole.operation = "LESS_THAN"
    inv = ov_nt.nodes.new("ShaderNodeMath")
    inv.operation = "SUBTRACT"
    inv.inputs[0].default_value = 1.0
    hole_r = 0.13
    vmd.inputs[1].default_value = (hx, hy, 0.0)
    mat_hole.inputs[1].default_value = hole_r
    ov_nt.links.new(texc.outputs["Camera"], sep.inputs[0])
    ov_nt.links.new(sep.outputs["X"], comb.inputs[0])
    ov_nt.links.new(sep.outputs["Y"], comb.inputs[1])
    ov_nt.links.new(comb.outputs["Vector"], vmd.inputs[0])
    ov_nt.links.new(vmd.outputs["Value"], mat_hole.inputs[0])
    ov_nt.links.new(mat_hole.outputs[0], inv.inputs[1])
    ov_nt.links.new(transp.outputs["BSDF"], mixsh.inputs[1])
    ov_nt.links.new(emission.outputs["Emission"], mixsh.inputs[2])
    ov_nt.links.new(inv.outputs[0], mixsh.inputs[0])
    ov_nt.links.new(mixsh.outputs["Shader"], out.inputs["Surface"])
    overlay.data.materials.append(ov_mat)
    overlay_emission = emission

    overlay.keyframe_insert("hide_render", frame=0)
    overlay.hide_render = True
    overlay.hide_render = False
    overlay.keyframe_insert("hide_render", frame=fr(0.85))
    key_scalar_eased(
        lambda v, f: (setattr(emission.inputs["Strength"], "default_value", v),
                      emission.inputs["Strength"].keyframe_insert("default_value", frame=f)),
        [(0.85, 0.0), (0.95, 1.0), (1.0, 1.0)])

    # ------------------------------------------------------------------------
    scene.frame_set(0)
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(QUICK_CHECK_DIR, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=BLEND_PATH)
    print("BUILD OK — saved", BLEND_PATH)


# ----------------------------------------------------------------------------
# STILLS
# ----------------------------------------------------------------------------
STILLS = [
    ("front",          (-260, -260, 170), (0, 0, 0),   85),
    ("back",           (260, 260, -170),  (0, 0, 0),   85),
    ("left",           (-350, 0, 30),     (0, 0, 0),   85),
    ("right",          (350, 0, 30),      (0, 0, 0),   85),
    ("top",            (0, 0, 350),       (0, 0, 0),   85),
    ("bottom",         (0, 0, -350),      (0, 0, 0),   85),
    ("front45_left",   (-220, -220, 160), (0, 0, 0),   85),
    ("front45_right",  (220, -220, 160),  (0, 0, 0),   85),
    ("rear45_left",    (-220, 220, 160),  (0, 0, 0),   85),
    ("rear45_right",   (220, 220, 160),   (0, 0, 0),   85),
    ("dial_closeup",   (0, 0, 240),       (0, 0, 5),   120),
    ("crown_closeup",  (95, -10, 38),     (21, 0, 5),  120),
    ("clasp_closeup",  (-80, 55, -75),    (0, 0, -59), 120),
    ("bracelet_links", (60, 45, -30),     (13, 23, -12), 120),
    ("engravings",     (0, 60, -35),      (0, 0, -5),  120),
]
TGT_BY_NAME = {"Camera_Target": (0, 0, 0), "Tgt_Crown": (21, 0, 5),
               "Tgt_Clasp": (0, 0, -59), "Tgt_Links": (13, 23, -12),
               "Tgt_Caseback": (0, 0, -5)}


def resolve_targets():
    tgt = {}
    for nm in TGT_BY_NAME:
        t = bpy.data.objects.get(nm)
        if t is None:
            t = bpy.data.objects.new(nm, None)
            bpy.context.scene.collection.objects.link(t)
            t.location = Vector(TGT_BY_NAME[nm])
        tgt[nm] = t
    return tgt


def render_stills():
    scene = bpy.context.scene
    cam = bpy.data.objects["Film_Camera"]
    cdata = bpy.data.cameras["Film_Camera_Data"]
    track = next(c for c in cam.constraints if c.type == "TRACK_TO")
    tgt = resolve_targets()
    scene.frame_set(0)
    for name, pos, look, lens in STILLS:
        target = None
        for tn, tp in TGT_BY_NAME.items():
            if abs(Vector(look).length - Vector(tp).length) < 0.01:
                target = tgt[tn]
                break
        if target is None:
            continue
        track.target = target
        cam.location = Vector(pos)
        cdata.lens = lens
        bpy.context.view_layer.update()
        scene.render.filepath = os.path.join(QUICK_CHECK_DIR, name + ".png")
        bpy.ops.render.render(write_still=True)
        print("STILL", name)
    print("STILLS OK —", QUICK_CHECK_DIR)


# ----------------------------------------------------------------------------
# ANIMATION + COMPILE
# ----------------------------------------------------------------------------
def render_anim():
    scene = bpy.context.scene
    scene.frame_start = 0
    scene.frame_end = DURATION * FPS
    os.makedirs(FRAMES_DIR, exist_ok=True)
    scene.render.filepath = os.path.join(FRAMES_DIR, "frame_")
    bpy.ops.render.render(animation=True)
    print("ANIM OK —", FRAMES_DIR)


def compile_mp4():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    pattern = os.path.join(FRAMES_DIR, "frame_%04d.png").replace("\\", "/")
    cmd = [FFMPEG, "-y", "-r", str(FPS), "-i", pattern,
           "-c:v", "libx264", "-preset", "slow", "-crf", "15", "-g", "1",
           "-pix_fmt", "yuv420p", "-vf", "scale=2560:1440", MP4_PATH]
    print("FFMPEG", " ".join(cmd))
    subprocess.run(cmd, check=True)
    print("MP4 OK —", MP4_PATH)


# ----------------------------------------------------------------------------
def main():
    if STAGE in ("stills", "anim"):
        bpy.ops.wm.open_mainfile(filepath=BLEND_PATH)
    else:
        build_scene()
    if STAGE in ("all", "build", "stills"):
        render_stills()
    if STAGE in ("all", "anim"):
        render_anim()
        compile_mp4()
    print("STAGE DONE:", STAGE)


main()
