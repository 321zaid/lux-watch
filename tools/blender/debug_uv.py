import bpy, sys
SRC = sys.argv[sys.argv.index("--") + 1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)
for obj in bpy.data.objects:
    if obj.type != "MESH":
        continue
    me = obj.data
    if len(me.uv_layers) == 0:
        continue
    uv = me.uv_layers[0]
    vals = [uv.data[i].uv for i in [0, 100, 1000, 3000, 6000, 9000, len(uv.data)-1]]
    print(obj.name, "nloops", len(uv.data), "nverts", len(me.vertices), "sample uv:", [(round(v.x,3), round(v.y,3)) for v in vals])