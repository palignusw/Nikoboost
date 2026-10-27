import { tacticsDungeons } from "@/data/tactics-catalog";
import {
  isPublishedTactic,
  tacticsPublishedAt,
} from "@/data/published-tactics";
import { siteOrigin } from "@/lib/pageSeo";
import type { MetadataRoute } from "next";
import { serviceContent } from "@/data/season";
import { pageUrl, type SeoPage } from "@/lib/pageSeo";

export default function sitemap(): MetadataRoute.Sitemap {
  const services: MetadataRoute.Sitemap = (
    Object.keys(serviceContent) as SeoPage[]
  ).map((page) => ({
    url: pageUrl(page),
    lastModified: new Date(serviceContent[page].updatedAt),
    changeFrequency: "weekly",
    priority: page === "home" ? 1 : page === "delves" ? 0.9 : 0.8,
  }));
  const paths = [
    "/tactics",
    ...tacticsDungeons
      .filter((d) => isPublishedTactic(d.id))
      .flatMap((d) => [
        `/tactics/${d.id}`,
        ...d.bosses.map((b) => `/tactics/${d.id}/${b.id}`),
      ]),
  ];
  return [
    ...services,
    {
      url: `${siteOrigin}/mythic-plus-guide`,
      lastModified: new Date("2026-10-27"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...paths.map((path) => ({
      url: `${siteOrigin}${path}`,
      lastModified: new Date(tacticsPublishedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
