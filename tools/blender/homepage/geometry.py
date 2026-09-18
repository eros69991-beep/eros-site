from __future__ import annotations

import math
from typing import Callable

import bpy
from mathutils import Vector


ASSET_IDS = ("core", "spring", "summer", "autumn", "winter", "studio")


def _collection(name: str) -> bpy.types.Collection:
    collection = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(collection)
    return collection


def _move_to_collection(obj: bpy.types.Object, collection: bpy.types.Collection) -> None:
    for owner in tuple(obj.users_collection):
        owner.objects.unlink(obj)
    collection.objects.link(obj)


def _surface(
    name: str,
    collection: bpy.types.Collection,
    subdivisions: int,
    displacement: Callable[[Vector], float],
) -> bpy.types.Object:
    """Create a planet-first silhouette with restrained geological relief."""
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=subdivisions, radius=1.0)
    obj = bpy.context.object
    obj.name = name
    _move_to_collection(obj, collection)

    for vertex in obj.data.vertices:
        direction = vertex.co.normalized()
        vertex.co = direction * (1.0 + displacement(direction))

    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return obj


def _mask_helpers(collection: bpy.types.Collection, names: tuple[str, ...]) -> None:
    """Keep named authoring roles without layering visible shells over the planet."""
    for name in names:
        helper = bpy.data.objects.new(name, None)
        helper.empty_display_type = "SPHERE"
        helper.empty_display_size = 0.08
        collection.objects.link(helper)


def _core_relief(direction: Vector) -> float:
    x, y, z = direction
    continental = 0.007 * math.sin(3.4 * x + 2.6 * z) * math.cos(4.1 * y - 1.2 * z)
    strata = 0.0035 * math.sin(13.0 * y + 2.1 * math.sin(4.0 * x))
    mineral = 0.0015 * math.sin(41.0 * x + 23.0 * y + 31.0 * z)
    return continental + strata + mineral


def _dent(direction: Vector, center: tuple[float, float, float], radius: float, depth: float) -> float:
    distance = (direction - Vector(center).normalized()).length
    if distance >= radius:
        return 0.0
    falloff = 1.0 - distance / radius
    lip = 0.18 * depth * math.exp(-((distance - radius * 0.86) / (radius * 0.1)) ** 2)
    return -(depth * falloff * falloff) + lip


def _spring_relief(direction: Vector) -> float:
    x, y, z = direction
    facets = 0.009 * math.sin(6.0 * x + 4.0 * z) * math.cos(5.0 * y - 2.0 * z)
    crystal = 0.003 * math.sin(31.0 * y + 13.0 * x)
    return facets + crystal + _dent(direction, (0.6, 0.2, 0.75), 0.28, 0.025)


def _summer_relief(direction: Vector) -> float:
    x, y, z = direction
    ablation = 0.013 * math.sin(5.5 * x + 3.0 * z) * math.cos(7.0 * y)
    grit = 0.004 * math.sin(37.0 * x - 17.0 * z)
    return (
        ablation
        + grit
        + _dent(direction, (0.5, -0.1, 0.85), 0.32, 0.055)
        + _dent(direction, (-0.65, 0.55, 0.3), 0.22, 0.035)
    )


def _autumn_relief(direction: Vector) -> float:
    x, y, z = direction
    strata = 0.02 * math.sin(7.5 * y + 1.8 * math.sin(3.0 * x))
    erosion = 0.006 * math.sin(31.0 * x + 11.0 * z)
    return strata + erosion + _dent(direction, (-0.45, 0.2, 0.8), 0.3, 0.04)


def _winter_relief(direction: Vector) -> float:
    x, y, z = direction
    plates = 0.011 * math.sin(6.0 * x - 5.0 * y) * math.cos(4.0 * z)
    ice = 0.003 * math.sin(33.0 * z + 7.0 * x)
    return plates + ice + _dent(direction, (0.3, 0.65, 0.7), 0.25, 0.028)


def _studio_relief(direction: Vector) -> float:
    x, y, z = direction
    return 0.006 * math.sin(7.0 * x + 8.0 * y + 6.0 * z) + 0.002 * math.sin(43.0 * x - 19.0 * z)


def build_core(seed: int = 1701) -> bpy.types.Collection:
    del seed
    collection = _collection("SOURCE_CORE")
    _surface("core_surface_geo", collection, 7, _core_relief)
    _mask_helpers(
        collection,
        (
            "core_matte_metal_mask",
            "core_liquid_mask",
            "core_crystal_mask",
            "core_emissive_mask",
        ),
    )
    return collection


def build_spring(seed: int = 2101) -> bpy.types.Collection:
    del seed
    collection = _collection("SOURCE_SPRING")
    _surface(
        "spring_surface_geo",
        collection,
        6,
        _spring_relief,
    )
    return collection


def build_summer(seed: int = 2203) -> bpy.types.Collection:
    del seed
    collection = _collection("SOURCE_SUMMER")
    _surface(
        "summer_surface_geo",
        collection,
        6,
        _summer_relief,
    )
    return collection


def build_autumn(seed: int = 2309) -> bpy.types.Collection:
    del seed
    collection = _collection("SOURCE_AUTUMN")
    _surface(
        "autumn_surface_geo",
        collection,
        6,
        _autumn_relief,
    )
    return collection


def build_winter(seed: int = 2411) -> bpy.types.Collection:
    del seed
    collection = _collection("SOURCE_WINTER")
    _surface(
        "winter_surface_geo",
        collection,
        6,
        _winter_relief,
    )
    return collection


def build_studio(seed: int = 2503) -> bpy.types.Collection:
    del seed
    collection = _collection("SOURCE_STUDIO")
    _surface(
        "studio_surface_geo",
        collection,
        6,
        _studio_relief,
    )
    return collection


BUILDERS = {
    "core": build_core,
    "spring": build_spring,
    "summer": build_summer,
    "autumn": build_autumn,
    "winter": build_winter,
    "studio": build_studio,
}
