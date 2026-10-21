import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Rating({ value, className, showStar = true }: { value: number; className?: string; showStar?: boolean }) {
  const rating = value > 0 ? value.toFixed(1) : "–";
  return (
    <span className={cn("inline-flex items-center gap-1 font-semibold", className)}>
      {showStar && <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />}
      {rating}
    </span>
  );
}
