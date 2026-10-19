# Healthcare Empire V13 — Isometric Tycoon

## Architecture
- **Simulation / source of truth:** V11 inline `window.HealthcareCore` (`create`, `perform`, `metrics`, `capacity`, `validate`). No new game currency or duplicated economy.
- **Player state:** V11 `window.HealthcareBridge` (`getState`, `loadState`, `setIdentity`); V13 actions call `G.perform(B.getState(), command)`, then `B.loadState(result.state)` only on success.
- **Cloud Save:** Unchanged `v11-supabase-save.js` (Supabase Auth + RLS-protected `game_saves`, slot `main`). No schema migration; existing saves stay schema 1.
- **3D World:** `campus/index.html`, `campus/campus-3d.js`, procedural Three.js buildings and NPCs. It reads built buildings from the parent Bridge on iframe initialization.
- **Room exploration:** `v12-rooms-integration.js` and `rooms/*.html`, optional immersive scenes, not yet linked to individual room-level economy.
- **UI:** `v13-tycoon.js` and `v13-tycoon.css` render mobile-first HUD and management panels; V12 UI remains loaded for reversible fallback.
- **Deployment:** `tools/prepare-v11.py` assembles the site; `.github/workflows/deploy-v11.yml` deploys GitHub Pages.

## Core gameplay loop (V13 initial vertical slice)
Build facility → hire qualified staff → admit residents → perform care activities → advance time → review daily revenue/expense → reinvest. Gameplay actions are validated by V11 engine, including affordability, unlock level, beds and workforce.

## Known limitations
- Procedural low-poly graphics are not final character art.
- 3D building positions are predefined; no drag-to-place, road/pathfinding or per-room furniture editing yet.
- The 3D campus iframe refreshes after constructing buildings. Other actions do not alter building geometry.
- No automatic offline earnings or save migration added in this phase.
- Supabase Cloud Save remains a manual save/load flow; no claim of verified end-to-end deployment.
- **Do not reset player saves or replace `game_saves` while developing V14.**

## Next milestones
1. Validate GitHub Pages, mobile WebGL and cloud sign-in/save/load in a real browser.
2. Add grid-based placement with persistent positions in a backward-compatible optional metadata field.
3. Make 3D NPC tasks correspond to actual staff and resident simulation, with performance budgets.
4. Add room-level tycoon upgrades and staff shifts, followed by quests and tutorial.
