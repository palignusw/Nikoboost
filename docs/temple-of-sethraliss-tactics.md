# Temple of Sethraliss tactics review

Reviewed 2026-10-27 for Midnight Season 2 Mythic+ using [Tactyks / Method](https://www.method.gg/guides/dungeons/temple-of-sethraliss), [Petko / Icy Veins](https://www.icy-veins.com/wow/temple-of-sethraliss-dungeon-guide) and [Blizzard's hotfixes](https://news.blizzard.com/en-us/article/24296142/hotfixes-october-6-2026).

All scenes are examples, not measured combat timelines. Positions, directions, speeds and the order between illustrated examples are not a complete pull. No numeric cast timer is shown.

- Adderis and Aspix: Aspix starts immune; the shield switches at a boss's 40% health. Gale Force is followed by the Thunder and Lightning group soak.
- Merektha: group the two Knot of Snakes targets for area control. At full energy three Toxic Vipers and a Storm Serpent spawn while the boss burrows.
- Galvazzt: three spires must be intercepted. Method suggests non-tank soakers, while Icy Veins recommends using the tank; the guide therefore asks groups to agree on assignments and rotate defensives instead of prescribing one role.
- Avatar: defeat the Essence Defiler to enable healing. The Guardian death creates three soaks; Blizzard increased the soak window to six seconds. Heal the Avatar and control the healer-fixating Tormentors. The displayed scene has no exact countdown.

Maintenance: copy and mechanic descriptions live in `src/data/temple-guide.ts`, the scene state in `src/data/temple-playback.ts`, and the artwork in `src/app/tactics/temple-of-sethraliss/TempleArena.tsx`. Publication is controlled by `src/data/published-tactics.ts`. No video frame measurements or combat-log timing are claimed.
