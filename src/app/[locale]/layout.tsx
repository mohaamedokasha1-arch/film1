import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { routing, localeNames } from "@/i18n/routing";
import { siteConfig } from "@/config/site";
import { auth } from "@/lib/auth";
import { getSiteSettings } from "@/lib/store";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import "../globals.css";

const themeScript = `try{var t=localStorage.getItem('farja-theme');if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light');}}catch(e){}`;

// The header renders the signed-in user on every page, so locale routes are
// rendered per-request. TMDB responses stay cached for 6 hours via fetch().
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const name = locale === "ar" ? siteConfig.name.ar : siteConfig.name.en;

  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: t("homeTitle"), template: `%s · ${name}` },
    description: t("homeDescription"),
    applicationName: name,
    keywords:
      locale === "ar"
        ? ["أفلام", "مسلسلات", "بث", "سينما مصرية", "مشاهدة أونلاين", "فرجة"]
        : ["movies", "series", "streaming", "Egyptian cinema", "watch online", "Farja"],
    alternates: {
      canonical: `/${locale}`,
      languages: { ar: "/ar", en: "/en" },
    },
    openGraph: {
      type: "website",
      siteName: name,
      title: t("homeTitle"),
      description: t("homeDescription"),
      locale: locale === "ar" ? "ar_EG" : "en_US",
      url: `/${locale}`,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: name }],
    },
    twitter: { card: "summary_large_image", title: t("homeTitle"), description: t("homeDescription") },
    robots: { index: true, follow: true },
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();
  const settings = await getSiteSettings();

  let user = null;
  try {
    const session = await auth();
    if (session?.user?.id) {
      user = {
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        role: session.user.role,
      };
    }
  } catch {
    user = null;
  }

  const dir = localeNames[locale as "ar" | "en"].dir;

  return (
    <html lang={locale} dir={dir} className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <meta name="theme-color" content={siteConfig.theme.background} />
      </head>
      <body className="min-h-screen bg-bg font-sans text-fg antialiased">
        <NextIntlClientProvider messages={messages}>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-gold-500 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-night-950"
          >
            {locale === "ar" ? "تجاوز إلى المحتوى" : "Skip to content"}
          </a>
          <SiteHeader locale={locale} user={user} announcement={settings.announcement} />
          <main id="main">{children}</main>
          <SiteFooter locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
