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
      <aside className="w-64 border-r border-border bg-white p-5">
        <h2 className="mb-4 px-3 text-xs font-semibold uppercase tracking-widest text-text-muted">
          Settings
        </h2>
        <nav className="space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-primary-50 hover:text-primary-600"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 bg-surface-secondary p-6">{children}</main>
    </div>
  );
}
