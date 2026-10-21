export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden border-b border-line/60 bg-gradient-to-b from-night-900/60 to-transparent">
      <div className="absolute -end-20 -top-20 h-64 w-64 rounded-full bg-gold-500/10 blur-3xl" />
      <div className="container-page relative py-10 sm:py-14">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{description}</p>}
        {children}
      </div>
    </div>
  );
}
