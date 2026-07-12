"use client";

import { useEffect, useState } from "react";
import { JobCard, JobDTO } from "@/components/JobCard";
import { Search, Zap, Loader2, CheckCircle2, Hand } from "lucide-react";

const ROLE_PRESETS = ["software engineer intern", "full stack developer", "react developer", "python developer", "frontend developer", "sde intern"];

export default function JobsPage() {
  const [query, setQuery] = useState("software engineer intern");
  const [location, setLocation] = useState("Bengaluru");
  const [jobs, setJobs] = useState<JobDTO[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [target, setTarget] = useState(15);
  const [result, setResult] = useState<any>(null);
  const [hasAdzuna, setHasAdzuna] = useState(true);

  async function search() {
    setLoading(true);
    setResult(null);
    const r = await fetch(`/api/jobs?q=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&limit=80`);
    const d = await r.json();
    setJobs(d.jobs || []);
    setHasAdzuna(d.adzunaConfigured ?? false);
    // Preselect best-fit jobs up to target
    setSelected(new Set((d.jobs || []).slice(0, target).map((j: JobDTO) => j.external_id)));
    setLoading(false);
  }

  useEffect(() => { search(); /* eslint-disable-next-line */ }, []);

  function toggle(id: string) {
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  async function applyNow() {
    setApplying(true);
    setResult(null);
    const chosen = jobs.filter((j) => selected.has(j.external_id));
    const r = await fetch("/api/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobs: chosen, target }),
    });
    setResult(await r.json());
    setApplying(false);
  }

  const autoCount = jobs.filter((j) => selected.has(j.external_id) && j.apply_type === "auto").length;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight heading-gradient">Find &amp; Apply</h1>
        <p className="mt-1 text-sm text-muted">Tech internships &amp; fresher roles, Bengaluru-first — filtered to your profile, ranked by fit.</p>
      </header>

      {!hasAdzuna && (
        <div className="card flex items-start gap-3 border-warn/20 bg-warn/[0.04] text-sm">
          <span className="mt-0.5 text-warn">📍</span>
          <p className="text-muted">
            Seeing mostly remote roles? To pull <b className="text-text">Bengaluru-based</b> jobs, add a free{" "}
            <a href="https://developer.adzuna.com/signup" target="_blank" rel="noreferrer" className="text-accentSoft hover:text-white">Adzuna API key</a>{" "}
            to <span className="font-mono text-xs">.env.local</span> (<span className="font-mono text-xs">ADZUNA_APP_ID</span> + <span className="font-mono text-xs">ADZUNA_APP_KEY</span>) and restart. Takes 2 minutes.
          </p>
        </div>
      )}

      <div className="card space-y-3">
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-panel2 px-3">
            <Search className="h-4 w-4 text-muted" />
            <input className="w-full bg-transparent py-2 text-sm outline-none" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Role, e.g. software engineer intern" onKeyDown={(e) => e.key === "Enter" && search()} />
          </div>
          <input className="input max-w-[180px]" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" />
          <button className="btn-ghost" onClick={search} disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {ROLE_PRESETS.map((r) => (
            <button key={r} onClick={() => { setQuery(r); }} className="pill hover:text-text">{r}</button>
          ))}
        </div>
      </div>

      {/* The big Apply button */}
      <div className="card flex flex-wrap items-center justify-between gap-4 border-accent/30 bg-accent/5">
        <div>
          <div className="text-sm font-medium">{selected.size} jobs selected · {autoCount} auto-apply, {selected.size - autoCount} assisted</div>
          <div className="text-xs text-muted">Auto-apply submits programmatically. Assisted generates your cover letter + answers and gives you a one-click link (keeps LinkedIn/Naukri accounts safe).</div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-muted">Target
            <input type="number" min={10} max={25} value={target} onChange={(e) => setTarget(Number(e.target.value))} className="input w-16" />
          </label>
          <button className="btn-primary" onClick={applyNow} disabled={applying || selected.size === 0}>
            {applying ? <><Loader2 className="h-4 w-4 animate-spin" /> Applying…</> : <><Zap className="h-4 w-4" /> Apply to {selected.size} jobs</>}
          </button>
        </div>
      </div>

      {result && (
        <div className="card border-accent2/30 bg-accent2/5 text-sm">
          <div className="mb-2 flex items-center gap-2 font-medium"><CheckCircle2 className="h-4 w-4 text-accent2" /> Applied to {result.attempted} jobs — {result.autoApplied} auto-submitted, {result.assisted} assisted-pending</div>
          {result.note && <p className="text-muted">{result.note}</p>}
          <div className="mt-2 space-y-1">
            {(result.results || []).map((r: any, i: number) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                {r.status === "applied" ? <Zap className="h-3 w-3 text-accent2" /> : <Hand className="h-3 w-3 text-warn" />}
                <span className="font-medium">{r.job}</span><span className="text-muted">@ {r.company} — {r.message}</span>
                {r.url && r.status !== "applied" && <a href={r.url} target="_blank" rel="noreferrer" className="text-accent hover:underline">finish →</a>}
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16 text-muted"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {jobs.map((j) => (
            <JobCard key={`${j.source}-${j.external_id}`} job={j} selected={selected.has(j.external_id)} onToggle={() => toggle(j.external_id)} />
          ))}
          {jobs.length === 0 && <p className="col-span-full py-10 text-center text-sm text-muted">No jobs found. Try a different role, or add Greenhouse/Lever company slugs &amp; Adzuna keys in .env.local for more results.</p>}
        </div>
      )}
    </div>
  );
}
