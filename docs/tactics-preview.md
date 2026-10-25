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

## Altar of Fangs field guide

`/tactics/altar-of-fangs` opens the three-boss guide. Each boss route uses the same authored field-guide layout with a separate scene renderer for bone piles, tethers or four beam sources. The remaining dungeons keep their existing format.

`src/data/altar-study.ts` owns the short lesson copy, steps, comparison cues and practice choices. Encounter names, role reminders and extra notes still derive from `tactics-catalog.ts`; season identity comes from `tactics.ts`. `AltarScene.tsx` owns original, boss-specific SVG geometry. The geometry deliberately has no text nodes: explanatory labels live in HTML outside the arena. Letter markers connect the practice choices to the scene.

Mobile layouts put the current command above the picture and decision feedback directly below it. Step changes return the narrow viewport to the scene; reduced-motion preferences are respected. Boss changes use real links and reset lesson state. All decisions also have native keyboard-operable response buttons. Role reminders are separate from the illustrated role, so they do not silently change the scene assignment.

The guide is a source-linked key-mechanic teaching aid, not a complete encounter reference. Its stone floor, silhouettes, motion paths and soak locations/count in the Rav’i example are illustrative. The Coil example deliberately shows five adds; the Zul’jan example has four beams. Do not infer exact distances or timers from the art.

Source: Tactyks’ Method Altar of Fangs guide, updated 22 August 2026; reviewed 25 October 2026. The draft is noindex/nofollow and remains outside the public navbar/sitemap.

## Execution research revision — 25 October 2026

The Altar lessons now teach preparation and execution windows, rather than only positioning. The three frames remain manual, but trigger labels explain when the action belongs. Practice tests team decisions (damage availability, add-phase control and venom clearing), not a letter destination.

Sources actually consulted:

- Tactyks / Method, updated 22 August: empty pile, shield burst, three consecutive interrupts, rapid tether breaks, damage/control during Uncoil and the Boneslicer clear.
- Petko / Icy Veins, updated 12 October: add fixates and remaining-health significance, reform hazards, venom expiry/physical clears and blood pools, healing windows.
- Skandar Tank's own published +21–23 route (`vviWp8V` on Keystone.guru): explicit four-lane assignment and edge/Boneslicer clearing; it also includes a route-specific funnel-into-boss note. Public route HTML contains the author's descriptions/comments even where the text-only renderer hides the map. Only corroborated boss advice was adapted; unrelated route counts/pull combinations were not copied wholesale.
- Method's public YoDa Blood DK +20 recording (`z0hO75zq1Vc`): title and description verified from the public watch-page player metadata. Video playback/frames and captions were not successfully retrieved. It is linked as a comparison recording, not cited as observed execution, and no timestamps or player-specific decisions were invented.

The group-call cards are our composition-dependent adaptation of those mechanics, not quotations or claims that every professional group follows identical assignments. No fixed cooldown schedule, blanket instruction to hold all damage, exact timer, guaranteed key level, or recommendation to improvise physical hits is asserted.

Zul'jan's diagram now includes the previously missing venom loop: beams → planned edge Boneslicer → blood-pool exit and stack check. The cone is illustrative. The first Coil frame is interrupt preparation, the second is tether breaking, and the third is the Uncoil damage window. The five adds have player fixates; the guide does not assume a tank can simply collect them with taunts.

## Encounter playback — 25 October 2026

Altar opens in playback mode. Study steps/practice remain available through keyboard-operable view tabs. `src/data/altar-playback.ts` owns cue order, sourced spell durations, authored movement/outcomes, actor statuses, target selection and the pure seekable world state. `LiveEncounter.tsx` owns play/pause, reset/replay, chapter seeking, speed and the scene slider. `LiveArena.tsx` draws the world using the existing silhouettes; it combines overlapping P2–P5 into a clearly labelled four-player stack during the example shared clear. Playback begins paused, stops at the end, pauses on tab visibility loss and cancels its animation frame on unmount.

Numeric cast/channel countdowns are limited to sourced values: Ravenous Stomp 3s (spell 1307894), Toxic Atrophy 4s (1310358), Ritual of the Fang 5s (Blizzard’s 21 August hotfix), its beam channel 8s (1300876 tooltip), and Boneslicer 5s (1301413). Spell data/links are available beside the active cue. These are reviewed source values, not live game telemetry or guaranteed values under every future modifier/hotfix. The cast wrapper marked Instant is not incorrectly used as the Ritual preparation window.

Official hotfix: https://us.forums.blizzard.com/en/wow/t/altar-of-fangs-adjustments-august-21/2339724 . It also removed Feeding Frenzy’s faster Messy Eater/Carrion Burst frequency; no increased-frequency timer is taught.

Every gap, projectile travel time, movement path, interrupt placement inside a cast and damage-dependent shield outcome is authored teaching time, explicitly separated from sourced seconds. Death Rattle ends after all attached links break; the shield ends after damage breaks it. Neither gets a fabricated reaction deadline. Uncoil is compressed for clarity. There is no asserted full boss rotation or precise pull timer.

Boneslicer is illustrated as a path to the selected player, not a broad cone. The example holds the shared edge line through the projectile hit, then exits blood. Its travel time, path width and shared stack are schematic/group-specific. Venom becomes a stack-check instruction after the hit; the UI never automatically promises that one hit has removed all stacks. Party IDs remain stable; a diamond identifies cast targets/fixates, and soak assignments are not presented as real player debuffs.

Tests cover pure timeline contracts, source-window/countdown boundaries, conditional endings, end/replay and pause behavior, playback speed, actor movement, seeking, keyboard tabs, responsive frames and the retained study/practice flow. Screenshots are captured from paused, deterministically seeked states.
