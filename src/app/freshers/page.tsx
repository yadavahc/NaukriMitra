"use client";

import { useEffect, useState } from "react";
import { JobCard, JobDTO } from "@/components/JobCard";
import { GraduationCap, Loader2, ExternalLink } from "lucide-react";

// Curated big-company early-career / apprenticeship programs (open in browser).
const PROGRAMS = [
  { name: "Google — STEP / Early Career", url: "https://www.google.com/about/careers/applications/jobs/results/?employment_type=INTERN" },
  { name: "Microsoft — Internships & Aspire", url: "https://careers.microsoft.com/v2/global/en/students" },
  { name: "Amazon — SDE Intern / Apprenticeship", url: "https://www.amazon.jobs/en/teams/internships-for-students" },
  { name: "Flipkart — Runway / GRiD", url: "https://www.flipkartcareers.com/" },
  { name: "Zoho — Freshers", url: "https://careers.zohocorp.com/jobs" },
  { name: "Atlassian — Interns & Grads", url: "https://www.atlassian.com/company/careers/students" },
  { name: "Uber — University", url: "https://www.uber.com/us/en/careers/teams/university/" },
  { name: "Salesforce — Futureforce", url: "https://www.salesforce.com/company/careers/university-recruiting/" },
  { name: "SAP Labs India — iXp", url: "https://jobs.sap.com/search/?q=intern&locationsearch=India" },
  { name: "GitHub — Early Career", url: "https://www.github.careers/careers-home/jobs?keywords=intern" },
];

export default function FreshersPage() {
  const [jobs, setJobs] = useState<JobDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/jobs?q=${encodeURIComponent("intern")}&location=Bengaluru&limit=80`)
      .then((r) => r.json())
      .then((d) => {
        const list = (d.jobs || []).filter((j: JobDTO) => j.employment === "internship" || j.employment === "apprenticeship" || j.match_score >= 55);
        setJobs(list);
        setLoading(false);
      });
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold"><GraduationCap className="h-6 w-6 text-accent" /> Interns &amp; Freshers</h1>
        <p className="text-sm text-muted">You&apos;re in your 7th sem — these are your best-fit internships, apprenticeships and entry-level roles.</p>
      </header>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted">Big-company early-career &amp; apprenticeship programs</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PROGRAMS.map((p) => (
            <a key={p.name} href={p.url} target="_blank" rel="noreferrer" className="card flex items-center justify-between hover:border-accent">
              <span className="text-sm font-medium">{p.name}</span><ExternalLink className="h-4 w-4 text-accent" />
            </a>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted">Live internships matched to you</h2>
        {loading ? (
          <div className="flex justify-center py-12 text-muted"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {jobs.map((j) => <JobCard key={`${j.source}-${j.external_id}`} job={j} />)}
            {jobs.length === 0 && <p className="col-span-full py-8 text-center text-sm text-muted">No live internships cached yet — run a search on Find &amp; Apply first.</p>}
          </div>
        )}
      </section>
    </div>
  );
}
