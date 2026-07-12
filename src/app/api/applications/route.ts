import { NextRequest, NextResponse } from "next/server";
import { firestore, isFirebaseConfigured, toIso } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isFirebaseConfigured()) return NextResponse.json({ applications: [], configured: false });
  try {
    const db = firestore();
    const snap = await db.collection("applications").orderBy("applied_at", "desc").limit(500).get();
    const applications = snap.docs.map((d) => {
      const data = d.data();
      return { id: d.id, ...data, applied_at: toIso(data.applied_at), responded_at: toIso(data.responded_at) };
    });
    return NextResponse.json({ applications, configured: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message, applications: [], configured: true }, { status: 500 });
  }
}

// PATCH — mark useful / responded / update status
export async function PATCH(req: NextRequest) {
  if (!isFirebaseConfigured()) return NextResponse.json({ error: "DB not configured" }, { status: 400 });
  const { id, ...patch } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  if (patch.responded === true && !patch.responded_at) patch.responded_at = new Date();
  try {
    const db = firestore();
    await db.collection("applications").doc(id).set(patch, { merge: true });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isFirebaseConfigured()) return NextResponse.json({ error: "DB not configured" }, { status: 400 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  try {
    await firestore().collection("applications").doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
