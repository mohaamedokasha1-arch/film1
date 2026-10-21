"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, LogOut, Heart, LayoutDashboard, UserRound } from "lucide-react";
import { signOut } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

export interface SessionUser {
  name?: string | null;
  email?: string | null;
  role: UserRole;
}

export function UserMenu({ user, className }: { user: SessionUser; className?: string }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const initials = (user.name || user.email || "F").trim().slice(0, 1).toUpperCase();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-full border border-line bg-card/60 py-1 pe-2 ps-1 text-xs font-semibold text-muted transition hover:border-gold-500/50 hover:text-gold-300",
          className,
        )}
        aria-label={t("account")}
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-gold-400 to-gold-700 text-night-950">
          {initials}
        </span>
        <span className="hidden max-w-24 truncate sm:block">{user.name || user.email}</span>
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-[60] min-w-52 overflow-hidden rounded-xl border border-line bg-card p-1.5 shadow-card"
        >
          <div className="px-3 py-2">
            <p className="truncate text-sm font-bold text-fg">{user.name || t("account")}</p>
            <p className="truncate text-[11px] text-muted">{user.email}</p>
          </div>
          <div className="my-1 h-px bg-line" />
          <Item asChild>
            <Link href="/account">
              <UserRound className="h-4 w-4" /> {t("account")}
            </Link>
          </Item>
          <Item asChild>
            <Link href={{ pathname: "/account", query: { tab: "watchlist" } }}>
              <Heart className="h-4 w-4" /> {t("watchlist")}
            </Link>
          </Item>
          {user.role === "ADMIN" && (
            <Item asChild>
              <Link href="/admin">
                <LayoutDashboard className="h-4 w-4" /> {t("admin")}
              </Link>
            </Item>
          )}
          <div className="my-1 h-px bg-line" />
          <Item
            className="text-nile-400 focus:bg-nile-500/10"
            onSelect={(event) => {
              event.preventDefault();
              void signOut({ redirectTo: `/${locale}` });
            }}
          >
            <LogOut className="h-4 w-4" /> {t("logout")}
          </Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function Item({
  children,
  className,
  asChild,
  onSelect,
}: {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
  onSelect?: (event: Event) => void;
}) {
  return (
    <DropdownMenu.Item
      asChild={asChild}
      onSelect={onSelect}
      className={cn(
        "flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-muted outline-none transition hover:bg-bg/60 hover:text-gold-300 focus:bg-bg/60 focus:text-gold-300",
        className,
      )}
    >
      {children}
    </DropdownMenu.Item>
  );
}
