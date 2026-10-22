import { mockReceipt } from "./helpers/receipt";
import { openReservation } from "./helpers/configurator";

import {
  test,
  expect,
  type Page,
} from "@playwright/test";

const TEST_ORDER_ID = "NB-TEST-12345";
const TEST_TOTAL = 80_000;

async function fillCustomerDetails(page: Page) {
  await page.getByPlaceholder("Player#1234").fill(
    "TestPlayer#1234"
  );

  await page.getByPlaceholder("@username").fill(
    "test_user"
  );

  await page.getByPlaceholder("Your character").fill(
    "Testrogue"
  );

  await page.getByPlaceholder("Tarren Mill").fill(
    "Tarren Mill"
  );
}

async function chooseFlexibleTime(page: Page) {
  await page.getByRole("button", {
    name: "Flexible time",
  }).click();

  await expect(
    page.getByRole("button", {
      name: "Flexible time",
    })
  ).toHaveAttribute("aria-pressed", "true");
}


test.describe("NikoBoost reservation", () => {
  // Safety net: prevent real Discord submissions
  // if an individual test forgets to install a mock.
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/order", async (route) => {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          error: "Test API fallback",
        }),
      });
    });
  });

  test("Reservation modal opens and closes", async ({
    page,
  }) => {
    await openReservation(page);

    await expect(
      page.getByText("Contact & character details")
    ).toBeVisible();

    await page.getByRole("button", {
      name: "Close reservation",
    }).click();

    await expect(
      page.getByRole("dialog")
    ).toHaveCount(0);

    await openReservation(page);

    await page.keyboard.press("Escape");

    await expect(
      page.getByRole("dialog")
    ).toHaveCount(0);
  });

  test("Required customer fields prevent empty submission", async ({
    page,
  }) => {
    let requestCount = 0;

    await page.route("**/api/order", async (route) => {
      requestCount++;

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          orderId: TEST_ORDER_ID,
          total: TEST_TOTAL,
          receipt: mockReceipt(TEST_ORDER_ID, TEST_TOTAL),
        }),
      });
    });

    await openReservation(page);

    await page.getByRole("button", {
      name: "Submit Reservation",
    }).click();

    const battleTag = page.getByPlaceholder("Player#1234");

    await expect(battleTag).toBeFocused();

    const isMissing = await battleTag.evaluate(
      (element) =>
        (element as HTMLInputElement).validity.valueMissing
    );

    expect(isMissing).toBe(true);
    expect(requestCount).toBe(0);
  });

  test("Exact scheduling requires date and time", async ({
    page,
  }) => {
    let requestCount = 0;

    await page.route("**/api/order", async (route) => {
      requestCount++;

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          orderId: TEST_ORDER_ID,
          total: TEST_TOTAL,
          receipt: mockReceipt(TEST_ORDER_ID, TEST_TOTAL),
        }),
      });
    });

    await openReservation(page);

    await fillCustomerDetails(page);

    await page.getByRole("button", {
      name: "Submit Reservation",
    }).click();
await expect(
  page.getByRole("dialog").getByRole("alert")
).toContainText("Please choose a date and time.");

    expect(requestCount).toBe(0);
  });

  test("Successful reservation returns correct order", async ({
    page,
  }) => {
    let capturedPayload: { customer: Record<string, string>; order: Record<string, unknown> } = { customer: {}, order: {} };
    let requestCount = 0;

    await page.route("**/api/order", async (route) => {
      requestCount++;
      capturedPayload = route.request().postDataJSON();

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          orderId: TEST_ORDER_ID,
          total: TEST_TOTAL,
          receipt: mockReceipt(TEST_ORDER_ID, TEST_TOTAL),
        }),
      });
    });

    await openReservation(page);
    await fillCustomerDetails(page);
    await chooseFlexibleTime(page);

    await page.getByRole("button", {
      name: "Submit Reservation",
    }).click();

    await expect(
      page.getByText("Your order is in.")
    ).toBeVisible();

    await expect(
      page.getByText(TEST_ORDER_ID)
    ).toBeVisible();


await expect(
  page.getByRole("dialog").getByRole("status")
).toContainText("80,000 GOLD");


    expect(requestCount).toBe(1);

    expect(capturedPayload.customer).toEqual(
      expect.objectContaining({
        battleTag: "TestPlayer#1234",
        discord: "test_user",
        character: "Testrogue",
        realm: "Tarren Mill",
      })
    );

    expect(
      capturedPayload.customer.preferredTime
    ).toContain("Flexible");

    expect(capturedPayload.order).toEqual(
      expect.objectContaining({
        keyLevel: 10,
        runs: 1,
        participation: "play",
        role: "dps",
        playerClass: "Rogue",
        traders: 0,
        region: "EU",
        specificDungeon: false,
      })
    );

    await page.getByRole("button", {
      name: "Back to Homepage →",
    }).click();

    await expect(
      page.getByRole("dialog")
    ).toHaveCount(0);
  });

  test("API error is displayed to customer", async ({
    page,
  }) => {
    await page.route("**/api/order", async (route) => {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          error: "Discord service unavailable",
        }),
      });
    });

    await openReservation(page);
    await fillCustomerDetails(page);
    await chooseFlexibleTime(page);

    await page.getByRole("button", {
      name: "Submit Reservation",
    }).click();


await expect(
  page.getByRole("dialog").getByRole("alert")
).toContainText("Discord service unavailable");


    await expect(
      page.getByRole("button", {
        name: "Submit Reservation",
      })
    ).toBeEnabled();
  });

  test("Cannot submit the same order twice while sending", async ({
    page,
  }) => {
    let requestCount = 0;

    await page.route("**/api/order", async (route) => {
      requestCount++;

      await new Promise((resolve) =>
        setTimeout(resolve, 700)
      );

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          orderId: TEST_ORDER_ID,
          total: TEST_TOTAL,
          receipt: mockReceipt(TEST_ORDER_ID, TEST_TOTAL),
        }),
      });
    });

    await openReservation(page);
    await fillCustomerDetails(page);
    await chooseFlexibleTime(page);

    await page.getByRole("button", {
      name: "Submit Reservation",
    }).click();

    const sendingButton = page.getByRole("button", {
      name: "Sending order...",
    });

    await expect(sendingButton).toBeDisabled();

    await expect(
      page.getByText("Your order is in.")
    ).toBeVisible();

    expect(requestCount).toBe(1);
  });
});
