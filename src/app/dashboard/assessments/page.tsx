import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/require-auth";
import Link from "next/link";
import LaunchButton from "./launch-button";
import SubmissionCard from "./submission-card";

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
    <div className="mx-auto max-w-5xl flex-1 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text">
          Assessments
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Launch, track, and review assessments
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-border">
        <div className="flex gap-6">
          <span className="border-b-2 border-primary-500 pb-2 text-sm font-semibold text-primary-600">
            Active ({templates.length})
          </span>
          <span className="pb-2 text-sm text-text-muted">
            In-Progress ({inProgress.length})
          </span>
          <span className="pb-2 text-sm text-text-muted">
            Delivered ({delivered.length})
          </span>
        </div>
      </div>

      {/* Active Templates */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => (
          <div
            key={t.id}
            className="rounded-xl border border-border bg-surface p-5 shadow-card transition-all hover:shadow-card-hover"
          >
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500/10 text-primary-400">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-text">{t.title}</h3>
            {t.description && (
              <p className="mt-1 text-sm text-text-secondary line-clamp-2">
                {t.description}
              </p>
            )}
            <p className="mt-2 text-xs text-text-muted">
              {(t.questions as any[])?.length ?? 0} questions
            </p>
            <div className="mt-4 flex gap-2">
              <LaunchButton assessmentId={t.id} assessmentTitle={t.title} />
              <Link
                href={`/dashboard/settings/assessments/${t.id}`}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-secondary"
              >
                Edit
              </Link>
            </div>
          </div>
        ))}
        {templates.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-border bg-surface p-12 text-center">
            <p className="text-text-secondary">
              No assessments yet.{" "}
              <Link
                href="/dashboard/settings/assessments/new"
                className="font-medium text-primary-600 underline underline-offset-2 hover:text-primary-700"
              >
                Create one
              </Link>
            </p>
          </div>
        )}
      </div>

      {/* In-Progress Section */}
      {inProgress.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-semibold">In-Progress</h2>
          <div className="space-y-3">
            {inProgress.map((s) => (
              <SubmissionCard key={s.id} submission={s} />
            ))}
          </div>
        </div>
      )}

      {/* Delivered Section */}
      {delivered.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-semibold">Delivered</h2>
          <div className="space-y-3">
            {delivered.map((s) => (
              <SubmissionCard key={s.id} submission={s} showScore />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
