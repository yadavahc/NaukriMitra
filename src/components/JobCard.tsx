"use client";

import { ExternalLink, Zap, Hand, MapPin, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface JobDTO {
  source: string;
  external_id: string;
  title: string;
  company: string;
  company_type?: string;
  location?: string;
  is_remote?: boolean;
  employment?: string;
  salary?: string;
  url: string;
  apply_type?: "auto" | "assisted";
  match_score: number;
  posted_at?: string;
}

export function JobCard({ job, selected, onToggle }: { job: JobDTO; selected?: boolean; onToggle?: () => void }) {
  const auto = job.apply_type === "auto";
  return (
    <div className={cn("card card-hover animate-fade-up", selected && "border-white/25 bg-white/[0.05]")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold tracking-tight">{job.title}</h3>
            <span
              className={cn(
                "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                job.match_score >= 70 ? "bg-accent2/15 text-accent2" : job.match_score >= 50 ? "bg-warn/15 text-warn" : "bg-white/5 text-muted"
              )}
            >
              {job.match_score}% fit
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted">
            <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {job.company}</span>
            {job.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>}
            {job.is_remote && <span className="pill">Remote</span>}
            {job.employment && job.employment !== "unknown" && <span className="pill capitalize">{job.employment}</span>}
            {job.company_type === "startup" && <span className="pill">startup</span>}
            {job.salary && <span className="pill">{job.salary}</span>}
            <span className="pill">{job.source}</span>
          </div>
        </div>
        {onToggle && (
          <input type="checkbox" checked={!!selected} onChange={onToggle} className="mt-1 h-4 w-4 shrink-0 accent-white" />
        )}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
        <span className={cn("flex items-center gap-1.5 text-xs", auto ? "text-accent2" : "text-warn")}>
          {auto ? <Zap className="h-3.5 w-3.5" /> : <Hand className="h-3.5 w-3.5" />}
          {auto ? "Auto-apply eligible" : "Assisted apply"}
        </span>
        <a href={job.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-accentSoft transition hover:text-white">
          Open <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
