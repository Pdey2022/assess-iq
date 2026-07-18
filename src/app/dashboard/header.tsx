import { auth } from "@/lib/auth";
import Link from "next/link";
import SignOutButton from "./sign-out-button";

export default async function DashboardHeader() {
  const session = await auth();

  return (
    <header className="flex items-center justify-between border-b px-6 py-3">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="text-xl font-bold">
          AssessIQ
        </Link>
        <nav className="flex gap-4 text-sm">
          <Link
            href="/dashboard"
            className="text-gray-600 hover:text-gray-900"
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/settings/assessments"
            className="text-gray-600 hover:text-gray-900"
          >
            Settings
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {session?.user?.name}
        </span>
        <SignOutButton />
      </div>
    </header>
  );
}
