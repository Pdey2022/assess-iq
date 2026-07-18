import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { answers, status } = body;

  const submission = await prisma.customerSubmission.update({
    where: { id },
    data: {
      ...(answers !== undefined && { answers }),
      ...(status !== undefined && { status }),
    },
  });

  return NextResponse.json(submission);
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const submission = await prisma.customerSubmission.findUnique({
    where: { id },
    include: { assessmentDefinition: true },
  });
  if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(submission);
}
