import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BrowseView, type RawSearchParams } from "@/components/browse/browse-view";
import { genreBySlug, genres } from "@/config/genres";

export function generateStaticParams() {
  return genres.map((genre) => ({ slug: genre.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const genre = genreBySlug.get(slug);
  if (!genre) return {};
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("genreTitle", { genre: locale === "ar" ? genre.ar : genre.en }),
    description: t("homeDescription"),
  };
}

export default async function GenrePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const genre = genreBySlug.get(slug);
  if (!genre) notFound();
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "meta" });
  const common = await getTranslations({ locale, namespace: "common" });

  return (
    <BrowseView
      locale={locale}
      title={`${genre.emoji} ${locale === "ar" ? genre.ar : genre.en}`}
      eyebrow={t("genreTitle", { genre: locale === "ar" ? genre.ar : genre.en })}
      description={common("movies") + " & " + common("series")}
      basePath={`/genre/${slug}`}
      rawParams={sp}
      overrides={{ genre: slug }}
      showGenre={false}
    />
  );
}
