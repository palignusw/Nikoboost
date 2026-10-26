# The Blinding Vale field guide

Four isolated encounter scripts (`src/data/vale-guide.ts`), deterministic geometry (`vale-playback.ts`) and their own UI/arena/styles under `src/app/tactics/the-blinding-vale`. Existing published guides are not changed. Publication is controlled by `published-tactics.ts`.

Reviewed 27 October 2026 against Tactyks/Method (14 Oct), Petko/Icy Veins (12 Oct), the encounter journal, Raider.IO's original role guide, current spell variants and official October hotfixes. Links are recorded in `valeSources`. No video-frame or combat-log timing measurement is claimed.

Important checks:

- Trinity: three loam patches are avoided during the dash, then occupied inside their flower circles during the beam. Standing on the line at arbitrary distance is shown as a failure. Use current live effect 1235574 (8 seconds), not older cast variant 1235564 with stale 10-second text. After the channel, scorched ground remains dangerous.
- Ikuzz: the 4-second post-Stomp delay starts after impact. New roots immobilize the group until destroyed or broken. The Gaze example keeps the player out of roots while the boss clears them; its 10-second duration is journal-sourced. Positioning, knockback distance and time to destroy roots are illustrative.
- Ruia: health gates are 70% Bear and 40% Haranir, not elapsed-time phase predictions. Three Lightfire markers and three Pulverizing lanes are drawn. Marked targets separate and hold lanes rather than attempting to dodge their own tracked cones. The 6-second Strikes effect is separate from its cast. Grievous Thrash affects the group and is removed at full health; the model demonstrates topping all five players.
- Ziekket: representative lashers become Dormant, then are liquefied by a correctly aimed beam; ordinary damage does not remove their bodies. A missed beam leaves bodies to reawaken. The beam target still takes damage. Orb collectors intercept before the boss, share stacks and stay out of the resulting Lightsap. Spawn counts, puddle radii, damage and movement are schematic. Updated Regrowth tuning is not turned into a stale numerical damage prediction.

Local/model and browser coverage checks flower coverage, frozen root positions, safe pursuit, non-overlapping versus overlapping tracked lanes, full-heal bleed removal, collinear body/beam geometry, shared orb collection outside puddles, playback controls, practice and 320/393/1440 layouts. CI screenshot names are `tactics-vale-*`.
