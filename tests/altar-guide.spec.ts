import { test, expect } from "@playwright/test";
import { altarStudies } from "../src/data/altar-study";
const base = "/tactics/altar-of-fangs";

test("all three bosses have distinct readable scenes, outcomes and practice decisions", async ({
  page,
}) => {
  test.setTimeout(90000);
  const orders: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/api/order")) orders.push(r.url());
  });
  for (const study of altarStudies) {
    await page.goto(`${base}/${study.id}`);
    await page.getByRole("tab", { name: "Study steps", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Altar of Fangs",
    );
    await expect(
      page
        .getByRole("navigation", { name: "Choose a boss" })
        .locator('[aria-current="page"]'),
    ).toHaveAttribute("href", `${base}/${study.id}`);
    for (let step = 0; step < 3; step++) {
      await page
        .getByRole("button", {
          name: new RegExp(`0${step + 1}.*${study.frames[step].label}`),
        })
        .click();
      await expect(
        page.getByRole("heading", {
          name: study.frames[step].action,
          exact: true,
        }),
      ).toBeVisible();
      for (const width of [393, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.screenshot({
          path: test
            .info()
            .outputPath(`tactics-altar-${study.id}-step-${step}-${width}.png`),
          fullPage: true,
        });
      }
    }
    await page.getByRole("button", { name: "× Mistake", exact: true }).click();
    await expect(page.getByText(study.wrong, { exact: true })).toBeVisible();
    await page.screenshot({
      path: test.info().outputPath(`tactics-altar-${study.id}-mistake.png`),
      fullPage: true,
    });
    await page.getByRole("button", { name: "Try the situation ↗" }).click();
    const right = study.options.find((o) => o.correct)!;
    for (const wrong of study.options.filter((o) => !o.correct)) {
      await page
        .getByRole("button", {
          name: `Choose ${wrong.id.toUpperCase()}: ${wrong.label}`,
          exact: true,
        })
        .click();
      const feedback = page.getByRole("status").filter({ visible: true });
      await expect(feedback).toContainText(wrong.feedback);
      await expect(feedback).not.toContainText(study.wrong);
    }
    await page
      .getByRole("button", {
        name: `Choose ${right.id.toUpperCase()}: ${right.label}`,
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("status").filter({ visible: true }),
    ).toContainText(study.right);
    await page.screenshot({
      path: test.info().outputPath(`tactics-altar-${study.id}-practice.png`),
      fullPage: true,
    });
    await page
      .getByRole("button", { name: "Reset choice ↺", exact: true })
      .filter({ visible: true })
      .click();
    await expect(page.getByRole("status")).toHaveCount(0);
  }
  expect(orders).toEqual([]);
});

test("boss navigation resets the lesson and keyboard controls preserve the decision flow", async ({
  page,
}) => {
  await page.goto(base);
  await page.getByRole("tab", { name: "Study steps", exact: true }).click();
  await page.getByRole("button", { name: "Next step", exact: true }).click();
  await page.getByRole("link", { name: /02.*The Writhing Coil/ }).click();
  await expect(page).toHaveURL(`${base}/writhing-coil`);
  await page.getByRole("tab", { name: "Study steps", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /01.*Assign/ }),
  ).toHaveAttribute("aria-current", "step");
  await page.getByRole("button", { name: "Try the situation ↗" }).click();
  const target = page.getByRole("button", { name: /^Choose A:/ });
  await target.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("status").filter({ visible: true }),
  ).toContainText("GOOD CALL");
  await page
    .getByRole("button", { name: "← Back to lesson", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveCount(0);
  await page.getByRole("button", { name: "Next step", exact: true }).click();
  await page
    .getByRole("button", { name: "Previous step", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: /01.*Assign/ }),
  ).toHaveAttribute("aria-current", "step");
  await page
    .getByRole("region", { name: "The Writhing Coil", exact: true })
    .locator("summary")
    .filter({ hasText: "Before you pull" })
    .click();
  await expect(
    page.getByText("Interrupt Toxic Atrophy repeatedly.", { exact: true }),
  ).toBeVisible();
});

test("all scenes fit narrow screens and keep explanatory text outside the illustration", async ({
  page,
  request,
}) => {
  test.setTimeout(90000);
  for (const study of altarStudies) {
    await page.goto(`${base}/${study.id}`);
    await page.getByRole("tab", { name: "Study steps", exact: true }).click();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /^index, follow$/,
    );
    for (const width of [320, 360, 393, 600, 768, 850, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${study.id} ${width}`,
      ).toBe(true);
      const diagram = await page
        .getByRole("img", { name: /scene:/ })
        .boundingBox();
      for (const callout of await page.locator("[data-callout]").all()) {
        const box = await callout.boundingBox();
        if (box && diagram)
          expect(
            box.x >= diagram.x + diagram.width ||
              box.x + box.width <= diagram.x ||
              box.y >= diagram.y + diagram.height ||
              box.y + box.height <= diagram.y,
          ).toBe(true);
      }
      // Long labels must never share the arena with actors or beams.
      await expect(
        page.getByRole("img", { name: /scene:/ }).locator("text"),
      ).toHaveCount(0);
    }
  }
  expect(await (await request.get("/sitemap.xml")).text()).toContain(base);
  await expect(
    page.getByRole("link", {
      name: "Method · Tactyks’ full guide ↗",
      exact: true,
    }),
  ).toHaveAttribute(
    "href",
    "https://www.method.gg/guides/dungeons/altar-of-fangs",
  );
});
