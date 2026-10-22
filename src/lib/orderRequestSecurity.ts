/**
 * Browser-origin allowlist for the public order endpoint.
 *
 * This is a CSRF/cross-site browser safeguard, not authentication or
 * bot protection: non-browser clients can forge an Origin header.
 */
const LIVE_ORIGINS = [
  "https://www.nikoboost.online",
  "https://nikoboost.online",
] as const;

export function isAllowedOrderOrigin(
  origin: string | null,
  siteUrl: string | undefined,
  isProduction: boolean
): boolean {
  if (!origin) return false;

  const allowed = new Set<string>(LIVE_ORIGINS);

  if (!isProduction) {
    allowed.add("http://localhost:3000");
    allowed.add("http://127.0.0.1:3000");
  }

  if (siteUrl) {
    // Invalid deployment configuration must not silently disable checks.
    const configured = new URL(siteUrl);

    if (
      !["https:", "http:"].includes(configured.protocol) ||
      configured.username ||
      configured.password
    ) {
      throw new Error("Invalid SITE_URL configuration");
    }

    allowed.add(configured.origin);
  }

  return allowed.has(origin);
}
