
import { createHash, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import {
  AFK_SURCHARGE,
  SPECIFIC_DUNGEON_SURCHARGE,
  basePrices,
  classArmor,
  classRoles,
  dungeons,
  getMaxTraders,
  getRunsDiscount,
  roleSurcharges,
  traderSurcharges,
  type Role,
} from "@/data/mythicPlus";
import type { OrderReceipt } from "@/components/MythicPlus/components/downloadOrderPdf";


const RATE_WINDOW = 10 * 60 * 1000;
const RATE_MAX = 5;
const DUPLICATE_WINDOW = 30 * 1000;
const MAX_BODY_BYTES = 12 * 1024;
const DISCORD_TIMEOUT = 10_000;

type RateRecord = {
  count: number;
  resetAt: number;
};

type DuplicateRecord = {
  expiresAt: number;
  state: "pending" | "sent";
  orderId?: string;
  total?: number;
  receipt?: OrderReceipt;
};

const rateLimits = new Map<string, RateRecord>();
const duplicates = new Map<string, DuplicateRecord>();

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { ok: false, error: message },
    { status }
  );
}

function isObject(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function cleanText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";

  return value
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .trim()
    .slice(0, max);
}

function isInteger(
  value: unknown,
  min: number,
  max: number
): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= min &&
    value <= max
  );
}

function hasOwn(
  object: object,
  key: string
): boolean {
  return Object.prototype.hasOwnProperty.call(
    object,
    key
  );
}

function getClientIp(request: Request): string {
  // x-forwarded-for must come from a trusted proxy.
  // Configure this according to your hosting provider.
  const forwarded =
    request.headers.get("x-forwarded-for");

  return (
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();

  // Periodic cleanup to avoid unbounded memory growth.
  for (const [key, value] of rateLimits) {
    if (value.resetAt <= now) {
      rateLimits.delete(key);
    }
  }

  const record = rateLimits.get(ip);

  if (!record || record.resetAt <= now) {
    rateLimits.set(ip, {
      count: 1,
      resetAt: now + RATE_WINDOW,
    });

    return true;
  }

  if (record.count >= RATE_MAX) {
    return false;
  }

  record.count++;
  return true;
}

function cleanDuplicateCache() {
  const now = Date.now();

  for (const [key, value] of duplicates) {
    if (value.expiresAt <= now) {
      duplicates.delete(key);
    }
  }
}

async function readJson(request: Request): Promise<unknown> {
  const declaredLength = Number(
    request.headers.get("content-length") || 0
  );

  if (declaredLength > MAX_BODY_BYTES) {
    throw new Error("BODY_TOO_LARGE");
  }

  const reader = request.body?.getReader();

  if (!reader) {
    throw new Error("INVALID_BODY");
  }

  const chunks: Uint8Array[] = [];
  let size = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      size += value.byteLength;

      if (size > MAX_BODY_BYTES) {
        throw new Error("BODY_TOO_LARGE");
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(size);
  let offset = 0;

  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return JSON.parse(new TextDecoder().decode(body));
  } catch {
    throw new Error("INVALID_BODY");
  }
}


function isValidTimezone(timezone: string): boolean {
  if (!timezone || timezone.length > 100) {
    return false;
  }

  try {
    new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
    });

    return true;
  } catch {
    return false;
  }
}

type ScheduleResult =
  | { valid: true; tbilisiTime?: string }
  | { valid: false; error: string };
function formatTimeForTbilisi(
  timestamp: number
): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Tbilisi",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(timestamp));
}


function validatePreferredTime(
  preferredTime: string
): ScheduleResult {
  const exactMatch = preferredTime.match(
    /^(\d{4}-\d{2}-\d{2}) ([01]\d|2[0-3]):([0-5]\d) \(([^()]+)\)$/
  );

  const flexibleMatch = preferredTime.match(
    /^Flexible — please contact me \(([^()]+)\)$/
  );

  // Flexible scheduling requires no fixed start time.
  if (flexibleMatch) {
    const timezone = flexibleMatch[1];

    if (!isValidTimezone(timezone)) {
      return {
        valid: false,
        error: "Invalid time zone.",
      };
    }

    return { valid: true };
  }

  if (!exactMatch) {
    return {
      valid: false,
      error: "Invalid preferred date and time.",
    };
  }

  const [
    ,
    date,
    hourString,
    minuteString,
    timezone,
  ] = exactMatch;

  if (!isValidTimezone(timezone)) {
    return {
      valid: false,
      error: "Invalid time zone.",
    };
  }

  const [year, month, day] = date
    .split("-")
    .map(Number);

  const hour = Number(hourString);
  const minute = Number(minuteString);

  // Check that the calendar date actually exists.
  const calendarDate = new Date(
    Date.UTC(year, month - 1, day)
  );

  if (
    year < 2020 ||
    year > 2100 ||
    calendarDate.getUTCFullYear() !== year ||
    calendarDate.getUTCMonth() !== month - 1 ||
    calendarDate.getUTCDate() !== day
  ) {
    return {
      valid: false,
      error: "Invalid preferred date.",
    };
  }

  const formatter = new Intl.DateTimeFormat(
    "en-GB",
    {
      timeZone: timezone,
      calendar: "gregory",
      numberingSystem: "latn",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }
  );

  function getLocalParts(timestamp: number) {
    const parts = formatter.formatToParts(
      new Date(timestamp)
    );

    const numberPart = (type: string) =>
      Number(
        parts.find((part) => part.type === type)
          ?.value
      );

    return {
      year: numberPart("year"),
      month: numberPart("month"),
      day: numberPart("day"),
      hour: numberPart("hour"),
      minute: numberPart("minute"),
    };
  }

  const requestedWallTime = Date.UTC(
    year,
    month - 1,
    day,
    hour,
    minute
  );

  // Collect the possible UTC offsets around
  // the requested date, including DST transitions.
  const offsets = new Set<number>();

  for (
    let hours = -36;
    hours <= 36;
    hours += 6
  ) {
    const sample =
      requestedWallTime +
      hours * 60 * 60 * 1000;

    const local = getLocalParts(sample);

    const displayedAsUTC = Date.UTC(
      local.year,
      local.month - 1,
      local.day,
      local.hour,
      local.minute
    );

    offsets.add(
      Math.round(
        (displayedAsUTC - sample) / 60_000
      )
    );
  }

  const matchingInstants = new Set<number>();

  for (const offset of offsets) {
    const timestamp =
      requestedWallTime - offset * 60_000;

    const local = getLocalParts(timestamp);

    if (
      local.year === year &&
      local.month === month &&
      local.day === day &&
      local.hour === hour &&
      local.minute === minute
    ) {
      matchingInstants.add(timestamp);
    }
  }

  if (matchingInstants.size === 0) {
    return {
      valid: false,
      error:
        "This time does not exist in the selected " +
        "time zone. Please choose another time.",
    };
  }

  if (matchingInstants.size > 1) {
    return {
      valid: false,
      error:
        "This time occurs twice because of a clock " +
        "change. Please choose another time.",
    };
  }

  const timestamp = [...matchingInstants][0];

  if (timestamp <= Date.now()) {
    return {
      valid: false,
      error:
        "The selected date and time have already " +
        "passed in your chosen time zone.",
    };
  }

  return {
    valid: true,
    tbilisiTime: formatTimeForTbilisi(timestamp),
  };
}


function formatRole(role: Role) {
  if (role === "dps") return "DPS";

  return role.charAt(0).toUpperCase() + role.slice(1);
}

export async function POST(request: Request) {
  try {
    const webhook = process.env.DISCORD_WEBHOOK_URL;

    if (!webhook) {
      console.error("Discord webhook is not configured");

      return jsonError(
        "Order service is temporarily unavailable.",
        503
      );
    }

    // Optional production origin validation.
    // Set SITE_URL to your actual public website URL.
    const siteUrl = process.env.SITE_URL;
    const origin = request.headers.get("origin");

    if (siteUrl && origin) {
      let expectedOrigin: string;

      try {
        expectedOrigin = new URL(siteUrl).origin;
      } catch {
        console.error("Invalid SITE_URL configuration");
        return jsonError("Server configuration error.", 503);
      }

      if (origin !== expectedOrigin) {
        return jsonError("Origin not allowed.", 403);
      }
    }

    const ip = getClientIp(request);

    if (!checkRateLimit(ip)) {
      return jsonError(
        "Too many requests. Please try again later.",
        429
      );
    }

    let body: unknown;

    try {
      body = await readJson(request);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "BODY_TOO_LARGE"
      ) {
        return jsonError("Request is too large.", 413);
      }

      return jsonError("Invalid request body.", 400);
    }

    if (!isObject(body)) {
      return jsonError("Invalid request.", 400);
    }

    const customer = body.customer;
    const order = body.order;

    if (!isObject(customer) || !isObject(order)) {
      return jsonError("Invalid order data.", 400);
    }

    // Honeypot: silently reject automated submissions.
    // This deliberately does not confirm a real order.
    if (cleanText(customer.website, 100)) {
      return jsonError("Unable to submit this request.", 400);
    }

    // CUSTOMER VALIDATION

    const battleTag = cleanText(customer.battleTag, 80);
    const discord = cleanText(customer.discord, 80);
    const character = cleanText(customer.character, 80);
    const realm = cleanText(customer.realm, 80);
    const preferredTime = cleanText(
      customer.preferredTime,
      150
    );
    const comment = cleanText(customer.comment, 700);

    if (
      battleTag.length < 3 ||
      discord.length < 2 ||
      character.length < 1 ||
      realm.length < 1 ||
      preferredTime.length < 2
    ) {
      return jsonError(
        "Please complete all required fields.",
        400
      );
    }

    if (
      !/^[^\s#]{2,50}#[0-9]{3,12}$/.test(battleTag)
    ) {
      return jsonError(
        "Invalid BattleTag. Example: Player#1234.",
        400
      );
    }

    const scheduleValidation =
      validatePreferredTime(preferredTime);

    if (!scheduleValidation.valid) {

      return jsonError(
        scheduleValidation.error,
        400
      );
    }
    const tbilisiTime =
      scheduleValidation.tbilisiTime ??
      "Flexible — arrange with customer";


    // ORDER VALIDATION

    const keyLevel = order.keyLevel;
    const runs = order.runs;
    const traders = order.traders;

    if (!isInteger(keyLevel, 2, 20)) {
      return jsonError("Invalid key level.", 400);
    }

    if (!isInteger(runs, 1, 50)) {
      return jsonError("Invalid run count.", 400);
    }

    const playerClass = cleanText(
      order.playerClass,
      50
    );

    if (
      !hasOwn(classArmor, playerClass) ||
      !hasOwn(classRoles, playerClass)
    ) {
      return jsonError("Invalid character class.", 400);
    }

    const armorType = classArmor[playerClass];
    const allowedRoles = classRoles[playerClass];

    const participation = order.participation;
    const role = order.role;
    const region = order.region;

    if (
      participation !== "play" &&
      participation !== "afk"
    ) {
      return jsonError("Invalid participation mode.", 400);
    }

    if (
      role !== "dps" &&
      role !== "tank" &&
      role !== "healer"
    ) {
      return jsonError("Invalid role.", 400);
    }

    if (region !== "EU" && region !== "NA") {
      return jsonError("Invalid region.", 400);
    }

    if (
      participation === "play" &&
      !allowedRoles.includes(role)
    ) {
      return jsonError(
        "Selected role is not available for this class.",
        400
      );
    }

    if (
      !isInteger(
        traders,
        0,
        getMaxTraders(armorType)
      )
    ) {
      return jsonError("Invalid loot trader count.", 400);
    }

    if (typeof order.specificDungeon !== "boolean") {
      return jsonError(
        "Invalid dungeon selection mode.",
        400
      );
    }

    const specificDungeon = order.specificDungeon;
    const rawCounts = order.dungeonCounts;

    if (!isObject(rawCounts)) {
      return jsonError(
        "Invalid dungeon configuration.",
        400
      );
    }

    const validDungeons = new Set<string>(dungeons);
    const dungeonCounts: Record<string, number> = {};

    for (const dungeon of dungeons) {
      dungeonCounts[dungeon] = 0;
    }

    for (const [dungeon, amount] of Object.entries(
      rawCounts
    )) {
      if (!validDungeons.has(dungeon)) {
        return jsonError("Unknown dungeon.", 400);
      }

      if (!isInteger(amount, 0, runs)) {
        return jsonError("Invalid dungeon count.", 400);
      }

      dungeonCounts[dungeon] = amount;
    }

    const allocatedSpecificRuns = Object.values(
      dungeonCounts
    ).reduce((sum, count) => sum + count, 0);

    if (allocatedSpecificRuns > runs) {
      return jsonError(
        "Assigned runs exceed purchased runs.",
        400
      );
    }

    if (
      !specificDungeon &&
      allocatedSpecificRuns > 0
    ) {
      return jsonError(
        "Invalid dungeon configuration.",
        400
      );
    }

    // SERVER-SIDE PRICE CALCULATION

    const singleRun = basePrices[keyLevel];

    if (!Number.isFinite(singleRun)) {
      return jsonError("Price unavailable.", 400);
    }

    const base = singleRun * runs;

    const afkExtra =
      participation === "afk"
        ? Math.round(base * AFK_SURCHARGE)
        : 0;

    const safeRole: Role =
      participation === "afk" ? "dps" : role;

    const roleExtra =
      participation === "play"
        ? Math.round(base * roleSurcharges[safeRole])
        : 0;

    const specificExtra = Math.round(
      singleRun *
      allocatedSpecificRuns *
      SPECIFIC_DUNGEON_SURCHARGE
    );

    const traderExtra = Math.round(
      base * traderSurcharges[traders]
    );

    const beforeDiscount =
      base +
      afkExtra +
      roleExtra +
      specificExtra +
      traderExtra;

    const discount = Math.round(
      beforeDiscount * getRunsDiscount(runs)
    );

    const total = beforeDiscount - discount;

    // DUNGEON SUMMARY

    const remainingRuns =
      runs - allocatedSpecificRuns;

    const dungeonLines = dungeons
      .filter((name) => dungeonCounts[name] > 0)
      .map(
        (name) =>
          `• ${name} ×${dungeonCounts[name]}`
      );

    if (remainingRuns > 0) {
      dungeonLines.push(
        `• Any dungeon ×${remainingRuns}`
      );
    }

    const modeLabel =
      participation === "play"
        ? "I Play"
        : "AFK / Minimal";

    const roleLabel =
      participation === "play"
        ? formatRole(safeRole)
        : "—";

    // DUPLICATE PROTECTION

    cleanDuplicateCache();

    const fingerprint = createHash("sha256")
      .update(
        JSON.stringify({
          ip,
          battleTag,
          discord,
          character,
          realm,
          preferredTime,
          comment,
          keyLevel,
          runs,
          traders,
          playerClass,
          participation,
          role,
          region,
          specificDungeon,
          dungeonCounts,
        })
      )
      .digest("hex");

    const existing = duplicates.get(fingerprint);

    if (existing && existing.expiresAt > Date.now()) {
      if (existing.state === "sent") {
        return NextResponse.json({
          ok: true,
          orderId: existing.orderId,
          total: existing.total,
          receipt: existing.receipt,
          duplicate: true,
        });
      }

      return jsonError(
        "This order is already being processed.",
        409
      );
    }

    duplicates.set(fingerprint, {
      state: "pending",
      expiresAt: Date.now() + 30_000,
    });

    const orderId = `NB-${Date.now()
      .toString(36)
      .toUpperCase()}-${randomUUID()
        .slice(0, 4)
        .toUpperCase()}`;
    const receipt: OrderReceipt = {
      orderId,
      createdAt: new Date().toISOString(),
      total,

      customer: {
        battleTag,
        discord,
        character,
        realm,
        comment,
      },

      service: {
        keyLevel,
        runs,
        mode: modeLabel,
        region,
        playerClass,
        role: roleLabel,
        armor: armorType,
        traders,
        dungeons: dungeonLines,
      },

      schedule: {
        preferredTime,
        tbilisiTime,
      },
    };

    // DISCORD MESSAGE

    try {
      const response = await fetch(webhook, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(DISCORD_TIMEOUT),
        body: JSON.stringify({
          username: "NikoBoost Orders",
          allowed_mentions: {
            parse: [],
          },
          embeds: [
            {
              title: `🟢 New order ${orderId}`,
              color: 0x5f7cff,
              fields: [
                {
                  name: "⚔️ Order",
                  value: [
                    `**Mythic+ +${keyLevel}**`,
                    `Runs: **${runs}**`,
                    `Mode: **${modeLabel}**`,
                    `Region: **${region}**`,
                  ].join("\n"),
                  inline: true,
                },
                {
                  name: "🛡 Character",
                  value: [
                    `Class: **${playerClass}**`,
                    `Role: **${roleLabel}**`,
                    `Armor: **${armorType}**`,
                    `Traders: **${traders === 0
                      ? "None"
                      : `+${traders}`
                    }**`,
                  ].join("\n"),
                  inline: true,
                },
                {
                  name: "🗺 Dungeons",
                  value:
                    dungeonLines.join("\n") ||
                    "Any dungeon",
                  inline: false,
                },
                {
                  name: "💰 Price",
                  value: `**${total.toLocaleString(
                    "en-US"
                  )} GOLD**`,
                  inline: false,
                },
                {
                  name: "👤 Customer",
                  value: [
                    `BattleTag: **${battleTag}**`,
                    `Discord: **${discord}**`,
                    `Character: **${character}**`,
                    `Realm: **${realm}**`,
                  ].join("\n"),
                  inline: false,
                },
                {
                  name: "🕒 Preferred time",
                  value: [
                    `🌍 Customer: ${preferredTime}`,
                    `🇬🇪 Tbilisi: **${tbilisiTime}**`,
                  ].join("\n"),
                  inline: false,
                },
                ...(comment
                  ? [
                    {
                      name: "📝 Comment",
                      value: comment,
                      inline: false,
                    },
                  ]
                  : []),
              ],
              footer: {
                text: "NikoBoost • Website order",
              },
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      });

      if (!response.ok) {
        console.error(
          "Discord webhook failed:",
          response.status
        );

        duplicates.delete(fingerprint);

        return jsonError(
          "Order could not be sent. Please try again.",
          502
        );
      }

      duplicates.set(fingerprint, {
        state: "sent",
        expiresAt: Date.now() + DUPLICATE_WINDOW,
        orderId,
        total,
        receipt,
      });

      return NextResponse.json({
        ok: true,
        orderId,
        total,
        receipt,
      });
    } catch (error) {
      console.error("Discord delivery error:", error);

      // Keep this request temporarily blocked.
      // A timeout may happen AFTER Discord received it.
      duplicates.set(fingerprint, {
        state: "pending",
        expiresAt: Date.now() + DUPLICATE_WINDOW,
      });

      return jsonError(
        "Could not confirm delivery. Check with support before trying again.",
        504
      );
    }
  } catch (error) {
    console.error("Order API error:", error);

    return jsonError(
      "Something went wrong. Please try again later.",
      500
    );
  }
}
