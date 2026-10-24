# Tactics Lab design preview

Route: `/tactics/ruby-life-pools`. This is a reviewable prototype for one positioning mechanic, not a complete boss guide or a published Academy. It is intentionally absent from navigation and sitemap, and has `noindex, nofollow` metadata.

## Scope

Melidrussa Chillworn's Chillstorm: recognize the target, separate from teammates, avoid the storm/pull, and recover after danger ends. The example always marks one DPS. Changing the selected role changes advice, not the target assignment.

- Four selectable steps with play, pause and restart.
- Native HTML controls for mouse, touch and keyboard.
- A practice decision with incorrect-answer feedback, retry and a correct destination.
- The SVG is an authored schematic, not a game map. Its distances, storm radius and 2.6-second teaching steps are illustrative. This is not a reflex benchmark or simulated game damage.
- The source is linked on the page; no profile, character or Battle.net access is requested.

## Editing

`src/data/tactics.ts` holds the mechanic copy, source, reviewed date, role notes and practice destinations. `seasonId` is pinned to the reviewed season: when the main season changes, an old lesson is labelled archived rather than silently claiming to be current. Review every mechanic before updating it.

`TacticsPreview.tsx` holds the arena and interaction. `tactics.module.scss` uses the existing Sora/Rajdhani fonts and site palette. Warm gold marks the target, muted red indicates danger, blue marks party/controls. Text labels and numbered HTML choices supplement color.

No persistent progress, full dungeon simulation, arbitrary movement, exact boss timers or external game integration is included in this design trial. Expand only after design feedback and further mechanic verification.

## Reference

- Blizzard encounter identity: https://worldofwarcraft.blizzard.com/en-us/news/23874316/dragonflight-esplora-le-terre-selvagge-delle-sponde-del-risveglio
- Guide author Tactyks, Method, updated 14 October 2026: https://www.method.gg/guides/dungeons/ruby-life-pools

The trial intentionally avoids health thresholds and unrelated abilities because older and current guide versions differ. Positions are original teaching choices, not an asserted mandatory route.
