// Greenhouse job board API — public, per company "board token".
// https://boards-api.greenhouse.io/v1/boards/{token}/jobs?content=true
// These are AUTO-APPLY eligible: Greenhouse has a public application endpoint.
import { RawJob, SearchParams, classifyEmployment } from "./types";

export async function fetchGreenhouse(p: SearchParams, boards?: string[]): Promise<RawJob[]> {
  const tokens = (boards ?? (process.env.GREENHOUSE_BOARDS || "").split(","))
    .map((s) => s.trim())
    .filter(Boolean);
  if (!tokens.length) return [];
  const q = (p.query || "").toLowerCase();
  const out: RawJob[] = [];

  await Promise.all(
    tokens.map(async (token) => {
      try {
        const res = await fetch(
          `https://boards-api.greenhouse.io/v1/boards/${token}/jobs?content=true`,
          { next: { revalidate: 1800 } }
        );
        if (!res.ok) return;
        const data = await res.json();
        for (const j of data.jobs || []) {
          const text = `${j.title} ${j.content || ""}`.toLowerCase();
          if (q && !text.includes(q)) continue;
          const loc = j.location?.name || "";
          out.push({
            source: "greenhouse",
            external_id: `${token}:${j.id}`,
            title: j.title,
            company: token,
            company_type: "startup",
            location: loc,
            is_remote: /remote/i.test(loc),
            employment: classifyEmployment(text),
            description: (j.content || "").replace(/<[^>]+>/g, " ").replace(/&\w+;/g, " ").slice(0, 4000),
            url: j.absolute_url,
            apply_type: "auto", // ✅ programmatically applicable
            posted_at: j.updated_at,
          });
        }
      } catch {
        /* skip board on error */
      }
    })
  );
  return out.slice(0, p.limit ?? 50);
}
