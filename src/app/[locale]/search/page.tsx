import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SearchBox } from "@/components/navigation/search-box";
import { FilterBar, type FilterValues } from "@/components/browse/filter-bar";
import { TitleGrid } from "@/components/browse/title-grid";
import { Pagination } from "@/components/ui/pagination";
import { AdSlot } from "@/components/ui/ad-slot";
import { PageHeader } from "@/components/browse/page-header";
import { browseTitles, searchTitles, yearsForSelect } from "@/lib/data";
import { clampPage, firstParam } from "@/lib/utils";
import type { BrowseSort, MediaType } from "@/types";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("searchTitle"), description: t("homeDescription") };
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  const q = firstParam(sp.q)?.slice(0, 80)?.trim() ?? "";
  const typeRaw = firstParam(sp.type);
  const type: MediaType | "all" = typeRaw === "movie" || typeRaw === "tv" ? typeRaw : "all";
  const genre = firstParam(sp.genre);
  const year = firstParam(sp.year);
  const ratingRaw = Number(firstParam(sp.rating));
  const sortRaw = firstParam(sp.sort);
  const sorts: BrowseSort[] = ["popularity", "rating", "newest", "oldest"];
  const sort = sorts.includes(sortRaw as BrowseSort) ? (sortRaw as BrowseSort) : "popularity";
  const page = clampPage(sp.page);

  const filters = {
    q,
    type,
    genre,
    year,
    minRating: Number.isFinite(ratingRaw) && ratingRaw > 0 ? ratingRaw : undefined,
    sort,
    page,
    pageSize: 24,
  };

  const result = q ? await searchTitles(filters, locale) : await browseTitles(filters, locale);

  const t = await getTranslations({ locale, namespace: "search" });
  const common = await getTranslations({ locale, namespace: "common" });
  const filtersT = await getTranslations({ locale, namespace: "filters" });

  const values: FilterValues = {
    q,
    type: type === "all" ? undefined : type,
    genre,
    year,
    rating: filters.minRating ? String(filters.minRating) : undefined,
    sort,
  };

  return (
    <>
      <PageHeader eyebrow={t("title")} title={t("title")} description={t("subtitle")}>
        <div className="mt-6 max-w-2xl">
          <SearchBox variant="overlay" />
        </div>
        {q && (
          <p className="mt-4 text-sm text-muted">
            {t("resultsFor", { query: q })}
            <span className="ms-2 rounded-full bg-gold-500/10 px-2 py-0.5 text-[10px] font-bold text-gold-300">
              {result.totalResults.toLocaleString(locale === "ar" ? "ar-EG-u-nu-latn" : "en-US")}
            </span>
          </p>
        )}
      </PageHeader>

      <div className="container-page space-y-7 py-9">
        <AdSlot id="browse-top" label="AD_SLOT · SEARCH" />

        <FilterBar
          values={values}
          years={yearsForSelect()}
          basePath="/search"
          resultCount={result.totalResults}
        />

        {result.items.length ? (
          <TitleGrid items={result.items} locale={locale} />
        ) : (
          <div className="surface flex flex-col items-center gap-3 px-6 py-16 text-center">
            <p className="text-lg font-bold">{t("noResultsTitle")}</p>
            <p className="max-w-md text-sm text-muted">{t("noResultsHint")}</p>
          </div>
        )}

        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          pathname="/search"
          query={{ q, type: type === "all" ? undefined : type, genre, year, rating: filters.minRating, sort }}
          labels={{
            previous: locale === "ar" ? "السابق" : "Previous",
            next: locale === "ar" ? "التالي" : "Next",
            page: common("page"),
            of: common("of"),
          }}
        />

        <p className="text-center text-[10px] text-muted/50">{filtersT("title")} · {t("browseAll")}</p>
      </div>
    </>
  );
}
