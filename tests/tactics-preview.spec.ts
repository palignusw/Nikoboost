import { test, expect } from "@playwright/test";
const path = "/tactics/ruby-life-pools";

test("tactics walkthrough, roles and practice work without booking requests", async ({
  page,
}) => {
  const orders: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/api/order")) orders.push(r.url());
  });
  await page.goto(path);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Know where to stand.",
  );
  await expect(
    page.getByRole("img", { name: /Chillstorm positioning diagram/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: /02\s*Create space/ }).click();
  await expect(
    page.getByRole("heading", { name: "Take the storm away." }),
  ).toBeVisible();
  await page.getByRole("button", { name: /\+\s*Healer/, exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Watch the target and the group." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "I get it. Let me try." }).click();
  await page
    .getByRole("button", { name: "Stay with the party", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Try a different position.",
  );
  await page
    .getByRole("button", {
      name: "Open side, away from teammates",
      exact: true,
    })
    .click();
  await expect(page.getByRole("status")).toContainText("That’s the idea.");
  await page.getByRole("button", { name: "Reset practice" }).click();
  await expect(page.getByRole("status")).toHaveCount(0);
  await expect(
    page.getByRole("button", {
      name: "Open side, away from teammates",
      exact: true,
    }),
  ).toBeVisible();
  expect(orders).toEqual([]);
});

test("playback advances, stops at the final step and restarts", async ({
  page,
}) => {
  await page.goto(path);
  await page.clock.install();
  await page
    .getByRole("button", { name: "Play walkthrough", exact: true })
    .click();
  for (const heading of [
    "Take the storm away.",
    "Keep clear of the pull.",
    "Regroup without crossing danger.",
  ]) {
    await page.clock.fastForward(2700);
    await expect(
      page.getByRole("heading", { name: heading, exact: true }),
    ).toBeVisible();
  }
  await expect(
    page.getByRole("button", { name: "Play walkthrough", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Restart walkthrough", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "One player gets the storm.",
      exact: true,
    }),
  ).toBeVisible();
});

test("preview is excluded from indexing and fits mobile screens", async ({
  page,
  request,
}) => {
  await page.goto(path);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
  for (const width of [320, 393, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if ([393, 1440].includes(width)) {
      await page.screenshot({
        path: test.info().outputPath(`tactics-${width}.png`),
        fullPage: true,
      });
    }
  }
  expect(await (await request.get("/sitemap.xml")).text()).not.toContain(path);
  await expect(page.getByRole("link", { name: /Method/ })).toHaveAttribute(
    "href",
    "https://www.method.gg/guides/dungeons/ruby-life-pools",
  );
});
