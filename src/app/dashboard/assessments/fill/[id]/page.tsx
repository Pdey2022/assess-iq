import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/require-auth";
import { notFound } from "next/navigation";
import AssessmentForm from "../../../../components/assessment-form";

export default async function FillAssessmentPage({
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

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {submission.assessmentDefinition.title}
        </h1>
        <p className="text-sm text-gray-500">
          Customer: {submission.customerName} &middot; Internal Assessment
        </p>
      </div>

      <AssessmentForm
        submissionId={submission.id}
        questions={submission.assessmentDefinition.questions as any}
        scoringLogic={submission.assessmentDefinition.scoringLogic as any}
        knowledgeBase={submission.assessmentDefinition.knowledgeBase as any}
        isInternal
      />
    </div>
  );
}
