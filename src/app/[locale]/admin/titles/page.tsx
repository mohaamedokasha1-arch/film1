import type { Metadata } from "next";
import { AlertTriangle, Film, Plus, Star, Tv } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { listAllCustomTitles } from "@/lib/custom";
import { isDatabaseConfigured } from "@/lib/store";
import { TitleRowActions } from "@/components/admin/title-row-actions";
import { EmptyState } from "@/components/ui/empty-state";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "studio" });
  return { title: t("titlesPage"), robots: { index: false, follow: false } };
}

export default async function AdminTitlesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "studio" });
  const titles = await listAllCustomTitles();

  const stats = [
    { label: t("total"), value: titles.length, icon: Film },
    { label: t("movies"), value: titles.filter((entry) => entry.type === "movie").length, icon: Film },
    { label: t("shows"), value: titles.filter((entry) => entry.type === "tv").length, icon: Tv },
    { label: t("featuredCount"), value: titles.filter((entry) => entry.featured).length, icon: Star },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">{t("titlesPage")}</h2>
          <p className="mt-1 max-w-2xl text-xs leading-6 text-muted">{t("titlesHint")}</p>
        </div>
        <Link href="/admin/titles/new" className="btn-gold !py-2.5 !text-xs">
          <Plus className="h-4 w-4" /> {t("addTitle")}
        </Link>
      </div>

      {!isDatabaseConfigured() ? (
        <div className="flex items-start gap-2 rounded-xl border border-gold-500/40 bg-gold-500/10 px-4 py-3 text-[11px] leading-6 text-gold-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{t("noDatabase")}</p>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((card) => (
          <div key={card.label} className="surface flex items-center gap-3 p-4">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gold-500/10 text-gold-400">
              <card.icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-lg font-extrabold leading-none">{card.value}</p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-muted/70">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {titles.length === 0 ? (
        <EmptyState
          icon="film"
          title={t("empty")}
          hint={t("emptyHint")}
          action={
            <Link href="/admin/titles/new" className="btn-gold !py-2 !text-xs">
              <Plus className="h-3.5 w-3.5" /> {t("addTitle")}
            </Link>
          }
        />
      ) : (
        <div className="surface overflow-x-auto">
          <table className="w-full min-w-[760px] text-start text-xs">
            <thead className="border-b border-line text-[10px] uppercase tracking-widest text-muted/60">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">{t("titlesPage")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("type")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("year")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("playback")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("visibility")}</th>
                <th className="px-4 py-3 text-end font-semibold">{t("edit")}</th>
              </tr>
            </thead>
            <tbody>
              {titles.map((title) => (
                <tr key={title.id} className="border-b border-line/40 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {title.posterUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={title.posterUrl}
                          alt=""
                          loading="lazy"
                          className="h-14 w-10 shrink-0 rounded-md border border-line object-cover"
                        />
                      ) : (
                        <span className="grid h-14 w-10 shrink-0 place-items-center rounded-md border border-line bg-bg/50 text-muted">
                          <Film className="h-4 w-4" />
                        </span>
                      )}
                      <div className="min-w-0">
                        <Link
                          href={`/admin/titles/${title.id}`}
                          className="block truncate font-bold text-fg transition hover:text-gold-300"
                        >
                          {title.titleAr || title.titleEn}
                        </Link>
                        {title.titleEn && title.titleAr ? (
                          <span className="block truncate text-[10px] text-muted/70" dir="ltr">
                            {title.titleEn}
                          </span>
                        ) : null}
                        <span className="mt-1 block text-[9px] text-muted/50" dir="ltr">
                          #{title.numericId}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold text-muted">
                      {title.type === "movie" ? t("movie") : t("show")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted" dir="ltr">
                    {title.year ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {title.streams.length ? (
                      <span className="text-[11px] font-semibold text-gold-300">
                        {title.streams.length} × {title.streams[0].label}
                      </span>
                    ) : (
                      <span className="text-[11px] text-muted/60">{t("noStreams")}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                          title.published ? "bg-gold-500/15 text-gold-300" : "bg-white/5 text-muted"
                        }`}
                      >
                        {title.published ? t("published") : t("draft")}
                      </span>
                      {title.featured ? (
                        <span className="rounded-full bg-gold-500/10 px-2 py-0.5 text-[9px] font-bold text-gold-300">
                          {t("featured")}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/titles/${title.id}`}
                        className="rounded-lg border border-line px-3 py-1.5 text-[10px] font-semibold text-muted transition hover:border-gold-500/50 hover:text-gold-300"
                      >
                        {t("edit")}
                      </Link>
                      <TitleRowActions id={title.id} published={title.published} featured={title.featured} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
