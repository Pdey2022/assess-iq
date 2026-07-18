import Link from "next/link";

export default function SubmissionCard({
  submission,
  showScore,
}: {
  submission: any;
  showScore?: boolean;
}) {
  const isInProgress = submission.status === "IN_PROGRESS";
  const rec = submission.recommendationReport as any;

  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-card transition-all hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-text">
            {submission.assessmentDefinition.title}
          </h3>
          <div className="mt-1 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-[10px] font-semibold text-primary-700">
              {submission.customerName[0]}
            </div>
            <p className="text-sm font-medium text-text-secondary">{submission.customerName}</p>
          </div>
          {submission.customerEmail && (
            <p className="mt-0.5 text-xs text-text-muted">{submission.customerEmail}</p>
          )}
        </div>
        <div className="ml-4 text-right">
          {showScore && rec && (
            <div>
              <span className="text-xl font-bold text-text">{rec.score}</span>
              <span className="text-xs text-text-muted"> / {rec.maxScore}</span>
              {rec.percentage !== undefined && (
                <p className="text-xs font-medium text-text-secondary">{rec.percentage}%</p>
              )}
            </div>
          )}
          {isInProgress && (
            <Link
              href={`/dashboard/assessments/fill/${submission.id}`}
              className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:from-primary-700 hover:to-primary-600"
            >
              Continue
            </Link>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3 border-t border-border pt-3 text-xs">
        <span className={`rounded-full px-2 py-0.5 font-medium ${
          isInProgress ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
        }`}>
          {submission.status}
        </span>
        <span className="text-text-muted">{new Date(submission.updatedAt).toLocaleDateString()}</span>
        {showScore && (
          <>
            <span className="text-border">&middot;</span>
            <Link
              href={`/dashboard/submissions/${submission.id}`}
              className="font-medium text-primary-600 underline-offset-2 hover:underline"
            >
              View Details
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
