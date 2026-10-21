import { ShieldCheck, Sparkles, Star } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Logo } from "@/components/brand/logo";
import { siteConfig } from "@/config/site";

export async function AuthShell({
  headline,
  subtitle,
  children,
}: {
  headline: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "auth" });
  return (
    <div className="container-page py-10 sm:py-16">
      <div className="grid items-stretch gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative hidden overflow-hidden rounded-3xl border border-line/70 bg-night-900 p-10 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -end-24 -top-24 h-72 w-72 rounded-full bg-gold-500/20 blur-3xl" />
          <div className="absolute -bottom-32 -start-20 h-80 w-80 rounded-full bg-nile-600/20 blur-3xl" />
          <div className="absolute inset-0 grain" />
          <div className="relative">
            <Logo locale="ar" />
            <p className="mt-10 max-w-sm font-display text-3xl font-extrabold leading-snug text-white">
              {siteConfig.tagline.ar}
            </p>
            <p className="mt-4 max-w-sm text-sm leading-7 text-ink-300/80">
              {siteConfig.description.ar}
            </p>
          </div>
          <div className="relative grid gap-3">
            {[
              { icon: Star, text: "بيانات حقيقية من TMDB — أكثر من 2,500 عمل" },
              { icon: Sparkles, text: "7 سيرفرات تشغيل لكل فيلم ومسلسل" },
              { icon: ShieldCheck, text: "كلمات مرور مشفّرة وجلسات آمنة" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold text-white/80 backdrop-blur">
                <item.icon className="h-4 w-4 text-gold-400" />
                {item.text}
              </div>
            ))}
          </div>
        </div>

        <div className="surface mx-auto w-full max-w-md self-center p-6 sm:p-8">
          <p className="eyebrow mb-2">{t("or")} · Farja</p>
          <h1 className="text-2xl font-extrabold">{headline}</h1>
          <p className="mt-2 text-xs leading-6 text-muted">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
