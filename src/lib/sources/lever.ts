// Lever postings API — public, per company. https://api.lever.co/v0/postings/{company}?mode=json
// Lever also supports application submission via its public apply endpoint.
import { RawJob, SearchParams, classifyEmployment } from "./types";

export async function fetchLever(p: SearchParams, boards?: string[]): Promise<RawJob[]> {
  const companies = (boards ?? (process.env.LEVER_BOARDS || "").split(","))
    .map((s) => s.trim())
    .filter(Boolean);
  if (!companies.length) return [];
  const q = (p.query || "").toLowerCase();
  const out: RawJob[] = [];

  await Promise.all(
    companies.map(async (company) => {
      try {
        const res = await fetch(`https://api.lever.co/v0/postings/${company}?mode=json`, {
          next: { revalidate: 1800 },
        });
        if (!res.ok) return;
        const jobs = await res.json();
        for (const j of jobs || []) {
          const text = `${j.text} ${j.descriptionPlain || ""}`.toLowerCase();
          if (q && !text.includes(q)) continue;
          const loc = j.categories?.location || "";
          out.push({
            source: "lever",
            external_id: `${company}:${j.id}`,
            title: j.text,
            company,
            company_type: "startup",
            location: loc,
            is_remote: /remote/i.test(loc + " " + (j.categories?.commitment || "")),
            employment: classifyEmployment(`${text} ${j.categories?.commitment || ""}`),
            description: (j.descriptionPlain || "").slice(0, 4000),
            url: j.hostedUrl,
            apply_type: "auto", // ✅ programmatically applicable
            posted_at: j.createdAt ? new Date(j.createdAt).toISOString() : undefined,
          });
        }
      } catch {
        /* skip company on error */
      }
    })
  );
  return out.slice(0, p.limit ?? 50);
}
