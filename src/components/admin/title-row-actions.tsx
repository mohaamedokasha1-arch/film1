"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, Star, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/** Quick publish / feature / delete controls for the titles table. */
export function TitleRowActions({
  id,
  published,
  featured,
}: {
  id: string;
  published: boolean;
  featured: boolean;
}) {
  const t = useTranslations("studio");
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);

  const patch = async (body: Record<string, unknown>, key: string) => {
    setPending(key);
    try {
      await fetch(`/api/admin/titles/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      router.refresh();
    } finally {
      setPending(null);
    }
  };

  const remove = async () => {
    if (!window.confirm(t("deleteConfirm"))) return;
    setPending("delete");
    try {
      await fetch(`/api/admin/titles/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="flex items-center justify-end gap-1.5">
      <button
        type="button"
        onClick={() => void patch({ published: !published }, "publish")}
        title={published ? t("draft") : t("published")}
        className={cn(
          "grid h-8 w-8 place-items-center rounded-lg border transition",
          published
            ? "border-gold-500/40 bg-gold-500/10 text-gold-300"
            : "border-line text-muted hover:text-fg",
        )}
      >
        {pending === "publish" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : published ? (
          <Eye className="h-3.5 w-3.5" />
        ) : (
          <EyeOff className="h-3.5 w-3.5" />
        )}
      </button>

      <button
        type="button"
        onClick={() => void patch({ featured: !featured }, "featured")}
        title={t("featured")}
        className={cn(
          "grid h-8 w-8 place-items-center rounded-lg border transition",
          featured
            ? "border-gold-500/40 bg-gold-500/10 text-gold-300"
            : "border-line text-muted hover:text-fg",
        )}
      >
        {pending === "featured" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Star className={cn("h-3.5 w-3.5", featured && "fill-current")} />
        )}
      </button>

      <button
        type="button"
        onClick={() => void remove()}
        title={t("delete")}
        className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition hover:border-nile-500/50 hover:text-nile-300"
      >
        {pending === "delete" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
