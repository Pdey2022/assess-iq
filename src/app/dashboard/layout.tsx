import { requireAuth } from "@/lib/require-auth";
import DashboardHeader from "./header";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex flex-1">{children}</div>
    </div>
  );
}
