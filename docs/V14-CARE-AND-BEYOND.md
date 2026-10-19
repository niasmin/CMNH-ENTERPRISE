# V14 — Care & Beyond

The default Pages build now opens a 2D isometric care home inspired by the four user-provided references. V11 HealthcareCore and HealthcareBridge remain the only owners of the economy and player saves. Existing schema-1 saves are preserved; no database migration or reset is involved.

## Run

From the repository root:

```sh
python3 tools/prepare-v11.py
python3 -m http.server 8000 --bind 127.0.0.1 --directory site
```

Build output is generated in `site/`, not committed. The root `index.html` is an older starter; use the generated site. GitHub Actions assembles the same site and includes V14 files and assets. No deployment has been performed by this change.

## Play

- Build facilities, hire staff, admit residents and run care activities using the existing engine's prices, unlocks and validation. Advance the centre version from the build panel to unlock more facilities.
- Money, occupancy, wellbeing, reputation and time come from the player's actual saved state.
- Tap room labels for reference previews, care actions and existing optional 3D room viewers.
- Drag or use two fingers to pan/zoom; mouse wheel and zoom buttons also work. Map view resets independently of game state.
- Time starts paused. Play advances one game hour every ten seconds at 1x. The speed button cycles 1x/2x/4x; step advances one hour. Income and costs settle at midnight. Time does not advance while a management dialog is open or the page is hidden.
- Nurses use reference poses to follow an illustrative patrol route when time plays. RN count controls the number drawn, capped at 12. A care command briefly changes the pose. Their route does not model individual patient tasks. System Reduce Motion stops their movement.
- Decorations are free visual props. Select one, then tap the map to place; use Cancel or Escape to stop. Up to 30 props are saved under optional `settings.decorations`; removing the latest prop leaves all buildings and economy untouched.
- Management includes local saving, the original Supabase panel, an asset gallery, and a reversible return to V13.
- Modal controls support keyboard focus, Escape and focus return. Mobile labels remain on the map as the player pans.

## Asset files and provenance

`assets/v14/references/` retains the supplied JPEGs byte for byte. `manifest.json` records their SHA-256 hashes, 68 image regions (including the later seven-phase extension), and nurse direction/action coordinates. User references include character roles, buildings, room art, equipment, decorations and a nurse sheet. No independently verified third-party redistribution license is asserted.

`campus-map.png` was created with image_gen by removing UI and inpainting scenery in the supplied map reference. Its hash and origin are recorded in the manifest. It is a static illustrative background: visible rooms do not represent current construction progress. Small labelled pins reflect actual built facilities. Buildings do not change the background geometry.

The gallery renders atlas regions and lets users download them as PNG. These exports retain their original matte and are not a finished transparent asset pack. The nurse renderer samples one or two visible poses per direction (eight directions; idle/walk/run/use) and removes edge-connected pale backgrounds at runtime. North has a single visible pose. The supplied sheet is an illustration, not the 320 actual frames or separated editable rig described in its captions. No complete rig, skeletal animation JSON or per-frame production art is claimed.

No paid provider jobs were used. `game-dev` is unavailable in this environment, so no canonical package verification, licensing gate or vendoring receipt is claimed.

## Implementation

- `v14-assets.js`: manifest loading, reference region rendering, export and nurse preview.
- `v14-world.js`: bounded pan/zoom, touch controls, sprite patrol and reduced motion.
- `v14-care-empire.js` / `.css`: HUD, accessible management dialogs and game commands.
- `tools/prepare-v11.py`: includes V14 and copies its assets alongside V11 output.
- V12's legacy body-child filter exempts V14. The hidden V13 iframe is unloaded until requested to avoid continuing its 3D scene in the background.
- The HUD checks bridge state each second so cloud loads and identity switches also appear. No extra economy or separate save store is introduced.

## Validation

With the server running, use the environment's Python Playwright and Chromium:

```sh
python3 tests/smoke-v14.py
```

A fresh temporary browser context exercises UI-driven hiring, building, admissions, state persistence across reload, zoom/reset, decoration placement, walking/pause, hour step, room dialog, Cloud panel preservation, local resource requests, desktop/mobile layouts, asset rendering and export, rejected locked actions, bridge HUD synchronization, and Reduce Motion. Screenshots go to `/tmp/cmnh-v14-tests`; override with `CMNH_TEST_ARTIFACTS`. Override the local server with `CMNH_TEST_URL`.

The test uses disposable browser storage and never sends login emails or writes Supabase saves. Authenticated cloud save/load, real iOS/Android touch hardware and the existing external WebGL room scenes still require separate validation. Do not treat a locally passing test as proof of GitHub Pages deployment.
