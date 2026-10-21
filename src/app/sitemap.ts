import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { genres } from "@/config/genres";
import { getPublishedCustomTitles } from "@/lib/custom";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");
  const paths = ["", "/movies", "/tv", "/trending", "/top-rated", "/arabic", "/search", "/about", "/privacy"];
  const now = new Date();
  const pages = ["ar", "en"].flatMap((locale) =>
    paths.map((path) => ({
      url: `${base}/${locale}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
  );
  const genrePages = ["ar", "en"].flatMap((locale) =>
    genres.map((genre) => ({
      url: `${base}/${locale}/genre/${genre.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  );
  // Titles added from the dashboard are real pages too.
  const custom = await getPublishedCustomTitles().catch(() => []);
  const customPages = ["ar", "en"].flatMap((locale) =>
    custom.map((title) => ({
      url: `${base}/${locale}/title/${title.type}/${title.numericId}`,
      lastModified: new Date(title.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  );

  return [...pages, ...genrePages, ...customPages];
}
