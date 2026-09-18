from __future__ import annotations

import bpy


Color = tuple[float, float, float, float]


def _set_input(node: bpy.types.Node, names: tuple[str, ...], value) -> None:
    for name in names:
        socket = node.inputs.get(name)
        if socket is not None:
            socket.default_value = value
            return


def _placeholder(name: str, color: Color) -> bpy.types.Material:
    material = bpy.data.materials.new(name)
    material.diffuse_color = color
    material.use_nodes = True
    bsdf = material.node_tree.nodes.get("Principled BSDF")
    _set_input(bsdf, ("Base Color",), color)
    _set_input(bsdf, ("Roughness",), 0.55)
    return material


def _planet_material(
    name: str,
    low_color: Color,
    high_color: Color,
    seam_color: Color,
    *,
    macro_scale: float,
    detail_scale: float,
    crack_scale: float,
    roughness: float,
    metallic: float,
    seam_metallic: float,
    transmission: float = 0.0,
    emission_strength: float = 0.0,
    bump_strength: float = 0.22,
    rim_color: Color | None = None,
    seam_inner: float = 0.006,
    seam_outer: float = 0.027,
    branch_strength: float = 0.0,
) -> bpy.types.Material:
    """Build a single continuous geological surface; seams are shader masks, not pasted geometry."""
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    nodes.clear()

    output = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    texture = nodes.new("ShaderNodeTexCoord")

    macro = nodes.new("ShaderNodeTexNoise")
    macro.noise_dimensions = "3D"
    macro.inputs["Scale"].default_value = macro_scale
    macro.inputs["Detail"].default_value = 7.0
    macro.inputs["Roughness"].default_value = 0.68
    macro.inputs["Distortion"].default_value = 0.42
    links.new(texture.outputs["Generated"], macro.inputs["Vector"])

    mineral_ramp = nodes.new("ShaderNodeValToRGB")
    mineral_ramp.color_ramp.elements[0].position = 0.23
    mineral_ramp.color_ramp.elements[0].color = low_color
    mineral_ramp.color_ramp.elements[1].position = 0.78
    mineral_ramp.color_ramp.elements[1].color = high_color
    links.new(macro.outputs["Fac"], mineral_ramp.inputs["Fac"])

    voronoi = nodes.new("ShaderNodeTexVoronoi")
    voronoi.distance = "EUCLIDEAN"
    voronoi.feature = "DISTANCE_TO_EDGE"
    voronoi.voronoi_dimensions = "3D"
    voronoi.inputs["Scale"].default_value = crack_scale
    voronoi.inputs["Randomness"].default_value = 1.0
    centered_noise = nodes.new("ShaderNodeVectorMath")
    centered_noise.operation = "SUBTRACT"
    centered_noise.inputs[1].default_value = (0.5, 0.5, 0.5)
    links.new(macro.outputs["Color"], centered_noise.inputs[0])
    distortion = nodes.new("ShaderNodeVectorMath")
    distortion.operation = "SCALE"
    distortion.inputs[3].default_value = 0.46
    links.new(centered_noise.outputs["Vector"], distortion.inputs[0])
    distorted_coordinates = nodes.new("ShaderNodeVectorMath")
    distorted_coordinates.operation = "ADD"
    links.new(texture.outputs["Generated"], distorted_coordinates.inputs[0])
    links.new(distortion.outputs["Vector"], distorted_coordinates.inputs[1])
    links.new(distorted_coordinates.outputs["Vector"], voronoi.inputs["Vector"])

    seam_ramp = nodes.new("ShaderNodeValToRGB")
    seam_ramp.color_ramp.interpolation = "EASE"
    seam_ramp.color_ramp.elements[0].position = seam_inner
    seam_ramp.color_ramp.elements[0].color = (1.0, 1.0, 1.0, 1.0)
    seam_ramp.color_ramp.elements[1].position = seam_outer
    seam_ramp.color_ramp.elements[1].color = (0.0, 0.0, 0.0, 1.0)
    links.new(voronoi.outputs["Distance"], seam_ramp.inputs["Fac"])

    seam_factor = seam_ramp.outputs["Color"]
    if branch_strength > 0:
        branch_voronoi = nodes.new("ShaderNodeTexVoronoi")
        branch_voronoi.distance = "EUCLIDEAN"
        branch_voronoi.feature = "DISTANCE_TO_EDGE"
        branch_voronoi.voronoi_dimensions = "3D"
        branch_voronoi.inputs["Scale"].default_value = crack_scale * 2.7
        branch_voronoi.inputs["Randomness"].default_value = 1.0
        links.new(distorted_coordinates.outputs["Vector"], branch_voronoi.inputs["Vector"])
        branch_ramp = nodes.new("ShaderNodeValToRGB")
        branch_ramp.color_ramp.elements[0].position = 0.001
        branch_ramp.color_ramp.elements[0].color = (1.0, 1.0, 1.0, 1.0)
        branch_ramp.color_ramp.elements[1].position = 0.006
        branch_ramp.color_ramp.elements[1].color = (0.0, 0.0, 0.0, 1.0)
        links.new(branch_voronoi.outputs["Distance"], branch_ramp.inputs["Fac"])
        branch_mask = nodes.new("ShaderNodeMath")
        branch_mask.operation = "MULTIPLY"
        branch_mask.inputs[1].default_value = branch_strength
        links.new(branch_ramp.outputs["Color"], branch_mask.inputs[0])
        seam_add = nodes.new("ShaderNodeMath")
        seam_add.operation = "ADD"
        seam_add.use_clamp = True
        links.new(seam_ramp.outputs["Color"], seam_add.inputs[0])
        links.new(branch_mask.outputs[0], seam_add.inputs[1])
        seam_factor = seam_add.outputs[0]

    color_mix = nodes.new("ShaderNodeMixRGB")
    color_mix.blend_type = "MIX"
    color_mix.inputs[2].default_value = seam_color
    links.new(seam_factor, color_mix.inputs[0])
    links.new(mineral_ramp.outputs["Color"], color_mix.inputs[1])

    surface_color_output = color_mix.outputs["Color"]
    if rim_color is not None:
        layer_weight = nodes.new("ShaderNodeLayerWeight")
        layer_weight.inputs["Blend"].default_value = 0.38
        rim_ramp = nodes.new("ShaderNodeValToRGB")
        rim_ramp.color_ramp.elements[0].position = 0.08
        rim_ramp.color_ramp.elements[0].color = rim_color
        rim_ramp.color_ramp.elements[1].position = 0.72
        rim_ramp.color_ramp.elements[1].color = (0.0, 0.0, 0.0, 1.0)
        links.new(layer_weight.outputs["Facing"], rim_ramp.inputs["Fac"])
        rim_mix = nodes.new("ShaderNodeMixRGB")
        rim_mix.blend_type = "ADD"
        rim_mix.inputs[0].default_value = 1.0
        links.new(surface_color_output, rim_mix.inputs[1])
        links.new(rim_ramp.outputs["Color"], rim_mix.inputs[2])
        surface_color_output = rim_mix.outputs["Color"]

    detail = nodes.new("ShaderNodeTexNoise")
    detail.noise_dimensions = "3D"
    detail.inputs["Scale"].default_value = detail_scale
    detail.inputs["Detail"].default_value = 10.0
    detail.inputs["Roughness"].default_value = 0.8
    links.new(texture.outputs["Generated"], detail.inputs["Vector"])

    bump_mix = nodes.new("ShaderNodeMixRGB")
    bump_mix.blend_type = "MULTIPLY"
    bump_mix.inputs[0].default_value = 0.34
    links.new(detail.outputs["Fac"], bump_mix.inputs[1])
    links.new(voronoi.outputs["Distance"], bump_mix.inputs[2])
    bump = nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = bump_strength
    bump.inputs["Distance"].default_value = 0.11
    links.new(bump_mix.outputs["Color"], bump.inputs["Height"])

    metallic_multiply = nodes.new("ShaderNodeMath")
    metallic_multiply.operation = "MULTIPLY"
    metallic_multiply.inputs[1].default_value = max(0.0, seam_metallic - metallic)
    links.new(seam_factor, metallic_multiply.inputs[0])
    metallic_add = nodes.new("ShaderNodeMath")
    metallic_add.operation = "ADD"
    metallic_add.inputs[1].default_value = metallic
    links.new(metallic_multiply.outputs[0], metallic_add.inputs[0])

    links.new(surface_color_output, bsdf.inputs["Base Color"])
    links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    links.new(metallic_add.outputs[0], bsdf.inputs["Metallic"])
    roughness_range = nodes.new("ShaderNodeMapRange")
    roughness_range.inputs["From Min"].default_value = 0.0
    roughness_range.inputs["From Max"].default_value = 1.0
    roughness_range.inputs["To Min"].default_value = max(0.08, roughness - 0.12)
    roughness_range.inputs["To Max"].default_value = min(0.96, roughness + 0.17)
    links.new(macro.outputs["Fac"], roughness_range.inputs["Value"])
    links.new(roughness_range.outputs["Result"], bsdf.inputs["Roughness"])
    _set_input(bsdf, ("Transmission Weight", "Transmission"), transmission)
    _set_input(bsdf, ("IOR",), 1.48)
    if transmission > 0:
        _set_input(bsdf, ("Coat Weight", "Coat"), 0.22)
        _set_input(bsdf, ("Coat Roughness",), 0.18)
    if emission_strength > 0:
        _set_input(bsdf, ("Emission Color", "Emission"), seam_color)
        emission = nodes.new("ShaderNodeMath")
        emission.operation = "MULTIPLY"
        emission.inputs[1].default_value = emission_strength
        links.new(seam_factor, emission.inputs[0])
        links.new(emission.outputs[0], bsdf.inputs["Emission Strength"])
    links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])
    return material


def build_core_materials() -> dict[str, bpy.types.Material]:
    return {
        "core_obsidian": _planet_material(
            "core_obsidian",
            (0.001, 0.0013, 0.0017, 1.0),
            (0.028, 0.033, 0.04, 1.0),
            (0.18, 0.155, 0.125, 1.0),
            macro_scale=3.4,
            detail_scale=68.0,
            crack_scale=2.05,
            roughness=0.52,
            metallic=0.07,
            seam_metallic=0.98,
            emission_strength=0.025,
            bump_strength=0.17,
            seam_inner=0.0015,
            seam_outer=0.009,
            branch_strength=0.5,
        ),
        "core_matte_metal": _placeholder("core_matte_metal", (0.018, 0.022, 0.026, 1.0)),
        "core_liquid_mask": _placeholder("core_liquid_mask", (0.09, 0.08, 0.07, 1.0)),
        "core_crystal": _placeholder("core_crystal", (0.025, 0.03, 0.035, 1.0)),
        "core_emissive_mask": _placeholder("core_emissive_mask", (0.035, 0.022, 0.012, 1.0)),
    }


def build_body_materials(body_id: str) -> dict[str, bpy.types.Material]:
    if body_id == "spring":
        return {
            "spring_shell": _planet_material(
                "spring_shell",
                (0.012, 0.025, 0.019, 1.0),
                (0.17, 0.25, 0.19, 1.0),
                (0.012, 0.018, 0.016, 1.0),
                macro_scale=3.2,
                detail_scale=31.0,
                crack_scale=4.2,
                roughness=0.32,
                metallic=0.02,
                seam_metallic=0.14,
                transmission=0.3,
                bump_strength=0.34,
            ),
            "spring_interior": _placeholder("spring_interior", (0.015, 0.024, 0.02, 1.0)),
            "spring_growth_mask": _placeholder("spring_growth_mask", (0.16, 0.25, 0.18, 1.0)),
        }
    if body_id == "summer":
        return {
            "summer_metal": _planet_material(
                "summer_metal",
                (0.002, 0.0018, 0.0015, 1.0),
                (0.045, 0.032, 0.022, 1.0),
                (0.15, 0.025, 0.003, 1.0),
                macro_scale=3.5,
                detail_scale=39.0,
                crack_scale=3.6,
                roughness=0.54,
                metallic=0.68,
                seam_metallic=0.92,
                emission_strength=0.52,
                bump_strength=0.38,
                seam_inner=0.003,
                seam_outer=0.016,
            ),
            "summer_heat_mask": _placeholder("summer_heat_mask", (0.22, 0.028, 0.003, 1.0)),
        }
    if body_id == "autumn":
        return {
            "autumn_mineral": _planet_material(
                "autumn_mineral",
                (0.004, 0.003, 0.0025, 1.0),
                (0.12, 0.042, 0.016, 1.0),
                (0.008, 0.006, 0.005, 1.0),
                macro_scale=2.8,
                detail_scale=36.0,
                crack_scale=3.0,
                roughness=0.8,
                metallic=0.12,
                seam_metallic=0.42,
                bump_strength=0.42,
            ),
            "autumn_oxidation_mask": _placeholder("autumn_oxidation_mask", (0.19, 0.065, 0.025, 1.0)),
        }
    if body_id == "winter":
        return {
            "winter_ice": _planet_material(
                "winter_ice",
                (0.045, 0.062, 0.072, 1.0),
                (0.34, 0.42, 0.46, 1.0),
                (0.001, 0.002, 0.003, 1.0),
                macro_scale=3.4,
                detail_scale=34.0,
                crack_scale=3.8,
                roughness=0.4,
                metallic=0.02,
                seam_metallic=0.08,
                transmission=0.12,
                bump_strength=0.3,
            ),
            "winter_fissure": _placeholder("winter_fissure", (0.001, 0.002, 0.003, 1.0)),
        }
    if body_id == "studio":
        return {
            "studio_absorber": _planet_material(
                "studio_absorber",
                (0.00001, 0.000015, 0.000025, 1.0),
                (0.00012, 0.00018, 0.00028, 1.0),
                (0.0015, 0.002, 0.003, 1.0),
                macro_scale=2.6,
                detail_scale=28.0,
                crack_scale=4.4,
                roughness=0.88,
                metallic=0.04,
                seam_metallic=0.55,
                bump_strength=0.18,
                rim_color=(0.008, 0.012, 0.018, 1.0),
            ),
            "studio_rim_mask": _placeholder("studio_rim_mask", (0.025, 0.032, 0.042, 1.0)),
        }
    raise ValueError(f"Unsupported homepage body material set: {body_id}")


def _assign(obj: bpy.types.Object, materials: list[bpy.types.Material]) -> None:
    obj.data.materials.clear()
    for material in materials:
        obj.data.materials.append(material)


def assign_source_materials() -> None:
    core = build_core_materials()
    core_surface = bpy.data.collections["SOURCE_CORE"].objects["core_surface_geo"]
    _assign(core_surface, list(core.values()))

    for body_id in ("spring", "summer", "autumn", "winter", "studio"):
        materials = build_body_materials(body_id)
        surface = bpy.data.collections[f"SOURCE_{body_id.upper()}"].objects[f"{body_id}_surface_geo"]
        _assign(surface, list(materials.values()))


def configure_bake_targets(body_id: str, resolution: int) -> dict[str, bpy.types.Image]:
    return {
        role: bpy.data.images.new(f"{body_id}_{role}", width=resolution, height=resolution, alpha=False)
        for role in ("base_color", "normal", "orm", "emissive_mask", "effect_mask")
    }
