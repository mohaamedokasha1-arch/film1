import { Film, Languages, Server, Shapes } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { formatNumber } from "@/lib/utils";

export async function StatsStrip({
  locale,
  stats,
}: {
  locale: string;
  stats: { titles: number; genres: number; servers: number; languages: number };
}) {
  const t = await getTranslations({ locale, namespace: "home" });

  const items = [
    { icon: Film, value: formatNumber(stats.titles, locale) + "+", label: t("statsTitles") },
    { icon: Shapes, value: formatNumber(stats.genres, locale), label: t("statsGenres") },
    { icon: Server, value: formatNumber(stats.servers, locale), label: t("statsServers") },
    { icon: Languages, value: formatNumber(stats.languages, locale), label: t("statsLanguages") },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="surface flex items-center gap-3 px-4 py-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold-500/10 text-gold-400">
            <item.icon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-extrabold leading-none text-fg">{item.value}</p>
            <p className="mt-1 text-[10px] uppercase tracking-widest text-muted/70">{item.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
