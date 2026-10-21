import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  pathname,
  query,
  labels,
  className,
}: {
  page: number;
  totalPages: number;
  pathname: string;
  query: Record<string, string | number | undefined>;
  labels: { previous: string; next: string; page: string; of: string };
  className?: string;
}) {
  if (totalPages <= 1) return null;
  const safe = Math.min(Math.max(1, page), totalPages);
  const pages = new Set<number>([1, totalPages, safe - 1, safe, safe + 1]);
  const visible = [...pages].filter((value) => value >= 1 && value <= totalPages).sort((a, b) => a - b);

  const hrefFor = (target: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== "" && key !== "page") params.set(key, String(value));
    }
    if (target > 1) params.set("page", String(target));
    const suffix = params.toString();
    return suffix ? `${pathname}?${suffix}` : pathname;
  };

  return (
    <nav className={cn("flex flex-wrap items-center justify-center gap-2", className)} aria-label="Pagination">
      <Link
        href={hrefFor(safe - 1)}
        aria-disabled={safe <= 1}
        className={cn(
          "inline-flex h-10 items-center gap-1 rounded-full border border-line px-4 text-xs font-semibold transition",
          safe <= 1 ? "pointer-events-none opacity-40" : "hover:border-gold-500/60 hover:text-gold-300",
        )}
      >
        <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
        {labels.previous}
      </Link>

      <div className="flex items-center gap-1">
        {visible.map((value, index) => {
          const previous = visible[index - 1];
          return (
            <span key={value} className="flex items-center gap-1">
              {previous && value - previous > 1 && <span className="px-1 text-muted">…</span>}
              <Link
                href={hrefFor(value)}
                aria-current={value === safe ? "page" : undefined}
                className={cn(
                  "grid h-10 w-10 place-items-center rounded-full border text-xs font-bold transition",
                  value === safe
                    ? "border-gold-500 bg-gold-500 text-night-950"
                    : "border-line text-muted hover:border-gold-500/60 hover:text-gold-300",
                )}
              >
                {value}
              </Link>
            </span>
          );
        })}
      </div>

      <Link
        href={hrefFor(safe + 1)}
        aria-disabled={safe >= totalPages}
        className={cn(
          "inline-flex h-10 items-center gap-1 rounded-full border border-line px-4 text-xs font-semibold transition",
          safe >= totalPages ? "pointer-events-none opacity-40" : "hover:border-gold-500/60 hover:text-gold-300",
        )}
      >
        {labels.next}
        <ChevronRight className="h-4 w-4 rtl:rotate-180" />
      </Link>
      <span className="ms-2 text-[11px] text-muted">
        {labels.page} {safe} {labels.of} {totalPages}
      </span>
    </nav>
  );
}
