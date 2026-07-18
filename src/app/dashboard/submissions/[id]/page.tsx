import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/require-auth";
import { notFound } from "next/navigation";

export default async function SubmissionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const { id } = await params;

  const submission = await prisma.customerSubmission.findUnique({
    where: { id },
    include: { assessmentDefinition: true },
  });
  if (!submission) notFound();

  const rec = submission.recommendationReport as any;
  const breakdown = rec?.breakdown ?? [];
  const score = rec?.score ?? 0;
  const maxScore = rec?.maxScore ?? 0;
  const pct = rec?.percentage ?? 0;

  const getBarColor = (p: number) =>
    p >= 70 ? "bg-green-500" : p >= 40 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">
        {submission.assessmentDefinition.title}
      </h1>
      <p className="text-sm text-gray-500">
        Customer: {submission.customerName}
        {submission.customerEmail && ` (${submission.customerEmail})`}
      </p>
      <p className="text-xs text-gray-400">
        Status: {submission.status} &middot;{" "}
        {new Date(submission.updatedAt).toLocaleDateString()}
      </p>

      {/* Score Card */}
      <div className="mt-6 rounded-lg border p-6 text-center">
        <div className="flex items-center justify-center gap-4">
          <span className="text-5xl font-bold">{score}</span>
          <span className="text-xl text-gray-400">/ {maxScore}</span>
        </div>
        <p className="mt-1 text-sm text-gray-500">{pct}% overall</p>
        <div className="mx-auto mt-3 h-3 w-full max-w-xs rounded-full bg-gray-200">
          <div
            className={`h-3 rounded-full ${getBarColor(pct)}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Recommendation */}
      {rec?.recommendation && (
        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm whitespace-pre-line">
          <strong>Recommendation:</strong>
          <p className="mt-1 text-blue-800">{rec.recommendation}</p>
        </div>
      )}

      {/* Breakdown */}
      <div className="mt-6">
        <h2 className="mb-3 text-lg font-semibold">Question Breakdown</h2>
        <div className="space-y-2">
          {breakdown.map((b: any, i: number) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border px-4 py-3"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {i + 1}. {b.questionText}
                </p>
                <p className="text-xs text-gray-500">Answer: {b.answer}</p>
              </div>
              <div className="ml-4 text-right">
                <span className="text-sm font-semibold">
                  {b.score} / {b.maxScore}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Raw Answers */}
      {submission.answers && (
        <div className="mt-6">
          <h2 className="mb-3 text-lg font-semibold">Raw Answers</h2>
          <pre className="overflow-auto rounded-lg border bg-gray-50 p-4 text-xs">
            {JSON.stringify(submission.answers, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
