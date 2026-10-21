"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";

const STORAGE_KEY = "farja-theme";

export function ThemeToggle({ className }: { className?: string }) {
  const t = useTranslations("nav");
  const [light, setLight] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const isLight = stored === "light";
    setLight(isLight);
    document.documentElement.classList.toggle("light", isLight);
    document.documentElement.classList.toggle("dark", !isLight);
  }, []);

  const toggle = () => {
    const next = !light;
    setLight(next);
    document.documentElement.classList.toggle("light", next);
    document.documentElement.classList.toggle("dark", !next);
    window.localStorage.setItem(STORAGE_KEY, next ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t("theme")}
      title={light ? t("dark") : t("light")}
      className={`grid h-9 w-9 place-items-center rounded-full border border-line bg-card/60 text-muted transition hover:border-gold-500/50 hover:text-gold-300 ${className ?? ""}`}
    >
      {mounted && light ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  );
}
