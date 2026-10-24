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
  isProduction: boolean,
  vercelEnv?: string,
  vercelUrl?: string,
  vercelBranchUrl?: string
): boolean {
  if (!origin) return false;

  const allowed = new Set<string>(LIVE_ORIGINS);

  if (!isProduction) {
    allowed.add("http://localhost:3000");
    allowed.add("http://127.0.0.1:3000");
  }

  // A preview has both an immutable deployment URL and a stable Git-branch
  // alias. Accept only the exact hosts supplied by Vercel, never a wildcard
  // or an address derived from request/forwarded headers.
  if (vercelEnv === "preview") {
    for (const value of [vercelUrl, vercelBranchUrl]) {
      const host = value?.trim().toLowerCase();
      if (host && /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.vercel\.app$/.test(host)) {
        allowed.add(`https://${host}`);
      }
    }
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
