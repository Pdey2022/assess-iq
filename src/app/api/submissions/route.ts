import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { assessmentDefinitionId, customerName, customerEmail, mode } = body;

  if (!assessmentDefinitionId || !customerName || !mode) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const assessment = await prisma.assessmentDefinition.findUnique({
    where: { id: assessmentDefinitionId },
  });
  if (!assessment) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
  }

  const uniqueLinkToken = mode === "external"
    ? crypto.randomBytes(24).toString("hex")
    : null;

  const submission = await prisma.customerSubmission.create({
    data: {
      customerName,
      customerEmail: customerEmail ?? null,
      status: "IN_PROGRESS",
      uniqueLinkToken,
      assessmentDefinitionId,
      answers: {},
    },
  });

  const publicUrl = uniqueLinkToken
    ? `${process.env.NEXT_PUBLIC_BASE_URL || "https://aassess-iq.vercel.app"}/assess/${uniqueLinkToken}`
    : null;

  return NextResponse.json({ submission, publicUrl }, { status: 201 });
}
