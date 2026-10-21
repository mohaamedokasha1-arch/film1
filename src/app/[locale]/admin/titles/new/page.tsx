import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { TitleForm } from "@/components/admin/title-form";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "studio" });
  return { title: t("newTitle"), robots: { index: false, follow: false } };
}

export default async function NewTitlePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <TitleForm mode="create" />;
}
