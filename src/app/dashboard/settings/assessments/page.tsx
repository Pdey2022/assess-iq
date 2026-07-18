import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/require-auth";
import type { AssessmentDefinition } from "@prisma/client";

export default async function AssessmentsPage() {
  await requireAuth();
  const assessments = await prisma.assessmentDefinition.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Assessment Customizer</h1>
          <p className="text-sm text-gray-500">
            Create and manage assessment templates
          </p>
        </div>
        <Link
          href="/dashboard/settings/assessments/new"
          className="rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:from-primary-700 hover:to-primary-600 active:scale-[0.98]"
        >
          + New Assessment
        </Link>
      </div>

      {assessments.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-gray-500">
            No assessments yet. Create your first one!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {assessments.map((a: AssessmentDefinition) => (
            <Link
              key={a.id}
              href={`/dashboard/settings/assessments/${a.id}`}
              className="block rounded-lg border p-4 hover:bg-gray-50"
            >
              <h3 className="font-semibold">{a.title}</h3>
              {a.description && (
                <p className="mt-1 text-sm text-gray-500">{a.description}</p>
              )}
              <p className="mt-1 text-xs text-gray-400">
                {(a.questions as any[])?.length ?? 0} questions &middot; Created{" "}
                {new Date(a.createdAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
