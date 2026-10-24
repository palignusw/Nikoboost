import { test, expect } from "@playwright/test";

const videoPath = "/videos/midnight-hero.mp4";

test("mobile hero never requests hidden video and keeps its optimized artwork", async ({
  page,
}) => {
  await page.setViewportSize({ width: 393, height: 852 });
  const videos: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes(videoPath)) videos.push(request.url());
  });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("video")).not.toHaveAttribute("src");
  expect(videos).toEqual([]);
  const poster = page.locator('[class*="heroPoster"]');
  await expect(poster).toHaveAttribute("fetchpriority", "high");
  await expect(poster).toHaveAttribute("srcset", /\/_next\/image/);
  await expect
    .poll(() =>
      poster.evaluate(
        (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
      ),
    )
    .toBe(true);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "WoW Mythic+ Boost for Gold",
  );
});

test("desktop motion starts after load, respects changed motion preferences and survives media errors", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  let requests = 0;
  await page.route(`**${videoPath}`, async (route) => {
    requests++;
    await route.abort();
  });
  await page.goto("/", { waitUntil: "networkidle" });
  const video = page.locator("video");
  await expect(video).not.toHaveAttribute("src");
  expect(requests).toBe(0);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(video).toHaveAttribute("src", videoPath);
  await expect.poll(() => requests).toBeGreaterThan(0);
  await expect(video).toHaveCSS("opacity", "0");
  await expect(page.locator('[class*="heroPoster"]')).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(video).not.toHaveAttribute("src");
  await page.setViewportSize({ width: 393, height: 852 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(video).not.toHaveAttribute("src");
});

test("data-saving visitors receive artwork without a video request", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: Object.assign(new EventTarget(), { saveData: true }),
    });
  });
  const videos: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes(videoPath)) videos.push(request.url());
  });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("video")).not.toHaveAttribute("src");
  expect(videos).toEqual([]);
  await expect(page.locator('[class*="heroPoster"]')).toBeVisible();
});
