/**
 * Farja — single source of truth for branding, navigation and ads.
 * Change the platform name, colours or copy here and the whole site follows.
 */
export const siteConfig = {
  name: { ar: "فَرجة", en: "Farja" },
  nameFallback: "Farja",
  tagline: {
    ar: "سينما مصرية… بنكهة عالمية",
    en: "Egyptian cinema, world-class streaming",
  },
  description: {
    ar: "منصة بث مصرية للأفلام والمسلسلات: أكثر من سيرفر تشغيل، مفضلة وسجل مشاهدة، وواجهة عربية وإنجليزية بالكامل.",
    en: "An Egyptian streaming platform for films and series: multiple servers, watchlist and history, with a fully bilingual Arabic/English interface.",
  },
  url: process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "https://farja.app",
  email: "hello@farja.app",
  adminEmailDefault: "admin@farja.app",
  adminPasswordDefault: "Admin@12345",
  socials: {
    instagram: "https://instagram.com",
    x: "https://x.com",
    youtube: "https://youtube.com",
  },
  theme: {
    background: "#07070B",
    surface: "#101018",
    gold: "#D4AF37",
    red: "#C8102E",
  },
  /** Ready-to-fill ad slots. Paste AdSense (or any network) code inside <AdSlot>. */
  ads: {
    enabled: true,
    slots: {
      "home-top": { size: "970×90", placement: "Homepage top banner" },
      "home-between-rows": { size: "970×90", placement: "Between homepage rows" },
      "browse-top": { size: "728×90", placement: "Above browse grids" },
      "before-player": { size: "970×250", placement: "Above the video player" },
      "title-sidebar": { size: "300×250", placement: "Title page sidebar" },
      "footer-top": { size: "970×90", placement: "Above the footer" },
    },
  },
  nav: [
    { key: "home", href: "/" },
    { key: "movies", href: "/movies" },
    { key: "series", href: "/tv" },
    { key: "trending", href: "/trending" },
    { key: "topRated", href: "/top-rated" },
    { key: "arabic", href: "/arabic" },
  ],
  genresNav: [
    "action",
    "comedy",
    "drama",
    "thriller",
    "romance",
    "animation",
    "crime",
    "documentary",
  ],
  stats: {
    servers: 7,
    languages: 2,
  },
  features: {
    /** Show the ad placeholders on the site. Turn off when real ads are live. */
    showAdPlaceholders: true,
    /** Number of items per homepage rail */
    railSize: 18,
  },
} as const;

export type SiteConfig = typeof siteConfig;
