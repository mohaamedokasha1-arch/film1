"use client";

import { useEffect } from "react";
import { X, LogOut, Heart, LayoutDashboard, UserRound, Compass } from "lucide-react";
import { signOut } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { siteConfig } from "@/config/site";
import { genres } from "@/config/genres";
import { LocaleSwitcher } from "./locale-switcher";
import { ThemeToggle } from "./theme-toggle";
import { SearchBox } from "./search-box";
import { Logo } from "@/components/brand/logo";
import type { SessionUser } from "./user-menu";

export function MobileMenu({
  open,
  onClose,
  user,
}: {
  open: boolean;
  onClose: () => void;
  user: SessionUser | null;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-bg/95 backdrop-blur-xl lg:hidden">
      <div className="flex items-center justify-between border-b border-line px-4 py-4">
        <Logo locale={locale} />
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
          <button
            type="button"
            onClick={onClose}
            aria-label={t("nav.closeMenu")}
            className="grid h-9 w-9 place-items-center rounded-full border border-line bg-card/60 text-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <SearchBox onNavigate={onClose} />

        <nav className="mt-6 space-y-1">
          {siteConfig.nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  active ? "bg-gold-500/10 text-gold-300" : "text-muted hover:bg-card hover:text-fg"
                }`}
              >
                {t(`nav.${item.key}`)}
                <Compass className="h-4 w-4 opacity-40" />
              </Link>
            );
          })}
        </nav>

        <p className="mt-7 mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.25em] text-muted/70">
          {t("nav.genres")}
        </p>
        <div className="flex flex-wrap gap-2">
          {siteConfig.genresNav.map((slug) => {
            const genre = genres.find((entry) => entry.slug === slug);
            if (!genre) return null;
            return (
              <Link
                key={slug}
                href={`/genre/${slug}`}
                onClick={onClose}
                className="chip hover:border-gold-500/50 hover:text-gold-300"
              >
                <span aria-hidden>{genre.emoji}</span>
                {locale === "ar" ? genre.ar : genre.en}
              </Link>
            );
          })}
        </div>

        <div className="mt-8 space-y-1 border-t border-line pt-4">
          {user ? (
            <>
              <Link href="/account" onClick={onClose} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted hover:bg-card">
                <UserRound className="h-4 w-4" /> {t("nav.account")}
              </Link>
              <Link
                href={{ pathname: "/account", query: { tab: "watchlist" } }}
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted hover:bg-card"
              >
                <Heart className="h-4 w-4" /> {t("nav.watchlist")}
              </Link>
              {user.role === "ADMIN" && (
                <Link href="/admin" onClick={onClose} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted hover:bg-card">
                  <LayoutDashboard className="h-4 w-4" /> {t("nav.admin")}
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  void signOut({ redirectTo: `/${locale}` });
                }}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-nile-400 hover:bg-card"
              >
                <LogOut className="h-4 w-4" /> {t("nav.logout")}
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <Link href="/login" onClick={onClose} className="btn-outline">
                {t("nav.login")}
              </Link>
              <Link href="/register" onClick={onClose} className="btn-gold">
                {t("nav.register")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
