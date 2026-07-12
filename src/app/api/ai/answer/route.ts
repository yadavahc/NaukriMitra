import { NextRequest, NextResponse } from "next/server";
import { answerQuestion, generateCoverLetter } from "@/lib/ai";

export const dynamic = "force-dynamic";

// POST { question, job } → tailored answer
// POST { coverLetter: true, job } → tailored cover letter
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (body.coverLetter) {
    const r = await generateCoverLetter(body.job || { title: "Software Engineer", company: "the company" });
    return NextResponse.json(r);
  }
  if (!body.question) return NextResponse.json({ error: "question required" }, { status: 400 });
  const r = await answerQuestion(body.question, body.job);
  return NextResponse.json(r);
}
