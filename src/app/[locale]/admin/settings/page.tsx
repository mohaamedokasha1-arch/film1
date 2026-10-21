import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getStore, getSiteSettings } from "@/lib/store";
import { auth } from "@/lib/auth";
import { AdminCredentialsForm, SiteSettingsForm } from "@/components/admin/settings-forms";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: t("settings"), robots: { index: false, follow: false } };
}

export default async function AdminSettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "admin" });
  const session = await auth();
  const settings = await getSiteSettings();
  const store = await getStore();
  const admin = session?.user?.id ? await store.findUserById(session.user.id) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="surface p-6">
        <h2 className="text-sm font-bold">{t("settingsTitle")}</h2>
        <p className="mt-1.5 text-[11px] leading-6 text-muted">{t("settingsHint")}</p>
        <div className="mt-5">
          <SiteSettingsForm tagline={settings.tagline} announcement={settings.announcement} />
        </div>
      </section>

      <section className="surface p-6">
        <h2 className="text-sm font-bold">{t("adminCredentials")}</h2>
        <p className="mt-1.5 text-[11px] leading-6 text-muted">{t("adminCredentialsHint")}</p>
        <div className="mt-5">
          <AdminCredentialsForm name={admin?.name ?? ""} email={admin?.email ?? session?.user?.email ?? ""} />
        </div>
      </section>
    </div>
  );
}
