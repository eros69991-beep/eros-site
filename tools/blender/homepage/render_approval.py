from __future__ import annotations

import argparse
import sys
from pathlib import Path

import bpy
from mathutils import Vector


SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parents[2]
SOURCE_PATH = ROOT / "assets-source" / "homepage" / "eros-homepage-master.blend"
OUTPUT_DIR = ROOT / "assets-source" / "homepage" / "renders" / "approval"

MOBILE_PLACEMENTS = {
    "SOURCE_CORE": ((3.5, 2.55, -0.45), 3.3),
    "SOURCE_SPRING": ((0.0, -1.15, 0.3), 0.68),
    "SOURCE_SUMMER": ((-1.15, 0.7, -0.1), 0.3),
    "SOURCE_AUTUMN": ((0.55, 0.05, -1.2), 0.24),
    "SOURCE_WINTER": ((-0.75, 1.65, -2.1), 0.19),
    "SOURCE_STUDIO": ((0.75, -2.75, -3.1), 0.16),
}


def parse_args() -> argparse.Namespace:
    arguments = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--set", default="portal", choices=("portal", "turntables"))
    return parser.parse_args(arguments)


def render_portal() -> None:
    scene = bpy.context.scene
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    scene.camera = bpy.data.objects["CAMERA_DESKTOP"]
    scene.render.resolution_x, scene.render.resolution_y = (1440, 900)
    scene.render.filepath = str(OUTPUT_DIR / "portal-desktop-1440x900.png")
    bpy.ops.render.render(write_still=True)
    print(f"Rendered {scene.render.filepath}")

    for collection_name, (location, scale) in MOBILE_PLACEMENTS.items():
        for obj in bpy.data.collections[collection_name].objects:
            obj.location = location
            obj.scale = (scale, scale, scale)
    scene.camera = bpy.data.objects["CAMERA_MOBILE"]
    scene.render.resolution_x, scene.render.resolution_y = (390, 844)
    scene.render.filepath = str(OUTPUT_DIR / "portal-mobile-390x844.png")
    bpy.ops.render.render(write_still=True)
    print(f"Rendered {scene.render.filepath}")


def _look_at(obj: bpy.types.Object, point: tuple[float, float, float]) -> None:
    direction = Vector(point) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def _turntable_light(name: str, location: tuple[float, float, float], energy: float, size: float) -> bpy.types.Object:
    data = bpy.data.lights.new(name=name, type="AREA")
    data.energy = energy
    data.shape = "DISK"
    data.size = size
    data.color = (0.78, 0.84, 0.9)
    obj = bpy.data.objects.new(name, data)
    obj.location = location
    bpy.context.scene.collection.objects.link(obj)
    _look_at(obj, (0.0, 0.0, 0.0))
    return obj


def _prepare_turntable_stage() -> bpy.types.Object:
    for obj in bpy.context.scene.objects:
        if obj.type in {"MESH", "CURVE", "LIGHT", "CAMERA"}:
            obj.hide_render = True

    data = bpy.data.cameras.new("CAMERA_TURNTABLE")
    data.lens = 50
    data.sensor_width = 36
    camera = bpy.data.objects.new("CAMERA_TURNTABLE", data)
    camera.location = (0.0, 0.0, 10.0)
    camera.rotation_euler = (0.0, 0.0, 0.0)
    bpy.context.scene.collection.objects.link(camera)
    camera.hide_render = False

    for light in (
        _turntable_light("TURNTABLE_KEY", (-4.0, 4.5, 6.0), 720, 5.0),
        _turntable_light("TURNTABLE_RIM", (4.5, 1.5, 4.5), 1050, 3.0),
        _turntable_light("TURNTABLE_FILL", (0.0, -4.0, 3.5), 110, 4.0),
    ):
        light.hide_render = False
    return camera


def _remove_turntable_objects(objects: list[bpy.types.Object]) -> None:
    for obj in objects:
        data = obj.data
        bpy.data.objects.remove(obj, do_unlink=True)
        if data and data.users == 0:
            if isinstance(data, bpy.types.Mesh):
                bpy.data.meshes.remove(data)
            elif isinstance(data, bpy.types.Curve):
                bpy.data.curves.remove(data)


def render_turntables() -> None:
    scene = bpy.context.scene
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    camera = _prepare_turntable_stage()
    scene.camera = camera
    scene.render.resolution_x = 2400
    scene.render.resolution_y = 800

    for asset_id in ("core", "spring", "summer", "autumn", "winter", "studio"):
        source = bpy.data.collections[f"SOURCE_{asset_id.upper()}"]
        rendered_objects: list[bpy.types.Object] = []
        scale = 1.08 if asset_id == "core" else 0.98
        for offset, angle in zip((-2.35, 0.0, 2.35), (-0.6, 0.25, 1.05), strict=True):
            for source_obj in source.objects:
                if source_obj.type not in {"MESH", "CURVE"}:
                    continue
                duplicate = source_obj.copy()
                duplicate.data = source_obj.data.copy()
                duplicate.location = (offset, 0.0, 0.0)
                duplicate.scale = (scale, scale, scale)
                duplicate.rotation_euler = (0.1, angle, -0.06)
                duplicate.hide_render = False
                bpy.context.scene.collection.objects.link(duplicate)
                rendered_objects.append(duplicate)

        scene.render.filepath = str(OUTPUT_DIR / f"{asset_id}-turntable.png")
        bpy.ops.render.render(write_still=True)
        print(f"Rendered {scene.render.filepath}")
        _remove_turntable_objects(rendered_objects)


def main() -> None:
    args = parse_args()
    bpy.ops.wm.open_mainfile(filepath=str(SOURCE_PATH))
    if args.set == "portal":
        render_portal()
        return
    render_turntables()


if __name__ == "__main__":
    main()
