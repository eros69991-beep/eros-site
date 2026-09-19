from __future__ import annotations

import json
from pathlib import Path

import bpy


SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parents[2]
SOURCE_PATH = ROOT / "assets-source" / "homepage" / "eros-homepage-master.blend"
OUTPUT_DIR = ROOT / "public" / "assets" / "homepage" / "models"
AUDIT_PATH = ROOT / "work" / "homepage-runtime-audit.json"

TRIANGLE_TARGETS = {
    "core": {"low": 26000, "medium": 52000, "high": 88000},
    "spring": {"low": 6500, "medium": 15000, "high": 30000},
    "summer": {"low": 7000, "medium": 17000, "high": 33000},
    "autumn": {"low": 7000, "medium": 18000, "high": 35000},
    "winter": {"low": 6500, "medium": 16000, "high": 31000},
    "studio": {"low": 5000, "medium": 12000, "high": 24000},
}


def _source_mesh(asset_id: str) -> bpy.types.Object:
    collection = bpy.data.collections[f"SOURCE_{asset_id.upper()}"]
    meshes = [obj for obj in collection.objects if obj.type == "MESH"]
    if len(meshes) != 1:
        raise RuntimeError(f"Expected one runtime mesh for {asset_id}, found {len(meshes)}")
    return meshes[0]


def _duplicate_for_export(source: bpy.types.Object, name: str) -> bpy.types.Object:
    duplicate = source.copy()
    duplicate.data = source.data.copy()
    duplicate.name = name
    duplicate.hide_render = False
    duplicate.hide_viewport = False
    duplicate.location = (0.0, 0.0, 0.0)
    duplicate.rotation_euler = (0.0, 0.0, 0.0)
    duplicate.scale = (1.0, 1.0, 1.0)
    bpy.context.scene.collection.objects.link(duplicate)
    return duplicate


def _triangle_count(obj: bpy.types.Object) -> int:
    return sum(max(0, len(polygon.vertices) - 2) for polygon in obj.data.polygons)


def _decimate(obj: bpy.types.Object, target: int) -> int:
    current = _triangle_count(obj)
    if current > target:
        modifier = obj.modifiers.new(name="runtime_lod", type="DECIMATE")
        modifier.decimate_type = "COLLAPSE"
        modifier.ratio = max(0.01, min(1.0, target / current))
        modifier.use_collapse_triangulate = True
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        bpy.ops.object.modifier_apply(modifier=modifier.name)
    return _triangle_count(obj)


def _export_selected(obj: bpy.types.Object, path: Path) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.export_scene.gltf(
        filepath=str(path),
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_cameras=False,
        export_lights=False,
        export_animations=False,
        export_materials="EXPORT",
        export_attributes=False,
    )


def main() -> None:
    bpy.ops.wm.open_mainfile(filepath=str(SOURCE_PATH))
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    audit: dict[str, object] = {"assets": {}}

    for asset_id, targets in TRIANGLE_TARGETS.items():
        source = _source_mesh(asset_id)
        asset_audit: dict[str, object] = {}
        for lod in ("low", "medium", "high"):
            duplicate = _duplicate_for_export(source, f"{asset_id}_{lod}")
            triangles = _decimate(duplicate, targets[lod])
            output_path = OUTPUT_DIR / f"{asset_id}-{lod}.glb"
            _export_selected(duplicate, output_path)
            asset_audit[lod] = {
                "path": str(output_path.relative_to(ROOT)),
                "triangles": triangles,
                "bytes": output_path.stat().st_size,
            }
            bpy.data.objects.remove(duplicate, do_unlink=True)
        audit["assets"][asset_id] = asset_audit

    AUDIT_PATH.parent.mkdir(parents=True, exist_ok=True)
    AUDIT_PATH.write_text(json.dumps(audit, indent=2, sort_keys=True), encoding="utf-8")
    print(f"Exported homepage runtime assets to {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
