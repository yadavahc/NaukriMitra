"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatCard } from "@/components/StatCard";
import { TrendChart } from "@/components/TrendChart";
import { timeAgo } from "@/lib/utils";
import { Search, CheckCircle2, AlertTriangle } from "lucide-react";

type Stats = { total: number; week: number; month: number; responses: number; useful: number; internships: number; fulltime: number };
type App = { id: string; title: string; company: string; status: string; useful: boolean; responded: boolean; applied_at: string; location?: string; employment?: string };

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [trend, setTrend] = useState<{ date: string; count: number }[]>([]);
  const [recent, setRecent] = useState<App[]>([]);
  const [configured, setConfigured] = useState(true);

  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then((d) => {
      setStats(d.stats);
      setTrend(d.trend || []);
      setConfigured(d.configured);
    });
    fetch("/api/applications").then((r) => r.json()).then((d) => setRecent((d.applications || []).slice(0, 6)));
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight heading-gradient">Welcome back, Yadava</h1>
          <p className="mt-1 text-sm text-muted">Your job autopilot — discover, apply, and track everything in one place.</p>
        </div>
        <Link href="/jobs" className="btn-primary"><Search className="h-4 w-4" /> Find & Apply</Link>
      </header>

      {!configured && (
        <div className="card flex items-center gap-3 border-warn/40 bg-warn/5 text-sm">
          <AlertTriangle className="h-5 w-5 text-warn" />
          Firebase isn&apos;t configured yet — stats will stay at zero. See <span className="font-mono">README.md → Setup</span>.
        </div>
      )}

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="This week" value={stats?.week ?? 0} accent="accent" sub="applications sent" />
        <StatCard label="This month" value={stats?.month ?? 0} sub="applications sent" />
        <StatCard label="All time" value={stats?.total ?? 0} sub="total applied" />
        <StatCard label="Responses" value={stats?.responses ?? 0} accent="accent2" sub={`${stats?.useful ?? 0} marked useful`} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2"><TrendChart data={trend} /></div>
        <div className="card">
          <div className="mb-3 text-sm font-medium">Breakdown</div>
          <Row label="Internships" value={stats?.internships ?? 0} />
          <Row label="Full-time" value={stats?.fulltime ?? 0} />
          <Row label="Responses received" value={stats?.responses ?? 0} />
          <Row label="Marked useful" value={stats?.useful ?? 0} />
        </div>
      </section>

      <section className="card">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-medium">Recent applications</div>
          <Link href="/applications" className="text-xs text-accent hover:underline">View all →</Link>
        </div>
        {recent.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">No applications yet. Head to <Link className="text-accent" href="/jobs">Find & Apply</Link>.</p>
        ) : (
          <div className="divide-y divide-border">
            {recent.map((a) => (
              <div key={a.id} className="flex items-center justify-between py-2.5 text-sm">
                <div className="min-w-0">
                  <div className="truncate font-medium">{a.title}</div>
                  <div className="text-xs text-muted">{a.company} · {a.location || "—"} · {timeAgo(a.applied_at)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="pill">{a.status}</span>
                  {a.useful && <CheckCircle2 className="h-4 w-4 text-accent2" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0">
      <span className="text-muted">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
