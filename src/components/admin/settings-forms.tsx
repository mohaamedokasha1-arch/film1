"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { updateAdminCredentials, updateSiteSettings, type ActionState } from "@/lib/actions";

const initial: ActionState = { ok: false };

function Message({ state, success }: { state: ActionState; success: string }) {
  const t = useTranslations("admin");
  const auth = useTranslations("auth");
  if (state.ok) return <p className="text-xs font-semibold text-gold-300">{t(success)}</p>;
  if (state.error) {
    const known = ["wrongPassword", "passwordShort", "emailInUse", "invalidEmail", "nameRequired", "forbidden"];
    return <p className="text-xs font-semibold text-nile-400">{known.includes(state.error) ? auth(state.error) : auth("genericError")}</p>;
  }
  return null;
}

export function SiteSettingsForm({ tagline, announcement }: { tagline: string; announcement: string }) {
  const t = useTranslations("admin");
  const common = useTranslations("common");
  const [state, action, pending] = useActionState(updateSiteSettings, initial);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label" htmlFor="tagline">{t("siteTagline")}</label>
        <input id="tagline" name="tagline" defaultValue={tagline} maxLength={160} className="input" />
      </div>
      <div>
        <label className="label" htmlFor="announcement">{t("announcement")}</label>
        <input id="announcement" name="announcement" defaultValue={announcement} maxLength={220} className="input" />
        <p className="mt-1 text-[10px] text-muted/70">{t("announcementHint")}</p>
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn-gold">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {pending ? common("saving") : common("save")}
        </button>
        <Message state={state} success="settingsSaved" />
      </div>
    </form>
  );
}

export function AdminCredentialsForm({ name, email }: { name: string; email: string }) {
  const t = useTranslations("admin");
  const auth = useTranslations("auth");
  const common = useTranslations("common");
  const [state, action, pending] = useActionState(updateAdminCredentials, initial);

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="admin-name">{auth("name")}</label>
          <input id="admin-name" name="name" defaultValue={name} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="admin-email">{auth("email")}</label>
          <input id="admin-email" name="email" type="email" defaultValue={email} required className="input" dir="ltr" />
        </div>
        <div>
          <label className="label" htmlFor="admin-current">{auth("password")}</label>
          <input id="admin-current" name="currentPassword" type="password" className="input" dir="ltr" autoComplete="current-password" placeholder={t("adminCredentialsHint")} />
        </div>
        <div>
          <label className="label" htmlFor="admin-new">{t("adminCredentials")}</label>
          <input id="admin-new" name="newPassword" type="password" minLength={8} className="input" dir="ltr" autoComplete="new-password" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn-outline">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {pending ? common("saving") : common("save")}
        </button>
        <Message state={state} success="settingsSaved" />
      </div>
    </form>
  );
}
