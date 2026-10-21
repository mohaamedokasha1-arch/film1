import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function SectionHeading({
  title,
  eyebrow,
  href,
  viewAllLabel,
  className,
}: {
  title: string;
  eyebrow?: string;
  href?: string;
  viewAllLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex items-end justify-between gap-4", className)}>
      <div>
        {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
        <h2 className="flex items-center gap-3 text-xl font-extrabold sm:text-2xl">
          <span className="inline-block h-6 w-1 rounded-full bg-gradient-to-b from-gold-300 to-gold-600" />
          {title}
        </h2>
      </div>
      {href && viewAllLabel && (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-muted transition hover:text-gold-300"
        >
          {viewAllLabel}
          <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
