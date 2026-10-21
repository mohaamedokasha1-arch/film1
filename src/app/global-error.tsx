"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="ar" dir="rtl">
      <body style={{ background: "#07070B", color: "#F5F1E6", fontFamily: "sans-serif", display: "grid", placeItems: "center", minHeight: "100vh" }}>
        <main style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 24, marginBottom: 12 }}>حدث خطأ غير متوقع</h1>
          <p style={{ color: "#9A96A6", marginBottom: 20 }}>Something went wrong. Please try again.</p>
          <button onClick={reset} style={{ background: "#D4AF37", color: "#07070B", padding: "10px 20px", borderRadius: 999, border: 0, fontWeight: 700, cursor: "pointer" }}>
            إعادة المحاولة / Try again
          </button>
        </main>
      </body>
    </html>
  );
}
