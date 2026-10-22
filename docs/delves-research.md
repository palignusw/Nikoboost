# Delves service — research and launch tariffs

Checked: 23 October 2026. Content: Midnight Season 2, patch 12.1.5.

## Content sources

- [Blizzard: original Midnight Delves](https://news.blizzard.com/en-gb/article/24244644/unleash-your-skills-in-midnight-s-new-delves): ten original regular locations, actual zone placement, and the previous Nemesis at Torment’s Rise.
- [Blizzard: Curse of Ula’tek](https://news.blizzard.com/en-gb/article/24294370/curse-of-ulatek-now-live-journey-to-the-coiled-isle): The Ring of Glory and Gnarldor Isle join the regular pool; Venomfall Deeps is a separate Season 2 Nemesis encounter. Total: twelve regular locations.
- [Blizzard: 12.1.5 notes](https://news.blizzard.com/en-us/article/24304162/12-1-5-content-update-notes): Labyrinth of Kindo’jan is a separate larger adventure. Tier 11 Bountiful Delves participate in the unlocked Ascendant Venomstone system.
- [Icy Veins current guide](https://www.icy-veins.com/wow/delves-guide): standard seasonal reward references, Tier 8 gearing breakpoint and World Vault thresholds of 2/4/8. Do not confuse those thresholds with Mythic+ 1/4/8. Its Tier 4 Vault cell disagrees with the gold seller below, so the UI deliberately says “Verify in-game” for that cell. No unsupported numeric promise is made.

The page lists all twelve current regular locations. Specialist sections cover Venomfall Deeps / Azta’rec and the new Labyrinth. Torment’s Rise / Nullaeus is identified as the previous-season target. We do not advertise its old solo rewards as current Season 2 products. Daily Bountiful availability is not connected to a live feed and must be confirmed in-game; no fabricated live badges or timers.

## Price evidence and decision

- [Boost4Gold](https://boost4gold.com/wow-delves-boost-gold) exposes a starting listing of **110K gold**, plus a US region adjustment. Its publicly retrieved page does not establish the selected Tier/run-count configuration behind that starting figure. It therefore cannot support a per-tier market average.
- [Skycoach](https://skycoach.gg/wow-boost/products/wow-delves-boost-4570) exposes real-money option prices; the retrieved page shows differing localised currency variants. These are not gold quotes and were **not** converted into gold.
- [Timesaver](https://timesaver.gg/products/wow-midnight-bountiful-delves) also sells real-money tier options. Useful as evidence of tier-based product structure, not as a gold exchange-rate source.

Public evidence is too thin for a defensible current gold market average. NikoBoost uses explicit **house tariffs**: tiers 1–3 25K; 4 30K; 5 35K; 6 40K; 7 45K; 8 50K; 9 65K; 10 85K; 11 110K gold per run. These are a product pricing decision, informed by the sparse public listing and positioned below the existing 72K +10 Mythic+ rate for a Tier 8 run. They are not claimed to be competitors’ prices or a market median. EU/NA are equal, consistent with the existing MVP pricing policy.

Specific regular Delve: +5%. Four to seven runs: 5% off; eight to twenty: 10% off. Apply the discount after the specific-location surcharge and round once to whole gold. Bountiful adds no service surcharge: the buyer supplies the keys. Nemesis and Labyrinth enquiries have **no fixed numeric price**, because scope and self-play feasibility must be established. Do not sell a grouped clear as a solo-only achievement.

All tariffs and calculations live in `src/data/delves.ts` and are recalculated on the server. They can be adjusted centrally before a future production launch. No real orders were used for testing.

## Operations

Normal reservations and specialist enquiries use `/api/order`, retaining its origin allowlist, bounded JSON reader, honeypot, common IP rate limit and validated customer schedule. Delves have separate normalised duplicate-delivery records and server-confirmed prices. State remains in memory, consistent with the existing MVP; distributed workers/restarts do not share these records. Availability, customer eligibility, scope and in-game payment are confirmed by the team before service. No new database or paid service is introduced.
