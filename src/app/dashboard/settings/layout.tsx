import Link from "next/link";
import { requireAuth } from "@/lib/require-auth";

const navItems = [
  { href: "/dashboard/settings/assessments", label: "Assessment Customizer" },
  { href: "/dashboard/settings/report-style", label: "Report Style Manager" },
  { href: "/dashboard/settings/users", label: "User Management" },
];

export default async function SettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAuth();

  return (
    <div className="flex flex-1">
      <aside className="w-64 border-r bg-gray-50 p-4">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Settings
        </h2>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-200"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
