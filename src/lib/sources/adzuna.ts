// Adzuna — free API (needs ADZUNA_APP_ID + ADZUNA_APP_KEY). Great India/Bengaluru coverage.
// Docs: https://developer.adzuna.com/
import { RawJob, SearchParams, classifyEmployment } from "./types";

export async function fetchAdzuna(p: SearchParams): Promise<RawJob[]> {
  const id = process.env.ADZUNA_APP_ID;
  const key = process.env.ADZUNA_APP_KEY;
  if (!id || !key) return []; // silently skip if not configured

  const country = "in"; // India
  const url = new URL(`https://api.adzuna.com/v1/api/jobs/${country}/search/1`);
  url.searchParams.set("app_id", id);
  url.searchParams.set("app_key", key);
  url.searchParams.set("results_per_page", "50");
  url.searchParams.set("what", p.query || "software developer");
  url.searchParams.set("category", "it-jobs"); // bias to tech
  if (p.location && !p.remoteOnly) url.searchParams.set("where", p.location);
  url.searchParams.set("sort_by", "date");
  url.searchParams.set("max_days_old", "45");

  try {
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).map((j: any): RawJob => {
      const loc = j.location?.display_name || "";
      const salary =
        j.salary_min || j.salary_max
          ? `₹${Math.round((j.salary_min || 0) / 1000)}k–${Math.round((j.salary_max || 0) / 1000)}k`
          : undefined;
      return {
        source: "adzuna",
        external_id: String(j.id),
        title: j.title,
        company: j.company?.display_name || "Unknown",
        company_type: "unknown",
        location: loc,
        is_remote: /remote/i.test(loc + j.title),
        employment: classifyEmployment(`${j.title} ${j.contract_time || ""} ${j.contract_type || ""}`),
        salary,
        description: (j.description || "").slice(0, 4000),
        url: j.redirect_url,
        apply_type: "assisted",
        posted_at: j.created,
      };
    });
  } catch {
    return [];
  }
}
