import { RawJob, SearchParams } from "./types";
import { fetchTheMuse } from "./themuse";
import { fetchRemotive } from "./remotive";
import { fetchArbeitnow } from "./arbeitnow";
import { fetchAdzuna } from "./adzuna";
import { fetchGreenhouse } from "./greenhouse";
import { fetchLever } from "./lever";
import { scoreJob, guessCompanyType, isRelevant, locationRank } from "@/lib/match";

// Aggregate every legitimate source, dedupe, HARD-FILTER to relevant
// (tech + fresher + Bengaluru/India), then sort Bengaluru-first by fit.
export async function aggregateJobs(params: SearchParams): Promise<(RawJob & { match_score: number })[]> {
  const results = await Promise.allSettled([
    fetchTheMuse(params),   // Bengaluru + tech + intern/entry (no key)
    fetchGreenhouse(params),
    fetchLever(params),
    fetchAdzuna(params),     // India jobs (needs key)
    fetchRemotive(params),
    fetchArbeitnow(params),
  ]);

  const all: RawJob[] = [];
  for (const r of results) if (r.status === "fulfilled") all.push(...r.value);

  // Dedupe by normalized title+company
  const seen = new Set<string>();
  const deduped = all.filter((j) => {
    const k = `${j.title}::${j.company}`.toLowerCase().replace(/\s+/g, " ").trim();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  return deduped
    .filter(isRelevant) // ← drops sales/senior/foreign junk
    .map((j) => ({ ...j, company_type: guessCompanyType(j), match_score: scoreJob(j) }))
    .sort((a, b) => locationRank(a) - locationRank(b) || b.match_score - a.match_score);
}

// Assisted-search deep links for platforms we must NOT bot (ToS-safe: just open the page).
export function assistedSearchLinks(query: string, location = "Bengaluru") {
  const q = encodeURIComponent(query);
  const l = encodeURIComponent(location);
  return [
    { platform: "LinkedIn", url: `https://www.linkedin.com/jobs/search/?keywords=${q}&location=${l}&f_TPR=r604800&sortBy=DD` },
    { platform: "LinkedIn (hiring posts)", url: `https://www.linkedin.com/search/results/content/?keywords=${q}%20hiring&sortBy=%22date_posted%22` },
    { platform: "Naukri", url: `https://www.naukri.com/${query.replace(/\s+/g, "-")}-jobs-in-${location.toLowerCase()}` },
    { platform: "Internshala", url: `https://internshala.com/internships/keywords-${query.replace(/\s+/g, "%20")}/` },
    { platform: "Indeed", url: `https://in.indeed.com/jobs?q=${q}&l=${l}&fromage=7&sort=date` },
    { platform: "Instahyre", url: `https://www.instahyre.com/search-jobs/?job_title=${q}` },
    { platform: "Wellfound (startups)", url: `https://wellfound.com/role/r/software-engineer` },
  ];
}
