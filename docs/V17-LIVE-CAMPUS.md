> Graphics renderer superseded by [V18 low-poly 3D](V18-LOW-POLY.md). Saved-state gameplay remains in use.

# Live campus correction

The prior default screen was a finished illustration with eleven preset room labels. Building, admitting or hiring mostly changed HUD numbers and pins; the drawing did not represent the saved centre. That was a functional and visual mismatch, not evidence of a completed game.

The default map now renders the actual saved buildings on an isometric parcel. Building art comes from the original release's existing transparent PNGs. The previous full-centre illustration remains only in the reference assets. Unbuilt hospitals, villas and rooms are no longer presented as operational facilities on the main map.

## Connected behavior

- Each saved building gets a projected position, visible structure and clickable label. Details show its real bed capacity, allocated occupants and upkeep. Construction adds a structure; existing saved positions are preserved.
- Residents are derived from the saved count and allocated to actual bed capacity. Admission adds a person; discharge removes one. A scene reload reconstructs the same allocation without maintaining a second economy or resident count.
- Hired staff are represented by role. Up to twelve RN use the active animation scene; additional RN and other staff use static role sprites. Staff counts are not fabricated by the illustration.
- RN routes and fountain placement come from built facilities. A care command opened from a selected ward targets a visible resident assigned to that ward. Therapy and activity use the actual corresponding facility entrance. Hiring/admission effects appear at the newly added character.
- Care controls quote the engine's actual availability. Locked actions are disabled with the reason displayed; V4 offers a direct V5 upgrade route rather than seven apparently usable care buttons.
- A six-step guide exercises hiring, construction, admission, V5 progression, care and the first daily settlement. Its checks are derived from current state, with no reward money or second progress store. The workforce menu is labelled Team, because individual shift scheduling does not exist.

## Core corrections

The default site's engine is now maintained in `healthcare-core.js`. The build replaces the archived inline engine with this synchronous script before the archived UI runs. The release ZIP itself is unchanged; legacy standalone pages inside it remain historical.

Two confirmed logic faults and one placement problem are corrected:

1. Hiring checked the full monthly wage even though it charged and displayed only the quarter-wage recruiting fee. The check and debit now agree, including the exact affordability boundary.
2. Care, therapy and activity could charge the player when there were zero residents. They now reject the action without a debit.
3. Construction could choose a footprint adjacent to an existing building and overlap its art. New construction keeps the required spacing; existing saves are never repositioned automatically.

Schema 1, the original guest/user save keys, cloud adapter and existing economic formulas are retained. Generated script/style URLs include content hashes to avoid combining cached files from different revisions.

## Scope still missing

This corrects the scene-to-state mismatch and the initial play loop. It is not a complete healthcare simulation. Resident names, independent needs or medical records, per-person clinical outcomes, shift assignments, full pathfinding, furniture editing and production-quality character rigs are not implemented. Care remains a centre-level validated action with a targeted visual response, not a persisted clinical job that waits for the nurse animation to finish. The separate 3D viewers remain optional previews. Authenticated cross-device Cloud Save is not covered by these local tests.

## Validation

```sh
python3 tools/prepare-v11.py
# Serve site/ using the README command.
node --test tests/core.test.cjs
python3 tests/smoke-campus.py
python3 tests/smoke-v14.py
python3 tests/smoke-animation.py
python3 tests/smoke-phases.py
```

Eight Node tests cover exact hiring fees for all roles, the management-to-income loop, vacant construction footprints and rejecting care without residents. The campus browser suite verifies that only saved facilities appear, people match actual occupancy, the six-step first-day flow can be completed through visible controls, reload preserves the scene, care targets a resident of the selected ward, the quoted hiring fee is sufficient and discharge removes a person. The existing game, animation and phase suites remain passing. Screenshots are written to `/tmp/cmnh-campus-tests`.
