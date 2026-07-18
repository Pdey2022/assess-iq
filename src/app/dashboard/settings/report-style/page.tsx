import { requireAuth } from "@/lib/require-auth";

export default async function ReportStylePage() {
  await requireAuth();
  return (
    <div>
      <h1 className="text-2xl font-bold">Report Style Manager</h1>
      <p className="mt-2 text-sm text-gray-500">Coming soon.</p>
    </div>
  );
}
