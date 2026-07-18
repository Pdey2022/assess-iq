import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const assessments = await prisma.assessmentDefinition.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(assessments);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, questions, scoringLogic, knowledgeBase } = body;

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const assessment = await prisma.assessmentDefinition.create({
    data: {
      title,
      description: description ?? null,
      questions: questions ?? [],
      scoringLogic: scoringLogic ?? {},
      knowledgeBase: knowledgeBase ?? {},
    },
  });

  return NextResponse.json(assessment, { status: 201 });
}
