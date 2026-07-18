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
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">
            {submission.assessmentDefinition.title}
          </h3>
          <p className="text-sm text-gray-500">{submission.customerName}</p>
          {submission.customerEmail && (
            <p className="text-xs text-gray-400">{submission.customerEmail}</p>
          )}
        </div>
        <div className="text-right">
          {showScore && rec && (
            <div>
              <span className="text-lg font-bold">{rec.score}</span>
              <span className="text-xs text-gray-400"> / {rec.maxScore}</span>
              {rec.percentage !== undefined && (
                <p className="text-xs text-gray-500">{rec.percentage}%</p>
              )}
            </div>
          )}
          {isInProgress && (
            <Link
              href={`/dashboard/assessments/fill/${submission.id}`}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Continue
            </Link>
          )}
        </div>
      </div>
      <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
        <span className={isInProgress ? "text-yellow-600" : "text-green-600"}>
          {submission.status}
        </span>
        <span>&middot;</span>
        <span>{new Date(submission.updatedAt).toLocaleDateString()}</span>
        {showScore && (
          <>
            <span>&middot;</span>
            <Link
              href={`/dashboard/submissions/${submission.id}`}
              className="text-blue-600 underline"
            >
              View Details
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
