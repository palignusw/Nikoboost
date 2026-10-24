import type { MetadataRoute } from "next";
import { serviceContent } from "@/data/season";
import { pageUrl, type SeoPage } from "@/lib/pageSeo";

export default function sitemap(): MetadataRoute.Sitemap {
  return (["home", "delves", "rewards"] as SeoPage[]).map((page) => ({
    url: pageUrl(page),
    lastModified: new Date(serviceContent[page].updatedAt),
    changeFrequency: "weekly",
    priority: page === "home" ? 1 : page === "delves" ? 0.9 : 0.8,
  }));
}
