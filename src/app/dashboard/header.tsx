import { auth } from "@/lib/auth";
import Link from "next/link";
import SignOutButton from "./sign-out-button";

export default async function DashboardHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 text-xs font-bold text-white shadow-sm">
              A
            </div>
            <span className="text-base font-bold tracking-tight text-text">
              AssessIQ
            </span>
          </Link>
          <nav className="flex gap-1 text-sm">
            <Link
              href="/dashboard"
              className="rounded-lg px-3 py-1.5 font-medium text-text-secondary transition-colors hover:bg-primary-50 hover:text-primary-600"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/assessments"
              className="rounded-lg px-3 py-1.5 font-medium text-text-secondary transition-colors hover:bg-primary-50 hover:text-primary-600"
            >
              Assessments
            </Link>
            <Link
              href="/dashboard/settings/assessments"
              className="rounded-lg px-3 py-1.5 font-medium text-text-secondary transition-colors hover:bg-primary-50 hover:text-primary-600"
            >
              Settings
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-500/20 text-xs font-semibold text-primary-300">
            {session?.user?.name?.[0] ?? "U"}
          </div>
          <span className="text-sm font-medium text-text-secondary">
            {session?.user?.name}
          </span>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
