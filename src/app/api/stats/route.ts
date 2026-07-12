import { NextResponse } from "next/server";
import { firestore, isFirebaseConfigured, toIso } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

const EMPTY = { total: 0, week: 0, month: 0, responses: 0, useful: 0, internships: 0, fulltime: 0 };

export async function GET() {
  if (!isFirebaseConfigured()) return NextResponse.json({ stats: EMPTY, trend: emptyTrend(), configured: false });
  try {
    const db = firestore();
    const snap = await db.collection("applications").get();
    const now = Date.now();
    const week = now - 7 * 86400000;
    const month = now - 30 * 86400000;

    const stats = { ...EMPTY };
    const byDay: Record<string, number> = {};

    snap.forEach((doc) => {
      const a = doc.data();
      const iso = toIso(a.applied_at);
      const t = iso ? new Date(iso).getTime() : 0;
      stats.total++;
      if (t >= week) stats.week++;
      if (t >= month) {
        stats.month++;
        const key = new Date(t).toISOString().slice(0, 10);
        byDay[key] = (byDay[key] || 0) + 1;
      }
      if (a.responded) stats.responses++;
      if (a.useful) stats.useful++;
      if (a.employment === "internship") stats.internships++;
      if (a.employment === "full-time") stats.fulltime++;
    });

    const trend = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now - (29 - i) * 86400000).toISOString().slice(0, 10);
      return { date: d.slice(5), count: byDay[d] || 0 };
    });

    return NextResponse.json({ stats, trend, configured: true });
  } catch (e) {
    return NextResponse.json({ stats: EMPTY, trend: emptyTrend(), configured: true, error: (e as Error).message });
  }
}

function emptyTrend() {
  const now = Date.now();
  return Array.from({ length: 30 }, (_, i) => ({ date: new Date(now - (29 - i) * 86400000).toISOString().slice(5, 10), count: 0 }));
}
