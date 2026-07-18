import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const assessment = await prisma.assessmentDefinition.findUnique({ where: { id } });
  if (!assessment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(assessment);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { title, description, questions, scoringLogic, knowledgeBase } = body;

  const assessment = await prisma.assessmentDefinition.update({
    where: { id },
    data: {
      title,
      description: description ?? null,
      questions: questions ?? [],
      scoringLogic: scoringLogic ?? {},
      knowledgeBase: knowledgeBase ?? {},
    },
  });

  return NextResponse.json(assessment);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.assessmentDefinition.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
