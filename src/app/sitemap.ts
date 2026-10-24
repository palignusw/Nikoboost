
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://www.nikoboost.online"
  ).replace(/\/$/, "");

  return [
    { url: `${baseUrl}/delves`, changeFrequency: "weekly", priority: 0.9 },
    {
      url: `${baseUrl}/mythic-plus-rewards`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
