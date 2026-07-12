"use client";

import { useState } from "react";
import { ExternalLink, Search, Users, Info } from "lucide-react";

// ToS-safe: we build official search deep-links and open them in a new tab.
// We never bot LinkedIn/Naukri/Internshala on your account.
function links(query: string, location: string) {
  const q = encodeURIComponent(query);
  const qh = encodeURIComponent(query + " hiring");
  const l = encodeURIComponent(location);
  const slug = query.trim().replace(/\s+/g, "-").toLowerCase();
  const kw = query.trim().replace(/\s+/g, "%20");
  return [
    { group: "LinkedIn", items: [
      { label: "Jobs (last 7 days, newest)", url: `https://www.linkedin.com/jobs/search/?keywords=${q}&location=${l}&f_TPR=r604800&sortBy=DD` },
      { label: "Internships (entry level)", url: `https://www.linkedin.com/jobs/search/?keywords=${q}&location=${l}&f_E=1%2C2&f_TPR=r604800` },
      { label: "🔥 Hiring posts (people posting openings)", url: `https://www.linkedin.com/search/results/content/?keywords=${qh}&sortBy=%22date_posted%22` },
      { label: "🤝 Referral posts", url: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(query + " referral")}&sortBy=%22date_posted%22` },
    ]},
    { group: "Naukri", items: [
      { label: `Jobs in ${location}`, url: `https://www.naukri.com/${slug}-jobs-in-${location.toLowerCase()}` },
      { label: "Fresher jobs", url: `https://www.naukri.com/fresher-${slug}-jobs` },
    ]},
    { group: "Internshala", items: [
      { label: "Internships", url: `https://internshala.com/internships/keywords-${kw}/` },
      { label: `Internships in ${location}`, url: `https://internshala.com/internships/${location.toLowerCase()}-location-internship/` },
    ]},
    { group: "Indeed & more", items: [
      { label: "Indeed (last 7 days)", url: `https://in.indeed.com/jobs?q=${q}&l=${l}&fromage=7&sort=date` },
      { label: "Instahyre", url: `https://www.instahyre.com/search-jobs/?job_title=${q}` },
      { label: "Wellfound (startups)", url: `https://wellfound.com/jobs` },
    ]},
  ];
}

export default function ReferralsPage() {
  const [query, setQuery] = useState("software engineer intern");
  const [location, setLocation] = useState("Bengaluru");
  const groups = links(query, location);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold"><Users className="h-6 w-6 text-accent" /> LinkedIn &amp; Referrals</h1>
        <p className="text-sm text-muted">Latest hiring posts, referral posts and platform jobs — opened safely in your own browser session.</p>
      </header>

      <div className="card flex items-start gap-3 border-accent/20 bg-accent/5 text-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <p className="text-muted">These platforms ban bots. So instead of auto-applying (which risks your account), NaukriMitra builds precise, freshness-sorted search links. Click one, skim the latest posts, and apply/DM manually. For real auto-apply, use the <b>Find &amp; Apply</b> tab (Greenhouse/Lever/Forms).</p>
      </div>

      <div className="card flex flex-wrap gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-panel2 px-3">
          <Search className="h-4 w-4 text-muted" />
          <input className="w-full bg-transparent py-2 text-sm outline-none" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Role / keywords" />
        </div>
        <input className="input max-w-[180px]" value={location} onChange={(e) => setLocation(e.target.value)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {groups.map((g) => (
          <div key={g.group} className="card">
            <div className="mb-3 text-sm font-semibold">{g.group}</div>
            <div className="space-y-2">
              {g.items.map((it) => (
                <a key={it.label} href={it.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl border border-border bg-panel2 px-3 py-2 text-sm hover:border-accent">
                  <span>{it.label}</span><ExternalLink className="h-3.5 w-3.5 text-accent" />
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
