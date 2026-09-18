from __future__ import annotations

import json
import sys
from pathlib import Path

import bpy


SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parents[2]
sys.path.insert(0, str(SCRIPT_DIR))

from composition import configure_composition  # noqa: E402
from geometry import BUILDERS  # noqa: E402
from materials import assign_source_materials  # noqa: E402


SOURCE_PATH = ROOT / "assets-source" / "homepage" / "eros-homepage-master.blend"
AUDIT_PATH = ROOT / "work" / "homepage-source-audit.json"


def reset_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for collection in list(bpy.data.collections):
        bpy.data.collections.remove(collection)
    for block in (bpy.data.meshes, bpy.data.curves, bpy.data.materials, bpy.data.cameras, bpy.data.lights):
        for item in list(block):
            if item.users == 0:
                block.remove(item)


def write_audit() -> None:
    collections = sorted(collection.name for collection in bpy.data.collections if collection.name.startswith("SOURCE_"))
    cameras = sorted(camera.name for camera in bpy.data.objects if camera.type == "CAMERA")
    material_slots = {}
    for collection_name in collections:
        asset_id = collection_name.removeprefix("SOURCE_").lower()
        material_slots[asset_id] = sorted({
            slot.material.name
            for obj in bpy.data.collections[collection_name].objects
            for slot in obj.material_slots
            if slot.material
        })
    audit = {
        "collections": collections,
        "cameras": cameras,
        "cameraRotations": {
            name: [round(value, 6) for value in bpy.data.objects[name].rotation_euler]
            for name in cameras
        },
        "objects": {name: len(bpy.data.collections[name].objects) for name in collections},
        "materialSlots": material_slots,
    }
    AUDIT_PATH.parent.mkdir(parents=True, exist_ok=True)
    AUDIT_PATH.write_text(json.dumps(audit, indent=2, sort_keys=True), encoding="utf-8")


def main() -> None:
    reset_scene()
    for builder in BUILDERS.values():
        builder()
    assign_source_materials()
    configure_composition()
    SOURCE_PATH.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE_PATH))
    write_audit()
    print(f"Built {SOURCE_PATH}")


if __name__ == "__main__":
    main()
