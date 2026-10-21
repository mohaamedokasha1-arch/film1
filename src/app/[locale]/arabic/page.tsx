import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BrowseView, type RawSearchParams } from "@/components/browse/browse-view";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("arabicTitle"), description: t("homeDescription") };
}

export default async function ArabicPage({
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
      title={nav("arabic")}
      eyebrow={meta("arabicTitle")}
      description={
        locale === "ar"
          ? "أفلام ومسلسلات عربية حقيقية من قاعدة بيانات TMDB — من كلاسيكيات السينما المصرية إلى دراما الخليج والشام."
          : "Real Arabic films and series from TMDB — from Egyptian classics to Gulf and Levantine drama."
      }
      basePath="/arabic"
      rawParams={sp}
      arabicOnly
    />
  );
}
