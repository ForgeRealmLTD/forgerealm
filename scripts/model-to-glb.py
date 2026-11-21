"""
Turn a print-ready mesh (STL / OBJ / PLY) into a web-light .glb for the
landing page's three.js viewer.

Run headless with the Blender binary:

  blender -b --factory-startup --python scripts/model-to-glb.py -- \
      path/to/owl.stl public/models/owl.glb [--tris 30000] [--yaw 0] [--preview out.png]

  --eyelids (textured models only) finds the eyes by their warm iris colour
  and adds an "Eyelids" mesh hugging them, for the web viewer to blink.

  --yaw turns the model about the vertical axis so its face points at the
  camera (-Y in Blender). Use it if the preview shows the back or a side.

What it does:
  1. imports the mesh and joins every part into one object
  2. decimates to roughly --tris triangles (print meshes are often 500k+)
  3. normalises it: 1 unit tall, centred on X/Y, base sitting on Z=0
  4. textured input (e.g. a Tripo3D .glb) keeps its textures; a bare print
     mesh instead gets a "painted PLA" look into vertex colours from mesh curvature:
     slate blue base, dark recesses, pale dry-brushed edges (like the real
     print photo), so the web viewer needs no textures at all
  5. exports .glb (Blender converts Z-up to glTF's Y-up on export)
  6. optionally renders a quick Cycles preview so the result can be checked
     without opening a browser
"""

import math
import sys
from pathlib import Path

import bmesh
import bpy
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
if len(argv) < 2:
    sys.exit("usage: ... -- <input mesh> <output.glb> [--tris N] [--yaw DEG] [--preview out.png]")

src, dst = Path(argv[0]).resolve(), Path(argv[1]).resolve()
target_tris = int(argv[argv.index("--tris") + 1]) if "--tris" in argv else 30000
yaw = float(argv[argv.index("--yaw") + 1]) if "--yaw" in argv else 0.0
preview = Path(argv[argv.index("--preview") + 1]).resolve() if "--preview" in argv else None
eyelids = "--eyelids" in argv

# sRGB colours for the paint job, matched to the owl print photo.
BASE = (0.20, 0.27, 0.36)  # slate blue PLA
RECESS = (0.06, 0.08, 0.12)  # dark wash in the crevices
EDGE = (0.62, 0.70, 0.80)  # pale dry-brush on raised edges


def srgb_to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


# ---------------------------------------------------------------- import
for ob in list(bpy.data.objects):
    bpy.data.objects.remove(ob, do_unlink=True)

ext = src.suffix.lower()
if ext == ".stl":
    bpy.ops.wm.stl_import(filepath=str(src))
elif ext == ".obj":
    bpy.ops.wm.obj_import(filepath=str(src))
elif ext == ".ply":
    bpy.ops.wm.ply_import(filepath=str(src))
elif ext in (".glb", ".gltf"):
    bpy.ops.import_scene.gltf(filepath=str(src))
elif ext == ".fbx":
    bpy.ops.import_scene.fbx(filepath=str(src))
else:
    sys.exit(f"unsupported input {ext} (use STL/OBJ/PLY/GLB/FBX)")

meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
if not meshes:
    sys.exit("no mesh found in input")
bpy.ops.object.select_all(action="DESELECT")
for o in meshes:
    o.select_set(True)
bpy.context.view_layer.objects.active = meshes[0]
if len(meshes) > 1:
    bpy.ops.object.join()
obj = bpy.context.view_layer.objects.active
obj.name = "Model"
obj.rotation_euler.z += math.radians(yaw)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

# Print meshes often have duplicate verts along seams; merge before decimating.
bm = bmesh.new()
bm.from_mesh(obj.data)
bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-4)
bm.to_mesh(obj.data)
bm.free()

# ---------------------------------------------------------------- decimate
tris = sum(len(p.vertices) - 2 for p in obj.data.polygons)
if tris > target_tris:
    mod = obj.modifiers.new("Decimate", "DECIMATE")
    mod.ratio = target_tris / tris
    mod.use_collapse_triangulate = True
    bpy.ops.object.modifier_apply(modifier=mod.name)
print(f"triangles: {tris} -> {sum(len(p.vertices) - 2 for p in obj.data.polygons)}")

# ---------------------------------------------------------------- normalise
pts = [v.co for v in obj.data.vertices]
lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
scale = 1.0 / (hi.z - lo.z)
shift = Vector(((lo.x + hi.x) / 2, (lo.y + hi.y) / 2, lo.z))
for v in obj.data.vertices:
    v.co = (v.co - shift) * scale
obj.data.update()
bpy.ops.object.shade_smooth()

# Generated models (Tripo3D etc.) arrive with baked textures: keep those and
# skip the paint job. Bare print meshes (STL) get painted below.
textured = any(
    m and m.use_nodes and any(n.type == "TEX_IMAGE" and n.image for n in m.node_tree.nodes)
    for m in obj.data.materials
)

# Generated textures are usually 2K-4K; 1024px is plenty at landing-page size
# and gets re-encoded as WebP on export (EXT_texture_webp, read by three.js).


def add_eyelids(obj):
    """Build a thin eyelid shell over each eye.

    The model's eyes are just painted bumps, so: bake the base colour to the
    vertices (Cycles evaluates the real material, UV transforms and all), find
    the warm iris pixels on the upper front of the head, then copy the eyeball
    surface around each iris, nudged out along its normals, coloured like the
    face just outside it. The web viewer reveals it top-down to blink.
    """
    import colorsys

    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 1
    me = obj.data
    bake = me.color_attributes.new("Bake", "FLOAT_COLOR", "POINT")
    me.color_attributes.active_color = bake
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.bake(type="DIFFUSE", pass_filter={"COLOR"}, target="VERTEX_COLORS")
    lin = [tuple(d.color[:3]) for d in bake.data]
    me.color_attributes.remove(me.color_attributes["Bake"])
    srgb = [tuple(linear_to_srgb(c) for c in col) for col in lin]

    def is_iris(c):
        h, s_, v = colorsys.rgb_to_hsv(*c)
        return 0.03 < h < 0.14 and s_ > 0.5 and v > 0.45  # orange / amber

    verts = me.vertices
    eyes = []
    for side in (-1, 1):
        pts = [
            v.co.copy()
            for v, c in zip(verts, srgb)
            if is_iris(c) and v.co.z > 0.62 and v.co.x * side > 0.04 and v.normal.y < -0.2
        ]
        if len(pts) < 8:
            sys.exit(f"--eyelids: no iris found on side {side} ({len(pts)} verts)")
        centre = sum(pts, Vector()) / len(pts)
        d = sorted((p - centre).length for p in pts)
        radius = d[int(len(d) * 0.95)] * 1.15
        ring = [
            c
            for v, c in zip(verts, srgb)
            if radius * 1.2 < (v.co - centre).length < radius * 1.7 and v.normal.y < 0
        ]
        eyes.append((centre, radius, ring))
        print(f"eye {side}: centre {tuple(round(x, 3) for x in centre)} r={radius:.3f} iris verts={len(pts)}")

    ring = [c for e in eyes for c in e[2]]
    lid_srgb = [0.82 * sum(c[i] for c in ring) / len(ring) for i in range(3)]

    # Copy every front face touching an eye, subdivide it 4x4 so the outline
    # is no longer bound to the model's coarse triangles, project the new
    # verts back onto the eye surface (slightly proud of it), then trim to the
    # eye radius. Result: a round lid that hugs the eye, not a polygon blob.
    from mathutils.bvhtree import BVHTree

    bm = bmesh.new()
    bm.from_mesh(me)
    bm.normal_update()
    bvh = BVHTree.FromBMesh(bm)
    out = bmesh.new()
    vmap = {}
    for f in bm.faces:
        if f.normal.y > 0 or not any(
            min((v.co - e[0]).length for v in f.verts) < e[1] for e in eyes
        ):
            continue
        nv = []
        for v in f.verts:
            if v.index not in vmap:
                vmap[v.index] = out.verts.new(v.co)
            nv.append(vmap[v.index])
        out.faces.new(nv)
    bm.free()
    bmesh.ops.subdivide_edges(out, edges=out.edges[:], cuts=3, use_grid_fill=True)
    for v in out.verts:
        hit, _, _, _ = bvh.find_nearest(v.co)
        if hit is not None:
            v.co = hit
    bmesh.ops.delete(
        out,
        geom=[v for v in out.verts if not any((v.co - e[0]).length <= e[1] * 1.5 for e in eyes)],
        context="VERTS",
    )
    # The eye surface underneath is coarse, so relax the interior into a
    # smooth dome (outline pinned), then lift it along the smoothed normals.
    inner = [v for v in out.verts if not v.is_boundary]
    for _ in range(6):
        bmesh.ops.smooth_vert(
            out, verts=inner, factor=0.5, use_axis_x=True, use_axis_y=True, use_axis_z=True
        )
    out.normal_update()
    for v in out.verts:
        v.co += v.normal * 0.007
    lid_me = bpy.data.meshes.new("Eyelids")
    out.to_mesh(lid_me)
    out.free()
    lid = bpy.data.objects.new("Eyelids", lid_me)
    # The patch is deliberately oversized; the web shader cuts it to an exact
    # circle per eye. Exported as glTF extras in glTF space (x, y-up, radius).
    # 0.92 x the detected radius lands on the painted eye's dark outline:
    # big enough to hide the iris, small enough not to spill onto the pale disc.
    lid["lid_eyes"] = [v for c, r, _ in eyes for v in (c.x, c.z, r * 0.92)]
    bpy.context.scene.collection.objects.link(lid)
    for p in lid_me.polygons:
        p.use_smooth = True

    mat = bpy.data.materials.new("Eyelid")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*[srgb_to_linear(x) for x in lid_srgb], 1)
    bsdf.inputs["Roughness"].default_value = 0.85
    lid_me.materials.append(mat)
    print(f"eyelids: {len(lid_me.polygons)} faces, colour {tuple(round(x, 2) for x in lid_srgb)}")


def linear_to_srgb(c):
    c = max(0.0, min(1.0, c))
    return c * 12.92 if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055


if eyelids:
    if not textured:
        sys.exit("--eyelids needs a textured model")
    add_eyelids(obj)

MAX_TEX = 1024
if textured:
    for img in bpy.data.images:
        w, h = img.size
        if max(w, h) > MAX_TEX:
            k = MAX_TEX / max(w, h)
            img.scale(round(w * k), round(h * k))

# ---------------------------------------------------------------- paint
if not textured:
    # Curvature per vertex: how far neighbours sit above (concave) or below
    # (convex) the vertex's tangent plane, scaled by edge length so it is
    # resolution independent. A few Laplacian passes soften the noise.
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bm.verts.ensure_lookup_table()
    curv = []
    for v in bm.verts:
        if not v.link_edges:
            curv.append(0.0)
            continue
        acc = 0.0
        for e in v.link_edges:
            d = e.other_vert(v).co - v.co
            L = d.length
            if L > 0:
                acc += v.normal.dot(d) / L
        curv.append(acc / len(v.link_edges))
    for _ in range(3):
        curv = [
            0.5 * curv[v.index]
            + 0.5 * sum(curv[e.other_vert(v).index] for e in v.link_edges) / max(1, len(v.link_edges))
            for v in bm.verts
        ]
    bm.free()

    # Normalise against the spread so the look survives any mesh density.
    spread = sorted(abs(c) for c in curv)[int(len(curv) * 0.95)] or 1.0
    attr = obj.data.color_attributes.new("Col", "BYTE_COLOR", "POINT")
    for i, c in enumerate(curv):
        t = max(-1.0, min(1.0, c / spread))  # >0 recess, <0 raised edge
        if t > 0:
            k = t ** 0.8
            rgb = [b + (r - b) * k for b, r in zip(BASE, RECESS)]
        else:
            k = (-t) ** 1.6 * 0.85
            rgb = [b + (e - b) * k for b, e in zip(BASE, EDGE)]
        # BYTE_COLOR stores sRGB, but the Python API reads/writes linear floats.
        attr.data[i].color = (*[srgb_to_linear(x) for x in rgb], 1.0)
    obj.data.color_attributes.active_color = attr
    obj.data.color_attributes.render_color_index = 0

    # A material that reads the colour attribute, so both the preview render and
    # the glTF exporter pick the vertex colours up.
    mat = bpy.data.materials.new("PaintedPLA")
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    bsdf.inputs["Roughness"].default_value = 0.62
    col = nt.nodes.new("ShaderNodeVertexColor")
    col.layer_name = "Col"
    nt.links.new(col.outputs["Color"], bsdf.inputs["Base Color"])
    obj.data.materials.clear()
    obj.data.materials.append(mat)

# ---------------------------------------------------------------- export
dst.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.export_scene.gltf(
    filepath=str(dst),
    export_format="GLB",
    use_selection=False,
    export_apply=True,
    export_texcoords=textured,
    export_normals=True,
    export_vertex_color="NONE" if textured else "ACTIVE",
    export_materials="EXPORT",
    export_image_format="WEBP",
    export_image_quality=82,
    export_yup=True,
    export_extras=True,
)
print(f"wrote {dst} ({dst.stat().st_size / 1024:.0f} KB)")

# ---------------------------------------------------------------- preview
if preview:
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 48
    scene.render.resolution_x = scene.render.resolution_y = 700
    scene.render.film_transparent = False
    scene.world = bpy.data.worlds.new("W")
    scene.world.use_nodes = True
    scene.world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.004, 0.006, 0.012, 1)

    cam = bpy.data.objects.new("Cam", bpy.data.cameras.new("Cam"))
    scene.collection.objects.link(cam)
    cam.location = (0, -3.2, 0.55)
    cam.rotation_euler = (math.radians(88), 0, 0)
    cam.data.lens = 50
    scene.camera = cam

    def light(name, loc, energy, color):
        L = bpy.data.objects.new(name, bpy.data.lights.new(name, "AREA"))
        L.data.energy, L.data.color, L.data.size = energy, color, 1.5
        L.location = loc
        L.rotation_euler = (Vector((0, 0, 0.5)) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
        scene.collection.objects.link(L)

    light("Key", (-1.5, -2.0, 2.0), 180, (1.0, 0.96, 0.9))
    light("Rim", (2.0, 1.5, 1.5), 260, (0.38, 0.65, 0.98))

    # Front and side views, side by side, matching the web interaction.
    frames = []
    for i, yaw in enumerate((0, 90)):
        obj.rotation_euler = (0, 0, math.radians(yaw))
        out = preview.with_name(f"{preview.stem}-{i}{preview.suffix}")
        scene.render.filepath = str(out)
        bpy.ops.render.render(write_still=True)
        frames.append(out)
    print("preview:", *frames)
