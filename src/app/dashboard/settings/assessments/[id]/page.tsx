import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/require-auth";
import { notFound } from "next/navigation";
import EditAssessmentClient from "./edit-client";

export default async function EditAssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const { id } = await params;

  const assessment = await prisma.assessmentDefinition.findUnique({
    where: { id },
  });
  if (!assessment) notFound();

  return (
    <div>
      <EditAssessmentClient
        id={assessment.id}
        initialData={{
          title: assessment.title,
          description: assessment.description ?? "",
          questions: assessment.questions as any,
          scoringLogic: assessment.scoringLogic as any,
          knowledgeBase: assessment.knowledgeBase as any,
        }}
      />
    </div>
  );
}
