"use client";

import { LayoutDashboard, Settings, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

export function AdminNav() {
  const t = useTranslations("admin");
  const pathname = usePathname();

  const items = [
    { href: "/admin", label: t("overview"), icon: LayoutDashboard },
    { href: "/admin/users", label: t("users"), icon: Users },
    { href: "/admin/settings", label: t("settings"), icon: Settings },
  ];

  return (
    <nav className="flex flex-wrap gap-2">
      {items.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition ${
              active
                ? "border-gold-500 bg-gold-500/15 text-gold-300"
                : "border-line bg-card/60 text-muted hover:border-gold-500/40 hover:text-fg"
            }`}
          >
            <item.icon className="h-3.5 w-3.5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
