import { getTranslations } from "next-intl/server";
import { AdSlot } from "@/components/ui/ad-slot";
import { Pagination } from "@/components/ui/pagination";
import { PageHeader } from "./page-header";
import { FilterBar, type FilterValues } from "./filter-bar";
import { TitleGrid } from "./title-grid";
import { browseTitles, yearsForSelect } from "@/lib/data";
import { clampPage, firstParam } from "@/lib/utils";
import type { BrowseFilters, BrowseSort, MediaType } from "@/types";

export interface RawSearchParams {
  [key: string]: string | string[] | undefined;
}

export function parseBrowseFilters(
  params: RawSearchParams,
  overrides: Partial<BrowseFilters> = {},
): BrowseFilters {
  const type = firstParam(params.type);
  const rating = Number(firstParam(params.rating));
  const sort = firstParam(params.sort);
  const validSort: BrowseSort[] = ["popularity", "rating", "newest", "oldest"];
  return {
    q: firstParam(params.q)?.slice(0, 80),
    type: type === "movie" || type === "tv" ? (type as MediaType) : "all",
    genre: firstParam(params.genre),
    year: firstParam(params.year),
    minRating: Number.isFinite(rating) && rating > 0 ? rating : undefined,
    sort: validSort.includes(sort as BrowseSort) ? (sort as BrowseSort) : "popularity",
    page: clampPage(params.page),
    ...overrides,
  };
}

export function filtersToValues(filters: BrowseFilters): FilterValues {
  return {
    q: filters.q,
    type: filters.type === "all" ? undefined : filters.type,
    genre: filters.genre,
    year: filters.year,
    rating: filters.minRating ? String(filters.minRating) : undefined,
    sort: filters.sort,
  };
}

export async function BrowseView({
  locale,
  title,
  description,
  eyebrow,
  basePath,
  rawParams,
  overrides,
  lockedType,
  showGenre = true,
  arabicOnly = false,
}: {
  locale: string;
  title: string;
  description?: string;
  eyebrow?: string;
  basePath: string;
  rawParams: RawSearchParams;
  overrides?: Partial<BrowseFilters>;
  lockedType?: MediaType;
  showGenre?: boolean;
  arabicOnly?: boolean;
}) {
  const filters = parseBrowseFilters(rawParams, {
    ...overrides,
    type: lockedType ?? overrides?.type,
    arabicOnly,
  });
  const result = await browseTitles(filters, locale);
  const t = await getTranslations({ locale, namespace: "common" });

  const query = {
    q: filters.q,
    type: lockedType ? undefined : filters.type === "all" ? undefined : filters.type,
    genre: filters.genre,
    year: filters.year,
    rating: filters.minRating,
    sort: filters.sort,
  };

  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <div className="container-page space-y-7 py-9">
        <AdSlot id="browse-top" label="AD_SLOT · BROWSE" />

        <FilterBar
          values={filtersToValues(filters)}
          years={yearsForSelect()}
          showType={!lockedType}
          showGenre={showGenre}
          basePath={basePath}
          resultCount={result.totalResults}
        />

        <TitleGrid items={result.items} locale={locale} />

        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          pathname={basePath}
          query={query}
          labels={{
            previous: locale === "ar" ? "السابق" : "Previous",
            next: locale === "ar" ? "التالي" : "Next",
            page: t("page"),
            of: t("of"),
          }}
        />
      </div>
    </>
  );
}
