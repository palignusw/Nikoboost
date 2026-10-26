# Murder Row field guide

Dedicated modules under `src/app/tactics/murder-row`, editable scripts in `src/data/murder-guide.ts`, deterministic geometry in `src/data/murder-playback.ts`. The shared scene clock is reused; Altar and Den implementations are unchanged. Publication uses `published-tactics.ts`.

Reviewed 26 October 2026 against Tactyks/Method, Petko/Icy Veins, the indexed encounter journal, live Axe Toss spell and Blizzard corrections. Source URLs are kept in `murderSources` and linked in the UI. No combat-log or video-frame measurements are claimed.

Important decisions:

- Zaen cover follows the October 13 assignment fix and October 16 close safe-zone indicator. Every player has a separate cover. Being behind a barrel at arbitrary distance is deliberately shown as a failure. Used barrels become a danger after the shot.
- Lithiel's non-tank Fingers example follows the official update to four preferred non-tank targets. Imp glyphs are representative clusters, not a spawn-count claim. The older PTR spell page still has outdated summon counts; those are not used. The tank kites the unkillable Infernal separately from killable summons.
- The only numeric effect countdowns are the live 5-second Axe Toss mark and the journal's 20-second Destabilized effect. Other cue durations, damage, movement, barrel/portal positions and radii are schematic. A displayed chapter clock is explicitly not a pull timer.
- Health progress, add kills and successful stops are authored outcomes, not a simulation of player damage. The correct/missed comparison isolates one error per boss.

Verification covers separate close-cover geometry, one marked axe player, four non-tank Fingers markers, a safe gate exit behind the ring, persistent Infernal, correct/missed add states, role advice, chapters, pause/speed/reset/replay, practice and 320/393/1440 widths. CI screenshots are named `tactics-murder-*` for mobile/desktop review.
