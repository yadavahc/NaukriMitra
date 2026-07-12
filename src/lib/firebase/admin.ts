import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

// Server-side Firebase Admin (Firestore). NEVER import this in a client component.
let _db: Firestore | null = null;

export function firestore(): Firestore {
  if (_db) return _db;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in .env.local"
    );
  }
  // .env stores the private key with literal \n — turn them back into real newlines.
  privateKey = privateKey.replace(/\\n/g, "\n");

  const app: App = getApps().length
    ? getApps()[0]
    : initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  _db = getFirestore(app);
  return _db;
}

export function isFirebaseConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY
  );
}

// Firestore doc ids can't contain "/" — build a safe deterministic id for dedupe.
export function safeDocId(source: string, externalId: string): string {
  return `${source}__${externalId}`.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 1400);
}

// Firestore Timestamp | Date | string → ISO string (for JSON responses)
export function toIso(v: any): string | null {
  if (!v) return null;
  if (typeof v === "string") return v;
  if (typeof v.toDate === "function") return v.toDate().toISOString();
  if (v instanceof Date) return v.toISOString();
  return null;
}
