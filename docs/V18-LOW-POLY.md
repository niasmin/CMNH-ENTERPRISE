# V18 — Warm low-poly 3D

The default game now renders newly authored procedural 3D geometry: ten facility types, nine room views, staff and resident rigs, furniture, equipment, vehicles and landscaping. The 76 catalogue entries are views and variants of these shared models, not 76 independent asset packages. Thumbnails and transparent PNG exports use the same geometry as the game. HUD icons are newly authored SVG.

Drag to orbit, scroll or pinch to zoom, and select a building to inspect or focus it. Nurses animate articulated limbs and follow the existing care-task state. Facility occupancy and physical bed slots follow saved game data: ward 6, villa 4, branch 5 and hospital 8. Therapy couches do not count as residential beds.

The economy, save keys and cloud-save adapter remain in place. Historical raster references remain in the repository but are not requested by the default renderer. This changes graphics and presentation; it does not introduce a new clinical simulation.

## Build and verification

```sh
python3 tools/prepare-v11.py
python3 -m http.server 8000 --bind 127.0.0.1 --directory site
python3 tests/smoke-graphics.py
python3 tests/smoke-campus.py
python3 tests/smoke-animation.py
python3 tests/smoke-phases.py
python3 tests/smoke-v14.py
```

Browser tests use Chromium SwiftShader for headless WebGL. They verify actual geometry, capacity, save preservation, limb motion, camera changes, room rendering and the absence of legacy image requests. They do not establish frame rates on real phones. WebGL is required; mobile hardware still needs device testing.

Three.js 0.160.1 is vendored locally under MIT. Its npm integrity and file hash are recorded in `assets/v18/vendor/provenance.json`; its license is alongside the runtime. New source hashes are recorded in `assets/v18/source-hashes.json`. No paid generation jobs or external model packages were used. PNG exports are previews, not GLB or canonical asset packages.
