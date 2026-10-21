import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BrowseView, type RawSearchParams } from "@/components/browse/browse-view";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("moviesTitle"), description: t("homeDescription") };
}

export default async function MoviesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "nav" });
  const common = await getTranslations({ locale, namespace: "common" });
  const meta = await getTranslations({ locale, namespace: "meta" });

  return (
    <BrowseView
      locale={locale}
      title={t("movies")}
      eyebrow={meta("moviesTitle")}
      description={common("movies") + " · " + common("year") + " · " + common("genre") + " · " + common("rating")}
      basePath="/movies"
      rawParams={sp}
      lockedType="movie"
    />
  );
}
