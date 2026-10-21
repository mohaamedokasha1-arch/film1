import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getStore } from "@/lib/store";
import { TitleForm } from "@/components/admin/title-form";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "studio" });
  return { title: t("editTitle"), robots: { index: false, follow: false } };
}

export default async function EditTitlePage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const store = await getStore();
  const record = await store.findCustomTitle(id).catch(() => null);
  if (!record) notFound();

  return <TitleForm mode="edit" record={record} />;
}
