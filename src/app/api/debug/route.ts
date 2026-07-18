import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    const assessmentCount = await prisma.assessmentDefinition.count();
    return NextResponse.json({
      status: "ok",
      userCount,
      assessmentCount,
      dbUrl: (process.env.DATABASE_URL ?? "").substring(0, 40) + "...",
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: String(error) },
      { status: 500 }
    );
  }
}
