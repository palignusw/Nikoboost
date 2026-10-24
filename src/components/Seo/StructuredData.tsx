import { pageStructuredData, type SeoPage } from "@/lib/pageSeo";

export default function StructuredData({ page }: { page: SeoPage }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(pageStructuredData(page)).replace(
          /</g,
          "\\u003c",
        ),
      }}
    />
  );
}
