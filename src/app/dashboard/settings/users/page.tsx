import { requireAuth } from "@/lib/require-auth";

export default async function UsersPage() {
  await requireAuth();
  return (
    <div>
      <h1 className="text-2xl font-bold">User Management</h1>
      <p className="mt-2 text-sm text-gray-500">Coming soon.</p>
    </div>
  );
}
