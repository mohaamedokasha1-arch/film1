import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { siteConfig } from "@/config/site";
import { PageHeader } from "@/components/browse/page-header";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  return { title: t("title"), description: t("intro") };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "privacy" });
  const date = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG-u-nu-latn" : "en-GB", { dateStyle: "long" }).format(new Date());

  const sections = [
    { title: t("dataTitle"), body: t("dataBody") },
    { title: t("cookiesTitle"), body: t("cookiesBody") },
    { title: t("thirdPartyTitle"), body: t("thirdPartyBody") },
    { title: t("rightsTitle"), body: t("rightsBody") },
    { title: t("contactTitle"), body: t("contactBody", { email: siteConfig.email }) },
  ];

  return (
    <>
      <PageHeader eyebrow="Farja" title={t("title")} description={t("lastUpdated", { date })} />
      <div className="container-page max-w-3xl py-10">
        <p className="text-sm leading-8 text-muted">{t("intro")}</p>
        <div className="mt-8 space-y-6">
          {sections.map((section) => (
            <section key={section.title} className="surface p-5">
              <h2 className="text-sm font-bold text-fg">{section.title}</h2>
              <p className="mt-2.5 text-xs leading-7 text-muted">{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
