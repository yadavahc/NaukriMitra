import { NextRequest, NextResponse } from "next/server";
import { aggregateJobs } from "@/lib/sources";
import { applyBatch } from "@/lib/apply/engine";
import { profile } from "@/lib/profile";
import type { RawJob } from "@/lib/sources/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// POST /api/apply
// Body: { jobs?: RawJob[], target?: number, query?: string, minScore?: number }
// If `jobs` omitted, it aggregates fresh, best-fit jobs and applies to a batch.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const target: number = body.target ?? 15;
  const minScore: number = body.minScore ?? 45;

  let jobs: RawJob[] = body.jobs;
  if (!jobs || !jobs.length) {
    const query = body.query || profile.targeting.roles[0];
    const aggregated = await aggregateJobs({ query, location: "Bengaluru", limit: 80 });
    jobs = aggregated.filter((j) => j.match_score >= minScore);
  }

  if (!jobs.length) {
    return NextResponse.json(
      { attempted: 0, autoApplied: 0, assisted: 0, results: [], note: "No jobs met the match threshold. Lower minScore or broaden the query." },
      { status: 200 }
    );
  }

  const summary = await applyBatch(jobs, target);
  return NextResponse.json(summary);
}
