"use client";

import { useEffect, useState } from "react";
import { Menu, Megaphone, Search, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { siteConfig } from "@/config/site";
import { genres } from "@/config/genres";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import { LocaleSwitcher } from "@/components/navigation/locale-switcher";
import { ThemeToggle } from "@/components/navigation/theme-toggle";
import { SearchBox } from "@/components/navigation/search-box";
import { UserMenu, type SessionUser } from "@/components/navigation/user-menu";
import { MobileMenu } from "@/components/navigation/mobile-menu";

export function SiteHeader({
  locale,
  user,
  announcement,
}: {
  locale: string;
  user: SessionUser | null;
  announcement?: string;
}) {
  const t = useTranslations();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [announcementVisible, setAnnouncementVisible] = useState(true);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50">
        {announcement && announcementVisible && (
          <div className="relative border-b border-gold-500/20 bg-gradient-to-r from-gold-700/25 via-night-900 to-nile-600/25">
            <div className="container-page flex items-center justify-center gap-2 py-2 text-center text-[11px] font-semibold text-gold-200">
              <Megaphone className="h-3.5 w-3.5 shrink-0 text-gold-400" />
              <span className="truncate">{announcement}</span>
              <button
                type="button"
                onClick={() => setAnnouncementVisible(false)}
                className="absolute end-4 text-gold-300/60 transition hover:text-gold-200"
                aria-label={t("common.close")}
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div
          className={cn(
            "border-b transition-all duration-300",
            scrolled
              ? "border-line/80 bg-bg/85 shadow-[0_18px_60px_-40px_rgba(0,0,0,0.9)] backdrop-blur-xl"
              : "border-transparent bg-gradient-to-b from-bg/95 via-bg/70 to-transparent",
          )}
        >
          <div className="container-page flex h-[72px] items-center gap-3">
            <Logo locale={locale} />

            <nav className="hidden items-center gap-0.5 ps-4 lg:flex">
              {siteConfig.nav.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={cn(
                      "relative rounded-full px-3.5 py-2 text-[13px] font-semibold transition",
                      active ? "text-gold-300" : "text-muted hover:text-fg",
                    )}
                  >
                    {t(`nav.${item.key}`)}
                    {active && (
                      <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
                    )}
                  </Link>
                );
              })}

              <div className="group relative">
                <button
                  type="button"
                  className="rounded-full px-3.5 py-2 text-[13px] font-semibold text-muted transition group-hover:text-fg"
                >
                  {t("nav.genres")}
                </button>
                <div className="pointer-events-none absolute start-0 top-full z-50 w-[420px] pt-2 opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
                  <div className="grid grid-cols-2 gap-1 rounded-2xl border border-line bg-card p-3 shadow-card">
                    {genres.map((genre) => (
                      <Link
                        key={genre.slug}
                        href={`/genre/${genre.slug}`}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-muted transition hover:bg-bg/60 hover:text-gold-300"
                      >
                        <span aria-hidden>{genre.emoji}</span>
                        {locale === "ar" ? genre.ar : genre.en}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </nav>

            <div className="ms-auto flex items-center gap-2">
              <div className="hidden w-[250px] xl:block">
                <SearchBox />
              </div>

              <button
                type="button"
                onClick={() => setSearchOpen((value) => !value)}
                aria-label={t("nav.search")}
                className="grid h-9 w-9 place-items-center rounded-full border border-line bg-card/60 text-muted transition hover:border-gold-500/50 hover:text-gold-300 xl:hidden"
              >
                <Search className="h-4 w-4" />
              </button>

              <LocaleSwitcher className="hidden sm:block" />
              <ThemeToggle className="hidden sm:grid" />

              {user ? (
                <UserMenu user={user} />
              ) : (
                <div className="hidden items-center gap-2 lg:flex">
                  <Link href="/login" className="rounded-full px-3.5 py-2 text-[13px] font-semibold text-muted transition hover:text-fg">
                    {t("nav.login")}
                  </Link>
                  <Link href="/register" className="btn-gold !px-4 !py-2 !text-[12px]">
                    <Sparkles className="h-3.5 w-3.5" />
                    {t("nav.register")}
                  </Link>
                </div>
              )}

              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label={t("nav.openMenu")}
                className="grid h-9 w-9 place-items-center rounded-full border border-line bg-card/60 text-muted transition hover:border-gold-500/50 hover:text-gold-300 lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </button>
            </div>
          </div>

          {searchOpen && (
            <div className="border-t border-line/70 bg-bg/95 px-4 py-3 backdrop-blur-xl xl:hidden">
              <SearchBox onNavigate={() => setSearchOpen(false)} />
            </div>
          )}
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} user={user} />
    </>
  );
}
