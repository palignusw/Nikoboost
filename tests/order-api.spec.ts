
import {
  test,
  expect,
  type APIRequestContext,
} from "@playwright/test";

const API_URL = "/api/order";

type TestOrder = {
  customer: {
    battleTag: string;
    discord: string;
    character: string;
    realm: string;
    preferredTime: string;
    comment: string;
    website: string;
  };
  order: {
    runGoal: string;
    keyLevel: number;
    runs: number;
    participation: string;
    role: string;
    playerClass: string;
    traders: number;
    region: string;
    specificDungeon: boolean;
    dungeonCounts: Record<string, number>;
  };
};

function createOrder(
  preferredTime: string
): TestOrder {
  return {
    customer: {
      battleTag: "ApiTester#1234",
      discord: "api_test_user",
      character: "Testrogue",
      realm: "Tarren Mill",
      preferredTime,
      comment: "",
      website: "",
    },

    order: {
      runGoal: "standard",
      keyLevel: 10,
      runs: 1,
      participation: "play",
      role: "dps",
      playerClass: "Rogue",
      traders: 0,
      region: "EU",
      specificDungeon: false,
      dungeonCounts: {},
    },
  };
}

function formatPastTime(): string {
  // Generate a timestamp that is already in the past.
  const past = new Date(Date.now() - 2 * 60 * 60 * 1000);

  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(past);

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return (
    `${get("year")}-${get("month")}-${get("day")} ` +
    `${get("hour")}:${get("minute")} (UTC)`
  );
}

async function postInvalidOrder(
  request: APIRequestContext,
  data: TestOrder,
  ipNumber: number,
  projectName: string
) {
  // This project's current rate limiter reads
  // x-forwarded-for. Use distinct TEST-NET addresses
  // so validation tests don't hit its 5-request limit.
  //
  // This must only be used against our local test server.
  const ip =
    projectName === "Mobile Chrome"
      ? `203.0.113.${ipNumber}`
      : `198.51.100.${ipNumber}`;

  const response = await request.post(API_URL, {
    data,
    headers: {
      "x-forwarded-for": ip,
      origin: "http://127.0.0.1:3000",
    },
  });

  const body = await response.json();

  expect(response.status()).toBe(400);
  expect(body.ok).toBe(false);

  return body;
}

test.describe("NikoBoost order API validation", () => {
  test("Rejects a date in the past", async ({
    request,
  }, testInfo) => {
    const data = createOrder(
      "2020-01-15 20:30 (Europe/Berlin)"
    );

    const body = await postInvalidOrder(
      request,
      data,
      11,
      testInfo.project.name
    );

    expect(body.error).toMatch(/already passed/i);
  });

  test("Rejects a past time", async ({
    request,
  }, testInfo) => {
    const data = createOrder(formatPastTime());

    const body = await postInvalidOrder(
      request,
      data,
      12,
      testInfo.project.name
    );

    expect(body.error).toMatch(/already passed/i);
  });

  test("Rejects an impossible calendar date", async ({
    request,
  }, testInfo) => {
    const data = createOrder(
      "2027-02-30 20:30 (Europe/Berlin)"
    );

    const body = await postInvalidOrder(
      request,
      data,
      13,
      testInfo.project.name
    );

    expect(body.error).toMatch(/invalid preferred date/i);
  });

  test("Rejects an unknown timezone", async ({
    request,
  }, testInfo) => {
    const data = createOrder(
      "2027-08-15 20:30 (Mars/Olympus)"
    );

    const body = await postInvalidOrder(
      request,
      data,
      14,
      testInfo.project.name
    );

    expect(body.error).toMatch(/invalid time zone/i);
  });

  test("Rejects nonexistent DST time", async ({
    request,
  }, testInfo) => {
    // Berlin skips 02:00–02:59 on March 28, 2027.
    const data = createOrder(
      "2027-03-28 02:30 (Europe/Berlin)"
    );

    const body = await postInvalidOrder(
      request,
      data,
      15,
      testInfo.project.name
    );

    expect(body.error).toMatch(/does not exist/i);
  });

  test("Rejects ambiguous DST time", async ({
    request,
  }, testInfo) => {
    // Berlin repeats 02:00–02:59 on October 31, 2027.
    const data = createOrder(
      "2027-10-31 02:30 (Europe/Berlin)"
    );

    const body = await postInvalidOrder(
      request,
      data,
      16,
      testInfo.project.name
    );

    expect(body.error).toMatch(/occurs twice/i);
  });

  test("Flexible schedule passes time validation", async ({
    request,
  }, testInfo) => {
    const data = createOrder(
      "Flexible — please contact me (Europe/Berlin)"
    );

    // Intentionally invalid key level.
    // If the response is "Invalid key level",
    // the schedule validation was passed first.
    // Discord will NOT be contacted.
    data.order.keyLevel = 99;

    const body = await postInvalidOrder(
      request,
      data,
      17,
      testInfo.project.name
    );

    expect(body.error).toBe("Invalid key level.");
  });

  test("Rejects invalid BattleTag", async ({
    request,
  }, testInfo) => {
    const data = createOrder(
      "Flexible — please contact me (Europe/Berlin)"
    );

    data.customer.battleTag = "InvalidBattleTag";

    const body = await postInvalidOrder(
      request,
      data,
      18,
      testInfo.project.name
    );

    expect(body.error).toMatch(/invalid battletag/i);
  });
});
