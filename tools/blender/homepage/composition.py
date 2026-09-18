from __future__ import annotations

import math
import random

import bpy
import bmesh
from mathutils import Matrix, Vector


CAMERA_PROFILES = {
    "desktop": {"resolution": (1440, 900), "lens_mm": 54, "core_crop": (0.28, 0.42)},
    "mobile": {"resolution": (390, 844), "lens_mm": 50, "dominant_body": "spring"},
}

PLACEMENTS = {
    "SOURCE_CORE": ((5.05, 1.15, -0.45), 3.3, (0.14, -0.3, 0.18)),
    "SOURCE_SPRING": ((2.05, -1.75, 0.3), 0.36, (0.2, 0.35, -0.15)),
    "SOURCE_SUMMER": ((-3.35, 0.35, -0.1), 0.48, (-0.18, 0.2, 0.1)),
    "SOURCE_AUTUMN": ((0.15, -0.25, -1.2), 0.4, (0.1, -0.25, 0.25)),
    "SOURCE_WINTER": ((-1.55, 1.45, -2.1), 0.27, (-0.15, 0.28, 0.05)),
    "SOURCE_STUDIO": ((0.9, 2.2, -3.1), 0.22, (0.0, -0.15, 0.2)),
}


def _look_at(obj: bpy.types.Object, point: tuple[float, float, float]) -> None:
    direction = Vector(point) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def _camera(name: str, location: tuple[float, float, float], lens: int) -> bpy.types.Object:
    data = bpy.data.cameras.new(name)
    data.lens = lens
    data.sensor_width = 36
    camera = bpy.data.objects.new(name, data)
    camera.location = location
    bpy.context.scene.collection.objects.link(camera)
    camera.rotation_euler = (0.0, 0.0, 0.0)
    return camera


def create_cameras() -> tuple[bpy.types.Object, bpy.types.Object]:
    desktop = _camera("CAMERA_DESKTOP", (0.0, 0.0, 14.0), 54)
    mobile = _camera("CAMERA_MOBILE", (0.0, 0.0, 14.0), 50)
    return desktop, mobile


def position_sources() -> None:
    for collection_name, (location, scale, rotation) in PLACEMENTS.items():
        collection = bpy.data.collections[collection_name]
        for obj in collection.objects:
            obj.location = location
            obj.scale = (scale, scale, scale)
            obj.rotation_euler = rotation


def _dust_material() -> bpy.types.Material:
    material = bpy.data.materials.new("galactic_dust")
    material.diffuse_color = (0.08, 0.075, 0.07, 1.0)
    material.use_nodes = True
    bsdf = material.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (0.12, 0.115, 0.11, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.92
    emission = bsdf.inputs.get("Emission Color") or bsdf.inputs.get("Emission")
    if emission:
        emission.default_value = (0.14, 0.13, 0.12, 1.0)
    strength = bsdf.inputs.get("Emission Strength")
    if strength:
        strength.default_value = 0.6
    return material


def _galaxy_band_material() -> bpy.types.Material:
    material = bpy.data.materials.new("galactic_band")
    material.use_nodes = True
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    nodes.clear()

    output = nodes.new("ShaderNodeOutputMaterial")
    transparent = nodes.new("ShaderNodeBsdfTransparent")
    emission = nodes.new("ShaderNodeEmission")
    emission.inputs["Color"].default_value = (0.17, 0.16, 0.15, 1.0)
    emission.inputs["Strength"].default_value = 0.52
    mix = nodes.new("ShaderNodeMixShader")
    texture = nodes.new("ShaderNodeTexCoord")
    separate = nodes.new("ShaderNodeSeparateXYZ")
    links.new(texture.outputs["Generated"], separate.inputs["Vector"])

    centered = nodes.new("ShaderNodeMath")
    centered.operation = "SUBTRACT"
    centered.inputs[1].default_value = 0.5
    links.new(separate.outputs["Y"], centered.inputs[0])
    absolute = nodes.new("ShaderNodeMath")
    absolute.operation = "ABSOLUTE"
    links.new(centered.outputs[0], absolute.inputs[0])
    width = nodes.new("ShaderNodeMath")
    width.operation = "MULTIPLY"
    width.inputs[1].default_value = 2.0
    links.new(absolute.outputs[0], width.inputs[0])
    falloff = nodes.new("ShaderNodeMath")
    falloff.operation = "SUBTRACT"
    falloff.inputs[0].default_value = 1.0
    links.new(width.outputs[0], falloff.inputs[1])
    power = nodes.new("ShaderNodeMath")
    power.operation = "POWER"
    power.inputs[1].default_value = 2.4
    links.new(falloff.outputs[0], power.inputs[0])

    noise = nodes.new("ShaderNodeTexNoise")
    noise.noise_dimensions = "3D"
    noise.inputs["Scale"].default_value = 8.0
    noise.inputs["Detail"].default_value = 8.0
    noise.inputs["Roughness"].default_value = 0.78
    noise.inputs["Distortion"].default_value = 0.36
    links.new(texture.outputs["Generated"], noise.inputs["Vector"])
    density = nodes.new("ShaderNodeMath")
    density.operation = "MULTIPLY"
    links.new(power.outputs[0], density.inputs[0])
    links.new(noise.outputs["Fac"], density.inputs[1])
    links.new(density.outputs[0], mix.inputs[0])
    links.new(transparent.outputs["BSDF"], mix.inputs[1])
    links.new(emission.outputs["Emission"], mix.inputs[2])
    links.new(mix.outputs["Shader"], output.inputs["Surface"])
    return material


def create_galactic_band() -> bpy.types.Object:
    bpy.ops.mesh.primitive_plane_add(size=2.0, location=(-0.2, -0.15, -4.0), rotation=(0.0, 0.0, -0.41))
    obj = bpy.context.object
    obj.name = "GALACTIC_BAND"
    obj.scale = (8.4, 1.45, 1.0)
    obj.data.materials.append(_galaxy_band_material())
    return obj


def create_galactic_dust(seed: int = 9031) -> bpy.types.Object:
    random.seed(seed)
    mesh = bpy.data.meshes.new("galactic_dust_mesh")
    builder = bmesh.new()
    for index in range(1150):
        x = random.uniform(-6.8, 5.2)
        band_y = -0.43 * x - 0.15
        y = band_y + random.gauss(0.0, 0.42 + 0.035 * abs(x))
        z = random.uniform(-4.5, -0.6)
        size = random.uniform(0.003, 0.009) * (1.8 if index % 53 == 0 else 1.0)
        bmesh.ops.create_icosphere(
            builder,
            subdivisions=1,
            radius=size,
            matrix=Matrix.Translation((x, y, z)),
        )
    builder.to_mesh(mesh)
    builder.free()
    mesh.update()
    obj = bpy.data.objects.new("GALACTIC_DUST", mesh)
    bpy.context.scene.collection.objects.link(obj)
    obj.data.materials.append(_dust_material())
    return obj


def _area_light(name: str, location: tuple[float, float, float], energy: float, size: float, color: tuple[float, float, float], target: tuple[float, float, float]) -> None:
    data = bpy.data.lights.new(name=name, type="AREA")
    data.energy = energy
    data.shape = "DISK"
    data.size = size
    data.color = color
    obj = bpy.data.objects.new(name, data)
    obj.location = location
    bpy.context.scene.collection.objects.link(obj)
    _look_at(obj, target)


def create_lighting() -> None:
    _area_light("LIGHT_COLD_KEY", (-5.0, 5.8, 7.0), 1050, 5.0, (0.68, 0.74, 0.82), (0.4, 0.0, 0.0))
    _area_light("LIGHT_CORE_RIM", (7.8, 3.5, 5.5), 2900, 3.2, (0.9, 0.9, 0.88), (4.9, 1.2, 0.0))
    _area_light("LIGHT_CORE_LIMB", (1.3, 4.4, -3.8), 3300, 2.8, (0.76, 0.8, 0.84), (4.6, 1.4, 0.0))
    _area_light("LIGHT_LOW_FILL", (-2.0, -5.0, 4.0), 240, 5.5, (0.25, 0.31, 0.36), (0.0, -0.5, 0.0))


def configure_world() -> None:
    world = bpy.context.scene.world
    world.use_nodes = True
    background = world.node_tree.nodes.get("Background")
    background.inputs["Color"].default_value = (0.0004, 0.0005, 0.0007, 1.0)
    background.inputs["Strength"].default_value = 0.015


def configure_render() -> None:
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.film_transparent = False
    scene.view_settings.look = "AgX - Medium High Contrast"
    scene.render.resolution_percentage = 100
    scene.render.image_settings.color_depth = "8"


def configure_composition() -> tuple[bpy.types.Object, bpy.types.Object]:
    configure_world()
    configure_render()
    position_sources()
    create_galactic_band()
    create_galactic_dust()
    create_lighting()
    return create_cameras()
