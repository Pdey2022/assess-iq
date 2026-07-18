import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SignOutButton from "./sign-out-button";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <h1 className="text-xl font-bold">AssessIQ</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {session.user.name} ({session.user.email})
          </span>
          <SignOutButton />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center">
        <p className="text-lg text-gray-500">
          Welcome to AssessIQ — you&apos;re logged in!
        </p>
      </main>
    </div>
  );
}
