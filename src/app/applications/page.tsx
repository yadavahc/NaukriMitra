"use client";

import { useEffect, useMemo, useState } from "react";
import { timeAgo } from "@/lib/utils";
import { CheckCircle2, Circle, ExternalLink, MessageSquare } from "lucide-react";

type App = {
  id: string; title: string; company: string; company_type?: string; location?: string;
  is_remote?: boolean; employment?: string; salary?: string; url?: string; source?: string;
  method?: string; status: string; responded: boolean; useful: boolean; applied_at: string;
};

const STATUSES = ["applied", "assisted-pending", "interview", "offer", "rejected", "ghosted"];

export default function ApplicationsPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [filter, setFilter] = useState<"all" | "responded" | "useful" | "internship">("all");
  const [configured, setConfigured] = useState(true);

  async function load() {
    const d = await (await fetch("/api/applications")).json();
    setApps(d.applications || []);
    setConfigured(d.configured);
  }
  useEffect(() => { load(); }, []);

  async function patch(id: string, body: Partial<App>) {
    setApps((a) => a.map((x) => (x.id === id ? { ...x, ...body } : x))); // optimistic
    await fetch("/api/applications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...body }) });
  }

  const filtered = useMemo(() => apps.filter((a) => {
    if (filter === "responded") return a.responded;
    if (filter === "useful") return a.useful;
    if (filter === "internship") return a.employment === "internship";
    return true;
  }), [apps, filter]);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Applications</h1>
          <p className="text-sm text-muted">Every company you&apos;ve applied to. Tick <b>Useful</b> when a company responds usefully.</p>
        </div>
        <div className="flex gap-2">
          {(["all", "responded", "useful", "internship"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`pill ${filter === f ? "border-accent text-accent" : ""}`}>{f}</button>
          ))}
        </div>
      </header>

      {!configured && <div className="card border-warn/40 bg-warn/5 text-sm">Firebase not configured — applications won&apos;t persist. See README.</div>}

      <div className="card overflow-x-auto p-0">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase text-muted">
              <th className="p-3">Role / Company</th>
              <th className="p-3">Type</th>
              <th className="p-3">Location</th>
              <th className="p-3">Applied</th>
              <th className="p-3">Status</th>
              <th className="p-3">Responded</th>
              <th className="p-3">Useful</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id} className="border-b border-border last:border-0 hover:bg-panel2/40">
                <td className="p-3">
                  <div className="font-medium">{a.title}</div>
                  <div className="text-xs text-muted">{a.company}{a.company_type && a.company_type !== "unknown" ? ` · ${a.company_type}` : ""} · via {a.method || a.source}</div>
                </td>
                <td className="p-3">
                  <span className="pill">{a.employment && a.employment !== "unknown" ? a.employment : "—"}</span>
                  {a.salary && <div className="mt-1 text-xs text-muted">{a.salary}</div>}
                </td>
                <td className="p-3 text-xs text-muted">{a.is_remote ? "Remote" : a.location || "—"}</td>
                <td className="p-3 text-xs text-muted">{timeAgo(a.applied_at)}</td>
                <td className="p-3">
                  <select value={a.status} onChange={(e) => patch(a.id, { status: e.target.value })} className="rounded-lg border border-border bg-panel2 px-2 py-1 text-xs">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-3">
                  <button onClick={() => patch(a.id, { responded: !a.responded })} title="Mark responded">
                    <MessageSquare className={`h-5 w-5 ${a.responded ? "text-accent" : "text-muted"}`} />
                  </button>
                </td>
                <td className="p-3">
                  <button onClick={() => patch(a.id, { useful: !a.useful })} title="Mark useful">
                    {a.useful ? <CheckCircle2 className="h-5 w-5 text-accent2" /> : <Circle className="h-5 w-5 text-muted" />}
                  </button>
                </td>
                <td className="p-3">{a.url && <a href={a.url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4 text-accent" /></a>}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-muted">No applications here yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
