// ───────────────────────────────────────────────────────────────
//  Apply engine — the brain behind the "Apply" button.
//
//  SAFETY MODEL (read this):
//   • auto     → jobs on Greenhouse / Lever / Google Forms. We can
//                submit programmatically through official/public
//                endpoints. Real one-click apply.
//   • assisted → LinkedIn / Naukri / Internshala / Indeed etc. We do
//                NOT bot these (ToS + ban risk). We generate your
//                answers + cover letter and queue a one-click link so
//                you finish the submit yourself in a browser.
//
//  Every attempt — auto or assisted — is written to `applications`
//  so your dashboard always reflects reality.
// ───────────────────────────────────────────────────────────────

import { profile } from "@/lib/profile";
import { generateCoverLetter } from "@/lib/ai";
import { firestore, isFirebaseConfigured } from "@/lib/firebase/admin";
import { detectAts, browserApply } from "./browser";
import type { RawJob } from "@/lib/sources/types";

export interface ApplyResult {
  job: string;
  company: string;
  method: string;
  status: "applied" | "assisted-pending" | "failed";
  message: string;
  url?: string;
}

async function submitGreenhouse(job: RawJob, coverLetter: string): Promise<ApplyResult> {
  // Greenhouse public application endpoint requires the board token, job id,
  // and a Job Board API key (per company). We only attempt if configured.
  // Docs: https://developers.greenhouse.io/job-board.html#submit-an-application
  const [token, jobId] = job.external_id.split(":");
  const apiKey = process.env.GREENHOUSE_API_KEY; // optional, per-board
  if (!apiKey) {
    return assistedResult(job, "greenhouse", "No Greenhouse API key set — queued as one-click assisted apply.");
  }
  try {
    const body = new FormData();
    body.set("first_name", profile.firstName);
    body.set("last_name", profile.lastName);
    body.set("email", profile.email);
    body.set("phone", profile.phone);
    body.set("cover_letter_text", coverLetter);
    // Resume must be attached server-side from /public; kept minimal here.
    const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${token}/jobs/${jobId}`, {
      method: "POST",
      headers: { Authorization: `Basic ${Buffer.from(apiKey + ":").toString("base64")}` },
      body,
    });
    if (res.ok) return { job: job.title, company: job.company, method: "greenhouse", status: "applied", message: "Submitted via Greenhouse API.", url: job.url };
    return assistedResult(job, "greenhouse", `Greenhouse returned ${res.status} — queued as assisted.`);
  } catch (e) {
    return assistedResult(job, "greenhouse", `Greenhouse error (${(e as Error).message}) — queued as assisted.`);
  }
}

function assistedResult(job: RawJob, method: string, message: string): ApplyResult {
  return { job: job.title, company: job.company, method, status: "assisted-pending", message, url: job.url };
}

export async function applyToJob(job: RawJob): Promise<ApplyResult & { coverLetter: string }> {
  const { coverLetter } = await generateCoverLetter(job);

  let result: ApplyResult;
  const ats = detectAts(job.url);
  const browserOn = process.env.AUTO_APPLY_BROWSER === "true";

  if (browserOn && ats !== "unknown") {
    // Fully automated path: a headless browser fills (and, if AUTO_SUBMIT=true, submits) the form.
    const r = await browserApply(job.url, ats, coverLetter);
    result = {
      job: job.title,
      company: job.company,
      method: ats,
      status: r.submitted ? "applied" : "assisted-pending",
      message: r.detail,
      url: job.url,
    };
  } else if (process.env.GREENHOUSE_API_KEY && job.source === "greenhouse") {
    result = await submitGreenhouse(job, coverLetter);
  } else {
    result = assistedResult(
      job,
      ats === "unknown" ? "assisted" : ats,
      "Cover letter + answers generated. Open the link to finish applying." +
        (ats !== "unknown" ? " (Enable AUTO_APPLY_BROWSER for hands-free submit.)" : "")
    );
  }

  // Persist to Firestore (best-effort; app still works if DB not configured yet)
  if (isFirebaseConfigured()) {
    try {
      await firestore().collection("applications").add({
        title: job.title,
        company: job.company,
        company_type: job.company_type ?? "unknown",
        location: job.location ?? "",
        is_remote: !!job.is_remote,
        employment: job.employment ?? "unknown",
        salary: job.salary ?? null,
        url: job.url,
        source: job.source,
        method: result.method,
        status: result.status,
        responded: false,
        useful: false,
        ai_cover_letter: coverLetter,
        applied_at: new Date(),
      });
    } catch (e) {
      console.warn("[apply] DB insert skipped:", (e as Error).message);
    }
  }

  return { ...result, coverLetter };
}

// Apply to a whole batch (this is what the big Apply button calls).
export async function applyBatch(jobs: RawJob[], target = 15) {
  const batch = jobs.slice(0, Math.max(10, Math.min(25, target)));
  const results: (ApplyResult & { coverLetter: string })[] = [];
  for (const job of batch) {
    results.push(await applyToJob(job));
  }
  return {
    attempted: results.length,
    autoApplied: results.filter((r) => r.status === "applied").length,
    assisted: results.filter((r) => r.status === "assisted-pending").length,
    results,
  };
}
