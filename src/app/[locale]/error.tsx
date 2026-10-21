"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function LocaleError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("errors");
  const common = useTranslations("common");

  useEffect(() => {
    console.error("[farja] route error:", error);
  }, [error]);

  return (
    <div className="container-page flex min-h-[60vh] items-center justify-center py-16">
      <div className="surface max-w-md p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-line bg-bg/50">
          <AlertTriangle className="h-6 w-6 text-gold-400" />
        </span>
        <h1 className="mt-5 text-xl font-extrabold">{t("errorTitle")}</h1>
        <p className="mt-2 text-sm leading-6 text-muted">{t("errorBody")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn-gold">
            <RotateCcw className="h-4 w-4" /> {common("tryAgain")}
          </button>
          <Link href="/" className="btn-outline">
            {common("goHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
