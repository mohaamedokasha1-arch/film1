import { getTranslations } from "next-intl/server";
import type { Title } from "@/types";
import { MediaCard } from "@/components/media/media-card";
import { EmptyState } from "@/components/ui/empty-state";

export async function TitleGrid({ items, locale }: { items: Title[]; locale: string }) {
  const t = await getTranslations({ locale, namespace: "common" });

  if (!items.length) {
    return <EmptyState title={t("empty")} hint={t("emptyHint")} icon="search" />;
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
      {items.map((item, index) => (
        <div key={`${item.type}-${item.id}`} className="w-full [&>article]:w-full">
          <MediaCard title={item} locale={locale} priority={index < 6} />
        </div>
      ))}
    </div>
  );
}
