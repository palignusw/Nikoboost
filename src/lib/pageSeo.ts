import type { Metadata } from "next";
import { serviceContent } from "@/data/season";

export type SeoPage = keyof typeof serviceContent;
export const siteOrigin = new URL(
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.nikoboost.online",
).origin;
export function pageUrl(page: SeoPage) {
  const path = serviceContent[page].path;
  return path === "/" ? siteOrigin : `${siteOrigin}${path}`;
}
export function pageMetadata(page: SeoPage): Metadata {
  const content = serviceContent[page];
  const title = `${content.seoTitle} | NikoBoost`;
  const image = `${siteOrigin}${content.image}`;
  return {
    title: { absolute: title },
    description: content.metaDescription,
    alternates: { canonical: pageUrl(page) },
    openGraph: {
      type: "website",
      siteName: "NikoBoost",
      title,
      description: content.metaDescription,
      url: pageUrl(page),
      images: [{ url: image, alt: "World of Warcraft - NikoBoost" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: content.metaDescription,
      images: [image],
    },
  };
}
export function pageStructuredData(page: SeoPage) {
  const content = serviceContent[page];
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteOrigin}/#website`,
        url: siteOrigin,
        name: "NikoBoost",
        inLanguage: "en",
      },
      {
        "@type": "WebPage",
        "@id": `${pageUrl(page)}#webpage`,
        url: pageUrl(page),
        name: `${content.heading} ${content.accent}`,
        description: content.metaDescription,
        isPartOf: { "@id": `${siteOrigin}/#website` },
        inLanguage: "en",
        ...(page === "home"
          ? {}
          : { breadcrumb: { "@id": `${pageUrl(page)}#breadcrumb` } }),
      },
      ...(page === "home"
        ? []
        : [
            {
              "@type": "BreadcrumbList",
              "@id": `${pageUrl(page)}#breadcrumb`,
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "NikoBoost",
                  item: siteOrigin,
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: content.label,
                  item: pageUrl(page),
                },
              ],
            },
          ]),
    ],
  };
}
