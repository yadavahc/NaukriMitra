"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function TrendChart({ data }: { data: { date: string; count: number }[] }) {
  return (
    <div className="card">
      <div className="mb-3 text-sm font-medium">Applications — last 30 days</div>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7aa2ff" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#7aa2ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fill: "#8f8f9a", fontSize: 10 }} interval={4} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#8f8f9a", fontSize: 10 }} allowDecimals={false} axisLine={false} tickLine={false} width={28} />
            <Tooltip
              contentStyle={{ background: "#0f0f12", border: "1px solid #232328", borderRadius: 12, color: "#f5f5f7" }}
              labelStyle={{ color: "#8f8f9a" }}
              cursor={{ stroke: "#232328" }}
            />
            <Area type="monotone" dataKey="count" stroke="#7aa2ff" strokeWidth={2} fill="url(#g)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
