import { Info } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getHomeFeed, currentDataSource } from "@/lib/data";
import { auth } from "@/lib/auth";
import { ensureSeeded, getStore } from "@/lib/store";
import { genres } from "@/config/genres";
import { HeroSlider } from "@/components/media/hero-slider";
import { MediaRow } from "@/components/media/media-row";
import { StatsStrip } from "@/components/home/stats-strip";
import { ContinueWatching } from "@/components/home/continue-watching";
import { AdSlot } from "@/components/ui/ad-slot";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "home" });
  const rows = await getTranslations({ locale, namespace: "homeRows" });
  const common = await getTranslations({ locale, namespace: "common" });
  const nav = await getTranslations({ locale, namespace: "nav" });
  const [feed, history] = await Promise.all([
    getHomeFeed(locale),
    (async () => {
      try {
        const session = await auth();
        if (!session?.user?.id) return [];
        await ensureSeeded();
        const store = await getStore();
        return store.getHistory(session.user.id, 10);
      } catch {
        return [];
      }
    })(),
  ]);

  const [firstSection, ...rest] = feed.sections;

  return (
    <div className="pb-6">
      <HeroSlider items={feed.hero} />

      <div className="container-page space-y-12 py-10">
        <StatsStrip locale={locale} stats={feed.stats} />

        <AdSlot id="home-top" label="AD_SLOT · HOME TOP" />

        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-xl font-extrabold sm:text-2xl">
              <span className="gold-text">{nav("genres")}</span>
            </h2>
            <Link href="/movies" className="text-xs font-semibold text-muted transition hover:text-gold-300">
              {common("viewAll")}
            </Link>
          </div>
          <div className="no-scrollbar flex gap-2.5 overflow-x-auto pb-1">
            {genres.slice(0, 16).map((genre) => (
              <Link
                key={genre.slug}
                href={`/genre/${genre.slug}`}
                className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-line bg-card/60 px-4 py-2 text-xs font-semibold text-muted transition hover:border-gold-500/60 hover:text-gold-300"
              >
                <span aria-hidden>{genre.emoji}</span>
                {locale === "ar" ? genre.ar : genre.en}
              </Link>
            ))}
          </div>
        </section>

        <ContinueWatching items={history} locale={locale} />

        {firstSection && (
          <MediaRow
            title={rows(firstSection.key)}
            href={firstSection.href}
            items={firstSection.items}
            eyebrow={t("heroTag")}
          />
        )}

        {rest.slice(0, 2).map((section) => (
          <MediaRow
            key={section.key}
            title={rows(section.key)}
            href={section.href}
            items={section.items}
          />
        ))}

        <AdSlot id="home-between-rows" label="AD_SLOT · BETWEEN ROWS" />

        {rest.slice(2).map((section) => (
          <MediaRow
            key={section.key}
            title={rows(section.key)}
            href={section.href}
            items={section.items}
          />
        ))}

        {currentDataSource() === "catalog" && (
          <div className="surface flex items-start gap-3 px-4 py-3 text-[11px] leading-6 text-muted">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold-500/80" />
            <p>{t("catalogNote")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
