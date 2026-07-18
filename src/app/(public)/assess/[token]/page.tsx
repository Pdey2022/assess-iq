import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PublicAssessmentForm from "./public-form";

export default async function AssessPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const submission = await prisma.customerSubmission.findUnique({
    where: { uniqueLinkToken: token },
    include: { assessmentDefinition: true },
  });

  if (!submission) notFound();
  if (submission.status === "DELIVERED" || submission.status === "COMPLETED") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md rounded-xl bg-white p-8 text-center shadow-lg">
          <h1 className="text-2xl font-bold text-gray-800">Already Completed</h1>
          <p className="mt-2 text-gray-500">
            This assessment has already been submitted. Thank you!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{submission.assessmentDefinition.title}</h1>
          <p className="text-sm text-gray-500">
            Customer: {submission.customerName} &middot; Self-Service Assessment
          </p>
        </div>

        <PublicAssessmentForm
          submissionId={submission.id}
          token={token}
          questions={submission.assessmentDefinition.questions as any}
          scoringLogic={submission.assessmentDefinition.scoringLogic as any}
          knowledgeBase={submission.assessmentDefinition.knowledgeBase as any}
        />
      </div>
    </div>
  );
}
