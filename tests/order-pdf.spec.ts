import { test, expect, type Page, type Locator } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { POST } from "../src/app/api/order/route";
import type { DelveOrderReceipt } from "../src/lib/orderReceipt";
import { openReservation } from "./helpers/configurator";
import { mockReceipt, mockDelveReceipt } from "./helpers/receipt";

async function fillContacts(modal: Locator) {
  for (const [placeholder, value] of [
    ["Player#1234", "PdfTester#1234"],
    ["@username", "pdf_tester"],
    ["Your character", "ტესტი"],
    ["Tarren Mill", "Гордунни"],
  ])
    await modal.getByPlaceholder(placeholder, { exact: true }).fill(value);
}
async function savePdf(
  page: Page,
  modal: Locator,
  path: string,
  orderId: string,
) {
  const downloadReady = page.waitForEvent("download");
  await modal.getByRole("button", { name: /Download PDF Receipt/ }).click();
  const download = await downloadReady;
  expect(download.suggestedFilename()).toBe(`NikoBoost-${orderId}.pdf`);
  expect(await download.failure()).toBeNull();
  await download.saveAs(path);
  const bytes = await readFile(path);
  expect(bytes.subarray(0, 5).toString()).toBe("%PDF-");
  expect(bytes.length).toBeGreaterThan(10_000);
}

for (const kind of ["regular", "bountiful", "nemesis", "labyrinth"] as const) {
  test(`Delves ${kind} downloads the server-confirmed PDF without resubmitting`, async ({
    page,
  }, info) => {
    let submissions = 0;
    let receipt: DelveOrderReceipt | undefined;
    await page.route("**/api/order", async (route) => {
      submissions++;
      const previous = {
        webhook: process.env.DISCORD_WEBHOOK_URL,
        site: process.env.SITE_URL,
        fetch: globalThis.fetch,
      };
      process.env.DISCORD_WEBHOOK_URL = "https://discord.invalid/pdf-test";
      process.env.SITE_URL = "http://127.0.0.1:3000";
      globalThis.fetch = async (url) => {
        expect(url).toBe("https://discord.invalid/pdf-test");
        return new Response(null, { status: 204 });
      };
      try {
        const response = await POST(
          new Request("http://127.0.0.1:3000/api/order", {
            method: "POST",
            headers: {
              origin: "http://127.0.0.1:3000",
              "content-type": "application/json",
              "x-forwarded-for": `192.0.2.${["regular", "bountiful", "nemesis", "labyrinth"].indexOf(kind) + 1}`,
            },
            body: route.request().postData(),
          }),
        );
        const result = await response.json();
        expect(response.status).toBe(200);
        receipt = result.receipt;
        await route.fulfill({ status: response.status, json: result });
      } finally {
        globalThis.fetch = previous.fetch;
        if (previous.webhook === undefined)
          delete process.env.DISCORD_WEBHOOK_URL;
        else process.env.DISCORD_WEBHOOK_URL = previous.webhook;
        if (previous.site === undefined) delete process.env.SITE_URL;
        else process.env.SITE_URL = previous.site;
      }
    });
    await page.goto("/delves");
    const specialist = kind === "nemesis" || kind === "labyrinth";
    if (specialist)
      await page
        .getByRole("button", {
          name:
            kind === "nemesis"
              ? /Discuss a Nemesis run/
              : /Plan a Labyrinth adventure/,
        })
        .click();
    else {
      if (kind === "bountiful")
        await page.getByRole("button", { name: /Bountiful runs/ }).click();
      await page.getByRole("combobox", { name: /^Delve location/ }).click();
      await page.getByRole("option", { name: /Twilight Crypts/ }).click();
    }
    await page
      .getByRole("button", {
        name: specialist ? /Request a gold quote/ : /Reserve this expedition/,
      })
      .click();
    const modal = page.getByRole("dialog");
    await fillContacts(modal);
    await modal
      .locator("textarea")
      .fill("Проверка PDF. ქართული ტექსტი. Please contact me before the run.");
    for (const checkbox of await modal.getByRole("checkbox").all())
      await checkbox.check();
    await modal
      .getByRole("button", {
        name: specialist ? /Send quote request/ : /Submit Reservation/,
      })
      .click();
    await expect(
      modal.getByRole("button", { name: /Download PDF Receipt/ }),
    ).toBeVisible();
    expect(receipt?.customer.character).toBe("ტესტი");
    expect(receipt?.schedule.preferredTime).toContain("Flexible");
    expect(receipt?.total).toBe(specialist ? null : 199500);
    expect(receipt?.service.destination).toBe(
      specialist
        ? kind === "nemesis"
          ? "Venomfall Deeps"
          : "Labyrinth of Kindo’jan"
        : "Twilight Crypts",
    );
    expect(receipt?.service.cofferKeys).toBe(kind === "bountiful" ? 4 : null);
    if (kind === "regular") {
      let failFont = true;
      await page.route("**/fonts/NotoSans-Regular.ttf", (route) =>
        failFont
          ? route.fulfill({ status: 503, body: "Font temporarily unavailable" })
          : route.continue(),
      );
      await modal.getByRole("button", { name: /Download PDF Receipt/ }).click();
      await expect(modal.getByRole("alert")).toContainText(
        "Your request is already received",
      );
      await expect(modal.getByRole("status")).toContainText(receipt!.orderId);
      failFont = false;
    }
    await savePdf(
      page,
      modal,
      `/tmp/delve-${kind}-${info.project.name.replaceAll(" ", "-")}.pdf`,
      receipt!.orderId,
    );
    await expect(modal.getByRole("alert")).toHaveCount(0);
    expect(submissions).toBe(1);
    await modal.screenshot({
      path: `/tmp/delve-${kind}-success-${info.project.name.replaceAll(" ", "-")}.png`,
    });
  });
}

test("Mythic+ keeps its existing PDF download", async ({ page }, info) => {
  let submissions = 0;
  await page.route("**/api/order", (route) => {
    submissions++;
    return route.fulfill({
      json: {
        ok: true,
        orderId: "NB-M-PDF",
        total: 72000,
        receipt: mockReceipt("NB-M-PDF", 72000),
      },
    });
  });
  await openReservation(page);
  const modal = page.getByRole("dialog");
  await fillContacts(modal);
  await modal
    .getByRole("button", { name: "Flexible time", exact: true })
    .click();
  await modal
    .getByRole("button", { name: "Submit Reservation", exact: true })
    .click();
  await expect(
    modal.getByRole("button", { name: /Download PDF Receipt/ }),
  ).toBeEnabled();
  await savePdf(
    page,
    modal,
    `/tmp/mythic-receipt-${info.project.name.replaceAll(" ", "-")}.pdf`,
    "NB-M-PDF",
  );
  expect(submissions).toBe(1);
});

test("Delves never offers a PDF for an inconsistent server confirmation", async ({
  page,
}) => {
  await page.route("**/api/order", (route) =>
    route.fulfill({
      json: {
        ok: true,
        orderId: "NB-D-OUTER",
        total: 190000,
        quote: false,
        receipt: mockDelveReceipt("NB-D-WRONG", 1),
      },
    }),
  );
  await page.goto("/delves");
  await page.getByRole("button", { name: /Reserve this expedition/ }).click();
  const modal = page.getByRole("dialog");
  await fillContacts(modal);
  for (const checkbox of await modal.getByRole("checkbox").all())
    await checkbox.check();
  await modal.getByRole("button", { name: /Submit Reservation/ }).click();
  await expect(modal.getByRole("alert")).toContainText(
    "Unexpected confirmation",
  );
  await expect(
    modal.getByRole("button", { name: /Download PDF Receipt/ }),
  ).toHaveCount(0);
});
