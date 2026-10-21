import { Play } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function Logo({ locale, className, compact = false }: { locale: string; className?: string; compact?: boolean }) {
  const name = locale === "ar" ? siteConfig.name.ar : siteConfig.name.en;
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label={name}>
      <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 shadow-glow transition-transform duration-300 group-hover:scale-105">
        <span className="absolute inset-0 opacity-40 [background:radial-gradient(circle_at_30%_20%,#fff,transparent_60%)]" />
        <Play className="relative h-[18px] w-[18px] translate-x-px fill-night-950 text-night-950" />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[22px] font-extrabold tracking-tight text-fg">{name}</span>
          <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.38em] text-gold-400/90">Farja</span>
        </span>
      )}
    </Link>
  );
}
