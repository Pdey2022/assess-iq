import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/require-auth";
import Link from "next/link";
import LaunchButton from "./launch-button";

export default async function AssessmentsDashboardPage() {
  await requireAuth();

  const [templates, inProgress, delivered] = await Promise.all([
    prisma.assessmentDefinition.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.customerSubmission.findMany({
      where: { status: "IN_PROGRESS" },
      include: { assessmentDefinition: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.customerSubmission.findMany({
      where: { status: { in: ["COMPLETED", "DELIVERED"] } },
      include: { assessmentDefinition: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return (
    <div className="flex-1 p-6">
      <h1 className="mb-6 text-2xl font-bold">Assessments</h1>

      {/* Tabs */}
      <div className="mb-6 border-b">
        <div className="flex gap-6">
          <span className="border-b-2 border-blue-600 pb-2 text-sm font-semibold text-blue-600">
            Active ({templates.length})
          </span>
          <span className="pb-2 text-sm text-gray-500">
            In-Progress ({inProgress.length})
          </span>
          <span className="pb-2 text-sm text-gray-500">
            Delivered ({delivered.length})
          </span>
        </div>
      </div>

      {/* Active Templates */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => (
          <div key={t.id} className="rounded-lg border p-4">
            <h3 className="font-semibold">{t.title}</h3>
            {t.description && (
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">{t.description}</p>
            )}
            <p className="mt-2 text-xs text-gray-400">
              {(t.questions as any[])?.length ?? 0} questions
            </p>
            <div className="mt-4 flex gap-2">
              <LaunchButton assessmentId={t.id} assessmentTitle={t.title} />
              <Link
                href={`/dashboard/settings/assessments/${t.id}`}
                className="rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-50"
              >
                Edit
              </Link>
            </div>
          </div>
        ))}
        {templates.length === 0 && (
          <div className="col-span-full rounded-lg border border-dashed p-12 text-center">
            <p className="text-gray-500">
              No assessments yet.{" "}
              <Link href="/dashboard/settings/assessments/new" className="text-blue-600 underline">
                Create one
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
