"use client";

import { useActionState, useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { registerUser, type ActionState } from "@/lib/actions";

const initialState: ActionState = { ok: false };

export function RegisterForm({ next }: { next?: string }) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [state, action, pending] = useActionState(registerUser, initialState);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!state.ok || signingIn) return;
    setSigningIn(true);
    const run = async () => {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (!result?.error) {
        router.push(next && next.startsWith("/") ? next : "/account");
        router.refresh();
      } else {
        router.push("/login");
      }
    };
    void run();
  }, [state.ok, signingIn, email, password, next, router]);

  const errorKey = state.error;
  const errorText =
    errorKey === "emailTaken" || errorKey === "passwordMismatch" || errorKey === "passwordShort" ||
    errorKey === "invalidEmail" || errorKey === "nameRequired"
      ? t(errorKey)
      : t("genericError");

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label" htmlFor="name">{t("name")}</label>
        <input id="name" name="name" required minLength={2} placeholder={t("namePlaceholder")} className="input" autoComplete="name" />
      </div>
      <div>
        <label className="label" htmlFor="email">{t("email")}</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t("emailPlaceholder")}
          className="input"
          dir="ltr"
          autoComplete="email"
        />
      </div>
      <div>
        <label className="label" htmlFor="password">{t("password")}</label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={t("passwordPlaceholder")}
            className="input pe-11"
            dir="ltr"
            autoComplete="new-password"
          />
          <button type="button" onClick={() => setShow((value) => !value)} className="absolute end-3 top-1/2 -translate-y-1/2 text-muted hover:text-fg">
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div>
        <label className="label" htmlFor="confirmPassword">{t("confirmPassword")}</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type={show ? "text" : "password"}
          required
          minLength={8}
          placeholder={t("passwordPlaceholder")}
          className="input"
          dir="ltr"
          autoComplete="new-password"
        />
      </div>

      {state.error && (
        <p className="rounded-xl border border-nile-500/30 bg-nile-500/10 px-4 py-3 text-xs font-semibold text-nile-400">
          {errorText}
        </p>
      )}

      <button type="submit" disabled={pending || signingIn} className="btn-gold w-full !py-3">
        {pending || signingIn ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
        {t("register")}
      </button>

      <p className="text-center text-xs text-muted">
        {t("hasAccount")}{" "}
        <Link href="/login" className="font-bold text-gold-300 hover:underline">
          {t("loginNow")}
        </Link>
      </p>
    </form>
  );
}
