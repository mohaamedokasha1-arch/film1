import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { ensureSeeded } from "@/lib/store";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/login?next=/${locale}/admin`);
  if (session.user.role !== "ADMIN") redirect(`/${locale}`);

  await ensureSeeded().catch(() => undefined);
  const t = await getTranslations({ locale, namespace: "admin" });

  return (
    <div>
      <div className="border-b border-line/60 bg-gradient-to-b from-night-900/70 to-transparent">
        <div className="container-page py-9">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-2">Farja Admin</p>
              <h1 className="text-3xl font-extrabold">{t("title")}</h1>
              <p className="mt-2 max-w-xl text-sm text-muted">{t("subtitle")}</p>
            </div>
            <Link href="/" className="btn-outline !py-2 !text-xs">
              {t("backToSite")}
            </Link>
          </div>
          <div className="mt-6">
            <AdminNav />
          </div>
        </div>
      </div>
      <div className="container-page py-9">{children}</div>
    </div>
  );
}
