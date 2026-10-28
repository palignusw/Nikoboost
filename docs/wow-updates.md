# Official WoW updates

`/wow-updates` indexes Blizzard's official content-update page. The homepage shows the first three entries. Cards contain validated headlines, source publication/update dates and original links; summaries are short NikoBoost-written descriptions of each category. Full Blizzard articles and images are not copied. No AI service or paid API is used.

## Refresh and failure behaviour

- Successful snapshots are held in Next.js's persistent Data Cache (`unstable_cache`), revalidated about hourly on requests. This deliberately uses the Data Cache rather than process-local memory. It remains supported alongside Cache Components; see the Next.js migration guide. No cron or new deployment is needed for content refreshes.
- Background failures throw inside the cache callback so a failed or malformed response does not replace the last successful cache entry. A later request retries. This is not a promise of updates exactly on the hour or a live push feed.
- On a cold cache when Blizzard is unavailable, a checked-in, verified snapshot is shown with an explicit saved-list notice. The date remains the original verification date; it is never replaced with a fake recent timestamp. Slow requests time out after eight seconds.
- Suspense initially shows the verified saved list with a checking notice, rather than inserting an empty news block into the homepage later. Filters are disabled only while this initial check is pending.
- Publication date controls ordering. Existing posts may be edited, so meaningful source-update times are displayed separately. All displayed dates/times are UTC.

## Source safety

The source is a fixed public Blizzard URL. Its embedded `model` assignment is parsed as JSON, never evaluated as JavaScript. Entries must be live WoW articles with valid dates and matching numeric IDs. Only official relative news paths are accepted and canonical outbound URLs are reconstructed on Blizzard's fixed origin. HTML responses are bounded to 2 MB, remote article content is discarded, and React renders text normally. No remote HTML is injected.

Hotfix articles often cover multiple WoW editions, so cards explicitly say Retail & Classic. Classic/Forever/PTR/beta-specific article titles and promotional content are excluded; regular patch notes come from the curated content-update index. This is an unofficial index, not an assertion that every listed fix applies to Retail or that every patch note has been reviewed by NikoBoost. Guides, prices and season configuration are not changed by this feed.

## Maintenance

- Source URL, polling interval, timeout, byte limit and item count: `src/data/wow-updates-config.ts`.
- Parser/schema checks: `src/lib/wowUpdates.ts`. This integration uses public page data, not a documented Blizzard news API, so future page-format changes can require a parser update. A failure falls back visibly.
- Cache adapter: `src/lib/wowUpdates.server.ts`. Bump its cache key version if the stored schema changes.
- Emergency verified list: `src/data/wow-updates-snapshot.json`. Refresh it only from a successfully validated source, preserving the actual verification timestamp. It is a safety net, not the normal update mechanism.
- Shared UI, category summaries and styles: `src/components/WowUpdates/`.

After deployment check the status on `/wow-updates`: a saved-list warning means a live source check did not succeed, not that an automatic refresh succeeded. Investigate HTTP access/parser changes if the verification date remains old. Do not remove the warning just to make the page appear current.

The sitemap includes only the index page; source articles remain external. The feed does not create duplicate per-article SEO pages.

Sources: https://worldofwarcraft.blizzard.com/en-us/content-update-notes · local Next.js docs for `unstable_cache`, Cache Components migration and ISR error handling.
