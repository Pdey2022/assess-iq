import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const submission = await prisma.customerSubmission.findUnique({
    where: { uniqueLinkToken: token },
    include: { assessmentDefinition: true },
  });
  if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (submission.status === "DELIVERED") {
    return NextResponse.json({ error: "Already completed" }, { status: 410 });
  }
  return NextResponse.json(submission);
}

export async function PUT(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const body = await req.json();
  const { answers } = body;

  const submission = await prisma.customerSubmission.update({
    where: { uniqueLinkToken: token },
    data: { answers, status: "COMPLETED" },
  });

  return NextResponse.json(submission);
}
