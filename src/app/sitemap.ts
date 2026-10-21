import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { genres } from "@/config/genres";

export default function sitemap(): MetadataRoute.Sitemap {
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
  return [...pages, ...genrePages];
}
