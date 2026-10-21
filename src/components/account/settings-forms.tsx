"use client";

import { useActionState, useEffect } from "react";
import { Loader2, Save, ShieldCheck, Trash2 } from "lucide-react";
import { signOut } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { changePassword, deleteAccount, updateProfile, type ActionState } from "@/lib/actions";

const initial: ActionState = { ok: false };

function Feedback({ state, successKeys }: { state: ActionState; successKeys: string[] }) {
  const t = useTranslations("account");
  const auth = useTranslations("auth");
  if (state.ok && state.message && successKeys.includes(state.message)) {
    return <p className="text-xs font-semibold text-gold-300">{t(state.message)}</p>;
  }
  if (state.error) {
    const known = ["wrongPassword", "passwordShort", "emailTaken", "invalidEmail", "nameRequired"];
    return <p className="text-xs font-semibold text-nile-400">{known.includes(state.error) ? auth(state.error) : auth("genericError")}</p>;
  }
  return null;
}

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const t = useTranslations("account");
  const auth = useTranslations("auth");
  const common = useTranslations("common");
  const [state, action, pending] = useActionState(updateProfile, initial);

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">{auth("name")}</label>
          <input id="name" name="name" defaultValue={name} required minLength={2} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="email">{auth("email")}</label>
          <input id="email" name="email" type="email" defaultValue={email} required className="input" dir="ltr" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn-gold">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {pending ? common("saving") : common("save")}
        </button>
        <Feedback state={state} successKeys={["profileSaved"]} />
      </div>
    </form>
  );
}

export function PasswordForm() {
  const t = useTranslations("account");
  const auth = useTranslations("auth");
  const common = useTranslations("common");
  const [state, action, pending] = useActionState(changePassword, initial);

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="currentPassword">{t("currentPassword")}</label>
          <input id="currentPassword" name="currentPassword" type="password" required className="input" dir="ltr" autoComplete="current-password" />
        </div>
        <div>
          <label className="label" htmlFor="newPassword">{t("newPassword")}</label>
          <input id="newPassword" name="newPassword" type="password" required minLength={8} className="input" dir="ltr" autoComplete="new-password" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn-outline">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          {auth("password")}
        </button>
        <Feedback state={state} successKeys={["passwordChanged"]} />
      </div>
    </form>
  );
}

export function DeleteAccountForm() {
  const t = useTranslations("account");
  const common = useTranslations("common");
  const locale = useLocale();
  const [state, action, pending] = useActionState(deleteAccount, initial);

  useEffect(() => {
    if (state.ok) {
      void signOut({ redirectTo: `/${locale}` });
    }
  }, [state.ok, locale]);

  return (
    <form action={action} className="space-y-3">
      <p className="text-xs leading-6 text-muted">{t("deleteAccountHint")}</p>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <input name="confirmation" placeholder={t("deleteConfirm")} className="input" dir="ltr" />
        <button type="submit" disabled={pending} className="btn bg-nile-600 text-white hover:bg-nile-500 disabled:opacity-50">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          {t("deleteAccount")}
        </button>
      </div>
      {state.error && <p className="text-xs font-semibold text-nile-400">{common("error")}</p>}
    </form>
  );
}
