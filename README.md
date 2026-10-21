# فَرجة · Farja

منصة بث سينمائي مصرية احترافية (بنمط Netflix / Shahid) مبنية بـ **Next.js 15 (App Router) + TypeScript + Tailwind CSS**،
بواجهة عربية أولاً تدعم RTL وتُبدّل إلى الإنجليزية LTR بضغطة واحدة، مع بيانات أفلام ومسلسلات حقيقية من **TMDB**،
وسيرفرات تشغيل متعددة، ومفضلة وسجل مشاهدة، ولوحة تحكم للمشرف — وبدون أي بيانات وهمية.

> **الاسم والشعار والألوان والروابط موجودة كلها في ملف واحد:** `src/config/site.ts`.
> غيّر الاسم من هناك (العربية والإنجليزية) وسيتبعه الموقع بالكامل: الترويسة، الفوتر، الميتاداتا، خريطة الموقع، وقاعدة البيانات.

---

## المحتويات

- [المزايا](#المزايا)
- [التقنيات](#التقنيات)
- [التشغيل المحلي](#التشغيل-المحلي)
- [متغيرات البيئة](#متغيرات-البيئة)
- [النشر على Vercel (بدون أي أوامر يدوية)](#النشر-على-vercel-بدون-أي-أوامر-يدوية)
- [استوديو المحتوى: أضف أي فيلم برابط](#استوديو-المحتوى-أضف-أي-فيلم-برابط)
- [بيانات الدخول للمشرف](#بيانات-الدخول-للمشرف)
- [مصدر البيانات: TMDB](#مصدر-البيانات-tmdb)
- [قاعدة البيانات: Neon](#قاعدة-البيانات-neon)
- [ماذا يحدث بدون مفاتيح؟](#ماذا-يحدث-بدون-مفاتيح)
- [التخصيص](#التخصيص)
- [بنية المشروع](#بنية-المشروع)
- [الأوامر](#الأوامر)
- [المسارات](#المسارات)
- [حل المشكلات](#حل-المشكلات)
- [ملاحظات قانونية](#ملاحظات-قانونية)

---

## المزايا

**الواجهة والتجربة**

- عربية افتراضية بنسبة 100% واتجاه RTL كامل، مع تبديل فوري إلى الإنجليزية LTR — كل النصوص من `next-intl` (لا نص مكتوب داخل المكوّنات).
- ثيم داكن افتراضي (`#07070B` مع الذهبي `#D4AF37`) + ثيم فاتح اختياري، وحفظ التفضيل في المتصفح.
- خطوط Cairo / Tajawal، تصميم mobile-first، وأنميشن Framer Motion.
- سلايدر رئيسي تلقائي (8 ثوانٍ لكل شريحة، يتوقف عند المرور بالماوس)، شرائح أفقيّة، وشبكات أفلام مع فلاتر.
- هيكل تحميل (skeletons) لكل صفحة استعراض، صفحات خطأ و404 مخصّصة، وحالات فراغ واضحة.

**المحتوى**

- **2,630 عنوانًا حقيقيًا** (1,736 فيلمًا + 894 مسلسلًا، منها 258 عملًا عربيًا) مضمّنة داخل المشروع، مبنية من تصديرات TMDB الرسمية.
- عند إضافة مفتاح TMDB: بحث وتصنيفات وبيانات تفصيلية **مباشرة من TMDB** مع تخزين مؤقت على السيرفر لمدة 6 ساعات.
- تصفّح: أفلام، مسلسلات، عربي، الأعلى تقييمًا، الأكثر رواجًا، 24 تصنيفًا، بحث فوري + فلاتر (التصنيف، السنة، التقييم، الترتيب).
- صفحة عمل: خلفية سينمائية، ملخص، تقييم، طاقم العمل، حلقات المواسم، أعمال مشابهة، إعلان تشويقي (Trailer).
- **7 سيرفرات تشغيل** (`vidlink`, `VidSrc`, `Embed.su`, `Videasy`, `2embed`, `MultiEmbed`, `VidSrc.cc`) مع تبديل بينها داخل مشغّل 16:9 متجاوب و`sandbox` آمن، ونموذج للإبلاغ عن مشكلة في السيرفر.

**الحسابات**

- تسجيل ودخول بـ NextAuth (Credentials + JWT) وكلمات مرور مشفّرة بـ bcrypt.
- مفضلة (Watchlist) وسجل مشاهدة مع "تابِع من حيث توقفت" ونسبة المشاهدة.
- صفحة حساب: الملف الشخصي، تغيير كلمة المرور، حذف الحساب.
- لوحة تحكم: إحصائيات، إدارة المستخدمين (ترقية/حذف)، إعدادات الموقع وبيانات دخول المشرف.
- حماية المسارات: زائر غير مسجّل يطلب `/account` أو `/admin` يحصل على تحويل 307 حقيقي إلى صفحة الدخول مع `?next=`.

**استوديو المحتوى (لوحة التحكم)**

- إضافة أي فيلم أو مسلسل **برابط تشغيل** من لوحة التحكم، ويظهر فورًا في الصفحة الرئيسية والبحث والتصفح وصفحة العمل.
- كل التفاصيل قابلة للتعديل: الاسم بالعربية والإنجليزية، الوصف، البوستر والخلفية، الإعلان، السنة، التقييم، المدة، التصنيفات، طاقم العمل، عدد المواسم والحلقات.
- عدة روابط تشغيل لكل عمل (Embed أو ملف فيديو مباشر mp4 / m3u8) مع دعم `{season}` و`{episode}` للمسلسلات.
- استيراد سريع من كتالوج الموقع المضمّن (أو من TMDB برقم العمل) لتعبئة البيانات تلقائيًا.
- إضافة روابط تشغيل خاصة لأي عنوان موجود في TMDB، تظهر قبل السيرفرات الافتراضية في المشغّل.
- نشر/إخفاء أو تمييز أي عنوان لعرضه في السلايدر الرئيسي بضغطة واحدة.

**الإنتاج**

- SEO كامل: ميتاداتا لكل صفحة، Open Graph بصورة `public/og.png`، `robots.txt`، `sitemap.xml`، وبيانات منظمة.
- رؤوس أمان (`nosniff`, `Referrer-Policy`, `X-Frame-Options`)، ولا مفاتيح مكتوبة داخل الكود.
- أمكان إعلانات جاهزة (AdSense أو أي شبكة) في 6 مواضع.

---

## التقنيات

| الطبقة | التقنية |
| --- | --- |
| الإطار | Next.js 15.5 (App Router, Server Components, Server Actions) |
| اللغة | TypeScript 5.8 (strict) |
| التنسيق | Tailwind CSS 3.4 + مكوّنات بنمط shadcn/ui (Radix) + Framer Motion |
| الترجمة | next-intl 4 (ar افتراضي / en) |
| المصادقة | NextAuth 5 (beta) — Credentials + JWT، bcryptjs |
| قاعدة البيانات | Prisma 6 + PostgreSQL (Neon / Vercel Postgres / Supabase) |
| البيانات | TMDB API v3/v4 + كتالوج TMDB مضمّن (fallback) |
| الأيقونات | lucide-react |

---

## التشغيل المحلي

المتطلب الوحيد: **Node.js 20+** (تم الاختبار على Node 22) و npm.

```bash
npm install          # يثبّت الحزم ويشغّل prisma generate تلقائيًا
cp .env.example .env.local
npm run dev          # http://localhost:3000  ← يحوّلك إلى /ar
```

- **بدون أي متغيّر بيئة** سيعمل الموقع فورًا: بيانات من الكتالوج المضمّن، والحسابات في مخزن ملفات محلي `.data/store.json`
  (مفيد للتجربة والمراجعة، وليس للإنتاج).
- **مع `DATABASE_URL`** سيُنشأ جدول Prisma تلقائيًا عند البناء، وتُحفظ الحسابات في PostgreSQL.
- **مع `TMDB_API_KEY`** تصبح كل البيانات حيّة من TMDB (بحث، تصنيفات، تفاصيل، مواسم).

للإنتاج محليًا:

```bash
npm run build && npm start
```

---

## متغيّرات البيئة

انسخ `.env.example` إلى `.env.local` محليًا، وأضف نفس المتغيّرات في
**Vercel → Project → Settings → Environment Variables** (لكل من Production وPreview).

| المتغيّر | مطلوب؟ | الوصف |
| --- | --- | --- |
| `DATABASE_URL` | للإنتاج | رابط PostgreSQL (Neon/Supabase/Vercel Postgres). مثال: `postgresql://user:pass@host/db?sslmode=require` |
| `NEXTAUTH_SECRET` | **نعم في الإنتاج** | مفتاح توقيع الجلسات — `openssl rand -base64 32` |
| `NEXTAUTH_URL` | نعم في الإنتاج | رابط الموقع الكامل، مثل `https://farja.vercel.app` |
| `NEXT_PUBLIC_SITE_URL` | مستحسن | نفس الرابط أعلاه؛ يُستخدم في الميتاداتا وخريطة الموقع وOpen Graph |
| `TMDB_API_KEY` | اختياري | مفتاح TMDB v3 — يفعّل البيانات الحيّة |
| `TMDB_READ_TOKEN` | اختياري | بديل للمفتاح: Read Access Token (v4 Bearer) |
| `ADMIN_EMAIL` | اختياري | بريد المشرف؛ الافتراضي `admin@farja.app` |
| `ADMIN_PASSWORD` | اختياري | كلمة مرور المشرف؛ الافتراضية `Admin@12345` |
| `NEXT_IMAGE_OPTIMIZATION` | اختياري | `1` لتفعيل تحسين صور Vercel (الافتراضي معطّل ليعمل على أي استضافة بدون تكاليف) |

> لا تضع أي مفتاح داخل الكود ولا ترفع `.env.local` إلى Git (مستثنى بالفعل في `.gitignore`).

---

## النشر على Vercel (بدون أي أوامر يدوية)

المشروع مُعدّ لبناء تلقائي بالكامل: `npm install` → `prisma generate` → `prisma db push` → `next build`.
لا تحتاج إلى تشغيل أي أمر في جهازك، ولا إلى `prisma migrate`، ولا إلى الخطوة `vercel` CLI.

**1) ارفع المشروع إلى GitHub** (إن لم يكن مرفوعًا):

```bash
git add . && git commit -m "Initial commit" && git push
```

**2) أنشئ قاعدة بيانات على Neon** — [neon.tech](https://neon.tech) → *New Project* → انسخ `Connection string`
(تأكد من وجود `?sslmode=require`). تبقى مجانية للاستخدام الشخصي.

**3) احصل على مفتاح TMDB** — [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api) → *Create API Key*
(مجاني، ويفضّل نوع Developer). انسخ **API Key (v3)** أو **Read Access Token (v4)**.

**4) استورد المشروع في Vercel** — [vercel.com/new](https://vercel.com/new) → اختر مستودع GitHub → *Import*.
اترك كل الإعدادات كما هي (Framework: Next.js، Build Command: `npm run build` — معرّفة في `vercel.json`).

**5) أضف المتغيّرات** في خطوة الاستيراد (Environment Variables):

```
DATABASE_URL          = postgresql://...neon.tech/...?sslmode=require
NEXTAUTH_SECRET       = <ناتج openssl rand -base64 32>
NEXTAUTH_URL          = https://<your-project>.vercel.app
NEXT_PUBLIC_SITE_URL  = https://<your-project>.vercel.app
TMDB_API_KEY          = <مفتاح TMDB>
```

**6) اضغط Deploy.** أثناء البناء سيُنشئ `scripts/prepare-db.mjs` الجداول تلقائيًا
(`prisma db push --accept-data-loss --skip-generate`)، ثم يُنشأ حساب المشرف تلقائيًا عند أول طلب لتسجيل الدخول.
لا توجد أي خطوة يدوية بعد ذلك.

**بعد أول نشر:** إن ربطت نطاقًا خاصًا، حدّث `NEXTAUTH_URL` و`NEXT_PUBLIC_SITE_URL` إلى النطاق الجديد ثم أعد النشر (Redeploy).

> إذا فشل `prisma db push` يتوقف البناء برسالة واضحة بدلًا من نشر موقع معطّل — راجع `DATABASE_URL` و SSL.

---

## استوديو المحتوى: أضف أي فيلم برابط

كل ما تحتاجه لإضافة عمل جديد: **الاسم + رابط التشغيل**. الباقي اختياري.

### من اللوحة

1. سجّل الدخول كمشرف ثم افتح **`/ar/admin/titles`**.
2. اضغط **«أضف عملًا جديدًا»**.
3. (اختياري) اكتب اسم الفيلم في **الاستيراد السريع** لملء البيانات من كتالوج الموقع تلقائيًا، أو أدخل رقم العمل في TMDB واضغط «استيراد».
4. اكتب الاسم بالعربية/الإنجليزية، وأضف **رابط التشغيل** (يمكن إضافة أكثر من سيرفر).
   - رابط Embed عادي: `https://vidsrc.xyz/embed/movie/155`
   - ملف فيديو مباشر: `https://cdn.example.com/movie.mp4` أو `https://cdn.example.com/master.m3u8`
   - للمسلسلات: `https://example.com/embed/{season}/{episode}` — يتم استبدال القيم تلقائيًا.
5. اختر **منشور** (يظهر للزوار) و**مميّز** (يظهر في السلايدر) ثم اضغط **حفظ**.
6. ستجد العمل فورًا على `/ar` و`/ar/movies` وفي البحث، ورابطه `/{locale}/title/{type}/{numericId}`.

### سيرفرات تشغيل لأعمال TMDB الموجودة

افتح **`/ar/admin/streams`** وأضف: النوع (فيلم/مسلسل) + رقم TMDB + اسم السيرفر + الرابط.
تظهر هذه الروابط **أولًا** في مشغّل الفيديو قبل السيرفرات العامة، ويمكن حذفها في أي وقت.

### واجهة API (اختيارية)

كل العمليات محمية بجلسة المشرف (كوكي `authjs.session-token`)، وتعمل بالـ JSON:

```bash
# كل العناوين المضافة
curl -b cookies.txt http://localhost:3000/api/admin/titles

# إضافة فيلم برابط
curl -b cookies.txt -X POST http://localhost:3000/api/admin/titles \
  -H 'content-type: application/json' \
  -d '{"type":"movie","titleAr":"اسم الفيلم","titleEn":"Movie name",
       "year":2025,"genres":["action"],
       "streams":[{"label":"سيرفر 1","url":"https://example.com/embed/123","quality":"FHD"}],
       "published":true,"featured":false}'

# تعديل / حذف
curl -b cookies.txt -X PATCH  http://localhost:3000/api/admin/titles/<id> -H 'content-type: application/json' -d '{"published":false}'
curl -b cookies.txt -X DELETE http://localhost:3000/api/admin/titles/<id>

# سيرفرات TMDB
curl -b cookies.txt -X POST http://localhost:3000/api/admin/streams \
  -H 'content-type: application/json' \
  -d '{"mediaType":"tv","tmdbId":1399,"label":"سيرفري","url":"https://example.com/s/{season}/{episode}","quality":"HD"}'
```

> العناوين المضافة تُحفظ في جدولَي `CustomTitle` و`StreamSource` داخل PostgreSQL.
> أرقامها تبدأ من `9000000` حتى لا تتعارض مع أرقام TMDB.
>
> ⚠️ بدون `DATABASE_URL` تُحفظ العناوين في ملف مؤقت (`.data/store.json`) للتجربة المحلية فقط — على Vercel لن تدوم بعد إعادة النشر.
> اربط قاعدة بيانات قبل إضافة محتوى حقيقي.

### بيانات الدخول للمشرف

| الحقل | القيمة الافتراضية |
| --- | --- |
| البريد | `admin@farja.app` |
| كلمة المرور | `Admin@12345` |

- يُنشأ الحساب تلقائيًا (bcrypt) عند أول عملية دخول/تسجيل — ولا يعطّل البناء أبدًا.
- لتغييرهما: عيّن `ADMIN_EMAIL` و`ADMIN_PASSWORD` قبل أول نشر، أو عدّلهما لاحقًا من
  **`/ar/admin/settings`** (اسم المشرف، البريد، وكلمة المرور).
- يظهر تحذير في لوحة التحكم ما دامت كلمة المرور الافتراضية مستخدمة، ويختفي تلقائيًا بعد تغييرها.

> ⚠️ **غيّر كلمة المرور الافتراضية فورًا بعد أول دخول في الإنتاج.** ملفات هذا المشروع عامة، وكلمة المرور هذه معروفة لأي شخص يقرأ README.

---

## مصدر البيانات: TMDB

- عند وجود `TMDB_API_KEY` أو `TMDB_READ_TOKEN`: كل الصفحات تقرأ من `api.themoviedb.org` (لغة `ar-SA` أو `en-US`)
  مع `revalidate: 21600` (6 ساعات) لتقليل الاستهلاك وتسريع الاستجابة. المفتاح يبقى على السيرفر فقط.
- بدون مفتاح: يعمل الموقع على **`src/data/catalog.json`** — 2,630 عنوانًا حقيقيًا مستخرجًا من تصديرات TMDB
  (البيانات الوصفية، البوسترات، التقييمات، التصنيفات، طاقم العمل، المواسم والحلقات). لا يتم توليد أو اختراع أي بيانات.
- لإعادة بناء الكتالوج من تصديرات TMDB:

```bash
python3 scripts/build_catalog.py \
  --movies  ./datasets/movies_metadata.csv \
  --tv      ./datasets/TMDB_tv_dataset_v3.csv \
  --credits ./datasets/tmdb_5000_credits.csv
```

  (ملفات CSV الضخمة مستثناة من Git في `.gitignore`؛ نزّلها مرة واحدة عند الحاجة فقط.)

- الصور تُحمَّل من `image.tmdb.org`؛ عند غياب بوستر يظهر بديل متدرّج أنيق بدل صورة مكسورة.

---

## قاعدة البيانات: Neon

1. [neon.tech](https://neon.tech) → *New Project* (اختر أقرب Region).
2. من *Dashboard → Connection string* اختر **Pooled connection** وانسخ الرابط.
3. أضفه في Vercel باسم `DATABASE_URL` (كما هو، مع `?sslmode=require`).
4. أعد النشر: أثناء البناء يُنفّذ `node scripts/prepare-db.mjs` الأمر
   `prisma db push --accept-data-loss --skip-generate` لإنشاء الجداول (`User`, `WatchlistItem`, `WatchHistory`, `Setting`).

للتجربة على قاعدة Neon محليًا: ضع الرابط في `.env.local` ثم `npm run build` (أو `npm run dev` — سيُنشأ الجدول عند أول عملية كتابة عبر Prisma).
يمكن أيضًا استخدام Vercel Postgres أو Supabase بنفس الطريقة.

---

## ماذا يحدث بدون مفاتيح؟

| بدون | النتيجة |
| --- | --- |
| `DATABASE_URL` | الحسابات والمفضلة والسجل تُحفظ في `.data/store.json` (ملف محلي). على Vercel نظام الملفات للقراءة فقط ومؤقت، لذا **يجب** ربط قاعدة بيانات في الإنتاج حتى تبقى الحسابات. |
| `TMDB_API_KEY` | الموقع يعمل بكتالوج TMDB المضمّن (2,630 عنوانًا) — تصفّح، بحث، فلاتر، صفحات أعمال ومشغّل. لا ميزات ناقصة. |
| `NEXTAUTH_SECRET` | يعمل الموقع بمفتاح تطوير غير آمن مع تحذير في السجلات. **لا تفعل ذلك في الإنتاج** (تسريب الجلسات). |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | يُستخدم `admin@farja.app` / `Admin@12345` الموضّحان أعلاه. |

---

## التخصيص

| ماذا تريد تغييره؟ | الملف |
| --- | --- |
| اسم المنصة، الشعار النصي، الوصف، الألوان، الإيميل، السوشيال، القائمة، مواضع الإعلانات | `src/config/site.ts` |
| سيرفرات التشغيل وترتيبها والافتراضي | `src/config/players.ts` |
| التصنيفات (slug + اسم عربي/إنجليزي + IDs الخاصة بـ TMDB) | `src/config/genres.ts` |
| النصوص العربية/الإنجليزية | `src/messages/ar.json` و`src/messages/en.json` |
| شعار الموقع / أيقونة المتصفح | `src/components/brand/logo.tsx` و`public/favicon.svg` |
| صورة المشاركة (1200×630) | `public/og.png` |
| مكوّنات الواجهة | `src/components/**` |
| طبقة البيانات (TMDB + الكتالوج) | `src/lib/tmdb.ts` و`src/lib/catalog.ts` و`src/lib/data.ts` |
| الحماية والتحويلات بين اللغتين | `src/middleware.ts` |
| الجداول | `prisma/schema.prisma` |

**إضافة جملة جديدة:** أضف المفتاح في `ar.json` **و** `en.json` بنفس المسار، ثم استخدمه عبر
`const t = await getTranslations({ locale, namespace: "namespace" })`. لا تكتب نصًا مباشرًا في الصفحات.

---

## بنية المشروع

```
├── prisma/schema.prisma          # User / WatchlistItem / WatchHistory / Setting
├── scripts/
│   ├── postinstall.mjs           # prisma generate لا يُفشل npm install إن كان الاتصال محجوبًا
│   ├── prepare-db.mjs            # prisma db push تلقائيًا أثناء البناء
│   └── build_catalog.py          # بناء كتالوج TMDB من تصديرات CSV
├── src/
│   ├── app/
│   │   ├── [locale]/             # كل الصفحات (ar/en): الرئيسية، استعراض، بحث، عمل، مشاهدة، حساب، admin، about، privacy
│   │   ├── api/                  # auth / watchlist / history / search / report / admin (titles · streams · import)
│   │   ├── robots.ts, sitemap.ts, global-error.tsx
│   ├── components/               # ui, navigation, layout, media, browse, home, auth, account, admin
│   ├── config/                   # site.ts (الهوية) · genres.ts · players.ts
│   ├── data/catalog.json         # كتالوج TMDB المضمّن (2,630 عنوانًا)
│   ├── i18n/                     # routing.ts · request.ts · navigation.ts
│   ├── messages/                 # ar.json · en.json (17 namespace متطابقة المفاتيح)
│   ├── lib/                      # auth · actions · data · tmdb · catalog · custom (عناوين اللوحة) · streams · store (Prisma/File)
│   └── middleware.ts             # توجيه اللغة + حماية /account و /admin
├── public/                       # favicon.svg · og.png
├── vercel.json                   # Build/Install commands
└── .env.example
```

---

## الأوامر

| الأمر | الوظيفة |
| --- | --- |
| `npm run dev` | تشغيل التطوير على `:3000` |
| `npm run build` | `prisma generate` + `prisma db push` (إن وُجد `DATABASE_URL`) + `next build` |
| `npm start` | تشغيل نسخة الإنتاج |
| `npx tsc --noEmit` | فحص الأنواع |
| `npm run catalog:build` | إعادة بناء `src/data/catalog.json` من `datasets/` |

---

## المسارات

| المسار | الوصف |
| --- | --- |
| `/` | يُحوِّل إلى `/ar` |
| `/ar` · `/en` | الرئيسية: سلايدر + شرائح + إعلانات |
| `/[locale]/movies` · `/tv` | الأفلام والمسلسلات مع فلاتر |
| `/[locale]/arabic` | الأعمال العربية |
| `/[locale]/top-rated` · `/trending` | الأعلى تقييمًا والأكثر رواجًا |
| `/[locale]/genre/[slug]` | 24 تصنيفًا (action, comedy, drama…) |
| `/[locale]/search?q=` | البحث |
| `/[locale]/title/[movie\|tv]/[id]` | صفحة العمل (طاقم، مواسم، مشابه، تريلر) |
| `/[locale]/watch/[movie\|tv]/[id]` | المشغّل متعدد السيرفرات |
| `/[locale]/login` · `/register` · `/account` | الحساب |
| `/[locale]/admin` · `/admin/users` · `/admin/settings` | لوحة التحكم (ADMIN فقط) |
| `/[locale]/admin/titles` · `/admin/titles/new` · `/admin/titles/[id]` | إدارة الأفلام والمسلسلات المضافة |
| `/[locale]/admin/streams` | روابط تشغيل إضافية لعناوين TMDB |
| `/[locale]/about` · `/privacy` | صفحات ثابتة |
| `/api/auth/*` · `/api/watchlist` · `/api/history` · `/api/search` | واجهات API |

---

## حل المشكلات

| المشكلة | السبب / الحل |
| --- | --- |
| البناء يتوقف عند `prisma db push` | `DATABASE_URL` خاطئ أو القاعدة لا تقبل SSL. أضف `?sslmode=require` وتأكد أن المشروع في Neon نشط. |
| الحسابات تختفي على Vercel | لم تربط `DATABASE_URL` (مخزن الملفات لا يدوم على Serverless). اربط Neon وأعد النشر. |
| الدخول ينجح ثم تنتهي الجلسة سريعًا | لم تضبط `NEXTAUTH_SECRET` أو تغيّر بين نشرين. اضبطه مرة واحدة وثبّته. |
| البوسترات لا تظهر | الشبكة تحجب `image.tmdb.org`؛ البطاقات تعرض بديلًا متدرّجًا تلقائيًا. لا يُظهر الموقع صورًا مكسورة. |
| بعض السيرفرات لا تعمل | هذه سيرفرات عامة تابعة لجهات أخرى وتتغير باستمرار. بدّل من قائمة السيرفرات أو أضف/عدّل في `src/config/players.ts`. |
| `MISSING_MESSAGE` في السجلات | مفتاح ناقص في `ar.json` أو `en.json` — أضفه في الملفين بنفس المسار. |
| صفحة تظهر 200 بدل تحويل للدخول | الحماية تعتمد على `src/middleware.ts` (كوكي الجلسة). لا تحذف الـ middleware. |
| أضفت فيلمًا ولا يظهر في الموقع | تأكد من تفعيل **«منشور»** في النموذج، ثم أعد تحميل الصفحة. لو ما زال مخفيًا راجع سجل السيرفر. |
| رابط تشغيل لا يعمل داخل المشغّل | بعض المواقع تمنع التضمين (X-Frame-Options). استخدم رابط Embed من سيرفر يسمح بالتضمين، أو أضف السيرفر في `src/config/players.ts`. |
| ملف m3u8 لا يعمل على Chrome | المشغّل يحمّل `hls.js` تلقائيًا لملفات HLS؛ تأكد من أن الرابط ينتهي بـ `.m3u8` وأن السيرفر يسمح بـ CORS. |

---

## ملاحظات قانونية

- البيانات الوصفية والصور ملك لـ **TMDB**، والاستخدام يخضع لشروطهم ([themoviedb.org/documentation/api/terms-of-use](https://www.themoviedb.org/documentation/api/terms-of-use)).
  هذا المنتج يستخدم TMDB API ولكنه **غير معتمد أو مصادق عليه من TMDB**.
- المشغّل يستخدم Embed URLs من سيرفرات خارجية عامة، وهذا المشروع لا يستضيف أو يوزّع أي فيديو.
  أنت مسؤول عن التأكد من حقوق المحتوى في بلدك.
- الإعلانات: املأ مكوّن `<AdSlot>` بكود شبكتك، وعطّل `features.showAdPlaceholders` عند تفعيل الإعلانات الحقيقية.

---

<p align="center">صُنع بشغف في مصر 🇪🇬 — <strong>فَرجة</strong></p>
