import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { listStreamSources } from "@/lib/custom";
import { StreamManager } from "@/components/admin/stream-manager";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "studio" });
  return { title: t("streamsTitle"), robots: { index: false, follow: false } };
}

export default async function AdminStreamsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "studio" });
  const sources = await listStreamSources();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">{t("streamsTitle")}</h2>
        <p className="mt-1 max-w-2xl text-xs leading-6 text-muted">{t("streamsSubtitle")}</p>
      </div>
      <StreamManager initialSources={sources} />
    </div>
  );
}
