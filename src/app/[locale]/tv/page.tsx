import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BrowseView, type RawSearchParams } from "@/components/browse/browse-view";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("seriesTitle"), description: t("homeDescription") };
}

export default async function SeriesPage({
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
  const meta = await getTranslations({ locale, namespace: "meta" });
  const common = await getTranslations({ locale, namespace: "common" });

  return (
    <BrowseView
      locale={locale}
      title={t("series")}
      eyebrow={meta("seriesTitle")}
      description={`${common("series")} · ${common("genre")} · ${common("rating")}`}
      basePath="/tv"
      rawParams={sp}
      lockedType="tv"
    />
  );
}
