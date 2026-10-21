import { Megaphone } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Reserved advertising slot.
 * To go live: drop your AdSense / network snippet inside this component and
 * keep the same ids so campaigns can be targeted by placement.
 */
export function AdSlot({
  id,
  size,
  label,
  className,
}: {
  id: keyof typeof siteConfig.ads.slots;
  size?: string;
  label?: string;
  className?: string;
}) {
  if (!siteConfig.ads.enabled || !siteConfig.features.showAdPlaceholders) return null;
  const slot = siteConfig.ads.slots[id];
  if (!slot) return null;

  return (
    <div
      id={`ad-slot-${id}`}
      data-ad-slot={id}
      className={cn(
        "mx-auto flex w-full max-w-5xl items-center justify-center gap-3 rounded-xl border border-dashed border-line/70 bg-card/25 px-4 py-5 text-center",
        className,
      )}
    >
      <Megaphone className="h-4 w-4 text-muted/60" aria-hidden />
      <div className="text-[11px] leading-5 text-muted/70">
        <span className="font-semibold uppercase tracking-[0.2em] text-muted/80">{label ?? "AD SLOT"}</span>
        <span className="mx-2 text-line">•</span>
        {size ?? slot.size}
        <span className="mx-2 text-line">•</span>
        <span>{slot.placement}</span>
      </div>
    </div>
  );
}
