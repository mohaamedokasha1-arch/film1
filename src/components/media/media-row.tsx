"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Title } from "@/types";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/section-heading";
import { MediaCard } from "./media-card";

export function MediaRow({
  title,
  items,
  href,
  eyebrow,
  className,
  variant = "default",
}: {
  title: string;
  items: Title[];
  href?: string;
  eyebrow?: string;
  className?: string;
  variant?: "default" | "wide";
}) {
  const locale = useLocale();
  const t = useTranslations("common");
  const scroller = useRef<HTMLDivElement>(null);

  if (!items.length) return null;

  const scroll = (direction: 1 | -1) => {
    const node = scroller.current;
    if (!node) return;
    node.scrollBy({ left: direction * node.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <section className={cn("group/row relative", className)}>
      <div className="flex items-end justify-between">
        <SectionHeading title={title} eyebrow={eyebrow} href={href} viewAllLabel={t("viewAll")} className="mb-3" />
        <div className="mb-4 hidden items-center gap-1.5 md:flex">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="scroll left"
            className="grid h-8 w-8 place-items-center rounded-full border border-line text-muted transition hover:border-gold-500/60 hover:text-gold-300"
          >
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="scroll right"
            className="grid h-8 w-8 place-items-center rounded-full border border-line text-muted transition hover:border-gold-500/60 hover:text-gold-300"
          >
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </button>
        </div>
      </div>

      <div
        ref={scroller}
        className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2"
      >
        {items.map((item, index) => (
          <div key={`${item.type}-${item.id}`} className={cn("snap-start", variant === "wide" && "w-[220px] sm:w-[240px]")}>
            <MediaCard title={item} locale={locale} priority={index < 3} />
          </div>
        ))}
      </div>
    </section>
  );
}
