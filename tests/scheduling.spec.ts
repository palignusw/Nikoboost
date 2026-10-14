
import {
  test,
  expect,
  type Page,
} from "@playwright/test";

const API_PATTERN = "**/api/order";

async function openReservation(page: Page) {
  await page.goto("/");

  await page
    .locator("aside")
    .getByRole("button", {
      name: /Reserve run/i,
    })
    .click();

  const modal = page.getByRole("dialog", {
    name: "Reserve your run.",
  });

  await expect(modal).toBeVisible();

  return modal;
}

async function fillCustomer(page: Page) {
  await page.getByPlaceholder("Player#1234")
    .fill("TestPlayer#1234");

  await page.getByPlaceholder("@username")
    .fill("test_user");

  await page.getByPlaceholder("Your character")
    .fill("Testrogue");

  await page.getByPlaceholder("Tarren Mill")
    .fill("Tarren Mill");
}

function mockOrderAPI(page: Page) {
  return page.route(API_PATTERN, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        orderId: "NB-SCHEDULE-TEST",
        total: 80_000,
      }),
    });
  });
}

async function browserToday(page: Page) {
  return page.evaluate(() => {
    const now = new Date();

    const iso = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-");

    return iso;
  });
}

async function selectToday(page: Page) {
  const modal = page.getByRole("dialog", {
    name: "Reserve your run.",
  });

  await modal.getByRole("button", {
    name: "Select a date",
  }).click();

  const calendar = page.getByRole("dialog", {
    name: "Choose preferred start date",
  });

  await expect(calendar).toBeVisible();

  await calendar.getByRole("button", {
    name: "Today",
  }).click();

  await expect(calendar).toHaveCount(0);
}

async function selectTime(
  page: Page,
  hour: string,
  minute: string
) {
  const modal = page.getByRole("dialog", {
    name: "Reserve your run.",
  });

  await modal.getByRole("button", {
    name: /Select preferred time|Preferred time/i,
  }).click();

  const picker = page.getByRole("dialog", {
    name: "Choose preferred time",
  });

  await expect(picker).toBeVisible();

  await picker.getByRole("button", {
    name: hour,
    exact: true,
  }).click();

  await picker.getByRole("button", {
    name: minute,
    exact: true,
  }).click();

  await picker.getByRole("button", {
    name: /Confirm/i,
  }).click();

  await expect(picker).toHaveCount(0);

  await expect(
    modal.getByRole("button", {
      name: `Preferred time ${hour}:${minute}`,
    })
  ).toBeVisible();
}

test.describe("NikoBoost scheduling", () => {
  test.beforeEach(async ({ page }) => {
    // Default safety mock: never contact real Discord.
    await page.route(API_PATTERN, async (route) => {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          error: "Test request blocked",
        }),
      });
    });
  });

  test("DatePicker selects today", async ({ page }) => {
    await openReservation(page);

    await selectToday(page);

    const today = await browserToday(page);

    const formatted = await page.evaluate((date) => {
      const [year, month, day] =
        date.split("-").map(Number);

      return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(year, month - 1, day));
    }, today);

    await expect(
      page.getByRole("dialog", {
        name: "Reserve your run.",
      }).getByRole("button", {
        name: formatted,
      })
    ).toBeVisible();
  });

  test("Calendar prevents selecting past dates", async ({
    page,
  }) => {
    await openReservation(page);

    await page.getByRole("button", {
      name: "Select a date",
    }).click();

    const calendar = page.getByRole("dialog", {
      name: "Choose preferred start date",
    });

    await expect(
      calendar.getByRole("button", {
        name: "Previous month",
      })
    ).toBeDisabled();

    await calendar.getByRole("button", {
      name: "Next month",
    }).click();

    await expect(
      calendar.getByRole("button", {
        name: "Previous month",
      })
    ).toBeEnabled();
  });

  test("TimePicker selects 23:45", async ({ page }) => {
    await openReservation(page);

    await selectTime(page, "23", "45");
  });

  test("Escape closes DatePicker without closing reservation", async ({
    page,
  }) => {
    const modal = await openReservation(page);

    await modal.getByRole("button", {
      name: "Select a date",
    }).click();

    const calendar = page.getByRole("dialog", {
      name: "Choose preferred start date",
    });

    await expect(calendar).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(calendar).toHaveCount(0);
    await expect(modal).toBeVisible();
  });

  test("Exact schedule is sent correctly to API", async ({
    page,
  }) => {
    let capturedPayload: {
      customer?: {
        preferredTime?: string;
      };
      order?: {
        keyLevel?: number;
        runs?: number;
      };
    } | null = null;

    await page.route(API_PATTERN, async (route) => {
      capturedPayload = route.request().postDataJSON();

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          orderId: "NB-SCHEDULE-TEST",
          total: 80_000,
        }),
      });
    });

    await openReservation(page);
    await fillCustomer(page);

    await selectToday(page);
    await selectTime(page, "20", "30");

    const today = await browserToday(page);

    await page.getByRole("dialog", {
      name: "Reserve your run.",
    }).getByRole("combobox").selectOption(
      "Asia/Tbilisi"
    );

    await page.getByRole("button", {
      name: "Submit Reservation",
    }).click();

    await expect(
      page.getByRole("heading", {
        name: "Your order is in.",
      })
    ).toBeVisible();

    expect(capturedPayload).not.toBeNull();

    const payload = capturedPayload as {
      customer: { preferredTime: string };
      order: { keyLevel: number; runs: number };
    } | null;

    expect(payload?.customer.preferredTime).toBe(
      `${today} 20:30 (Asia/Tbilisi)`
    );

    expect(payload?.order.keyLevel).toBe(10);
    expect(payload?.order.runs).toBe(1);

    await expect(
      page.getByText("NB-SCHEDULE-TEST")
    ).toBeVisible();
  });
});
