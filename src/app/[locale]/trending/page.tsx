import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCollection, currentDataSource } from "@/lib/data";
import type { Title } from "@/types";
import { PageHeader } from "@/components/browse/page-header";
import { TitleGrid } from "@/components/browse/title-grid";
import { Pagination } from "@/components/ui/pagination";
import { AdSlot } from "@/components/ui/ad-slot";
import { EmptyState } from "@/components/ui/empty-state";
import { clampPage } from "@/lib/utils";

export const revalidate = 21600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("trendingTitle"), description: t("homeDescription") };
}

export default async function TrendingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const page = clampPage(sp.page);
  const nav = await getTranslations({ locale, namespace: "nav" });
  const meta = await getTranslations({ locale, namespace: "meta" });
  const common = await getTranslations({ locale, namespace: "common" });
  const result = await getCollection("trending", locale, { page, pageSize: 24 });
  const items: Title[] = result.items;

  return (
    <>
      <PageHeader
        eyebrow={meta("trendingTitle")}
        title={nav("trending")}
        description={
          locale === "ar"
            ? "الأعمال التي يشاهدها العالم هذا الأسبوع، بترتيب مباشر من TMDB."
            : "What the world is watching this week, ranked live from TMDB."
        }
      />
      <div className="container-page space-y-7 py-9">
        <AdSlot id="browse-top" label="AD_SLOT · TRENDING" />
        {items.length ? <TitleGrid items={items} locale={locale} /> : <EmptyState title={common("empty")} hint={common("emptyHint")} />}
        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          pathname="/trending"
          query={{}}
          labels={{
            previous: locale === "ar" ? "السابق" : "Previous",
            next: locale === "ar" ? "التالي" : "Next",
            page: common("page"),
            of: common("of"),
          }}
        />
        <p className="text-center text-[10px] text-muted/50">
          {currentDataSource() === "tmdb" ? "TMDB · /trending/all/week" : "Farja catalog · offline TMDB snapshot"}
        </p>
      </div>
    </>
  );
}
