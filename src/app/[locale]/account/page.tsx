import type { Metadata } from "next";
import { Heart, History, Settings, ShieldCheck } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { WatchlistCard } from "@/components/account/watchlist-card";
import { HistoryRow } from "@/components/account/history-row";
import { DeleteAccountForm, PasswordForm, ProfileForm } from "@/components/account/settings-forms";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("accountTitle"), robots: { index: false, follow: false } };
}

type Tab = "watchlist" | "history" | "settings";

export default async function AccountPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/login`);

  const store = await getStore();
  const [record, watchlist, history] = await Promise.all([
    store.findUserById(session.user.id),
    store.getWatchlist(session.user.id),
    store.getHistory(session.user.id, 40),
  ]);
  if (!record) redirect(`/${locale}/login`);

  const sp = await searchParams;
  const tab: Tab = sp.tab === "history" || sp.tab === "settings" ? sp.tab : "watchlist";

  const t = await getTranslations({ locale, namespace: "account" });
  const nav = await getTranslations({ locale, namespace: "nav" });
  const media = await getTranslations({ locale, namespace: "media" });
  const common = await getTranslations({ locale, namespace: "common" });
  const initial = (record.name || record.email).slice(0, 1).toUpperCase();

  const tabs = [
    { key: "watchlist" as const, label: nav("watchlist"), icon: Heart, count: watchlist.length },
    { key: "history" as const, label: t("history"), icon: History, count: history.length },
    { key: "settings" as const, label: t("settings"), icon: Settings, count: null },
  ];

  return (
    <div className="container-page py-10">
      <div className="surface flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 text-2xl font-extrabold text-night-950 shadow-glow">
            {initial}
          </span>
          <div>
            <h1 className="text-xl font-extrabold">{record.name || t("title")}</h1>
            <p className="text-xs text-muted" dir="ltr">{record.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px]">
              <span className="inline-flex items-center gap-1 rounded-full border border-gold-500/30 bg-gold-500/10 px-2.5 py-1 font-bold text-gold-300">
                <ShieldCheck className="h-3 w-3" /> {record.role === "ADMIN" ? t("roleAdmin") : t("roleUser")}
              </span>
              <span className="text-muted/70">{t("memberSince", { date: formatDate(record.createdAt, locale) ?? "" })}</span>
            </div>
          </div>
        </div>

        <nav className="flex flex-wrap gap-2">
          {tabs.map((entry) => (
            <Link
              key={entry.key}
              href={{ pathname: "/account", query: { tab: entry.key } }}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                tab === entry.key
                  ? "border-gold-500 bg-gold-500/15 text-gold-300"
                  : "border-line bg-card/60 text-muted hover:border-gold-500/40 hover:text-fg"
              }`}
            >
              <entry.icon className="h-3.5 w-3.5" />
              {entry.label}
              {entry.count !== null && <span className="text-[10px] opacity-60">({entry.count})</span>}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-8">
        {tab === "watchlist" && (
          <section>
            <h2 className="mb-4 text-lg font-bold">{t("watchlist")}</h2>
            {watchlist.length ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
                {watchlist.map((item) => (
                  <WatchlistCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <EmptyState
                title={t("watchlistEmpty")}
                hint={t("watchlistEmptyHint")}
                action={
                  <Link href="/movies" className="btn-outline mt-2">
                    {media("watchNow")}
                  </Link>
                }
              />
            )}
          </section>
        )}

        {tab === "history" && (
          <section>
            <h2 className="mb-4 text-lg font-bold">{t("history")}</h2>
            {history.length ? (
              <div className="space-y-3">
                {history.map((item) => (
                  <HistoryRow key={item.id} item={item} locale={locale} />
                ))}
              </div>
            ) : (
              <EmptyState
                title={t("historyEmpty")}
                hint={t("historyEmptyHint")}
                icon="search"
                action={
                  <Link href="/tv" className="btn-outline mt-2">
                    {common("series")}
                  </Link>
                }
              />
            )}
          </section>
        )}

        {tab === "settings" && (
          <section className="grid gap-5 lg:grid-cols-2">
            <div className="surface p-5">
              <h2 className="mb-4 text-sm font-bold">{t("profile")}</h2>
              <ProfileForm name={record.name ?? ""} email={record.email} />
            </div>

            <div className="surface p-5">
              <h2 className="mb-4 text-sm font-bold">{t("changePassword")}</h2>
              <PasswordForm />
            </div>

            <div className="surface border-nile-500/30 p-5 lg:col-span-2">
              <h2 className="mb-3 text-sm font-bold text-nile-400">{t("dangerZone")}</h2>
              <DeleteAccountForm />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
