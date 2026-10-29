import { parseMidnightContent, type NoteSection } from "./wowUpdateContent";
import { wowUpdatesConfig as config } from "@/data/wow-updates-config";

export type WowUpdate = {
  id: number; title: string; url: string; kind: "patch" | "hotfix";
  publishedAt: string; updatedAt: string; scope: "midnight"; sections: NoteSection[]; contentMode: "notes" | "summary";
};
export type UpdatesSnapshot = { checkedAt: string; items: WowUpdate[] };
export type UpdatesFeed = UpdatesSnapshot & { mode: "cached" | "saved" | "checking" };
const record = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);
const validDate = (value: unknown): value is string =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value));

/** Read Blizzard's embedded JSON as data. Never execute remote scripts or render raw HTML. */
export function parseBlizzardUpdates(html: string): WowUpdate[] {
  if (new TextEncoder().encode(html).byteLength > config.maxResponseBytes) throw new Error("Source too large");
  const script = html.match(/<script\b(?=[^>]*\bid=["']model["'])[^>]*>([\s\S]*?)<\/script\s*>/i)?.[1];
  if (!script) throw new Error("Source format unavailable");
  const body = script.trim().replace(/^(?:(?:var|let|const)\s+)?model\s*=\s*/, "").replace(/;\s*$/, "");
  const data: unknown = JSON.parse(body);
  if (!record(data) || !Array.isArray(data.blogs)) throw new Error("Invalid source data");
  const items = new Map<number, WowUpdate>();
  for (const entry of data.blogs) {
    if (!record(entry) || entry.status !== "live" || entry.draft === true || entry.pending === true ||
        entry.community !== "wow-web" || typeof entry.id !== "number" || !Number.isSafeInteger(entry.id) || entry.id < 1 ||
        typeof entry.title !== "string" || !entry.title.trim() || entry.title.length > 200 || /[<>]/.test(entry.title) ||
        typeof entry.url !== "string" || !validDate(entry.published) || !validDate(entry.updated)) continue;
    const title = entry.title.trim();
    // A shared title is insufficient: require Midnight in the actual source content.
    const kind = /^hotfixes\s*:/i.test(title) ? "hotfix" : /(?:content update|pre-expansion.*|patch) notes$/i.test(title) ? "patch" : null;
    if (!kind || /classic|anniversary|season of discovery|forever|\bptr\b|\bbeta\b/i.test(title)) continue;
    if (typeof entry.content !== "string" || !/\bMidnight\b/i.test(`${title} ${entry.content}`) ||
        Date.parse(entry.published) < Date.parse(config.midnightStart)) continue;
    const versions = Array.isArray(entry.keywords) ? entry.keywords.filter((word): word is string => typeof word === "string" && /^\d+\.\d+(?:\.\d+)?$/.test(word)) : [];
    if (!versions.length || versions.some((version) => !version.startsWith(`${config.patchMajor}.`))) continue;
    const sections = parseMidnightContent(entry.content, kind);
    if (!sections.length) continue;
    const match = entry.url.match(/^\/(?:en-us\/)?news\/(\d+)\/([a-z0-9-]+)\/?$/i);
    if (!match || Number(match[1]) !== entry.id) continue;
    const item: WowUpdate = {
      id: entry.id, title, kind, publishedAt: entry.published, updatedAt: entry.updated,
      url: `${config.sourceOrigin}/en-us/news/${entry.id}/${match[2]}`,
      scope: "midnight", sections, contentMode: "notes",
    };
    const previous = items.get(item.id);
    if (!previous || Date.parse(previous.updatedAt) < Date.parse(item.updatedAt)) items.set(item.id, item);
  }
  const result = [...items.values()].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)).slice(0, config.maxItems);
  if (!result.length) throw new Error("No verified update entries");
  return result;
}

export async function fetchWowUpdates(fetcher: typeof fetch = fetch): Promise<UpdatesSnapshot> {
  const response = await fetcher(config.sourceUrl, {
    cache: "no-store", redirect: "error", signal: AbortSignal.timeout(config.timeoutMs),
    headers: { Accept: "text/html", "User-Agent": "NikoBoost-Updates/1.0" },
  });
  if (!response.ok || !response.headers.get("content-type")?.toLowerCase().includes("text/html")) throw new Error("Source unavailable");
  if (Number(response.headers.get("content-length")) > config.maxResponseBytes || !response.body) throw new Error("Invalid source response");
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > config.maxResponseBytes) { await reader.cancel(); throw new Error("Source too large"); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  const items = parseBlizzardUpdates(new TextDecoder().decode(bytes));
  return { checkedAt: new Date().toISOString(), items };
}

export async function resolveUpdates(load: () => Promise<UpdatesSnapshot>, saved: UpdatesSnapshot): Promise<UpdatesFeed> {
  try { return { ...await load(), mode: "cached" }; }
  catch { return { ...saved, mode: "saved" }; }
}

export function updateDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}
export function updateSummary(item: WowUpdate) {
  return item.kind === "hotfix"
    ? "Midnight balance changes and gameplay fixes. Read the changes here, grouped by date and topic."
    : "Midnight content and system changes. Read the changes here before planning your next session.";
}
