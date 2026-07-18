import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateScore } from "@/lib/scoring";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const submission = await prisma.customerSubmission.findUnique({
    where: { uniqueLinkToken: token },
    include: { assessmentDefinition: true },
  });
  if (!submission)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (submission.status === "DELIVERED") {
    return NextResponse.json({ error: "Already completed" }, { status: 410 });
  }
  return NextResponse.json(submission);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const body = await req.json();
  const { answers } = body;

  const existing = await prisma.customerSubmission.findUnique({
    where: { uniqueLinkToken: token },
    include: { assessmentDefinition: true },
  });
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const result = calculateScore(
    existing.assessmentDefinition.questions as any,
    answers,
    existing.assessmentDefinition.scoringLogic as any,
    existing.assessmentDefinition.knowledgeBase as any,
  );

  const submission = await prisma.customerSubmission.update({
    where: { uniqueLinkToken: token },
    data: {
      answers,
      status: "COMPLETED",
      finalScore: result.totalScore,
      recommendationReport: {
        score: result.totalScore,
        maxScore: result.maxPossibleScore,
        percentage: result.percentage,
        recommendation: result.recommendation,
        breakdown: result.breakdown,
      },
    },
  });

  return NextResponse.json(submission);
}
