import { NextRequest, NextResponse } from "next/server";
import { aggregateJobs } from "@/lib/sources";
import { profile } from "@/lib/profile";
import { firestore, isFirebaseConfigured, safeDocId } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const query = sp.get("q") || profile.targeting.roles[0];
  const location = sp.get("location") || "Bengaluru";
  const remoteOnly = sp.get("remote") === "1";
  const limit = Number(sp.get("limit") || 60);

  const jobs = await aggregateJobs({ query, location, remoteOnly, limit });

  // Cache discovered jobs into Firestore (best-effort; batch is capped at 500 ops)
  if (isFirebaseConfigured() && jobs.length) {
    try {
      const db = firestore();
      const batch = db.batch();
      for (const j of jobs.slice(0, 400)) {
        const ref = db.collection("jobs").doc(safeDocId(j.source, j.external_id));
        batch.set(
          ref,
          {
            source: j.source,
            external_id: j.external_id,
            title: j.title,
            company: j.company,
            company_type: j.company_type ?? "unknown",
            location: j.location ?? "",
            is_remote: !!j.is_remote,
            employment: j.employment ?? "unknown",
            salary: j.salary ?? null,
            description: j.description ?? "",
            url: j.url,
            apply_type: j.apply_type ?? "assisted",
            tags: j.tags ?? [],
            match_score: j.match_score,
            posted_at: j.posted_at ?? null,
            discovered_at: new Date(),
          },
          { merge: true }
        );
      }
      await batch.commit();
    } catch (e) {
      console.warn("[jobs] cache skipped:", (e as Error).message);
    }
  }

  return NextResponse.json({
    count: jobs.length,
    jobs,
    adzunaConfigured: Boolean(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY),
  });
}
