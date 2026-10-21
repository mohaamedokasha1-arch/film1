import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { EmptyState } from "@/components/ui/empty-state";

export default async function LocaleNotFound() {
  const t = await getTranslations("errors");
  const common = await getTranslations("common");
  return (
    <div className="container-page flex min-h-[60vh] items-center justify-center py-16">
      <EmptyState
        title={t("notFoundTitle")}
        hint={t("notFoundBody")}
        icon="search"
        className="max-w-lg"
        action={
          <Link href="/" className="btn-gold mt-2">
            {common("goHome")}
          </Link>
        }
      />
    </div>
  );
}
