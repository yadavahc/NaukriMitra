// Remotive — free public JSON API for remote jobs. https://remotive.com/api/remote-jobs
import { RawJob, SearchParams, classifyEmployment } from "./types";

export async function fetchRemotive(p: SearchParams): Promise<RawJob[]> {
  const url = new URL("https://remotive.com/api/remote-jobs");
  if (p.query) url.searchParams.set("search", p.query);
  url.searchParams.set("limit", String(p.limit ?? 40));
  try {
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.jobs || []).map((j: any): RawJob => ({
      source: "remotive",
      external_id: String(j.id),
      title: j.title,
      company: j.company_name,
      company_type: "unknown",
      location: j.candidate_required_location || "Remote",
      is_remote: true,
      employment: classifyEmployment(`${j.title} ${j.job_type || ""}`),
      salary: j.salary || undefined,
      description: (j.description || "").replace(/<[^>]+>/g, " ").slice(0, 4000),
      url: j.url,
      apply_type: "assisted",
      tags: j.tags || [],
      posted_at: j.publication_date,
    }));
  } catch {
    return [];
  }
}
