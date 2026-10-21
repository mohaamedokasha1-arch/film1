"use client";

import { ShieldCheck, ShieldOff, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { deleteUserAction, setUserRole } from "@/lib/actions";
import type { PublicUser } from "@/types";

export function UserActions({ user, isSelf }: { user: PublicUser; isSelf: boolean }) {
  const t = useTranslations("admin");

  if (isSelf) {
    return <span className="text-[10px] text-muted/60">—</span>;
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <form action={setUserRole}>
        <input type="hidden" name="id" value={user.id} />
        <input type="hidden" name="role" value={user.role === "ADMIN" ? "USER" : "ADMIN"} />
        <button
          type="submit"
          title={user.role === "ADMIN" ? t("makeUser") : t("makeAdmin")}
          className="grid h-8 w-8 place-items-center rounded-full border border-line text-muted transition hover:border-gold-500/50 hover:text-gold-300"
        >
          {user.role === "ADMIN" ? <ShieldOff className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
        </button>
      </form>
      <form
        action={deleteUserAction}
        onSubmit={(event) => {
          if (!window.confirm(t("deleteUserConfirm"))) event.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={user.id} />
        <button
          type="submit"
          title={t("deleteUser")}
          className="grid h-8 w-8 place-items-center rounded-full border border-line text-muted transition hover:border-nile-500/60 hover:text-nile-400"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
