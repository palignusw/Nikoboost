# Booking analytics

Existing Vercel Analytics continues recording page views. Vercel custom events require Pro/Enterprise. The optional Umami Cloud integration provides booking events without requiring a separate backend. As checked on 28 October 2026, Umami Hobby includes one website and 100,000 monthly events at no cost; review current pricing before enabling: https://umami.is/pricing.

## Enable on production

1. Create a free Umami Cloud account at https://cloud.umami.is and add the production website.
2. Copy the **Website ID** from its tracking code (the UUID in `data-website-id`). This is a public identifier, not a password or API key.
3. In Vercel → NikoBoost → Settings → Environment Variables, add `NEXT_PUBLIC_UMAMI_WEBSITE_ID` for **Production**, then redeploy.
4. Open the production site, make a setup choice and open the reservation form. Check Umami's Events view. No order submission is required to verify the first two events.

Missing/invalid ID means no Umami script or external event collection. Preview/development deployments are disabled. The collector also restricts the hostname to the canonical site domain (and `www`). Browser Do Not Track/Global Privacy Control preferences skip event collection. Ad blockers can suppress analytics; they must not affect booking.

## Events

| Name | Meaning |
| --- | --- |
| `booking_setup_started` | First setup choice or explicit draft resume per mounted configurator; opening default Delves settings also counts. |
| `booking_form_opened` | A valid configurator opens its booking dialog. Reopening counts as another opening. |
| `booking_sent` | The browser receives and validates a successful order confirmation. |
| `booking_send_failed` | A submission attempt fails or its confirmation is invalid. Client-side required fields/schedule errors and PDF errors do not count. |

Every event has only `service: mythic` or `service: delves`. Manual transport payloads contain a fixed route, title, canonical hostname, website ID, event name and service; no live URL/search/hash/referrer, form values, order IDs, schedule, prices or error messages are passed. No identify API, replay, automatic pageviews or automatic click tracking is enabled. Like any hosted analytics, network requests expose technical connection metadata to the provider; this is not a promise of zero technical data processing.

These are interaction counts, not a billing ledger or proof of delivery. A timeout does not prove an order was undelivered. Use Discord confirmations for actual orders. No events are backfilled before activation, and blocked clients will be missing. Review counts by service to compare starts → forms → confirmed requests; openings and retries can repeat.

Sources: https://vercel.com/docs/analytics/custom-events · https://docs.umami.is/docs/tracker-functions · https://docs.umami.is/docs/tracker-configuration
