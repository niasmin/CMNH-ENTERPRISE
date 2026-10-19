# Seven-phase visual development journey

The four latest reference images extend the V14 game with a seven-stage visual roadmap. Open it from the map's journey badge, Missions, or Management. Players can browse future stages, inspect the actual requirements, and advance the existing game with upgrade, build and hire buttons. Merely viewing a stage does not unlock it, charge money or grant rewards.

The image's phase numbers are visual milestones; the engine's V4–V10 chapters keep their existing economic unlocks. In particular, Villa is still V8. The page uses the core's own `perform` function to quote and validate the next action; no price, reputation threshold or balance is replaced.

| Phase | Visual milestone | Existing game requirements |
| --- | --- | --- |
| 1 | First Care Home | V4 and at least 1 ward |
| 2 | Professional Nursing Center | V5, at least 2 wards and 3 RN |
| 3 | Tranquila Senior Living | V8 and at least 1 villa |
| 4 | Home Care & Daycare | V7 and at least 1 Home Care centre |
| 5 | Healthcare Workforce | V8 and at least 12 staff |
| 6 | Neuro Hospital | V9 and at least 1 hospital |
| 7 | Healthcare Empire | V10, headquarters, ward, villa, Home Care centre and hospital |

The journey badge reports the last consecutively completed milestone, while the counter includes all individually completed milestones. These are derived views of current game state, not a new save field. Upgrades, buildings, personnel, cash and existing optional decorations persist through the same HealthcareBridge. No save migration or reset is performed.

PHC artwork is the visual target for the workforce milestone; no new PHC building, training simulation, MRI treatment, Daycare simulation, warehouse or medical procedure is introduced. These remain reference visuals where the engine has no corresponding mechanic. The main map remains the V14 illustrative scene; choosing a phase changes its roadmap preview, not main-world construction geometry.

## Images

The latest asset-pack image is byte-identical to the existing pack, verified by SHA-256, so it is reused. Three new reference JPEGs are retained without modification:

- `phases-overview.jpg`
- `phases-detail.jpg`
- `phases-atlas.jpg`

The atlas now has 68 entries: the original 41 plus 7 phase illustrations, 9 room views and 11 garden, vehicle and equipment regions. All reference hashes are in `assets/v14/manifest.json`. The gallery filters by category and exports the selected region to PNG. Reference crops retain their original backgrounds and are not standalone transparent production models. No canonical game-dev package or independent license receipt is claimed.

## Files and validation

`v15-phases.js` owns the derived roadmap model and presentation. `v15-phases.css` adapts it for wide and mobile screens. V14 links to the roadmap and adds asset filtering. The existing site builder and Pages workflow include the new files.

Build and serve with the commands in the README, then run:

```sh
python3 tests/smoke-phases.py
python3 tests/smoke-v14.py
```

The roadmap suite uses a disposable browser context. It verifies all seven previews, browsing without mutations, genuine upgrades/hiring, preservation of the original reputation lock, persistence after reload, earned progression to all seven milestones through core actions, mobile layout, category filtering and PNG download. Screenshots are written to `/tmp/cmnh-phase-tests`. It does not send login emails, write Supabase data, deploy GitHub Pages or claim validation on real mobile hardware.
