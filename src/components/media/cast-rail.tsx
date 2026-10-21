import Image from "next/image";
import { UserRound } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { CastMember } from "@/types";
import { profileUrl } from "@/lib/utils";

export async function CastRail({ cast, locale }: { cast: CastMember[]; locale: string }) {
  const t = await getTranslations({ locale, namespace: "media" });

  if (!cast?.length) {
    return <p className="text-sm text-muted">{t("noCast")}</p>;
  }

  return (
    <div className="no-scrollbar -mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
      {cast.slice(0, 14).map((member, index) => {
        const photo = profileUrl(member.profilePath);
        return (
          <div key={`${member.id ?? member.name}-${index}`} className="w-[112px] shrink-0 text-center">
            <div className="relative mx-auto h-[112px] w-[112px] overflow-hidden rounded-full border border-line bg-card">
              {photo ? (
                <Image src={photo} alt={member.name} fill sizes="112px" className="object-cover" />
              ) : (
                <span className="grid h-full w-full place-items-center text-muted">
                  <UserRound className="h-8 w-8" />
                </span>
              )}
            </div>
            <p className="mt-2 truncate text-xs font-bold text-fg">{member.name}</p>
            {member.character && <p className="truncate text-[10px] text-muted">{member.character}</p>}
          </div>
        );
      })}
    </div>
  );
}
