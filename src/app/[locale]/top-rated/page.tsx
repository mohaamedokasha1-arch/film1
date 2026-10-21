import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BrowseView, type RawSearchParams } from "@/components/browse/browse-view";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("topRatedTitle"), description: t("homeDescription") };
}

export default async function TopRatedPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const nav = await getTranslations({ locale, namespace: "nav" });
  const meta = await getTranslations({ locale, namespace: "meta" });

  return (
    <BrowseView
      locale={locale}
      title={nav("topRated")}
      eyebrow={meta("topRatedTitle")}
      description={
        locale === "ar"
          ? "أعمال حصدت أعلى تقييمات الجمهور والنقاد، أفلام ومسلسلات مختارة بعناية."
          : "The highest rated films and series, picked by audiences and critics."
      }
      basePath="/top-rated"
      rawParams={sp}
      overrides={{ sort: "rating", minRating: 7 }}
    />
  );
}
