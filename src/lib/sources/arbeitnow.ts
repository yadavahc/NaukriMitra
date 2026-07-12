// Arbeitnow — free public job board API. https://www.arbeitnow.com/api/job-board-api
import { RawJob, SearchParams, classifyEmployment } from "./types";

export async function fetchArbeitnow(p: SearchParams): Promise<RawJob[]> {
  try {
    const res = await fetch("https://www.arbeitnow.com/api/job-board-api", { next: { revalidate: 1800 } });
    if (!res.ok) return [];
    const data = await res.json();
    const q = (p.query || "").toLowerCase();
    return (data.data || [])
      .filter((j: any) => !q || `${j.title} ${j.description}`.toLowerCase().includes(q))
      .slice(0, p.limit ?? 40)
      .map((j: any): RawJob => ({
        source: "arbeitnow",
        external_id: j.slug,
        title: j.title,
        company: j.company_name,
        company_type: "unknown",
        location: j.location || (j.remote ? "Remote" : ""),
        is_remote: !!j.remote,
        employment: classifyEmployment(`${j.title} ${(j.job_types || []).join(" ")}`),
        description: (j.description || "").replace(/<[^>]+>/g, " ").slice(0, 4000),
        url: j.url,
        apply_type: "assisted",
        tags: [...(j.tags || []), ...(j.job_types || [])],
        posted_at: j.created_at ? new Date(j.created_at * 1000).toISOString() : undefined,
      }));
  } catch {
    return [];
  }
}
