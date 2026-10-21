import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AccountLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/${locale}/login?next=/${locale}/account`);
  }
  return <>{children}</>;
}
