# Tactics Lab review build

Preview entry: `/tactics`. Eight Midnight Season 2 dungeons and 28 encounters, including paired bosses as one encounter. The original `/tactics/ruby-life-pools` Chillstorm study remains available.

Each boss has one four-step key-mechanic study, a practice decision with retry feedback, three role hints, additional encounter reminders and a linked guide. Search matches dungeon, boss and mechanic; the dungeon selector narrows the catalog. Scenes cover position and action decisions, including cover, interrupts, target swaps, add priority, healing, beams and gateways.

## Editing and season rollover

- `src/data/tactics-catalog.ts` owns the roster, boss IDs, mechanics, reminders, role hints, guide review dates and scene types. Add or edit encounters here. The catalog, static routes and encounter navigation derive from that file.
- `src/data/tactics.ts` owns the pinned reviewed season and original Chillstorm lesson. Update the season only after reviewing the entire catalog. A mismatch with the store season labels lessons archived.
- `CatalogArena.tsx` renders authored teaching schematics. Boss-specific geometry overrides are necessary when an encounter does not fit a shared scene type.
- `TacticsPreview.tsx` owns playback, role switching and practice. Role switching changes advice; the marked actor in the study stays fixed.
- Existing Sora/Rajdhani typography and site colors are reused.

The SVGs are original teaching diagrams, not dungeon maps or a combat simulator. Distances, radii, marker counts for adds and playback timing are illustrative. One study plus reminders is not an exhaustive ability database. No timers, damage predictions, player tracking or persistent progress are claimed.

## Sources

Rotation: https://worldofwarcraft.blizzard.com/en-us/news/24294369/

Mechanics: Method guides by Tactyks, reviewed for this build on 25 October 2026. Each encounter links its dungeon guide. Guide update dates are stored per dungeon: Altar of Fangs 22 August; Murder Row, Voidscar Arena, Kings’ Rest and Temple of Sethraliss 18 August; Den of Nalorakk, The Blinding Vale and Ruby Life Pools 14 October 2026.

- https://www.method.gg/guides/dungeons/altar-of-fangs
- https://www.method.gg/guides/dungeons/murder-row
- https://www.method.gg/guides/dungeons/den-of-nalorakk
- https://www.method.gg/guides/dungeons/the-blinding-vale
- https://www.method.gg/guides/dungeons/voidscar-arena
- https://www.method.gg/guides/dungeons/kings-rest
- https://www.method.gg/guides/dungeons/temple-of-sethraliss
- https://www.method.gg/guides/dungeons/ruby-life-pools

This remains a draft review feature: noindex/nofollow, absent from the production navbar and sitemap. Review the design before merging or opening it to search engines.

## Chillstorm clarity revision

The original entry `/tactics/ruby-life-pools` and Melidrussa encounter route now use `ChillstormStudy.tsx`: four manually selected scenes, labeled actors, a correct/mistake comparison and free-position practice. `src/data/chillstorm-study.ts` owns the storyboard copy. The other 27 encounters retain their existing format pending design feedback. Practice uses illustrative distance checks, not actual game measurements, and supports pointer, touch and arrow keys plus Enter. Multiple separated positions are accepted. No automatic playback or reaction timer is used.
