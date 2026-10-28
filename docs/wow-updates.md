# Midnight patch notes

`/wow-updates` is an on-site reader for World of Warcraft: Midnight patch notes and hotfix changes. The homepage cards link into the reader using `#update-ID`. The reader provides update selection, a section index and class/ability text search. Blizzard links are secondary source references, not the reading destination.

## Automatic refresh

The fixed Blizzard content-update index includes article content in its JSON model. The integration reads that data without executing scripts, converts content to plain structured text and filters other editions. Successful results use the persistent Next Data Cache, revalidated about hourly on visits. No paid AI API, database or cron is needed. This is not a real-time push service.

Cache refresh errors throw so the last successful snapshot remains available. On a cold cache failure the checked-in NikoBoost summaries appear with an explicit warning that they are not complete changelogs. They retain their actual verification timestamp. Never label a summary as full notes or invent a fresh verification date.

## Edition and rendering safety

- Require a live WoW article, valid dates, matching numeric ID, official URL, Midnight in the article/title, and a publication date on or after the configured expansion boundary.
- Exclude Classic, Anniversary, Season of Discovery, Forever, PTR and beta article titles.
- Shared hotfix articles are split by date. A Classic/other-edition heading excludes subsequent sections until the next date or an explicit Midnight heading; unknown headings never re-enable Retail. Nested other-edition subsections are also removed.
- Preserve class/specialization/ability context and date headings. Source TOCs, developer commentary, promotions, images and embedded content are excluded. Plain gameplay text is rendered through React; no remote HTML, attributes, JavaScript or outbound image requests are used.
- Reject oversized responses, invalid JSON, empty/unknown content and overly complex markup. Requests time out after eight seconds and redirects are forbidden.
- This uses public page data, not a documented Blizzard news API. Future source-format changes may require maintenance. Guides, prices and season settings are never changed automatically.

## Maintenance

- `src/data/wow-updates-config.ts`: source, expansion boundary, interval and limits.
- `src/lib/wowUpdates.ts`: validated metadata and bounded fetch.
- `src/lib/wowUpdateContent.ts`: text extraction, context and edition filtering.
- `src/lib/wowUpdates.server.ts`: persistent validated cache; increment schema key when changing data shape.
- `src/data/wow-updates-snapshot.json`: small, manually verified NikoBoost fallback summaries; contentMode must stay summary.
- `src/components/WowUpdates`: reader, search, homepage cards and styles.

Only the reader index is in the sitemap; article selection uses shareable fragment links. After deployment check the actual source-check status. Persistent saved-summary warnings need investigation, not removal.
