# Search and mobile audit — 24 October 2026

## Verified production state

Fetched all four canonical pages directly over HTTPS after PR #6 was merged. All returned HTTP 200, one H1, one correct self-canonical, `index, follow`, a unique service-specific title/description and crawlable links to all four destinations.

| Page | Title | HTML bytes before this change |
| --- | --- | ---: |
| `/` | WoW Mythic+ Boost for Gold — EU & NA | 66,762 |
| `/delves` | WoW Delves Boost for Gold — Midnight Season 2 | 47,807 |
| `/mythic-plus-rewards` | Mythic+ Rewards Calculator & Great Vault Planner | 33,882 |
| `/gold-prices` | WoW Boost Prices in Gold — Mythic+ & Delves | 42,738 |

These are HTML sizes, not total transferred page weight or speed scores. The existing desktop/mobile SEO tests verify actual JSON-LD scripts, canonical values and headings without JavaScript. The raw HTML also contains React serialization, so counting the string `application/ld+json` is not a valid script-count check.

The public search retrieval tool returned NikoBoost's older homepage heading “MYTHIC+ ADVENTURE” and older titles for Delves/Rewards, while live HTML already has the new versions. This indicates a stale result in that retrieval system, not proof of Google's current indexed version or last crawl. Only the owner's Search Console indexed-page report can confirm those details. No Search Console account access was available to this audit.

## Search intent sample

Queries sampled in two search engines: “mythic plus boost for gold EU”, “mythic plus boost for gold EU NA self-play”, “delves boost gold NA”, “delves boost for gold”, and the domain itself. These are qualitative samples, not Google rank tracking from an EU/NA location or search-volume research.

- Boost4Gold's Mythic+ page directly addresses gold, self-play, setup, included service, prerequisites and scheduling. Its Delves page explains the distinction between completion and opening a Bountiful Coffer. Those are meaningful buyer questions; NikoBoost already covers configuration and payment, and the Delves FAQ covers Coffer Keys.
- Other returned services (LevelUpper, WowVendor, GetBoost) use real-money offers and multiple play modes. Their customer claims, safety assurances, season numbers and game data were not copied or treated as authoritative.
- Keep `/` for the self-play Mythic+ service, `/delves` for Delves, `/gold-prices` for tariff comparison and `/mythic-plus-rewards` for the free planning tool. Do not add repetitive EU/NA or per-key landing pages without distinct value. NikoBoost currently uses the same prices in both regions.
- No evidence justifies another wholesale title rewrite or a new batch of generic articles today. Preserve the new clear copy while gathering query-level Search Console data.

## Concrete loading issue and fix

The original hero always rendered an autoplay MP4 source, even when CSS hid the video at widths up to 650px or for reduced-motion preferences. The roughly 2.2 MB decorative resource could therefore be requested despite being invisible. Its poster was also a CSS background, discovered later than an HTML image.

This change:

- Renders a responsive Next Image immediately, with `sizes="100vw"`, eager loading and high fetch priority. It is the same existing artwork with the same responsive crop, including without JavaScript.
- Attaches no video source in server HTML. Desktop animation is attached after page load in an idle task, only above 650px, with normal motion and no browser data-saving preference.
- Removes the source and pauses playback when the viewport, motion or data-saving setting no longer permits it. Media failure leaves the image visible.
- Keeps titles, prices, forms, account privacy and the desktop cinematic design intact.

This is a resource-loading improvement, not a measured Core Web Vitals improvement. The public PageSpeed Insights API returned HTTP 429 (shared daily quota exceeded), and local Chromium installation returned corrupt archives. No Lighthouse score, LCP/INP/CLS number or Google ranking improvement is claimed. GitHub Actions browser tests verify resource-request behavior and booking regressions.

## Follow-up evidence to collect

1. After deployment, compare mobile resource waterfalls: MP4 requests should be zero; desktop should attach media after load. The automated tests enforce this behavior with reduced motion and save-data cases as well.
2. Use Search Console's indexed version and last crawl to verify adoption of the published titles. Repeated indexing requests are unnecessary.
3. Record weekly non-brand impressions, page/query combinations and clicks. Compare longer periods once sufficient observations exist; seven impressions cannot support a keyword strategy or a ranking deadline.
4. Run PageSpeed mobile when quota is available and use field Core Web Vitals when there is enough real traffic. Avoid interpreting a single lab run as production-user performance.

## Sources

- Next Image documentation bundled with the installed Next.js version (`node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md`).
- https://web.dev/learn/performance/video-performance
- https://developers.google.com/search/docs/appearance/page-experience
- https://developers.google.com/search/docs/appearance/core-web-vitals
- https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Competitor observations only: https://boost4gold.com/mythic-plus-boost-for-gold ; https://boost4gold.com/wow-delves-boost-gold ; https://levelupper.com/wow/delves/delves-boost ; https://wowvendor.com/shop/wow/product/delve-unlock-boost/
