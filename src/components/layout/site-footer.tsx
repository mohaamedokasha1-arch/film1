import { Instagram, Youtube, Twitter, Mail, Film, ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/config/site";
import { genres } from "@/config/genres";
import { getSiteSettings } from "@/lib/store";
import { AdSlot } from "@/components/ui/ad-slot";
import { Logo } from "@/components/brand/logo";

export async function SiteFooter({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "footer" });
  const nav = await getTranslations({ locale, namespace: "nav" });
  const settings = await getSiteSettings();
  const year = new Date().getFullYear();
  const name = locale === "ar" ? siteConfig.name.ar : siteConfig.name.en;

  const explore = [
    { href: "/movies", label: nav("movies") },
    { href: "/tv", label: nav("series") },
    { href: "/trending", label: nav("trending") },
    { href: "/top-rated", label: nav("topRated") },
    { href: "/arabic", label: nav("arabic") },
    { href: "/search", label: nav("search") },
  ];

  return (
    <footer className="relative mt-24 border-t border-line/70 bg-gradient-to-b from-bg to-night-950">
      <div className="absolute inset-x-0 -top-px h-px bg-gold-line opacity-60" />
      <div className="container-page py-10">
        <AdSlot id="footer-top" label="AD_SLOT · FOOTER" className="mb-12" />

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo locale={locale} />
            <p className="mt-4 max-w-xs text-sm leading-7 text-muted">{settings.tagline || siteConfig.tagline.ar}</p>
            <p className="mt-3 max-w-xs text-xs leading-6 text-muted/80">{t("tagline")}</p>
            <div className="mt-5 flex items-center gap-2">
              <a href={siteConfig.socials.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted transition hover:border-gold-500/60 hover:text-gold-300">
                <Instagram className="h-4 w-4" />
              </a>
              <a href={siteConfig.socials.x} target="_blank" rel="noopener noreferrer" aria-label="X" className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted transition hover:border-gold-500/60 hover:text-gold-300">
                <Twitter className="h-4 w-4" />
              </a>
              <a href={siteConfig.socials.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted transition hover:border-gold-500/60 hover:text-gold-300">
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.24em] text-muted/70">{t("explore")}</h3>
            <ul className="mt-4 space-y-2.5">
              {explore.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-muted transition hover:text-gold-300">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.24em] text-muted/70">{nav("genres")}</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {genres.slice(0, 12).map((genre) => (
                <Link key={genre.slug} href={`/genre/${genre.slug}`} className="chip hover:border-gold-500/50 hover:text-gold-300">
                  {locale === "ar" ? genre.ar : genre.en}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.24em] text-muted/70">{t("company")}</h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/about" className="text-sm text-muted transition hover:text-gold-300">{t("about")}</Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-muted transition hover:text-gold-300">{t("privacy")}</Link>
              </li>
              <li>
                <a href={`mailto:${siteConfig.email}`} className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-gold-300">
                  <Mail className="h-3.5 w-3.5" /> {t("contact")}
                </a>
              </li>
            </ul>
            <div className="mt-5 flex items-center gap-2 text-[10px] text-muted/70">
              <ShieldCheck className="h-3.5 w-3.5 text-gold-500/70" />
              <span>TMDB · Next.js · Prisma</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[10px] text-muted/60">
              <Film className="h-3.5 w-3.5" />
              <span>{name} — {siteConfig.nameFallback}</span>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-line/70 pt-6">
          <p className="text-[11px] leading-6 text-muted/70">{t("disclaimer")}</p>
          <div className="mt-4 flex flex-col items-start justify-between gap-2 text-[11px] text-muted/60 sm:flex-row sm:items-center">
            <p>{t("copyright", { year })}</p>
            <p className="inline-flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-gold-500" />
              {t("madeWith")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
