"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { signIn } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";

export function LoginForm({ next }: { next?: string }) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError("invalidCredentials");
        return;
      }
      router.push(next && next.startsWith("/") ? next : "/account");
      router.refresh();
    } catch {
      setError("genericError");
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label" htmlFor="email">{t("email")}</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t("emailPlaceholder")}
          className="input"
          dir="ltr"
        />
      </div>

      <div>
        <label className="label" htmlFor="password">{t("password")}</label>
        <div className="relative">
          <input
            id="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={t("passwordPlaceholder")}
            className="input pe-11"
            dir="ltr"
          />
          <button
            type="button"
            onClick={() => setShow((value) => !value)}
            aria-label={show ? "hide password" : "show password"}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-fg"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-nile-500/30 bg-nile-500/10 px-4 py-3 text-xs font-semibold text-nile-400">
          {t(error === "invalidCredentials" ? "invalidCredentials" : "genericError")}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-gold w-full !py-3">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
        {t("login")}
      </button>

      <p className="text-center text-xs text-muted">
        {t("noAccount")}{" "}
        <Link href={{ pathname: "/register", query: next ? { next } : undefined }} className="font-bold text-gold-300 hover:underline">
          {t("createOne")}
        </Link>
      </p>

      <p className="rounded-xl border border-line/70 bg-card/40 px-3 py-2.5 text-center text-[10px] leading-5 text-muted/70">
        {locale === "ar"
          ? "لتفعيل الحسابات والمفضلة على قاعدة بيانات حقيقية، أضف DATABASE_URL في إعدادات النشر."
          : "To use persistent accounts and watchlists, add DATABASE_URL to your deployment environment."}
      </p>
    </form>
  );
}
