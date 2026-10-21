import { Film, SearchX, ServerCrash } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  hint,
  icon = "film",
  action,
  className,
}: {
  title: string;
  hint?: string;
  icon?: "film" | "search" | "server";
  action?: React.ReactNode;
  className?: string;
}) {
  const Icon = icon === "search" ? SearchX : icon === "server" ? ServerCrash : Film;
  return (
    <div className={cn("surface flex flex-col items-center justify-center gap-3 px-6 py-14 text-center", className)}>
      <span className="grid h-14 w-14 place-items-center rounded-full border border-line bg-bg/60">
        <Icon className="h-6 w-6 text-gold-400/80" />
      </span>
      <h3 className="text-lg font-bold">{title}</h3>
      {hint && <p className="max-w-md text-sm leading-6 text-muted">{hint}</p>}
      {action}
    </div>
  );
}
