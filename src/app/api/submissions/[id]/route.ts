import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateScore } from "@/lib/scoring";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();
  const { answers, status } = body;

  // Compute score server-side on completion
  let finalScore: number | undefined;
  let recommendationReport: any;

  if (status === "COMPLETED" && answers) {
    const submission = await prisma.customerSubmission.findUnique({
      where: { id },
      include: { assessmentDefinition: true },
    });

    if (submission) {
      const result = calculateScore(
        submission.assessmentDefinition.questions as any,
        answers,
        submission.assessmentDefinition.scoringLogic as any,
        submission.assessmentDefinition.knowledgeBase as any,
      );
      finalScore = result.totalScore;
      recommendationReport = {
        score: result.totalScore,
        maxScore: result.maxPossibleScore,
        percentage: result.percentage,
        recommendation: result.recommendation,
        breakdown: result.breakdown,
      };
    }
  }

  const updated = await prisma.customerSubmission.update({
    where: { id },
    data: {
      ...(answers !== undefined && { answers }),
      ...(status !== undefined && { status }),
      ...(finalScore !== undefined && { finalScore }),
      ...(recommendationReport !== undefined && { recommendationReport }),
    },
  });

  return NextResponse.json(updated);
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const submission = await prisma.customerSubmission.findUnique({
    where: { id },
    include: { assessmentDefinition: true },
  });
  if (!submission)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(submission);
}
