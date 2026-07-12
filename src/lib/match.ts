import { profile } from "@/lib/profile";
import { RawJob } from "@/lib/sources/types";

// ── Hard filters: tech-only, fresher/intern-only, Bengaluru-first ──────────

const TECH = /\b(software|developer|engineer(ing)?|full[-\s]?stack|front[-\s]?end|back[-\s]?end|web|react|next\.?js|node|python|java(script)?|typescript|sde|programmer|coding|devops|cloud|data\s*(engineer|scientist|analyst)|machine\s*learning|\bml\b|\bai\b|android|ios|mobile|qa|sdet|test\s*engineer|platform|infrastructure)\b/i;

// Titles that are clearly NOT for a fresher software engineer
const NON_TECH = /\b(sales|gtm|go[-\s]?to[-\s]?market|account\s*(payable|receivable|manager|executive)|audit(or)?|receptionist|office\s*assistant|writing|content\s*writer|copywriter|nurse|health|clinical|driver|warehouse|recruit(er|ing)|human\s*resources|\bhr\b|teacher|tutor|customer\s*(support|service|operations)|call\s*center|telecaller|marketing\s*(executive|manager)|business\s*development|\bbdm\b|\bbde\b|finance|accountant|legal|paralegal|chef|cook|delivery|security\s*guard|housekeeping)\b/i;

const SENIOR = /\b(senior|sr\.?|lead|principal|staff|architect|manager|mgr|head\s+of|director|\bvp\b|distinguished|sde\s*(ii+|[23])|sdeii|engineer\s*(ii+|iii|[23])\b|\bii+\b|level\s*[3-9]|(?:[3-9]|1\d)\+?\s*years?)\b/i;

const ENTRY = /\b(intern(ship)?|apprentic|trainee|fresher|entry[-\s]?level|junior|jr\.?|graduate|new\s*grad|campus|early\s*career|associate|\bget\b|0[-–\s]*[12]\s*year)\b/i;

export type LocationClass = "bengaluru" | "india-remote" | "worldwide-remote" | "foreign";

function locationClass(job: RawJob): LocationClass {
  const loc = (job.location || "").toLowerCase();
  if (/beng|bangalore|karnataka/.test(loc)) return "bengaluru";
  if (/(india|bharat)/.test(loc)) return "india-remote";
  if (job.is_remote) {
    // Strip remote/flexible words — if nothing (or only "anywhere/worldwide") is left,
    // it's location-agnostic → India-eligible. If a foreign country/city remains, drop it.
    const rest = loc.replace(/remote|flexible|work\s*from\s*home|wfh|hybrid|[\/,|]/g, " ").trim();
    if (!rest || /(anywhere|worldwide|global|any\s*location)/.test(rest)) return "india-remote";
    return "foreign"; // e.g. "Remote, Brazil" / "Remote, Spain"
  }
  return "foreign";
}

/** The gatekeeper: is this job relevant to Yadava (tech + fresher + Bengaluru-ish)? */
export function isRelevant(job: RawJob): boolean {
  const title = job.title || "";
  const text = `${job.title} ${(job.tags || []).join(" ")} ${(job.description || "").slice(0, 600)}`;

  if (NON_TECH.test(title)) return false;          // kill sales/HR/office roles
  if (!TECH.test(title)) return false;             // must be a tech role by title
  if (SENIOR.test(title)) return false;            // no senior/lead/staff/SDE-II for a fresher

  // Location: Bengaluru or India-remote only (drop foreign-city / worldwide-only roles)
  const lc = locationClass(job);
  if (lc === "foreign") return false;

  // We keep all non-senior Bengaluru/India tech roles (a fresher can apply to these).
  // Internships/entry roles are boosted to the top by scoreJob(), not hard-required —
  // otherwise Bengaluru volume collapses to near-zero. `ENTRY` is referenced there.
  void ENTRY;
  return true;
}

// Score 0-100 how well a job fits Yadava. Bengaluru + internship weighted highest.
export function scoreJob(job: RawJob): number {
  let score = 0;
  const title = job.title.toLowerCase();
  const text = `${job.title} ${job.description || ""} ${(job.tags || []).join(" ")}`.toLowerCase();
  const t = profile.targeting;

  if (t.roles.some((r) => title.includes(r))) score += 26;
  else if (TECH.test(title)) score += 16;
  const techHit = [...profile.skills.frontend, ...profile.skills.backend, ...profile.skills.languages]
    .map((s) => s.toLowerCase())
    .filter((s) => text.includes(s)).length;
  score += Math.min(12, techHit * 2);

  if (/\bintern|apprentic|trainee/.test(text)) score += 22;
  else if (ENTRY.test(text)) score += 14;

  const lc = locationClass(job);
  if (lc === "bengaluru") score += 30;
  else if (lc === "india-remote") score += 16;
  else if (lc === "worldwide-remote") score += 6;

  if (job.posted_at) {
    const days = (Date.now() - new Date(job.posted_at).getTime()) / 86400000;
    if (days <= 3) score += 10;
    else if (days <= 7) score += 7;
    else if (days <= 30) score += 3;
  }

  if (t.preferStartups && job.company_type === "startup") score += 4;
  if (job.apply_type === "auto") score += 4;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function locationRank(job: RawJob): number {
  return { bengaluru: 0, "india-remote": 1, "worldwide-remote": 2, foreign: 3 }[locationClass(job)];
}

export function guessCompanyType(job: RawJob): "startup" | "company" | "unknown" {
  if (job.company_type && job.company_type !== "unknown") return job.company_type;
  if (job.source === "greenhouse" || job.source === "lever") return "startup";
  return "unknown";
}
