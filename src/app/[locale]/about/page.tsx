import type { Metadata } from "next";
import { Film, Globe2, Layers, Mail, MonitorPlay, ShieldCheck } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { siteConfig } from "@/config/site";
import { PageHeader } from "@/components/browse/page-header";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("title"), description: t("intro") };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "about" });

  const features = [
    { icon: Film, text: t("feature1") },
    { icon: Layers, text: t("feature2") },
    { icon: MonitorPlay, text: t("feature3") },
    { icon: Globe2, text: t("feature4") },
  ];

  return (
    <>
      <PageHeader eyebrow={locale === "ar" ? siteConfig.name.ar : siteConfig.name.en} title={t("title")} description={t("subtitle")} />

      <div className="container-page grid gap-10 py-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          <section className="surface p-6">
            <p className="text-sm leading-8 text-ink-200/85">{t("intro")}</p>
          </section>

          <section>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
              <span className="inline-block h-5 w-1 rounded-full bg-gold-500" /> {t("missionTitle")}
            </h2>
            <p className="max-w-3xl text-sm leading-8 text-muted">{t("mission")}</p>
          </section>

          <section>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
              <span className="inline-block h-5 w-1 rounded-full bg-gold-500" /> {t("featuresTitle")}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {features.map((feature) => (
                <div key={feature.text} className="surface flex items-start gap-3 p-4">
                  <feature.icon className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                  <p className="text-xs leading-6 text-muted">{feature.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-2 text-xl font-bold">
              <span className="inline-block h-5 w-1 rounded-full bg-gold-500" /> {t("techTitle")}
            </h2>
            <p className="text-sm leading-8 text-muted">{t("tech")}</p>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="surface p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold">
              <Mail className="h-4 w-4 text-gold-400" /> {t("contactTitle")}
            </h3>
            <p className="mt-3 text-xs leading-6 text-muted">{t("contactBody", { email: siteConfig.email })}</p>
            <a href={`mailto:${siteConfig.email}`} className="btn-outline mt-4 w-full !py-2 !text-xs">
              {siteConfig.email}
            </a>
          </div>

          <div className="surface p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold">
              <ShieldCheck className="h-4 w-4 text-gold-400" /> TMDB
            </h3>
            <p className="mt-3 text-[11px] leading-6 text-muted">
              {locale === "ar"
                ? "بيانات الأفلام والمسلسلات من TMDB. فَرجة لا يستضيف أي ملفات فيديو، والتشغيل يتم عبر سيرفرات خارجية."
                : "Film and series metadata comes from TMDB. Farja does not host any video files; playback runs on third-party servers."}
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
