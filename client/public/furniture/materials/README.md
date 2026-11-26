# Room materials and decor

These assets are used in the interactive furniture planner. The sources below are released under CC0 by Poly Haven or ambientCG.

| Local file | Original | Changes |
| --- | --- | --- |
| `oak-planks-diff.jpg`, `oak-planks-normal.jpg` | [Oak Wood Planks](https://polyhaven.com/a/oak_wood_planks), Dimitrios Savva | Original 1K texture maps; repeated and tinted in the scene. |
| `hessian-diff.jpg`, `hessian-normal.jpg` | [Hessian 230](https://polyhaven.com/a/hessian_230) | Original 1K texture maps, retained from an earlier version. |
| `carpet-color.jpg`, `carpet-normal.jpg` | [Carpet 016](https://ambientcg.com/view?id=Carpet016), [ambientCG CC0](https://ambientcg.com/faq) | Maps distributed with [Casa Ocaso](https://github.com/Leonxlnx/casa-ocaso) as CC0; resized to 1024 px and recompressed for the planner. |
| `linen-color.jpg`, `linen-normal.jpg` | [Rough Linen](https://polyhaven.com/a/rough_linen), [Poly Haven CC0](https://polyhaven.com/license) | Maps distributed with Casa Ocaso as CC0; resized to 1024 px and recompressed. The color map was converted to grayscale and tinted in the scene. |
| `painted-plaster.jpg` | [Painted Plaster Wall](https://polyhaven.com/a/painted_plaster_wall), Amal Kumar | Original 1K diffuse map, used as a subtle bump map on the walls. |
| `modern-wooden-cabinet.glb` | [Modern Wooden Cabinet](https://polyhaven.com/a/modern_wooden_cabinet), Patrik Pangerl | The 1K glTF was rotated, centred, grounded, and repackaged as GLB with embedded textures. |
| `ceramic-vase.glb` | [Ceramic Vase 01](https://polyhaven.com/a/ceramic_vase_01), James Ray Cock | The 1K glTF was centred, grounded, and repackaged as GLB with embedded textures. |
| `lebombo_1k.hdr` | [Lebombo](https://polyhaven.com/a/lebombo) | Original 1K HDR environment. |
| `potted-plant/` | [Potted Plant 02](https://polyhaven.com/a/potted_plant_02) | Original 1K glTF and texture files; scaled in the scene. |
| `wood-floor-diff.jpg`, `wood-floor-normal.jpg` | [Wood Floor](https://polyhaven.com/a/wood_floor) | Original 1K texture maps, repeated and tinted in the scene. |
| `laminate-floor-diff.jpg`, `laminate-floor-normal.jpg` | [Laminate Floor 02](https://polyhaven.com/a/laminate_floor_02), Charlotte Baglioni and Dario Barresi | Original 1K maps, tiled to the published 1.7 m × 1.7 m scale in the plan and interior. |
| `ceiling-pendant/` | [Modern Ceiling Lamp 01](https://polyhaven.com/a/modern_ceiling_lamp_01), James Ray Cock | Original 1K glTF and texture files; scaled as a decorative fixed ceiling pendant. Only requested in the interior view. |
| `pissarro-landscape.jpg` | [Landscape](https://www.metmuseum.org/art/collection/search/339645), Camille Pissarro, The Metropolitan Museum of Art | Original publicly available museum image, marked public domain by The Met; placed in a simple 3D frame as decorative context. Only requested in the interior view. |

The cabinet, vase and plant are decorative context, not products for sale. The cabinet and vase are hidden when their floor footprint overlaps an editable product or the room is too small. The product models use separate source and licensing records.

The picture is placed only on a free section of wall after openings, curtains, the shelf and tall products are considered; the left wall is a fallback. A directional shadow map is only refreshed when the room or products change. An optional variance shadow map is enabled only when the browser reports at least 4 GB of device memory and supports the required float render target; other devices use PCF shadows. These heuristics are not a substitute for testing performance on physical phones.

## Authored bookshelf module

`baked-bookshelf.glb` and `baked-bookshelf.webp` are a procedural bookshelf and books created for this project, exported with meshopt compression. Their baked colour and lighting include modified [Oak Veneer 03](https://polyhaven.com/a/oak_veneer_03) texture and [Meadow HDRI](https://polyhaven.com/a/meadow) lighting from Poly Haven ([CC0](https://polyhaven.com/license)); the texture was baked and converted to a 1024 px WebP. The source scene and bake script are retained in the accompanying work directory. The shelf is decorative and is hidden on collisions and in plan view.
