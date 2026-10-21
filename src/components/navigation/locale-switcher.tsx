"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const labels: Record<string, string> = { ar: "العربية", en: "English" };

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const t = useTranslations("nav");
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const change = (next: string) => {
    setOpen(false);
    if (next === locale) return;
    const search = typeof window !== "undefined" ? window.location.search : "";
    router.replace(`${pathname}${search}`, { locale: next });
  };

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("language")}
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-card/60 px-2.5 text-xs font-semibold text-muted transition hover:border-gold-500/50 hover:text-gold-300"
      >
        <Globe className="h-4 w-4" />
        <span className="uppercase">{locale}</span>
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute end-0 top-11 z-50 w-36 overflow-hidden rounded-xl border border-line bg-card shadow-card"
        >
          {routing.locales.map((item) => (
            <button
              key={item}
              role="option"
              aria-selected={item === locale}
              onClick={() => change(item)}
              className={cn(
                "flex w-full items-center justify-between px-3 py-2.5 text-xs font-semibold transition hover:bg-bg/60",
                item === locale ? "text-gold-300" : "text-muted",
              )}
            >
              {labels[item]}
              {item === locale && <Check className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
