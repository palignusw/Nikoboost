# Den of Nalorakk field guide

Routes: `/tactics/den-of-nalorakk` and `/tactics/den-of-nalorakk/{hoardmonger,sentinel-of-winter,nalorakk}`. Preview-only robots policy remains noindex/nofollow. Existing catalog links now reach the dedicated guide; other dungeons and Altar are unchanged.

## Modules

- `src/data/den-guide.ts`: names, editable cue scripts, role actions, reaction cards, practice questions, source links and documented limits.
- `src/data/den-playback.ts`: deterministic movement, mechanics and correct/missed states. Distances are diagram units, not game yards.
- `DenGuide.tsx`, `DenArena.tsx`, `den.module.scss`: isolated UI and drawing under the dungeon directory.
- `components/useScenePlayback.ts`: reusable manual scene clock, pause/replay/speed/seek, visibility pause and cleanup. No autoplay.

## Source review — 26 October 2026

Tactyks' Method guide, updated 14 Oct, and Petko's Icy Veins guide, updated 12 Oct, were cross-checked with the indexed encounter journal and spell descriptions. Official cumulative hotfixes through 23 Oct were checked; the Echoing Maul location bug was fixed on that date. PTR links in the older journal are identified as such; no PTR-only cast countdowns were added. No frame-by-frame video verification or combat-log measurement is claimed.

- https://www.method.gg/guides/dungeons/den-of-nalorakk
- https://www.icy-veins.com/wow/den-of-nalorakk-dungeon-guide
- https://www.wowhead.com/guide/midnight/den-of-nalorakk-dungeon-overview-location-rewards
- https://www.wowhead.com/npc=244584/rotten-mushroom
- https://www.wowhead.com/spell=1263590/rimeshatter
- https://www.wowhead.com/spell=1242860/echoing-maul
- https://www.icy-veins.com/wow/news/stop-wiping-to-sentinel-of-winter-in-den-of-nalorakk/
- https://news.blizzard.com/en-gb/article/24307310/hotfixes-october-23-2026

## Mechanics and explicit scope

Hoardmonger: resources trigger at 90/70/40% health and Mythic+ upgrades accumulate. The suggested meat/bones/mushroom order is a group choice. One highlighted mushroom teaches contact within its 12-second growth window; no fixed total mushroom count is asserted. Contact destroys the mushroom and applies poison. A missed example bursts at its deadline and poisons the party. Frontal avoidance and upgraded Bellow are also illustrated; movement and damage timing are authored.

Sentinel: bait area represents grouped squalls, not an exact count or trajectory. Two Frostspike impacts are dodged before the adds spawn. The selected optional coordinated plan kills A, controls B through the storm, then kills B. Each add death starts a sourced 6-second Rimeshatter delay; the collector stays until impact, not merely until they enter the circle. The missed first shard roots players for 4 seconds before the example recovery. The dead boss-add snowdrift inside the eye prevents forced movement while storm healing remains necessary. It is not an instruction to stand in dangerous snow at the arena edges. Shroud interruption and Glacial Torment dispels are covered in the guide.

Nalorakk: a 4-second Maul window places one early wave of three echoes at separated positions on the same side. Tank orientation keeps the shield side away from existing echoes. The group shelters behind Zul'jarra through Onslaught; after knockback the tank covers Forceful Slam, others remain outside. The Fury example forms an interception wall; drawn echoes follow straight lanes toward Zul'jarra and stop at correctly placed interceptors. In the missed version one reaches her. Three drawn echoes are not a cap on later cycles, and intercepted echoes are not automatically erased from the fight.

## Verification

Targeted ESLint, TypeScript and the pure Den model contract test ran locally. Browser checks cover the three routes, roles, pause/speed/replay/background pause, manual chapters, correct/missed consequences, practice decisions, source cards and 320/393/1440 widths. CI artifacts use `tactics-den-*` names for mobile/desktop review. The generic catalog interaction test excludes Den because dedicated interaction coverage replaces its old renderer; the roster/route test still covers every Den boss.
