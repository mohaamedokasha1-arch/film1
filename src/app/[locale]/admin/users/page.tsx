import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { getAdminOverview } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { UserActions } from "@/components/admin/user-actions";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: t("users"), robots: { index: false, follow: false } };
}

export default async function AdminUsersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "admin" });
  const session = await auth();
  const { users } = await getAdminOverview();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{t("users")}</h2>
        <span className="chip">{users.length}</span>
      </div>

      <div className="surface overflow-x-auto">
        <table className="w-full min-w-[720px] text-xs">
          <thead className="border-b border-line text-[10px] uppercase tracking-widest text-muted/60">
            <tr>
              <th className="px-4 py-3 text-start font-semibold">{t("email")}</th>
              <th className="px-4 py-3 text-start font-semibold">{t("role")}</th>
              <th className="px-4 py-3 text-start font-semibold">{t("joined")}</th>
              <th className="px-4 py-3 text-end font-semibold">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-line/50 last:border-0">
                <td className="px-4 py-3">
                  <p className="font-semibold" dir="ltr">{user.email}</p>
                  {user.name && <p className="text-[10px] text-muted">{user.name}</p>}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${user.role === "ADMIN" ? "bg-gold-500/15 text-gold-300" : "bg-white/5 text-muted"}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">{formatDate(user.createdAt, locale)}</td>
                <td className="px-4 py-3">
                  <UserActions user={user} isSelf={user.id === session?.user?.id} />
                </td>
              </tr>
            ))}
            {!users.length && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted">{t("noUsers")}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
