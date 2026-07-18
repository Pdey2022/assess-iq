import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const totalAssessments = await prisma.assessmentDefinition.count();

  return (
    <div className="flex-1 p-6">
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-500">Assessment Templates</p>
          <p className="mt-1 text-3xl font-bold">{totalAssessments}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="mt-1 text-3xl font-bold">0</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-500">Delivered</p>
          <p className="mt-1 text-3xl font-bold">0</p>
        </div>
      </div>

      <div className="mt-8">
        <Link
          href="/dashboard/settings/assessments"
          className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Go to Assessment Builder
        </Link>
      </div>
    </div>
  );
}
