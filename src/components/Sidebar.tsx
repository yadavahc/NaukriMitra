"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Search, Send, Briefcase, Users, GraduationCap, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs", label: "Find & Apply", icon: Search },
  { href: "/applications", label: "Applications", icon: Briefcase },
  { href: "/referrals", label: "LinkedIn & Referrals", icon: Users },
  { href: "/freshers", label: "Interns & Freshers", icon: GraduationCap },
];

export function Sidebar() {
  const path = usePathname();
  if (path === "/login") return null;

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/[0.06] bg-black/30 px-3 py-6 backdrop-blur-xl md:flex">
      <div className="mb-8 px-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-black shadow-glow">
            <Send className="h-4 w-4" />
          </span>
          <span className="text-lg font-semibold tracking-tight heading-gradient">NaukriMitra</span>
        </div>
        <p className="mt-2 px-0.5 text-xs text-muted">Yadava&apos;s job autopilot</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {nav.map((n) => {
          const active = n.href === "/" ? path === "/" : path.startsWith(n.href);
          const Icon = n.icon;
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition duration-200",
                active ? "bg-white/[0.06] text-text" : "text-muted hover:bg-white/[0.03] hover:text-text"
              )}
            >
              {active && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-white" />}
              <Icon className={cn("h-[18px] w-[18px] transition", active ? "text-white" : "text-muted group-hover:text-text")} />
              {n.label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={logout}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition hover:bg-white/[0.03] hover:text-danger"
      >
        <LogOut className="h-[18px] w-[18px]" /> Log out
      </button>
    </aside>
  );
}
