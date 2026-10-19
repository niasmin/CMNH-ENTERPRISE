# Animation system

The existing 2D isometric map now uses a presentation-only animation scene. No game economy, medical outcome, save schema or engine unlock is changed.

## Controls

- Press Play to animate the patrol, fountain ripples/droplets and floating leaves. Pausing freezes the ambient scene and patrol; time continues to be governed by the existing game clock.
- At 4x, nurses use the running poses and move faster. At 1x/2x they use walking poses. They stop briefly at route waypoints.
- Successful care, therapy and group-activity commands queue a visual task for an available nurse: approach with running poses, use an equipment/care pose with a heart indicator, then return to the prior patrol position. These are illustrative visual responses to the already completed game command, not autonomous care or patient assignments. A queued task plays after closing the management panel, even if game time is paused.
- Successful construction, hiring, admissions, chapter upgrades and end-of-day settlements create transient feedback. Rejected commands create no effects. Effects are limited to 24 concurrent entries.
- Settings provides Full, Reduced and Off modes. The preference is saved in optional `settings.animationMode` through HealthcareBridge. The operating system's Reduce Motion takes priority over Full. All modes preserve financial time controls and player progress.
- The Settings care demo costs nothing and changes no simulation state.

## Runtime

`v16-animation.js` owns nurse presentation states, frame selection, effect lifetimes and drawing. `v14-world.js` handles canvas scheduling and map controls. Rendering is capped at 30 FPS on wider viewports and 24 FPS when mounted on a narrow viewport. Rendering stops when idle, when hidden, or when the legacy view is active. Management dialogs suspend the scene. Visibility restoration resets frame timing to avoid replaying time spent in the background.

The nurse reference still has only the sampled illustrative poses, including a single visible north-facing pose. Movement uses the existing reference atlas and subtle body motion; this is not a full skeletal rig or newly produced animation art. Static people and buildings painted into the map remain part of the illustration. The fountain and leaves are small canvas overlays.

The animation scene and its task queue are not serialized. On reload, actors restart their patrol with the saved RN count and selected motion mode. Presentation state cannot advance time, hire, build or alter money by itself.

## Validation

After building and serving the site, run:

```sh
python3 tests/smoke-animation.py
python3 tests/smoke-v14.py
python3 tests/smoke-phases.py
```

The animation suite checks actual canvas pixel changes, walking/running/care transitions, pause and idle scheduling, no side effects on saved simulation state, mode persistence, OS Reduce Motion, accepted/rejected construction effects, inactive/resumed rendering and mobile settings. It uses disposable browser storage and does not send emails or write cloud saves.
