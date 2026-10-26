import { test, expect } from "@playwright/test";
import { serviceContent } from "../src/data/season";
import sitemap from "../src/app/sitemap";

const origin = new URL(
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.nikoboost.online",
).origin;

test("service pages expose matching SEO and readable headings without client JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const [key, content] of Object.entries(serviceContent)) {
    const response = await page.goto(`http://127.0.0.1:3000${content.path}`);
    expect(response?.status()).toBe(200);
    const canonical =
      content.path === "/" ? origin : `${origin}${content.path}`;
    await expect(page).toHaveTitle(`${content.seoTitle} | NikoBoost`);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText(
      `${content.heading} ${content.accent}`,
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      content.metaDescription,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      canonical,
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      `${content.seoTitle} | NikoBoost`,
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      "content",
      canonical,
    );
    await expect(
      page.locator('meta[name="twitter:description"]'),
    ).toHaveAttribute("content", content.metaDescription);
    const raw = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    expect(raw).toHaveLength(1);
    const data = JSON.parse(raw[0]);
    const graph = data["@graph"] as Array<Record<string, unknown>>;
    expect(data["@context"]).toBe("https://schema.org");
    expect(graph.find((node) => node["@type"] === "WebSite")).toMatchObject({
      name: "NikoBoost",
      url: origin,
    });
    expect(graph.find((node) => node["@type"] === "WebPage")).toMatchObject({
      url: canonical,
      name: `${content.heading} ${content.accent}`,
    });
    expect(JSON.stringify(data)).not.toMatch(
      /AggregateRating|Review|ratingValue/,
    );
    if (key !== "home") {
      await expect(
        page.getByRole("navigation", { name: "Breadcrumb", exact: true }),
      ).toContainText(content.label);
      expect(
        graph.find((node) => node["@type"] === "BreadcrumbList"),
      ).toMatchObject({
        itemListElement: [
          { position: 1, name: "NikoBoost", item: origin },
          { position: 2, name: content.label, item: canonical },
        ],
      });
    }
  }
  await context.close();
});

test("sitemap uses real configured update dates and the public origin", async ({
  request,
}) => {
  const entries = sitemap();
  expect(entries).toHaveLength(Object.keys(serviceContent).length + 23);
  for (const content of Object.values(serviceContent)) {
    const url = content.path === "/" ? origin : `${origin}${content.path}`;
    expect(entries.find((entry) => entry.url === url)?.lastModified).toEqual(
      new Date(content.updatedAt),
    );
  }
  expect(
    entries.filter((entry) => entry.url.includes("/tactics")),
  ).toHaveLength(23);
  expect(entries.some((entry) => entry.url.includes("ruby-life-pools"))).toBe(
    false,
  );
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  const xml = await response.text();
  for (const entry of entries) {
    expect(xml).toContain(`<loc>${entry.url}</loc>`);
    expect(xml).toContain(
      `<lastmod>${(entry.lastModified as Date).toISOString()}</lastmod>`,
    );
  }
  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain(`Sitemap: ${origin}/sitemap.xml`);
});

test("service guide links visitors to the matching tools and Delves page", async ({
  page,
}) => {
  await page.goto("/");
  const related = page.getByRole("navigation", {
    name: "Related WoW services and tools",
    exact: true,
  });
  await expect(
    related.getByRole("link", { name: /Vault rewards/ }),
  ).toHaveAttribute("href", "/mythic-plus-rewards");
  await related.getByRole("link", { name: /Delves runs/ }).click();
  await expect(page).toHaveURL(/\/delves$/);
  await expect(page.locator("h1:visible")).toHaveText(
    "WoW Delves Boost for Gold",
  );
});
