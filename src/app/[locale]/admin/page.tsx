import type { Metadata } from "next";
import { AlertTriangle, Database, Film, Heart, History, Server, Users } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { getAdminOverview, getSiteSettings, isDatabaseConfigured } from "@/lib/store";
import { currentDataSource, catalogSize } from "@/lib/data";
import { formatDate, formatNumber } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: t("title"), robots: { index: false, follow: false } };
}

export default async function AdminOverviewPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "admin" });
  const session = await auth();
  const { stats, users } = await getAdminOverview();
  const settings = await getSiteSettings();
  const source = currentDataSource();

  const cards = [
    { icon: Users, label: t("totalUsers"), value: formatNumber(stats.totalUsers, locale) },
    { icon: Server, label: t("totalAdmins"), value: formatNumber(stats.totalAdmins, locale) },
    { icon: Heart, label: t("watchlistItems"), value: formatNumber(stats.watchlistItems, locale) },
    { icon: History, label: t("historyItems"), value: formatNumber(stats.historyItems, locale) },
  ];

  return (
    <div className="space-y-8">
      {settings.defaultPassword && (
        <div className="flex items-start gap-3 rounded-xl border border-gold-500/40 bg-gold-500/10 px-4 py-3 text-xs leading-6 text-gold-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            {t("defaultWarning")}{" "}
            <Link href="/admin/settings" className="font-bold underline">
              {t("settings")}
            </Link>
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="surface p-5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold-500/10 text-gold-400">
              <card.icon className="h-5 w-5" />
            </span>
            <p className="mt-4 text-2xl font-extrabold">{card.value}</p>
            <p className="mt-1 text-[10px] uppercase tracking-widest text-muted/70">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="surface p-5">
          <p className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted/70">
            <Database className="h-3.5 w-3.5" /> {t("database")}
          </p>
          <p className="mt-2 text-sm font-bold">
            {isDatabaseConfigured() ? t("databaseConnected") : t("databaseDemo")}
          </p>
          <p className="mt-1 text-[10px] text-muted/60">
            {isDatabaseConfigured() ? "Prisma · PostgreSQL" : ".data/store.json"}
          </p>
        </div>
        <div className="surface p-5">
          <p className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted/70">
            <Film className="h-3.5 w-3.5" /> {t("tmdbMode")}
          </p>
          <p className="mt-2 text-sm font-bold">{source === "tmdb" ? t("tmdbLive") : t("tmdbSnapshot")}</p>
          <p className="mt-1 text-[10px] text-muted/60">
            {source === "tmdb" ? "TMDB API v3 · 6h cache" : `catalog.json · ${formatNumber(catalogSize(), locale)} titles`}
          </p>
        </div>
        <div className="surface p-5">
          <p className="text-[10px] uppercase tracking-widest text-muted/70">{t("security")}</p>
          <p className="mt-2 text-sm font-bold" dir="ltr">{session?.user?.email}</p>
          <p className="mt-1 text-[10px] text-muted/60">
            {settings.defaultPassword ? t("defaultWarning").slice(0, 60) + "…" : "bcrypt · JWT sessions"}
          </p>
        </div>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold">{t("latestUsers")}</h2>
          <Link href="/admin/users" className="text-[11px] font-semibold text-gold-300 hover:underline">
            {t("users")} →
          </Link>
        </div>
        <div className="surface overflow-x-auto">
          <table className="w-full min-w-[520px] text-start text-xs">
            <thead className="border-b border-line text-[10px] uppercase tracking-widest text-muted/60">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">{t("email")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("role")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("joined")}</th>
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 6).map((user) => (
                <tr key={user.id} className="border-b border-line/50 last:border-0">
                  <td className="px-4 py-3" dir="ltr">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${user.role === "ADMIN" ? "bg-gold-500/15 text-gold-300" : "bg-white/5 text-muted"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{formatDate(user.createdAt, locale)}</td>
                </tr>
              ))}
              {!users.length && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-muted">{t("noUsers")}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
