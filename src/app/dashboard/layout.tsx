import { requireAuth } from "@/lib/require-auth";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAuth();
  return <>{children}</>;
}
