// The Muse — free public jobs API, NO key needed, supports location + level + category.
// Perfect for Bengaluru + tech + Internship/Entry-Level. https://www.themuse.com/developers/api/v2
import { RawJob, SearchParams, classifyEmployment } from "./types";

const CATEGORIES = ["Software Engineering", "Data Science", "Data and Analytics", "IT", "UX", "Design"];
const LEVELS = ["Internship", "Entry Level"];

export async function fetchTheMuse(p: SearchParams): Promise<RawJob[]> {
  const out: RawJob[] = [];
  const locations = p.remoteOnly ? ["Flexible / Remote"] : ["Bengaluru, India", "Flexible / Remote"];

  // Pull 2 pages for a decent pool
  for (let page = 0; page < 2; page++) {
    const url = new URL("https://www.themuse.com/api/public/jobs");
    url.searchParams.set("page", String(page));
    url.searchParams.set("descending", "true");
    locations.forEach((l) => url.searchParams.append("location", l));
    CATEGORIES.forEach((c) => url.searchParams.append("category", c));
    LEVELS.forEach((l) => url.searchParams.append("level", l));
    try {
      const res = await fetch(url, { next: { revalidate: 1800 } });
      if (!res.ok) break;
      const data = await res.json();
      for (const j of data.results || []) {
        const loc = (j.locations || []).map((x: any) => x.name).join(", ") || "";
        const levels = (j.levels || []).map((x: any) => x.name).join(" ");
        const isRemote = /remote|flexible/i.test(loc);
        out.push({
          source: "themuse",
          external_id: String(j.id),
          title: j.name,
          company: j.company?.name || "Unknown",
          company_type: "unknown",
          location: loc,
          is_remote: isRemote,
          employment: /intern/i.test(levels) ? "internship" : classifyEmployment(`${j.name} ${levels} ${j.type || ""}`),
          description: (j.contents || "").replace(/<[^>]+>/g, " ").slice(0, 4000),
          url: j.refs?.landing_page || "",
          apply_type: "assisted",
          tags: (j.categories || []).map((x: any) => x.name),
          posted_at: j.publication_date,
        });
      }
      if (!data.results || data.results.length < 20) break;
    } catch {
      break;
    }
  }
  return out.filter((j) => j.url);
}
