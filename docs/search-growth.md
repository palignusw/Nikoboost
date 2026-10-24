# Search growth — 24 October 2026

## What the available evidence says

Search Console screenshot: 7 impressions and 3 clicks over the selected 28-day period; query table empty. An aggregate position of 4.4 cannot be assigned to “mythic boost”. The homepage is indexed. No keyword-volume or difficulty data is available, so the following targets are hypotheses, not measured low-competition opportunities.

A qualitative search sample for Mythic+ gold/self-play and Delves gold returned Slash2, Boosting-Ground, WowCarry, CoinLooting and WowVendor. The commercial pages explain booking, options and payment, often with dollar prices or piloted options. NikoBoost can explain its actual gold-only/self-play offering more clearly without inventing claims about speed, safety, team experience or customer reviews.

## Implemented

- `/gold-prices`: one useful comparison page for both services, rather than near-duplicate pages for every key, Tier or region.
- Server-rendered single/four/eight-run gold totals from the existing tariff and discount configuration. Delves uses its actual booking-price helper; Mythic+ uses the API's base-minus-rounded-discount calculation for the stated base setup.
- Explicit inclusion/exclusion notes, role/AFK/destination surcharges, specialist quote handling, booking FAQ and relevant calculator links.
- Crawlable links from navigation, homepage, Rewards and Delves; canonical/social metadata, breadcrumb schema and sitemap entry.
- Shared editorial settings in `src/data/season.ts`. No fake ratings, fake reviews, made-up gold currency schema or copied competitor descriptions.

## Candidate intents and destination pages

| Intent (not measured search volume) | Destination |
| --- | --- |
| Mythic+ boost for gold / self-play runs | `/` |
| Delves boost for gold / Bountiful runs | `/delves` |
| Mythic+ rewards calculator / Vault planning | `/mythic-plus-rewards` |
| Mythic+ gold prices / Delves gold prices / bundle comparison | `/gold-prices` |

## Next measurement

After the owner merges and production is ready, check the four URLs in Search Console. A request to recrawl the new page is reasonable; repeated requests are not a ranking strategy. Record impressions, clicks, non-brand queries and the page receiving each query weekly. A week is a checkpoint, not a ranking deadline. Compare longer periods once enough data exists. Do not infer growth from seven impressions.

Next useful external inputs: real team profiles/experience with permission, real run evidence, honest customer feedback when available, relevant community/creator mentions. No public outreach, paid ads, link purchases, profiles or messages were submitted by this change. External promotion requires a concrete channel and authorization, and must follow that channel's rules.

## Reference material

- Google SEO Starter Guide: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Google Search Essentials: https://developers.google.com/search/docs/essentials
- Helpful content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- URL Inspection: https://support.google.com/webmasters/answer/9012289
- Competitor sample (observations only, not authoritative game rules): https://slash2.io/faq ; https://boosting-ground.com/wow-boosting/boosting/mythic-dungeons ; https://wowcarry.com/wow/dungeons/mythic-keys ; https://coinlooting.com/wow/dungeon-boosting/mythic-boost/ ; https://wowvendor.com/shop/wow/product/delve-unlock-boost/
