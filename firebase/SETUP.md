# Firebase setup for NaukriMitra

NaukriMitra uses **Cloud Firestore** via the **Firebase Admin SDK** (server-side only).

## 1. Create the project
1. Go to https://console.firebase.google.com → **Add project** (e.g. `naukrimitra`).
2. In the left nav → **Build → Firestore Database → Create database** → start in **Production mode** → pick region `asia-south1` (Mumbai, closest to Bengaluru).

## 2. Lock the security rules
Firestore → **Rules** tab → paste the contents of [`firestore.rules`](firestore.rules) → **Publish**.
(Everything goes through the Admin SDK server-side, so the browser needs zero access.)

## 3. Get the service-account credentials
1. ⚙️ **Project settings → Service accounts**.
2. Click **Generate new private key** → downloads a JSON file.
3. From that JSON, copy three values into `.env.local`:
   - `project_id`     → `FIREBASE_PROJECT_ID`
   - `client_email`   → `FIREBASE_CLIENT_EMAIL`
   - `private_key`    → `FIREBASE_PRIVATE_KEY`  (paste the whole string **in quotes**, keep the `\n`s)

Example `.env.local` line:
```
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADAN...\n-----END PRIVATE KEY-----\n"
```

## 4. Collections (created automatically)
No manual schema needed — Firestore is schemaless. The app creates these on first write:
- **`jobs`** — discovered openings (doc id = `source__externalId`, deduped)
- **`applications`** — one doc per job you applied to (has `responded`, `useful`, `status`, `applied_at`, `ai_cover_letter` …)
- **`posts`** — (reserved) saved LinkedIn/referral posts

## 5. (Optional) Indexes
The stats query reads the whole `applications` collection (fine for personal volume).
The applications list uses `orderBy('applied_at', 'desc')` — Firestore builds that
single-field index automatically. If the console ever prompts you to create a
composite index, click the link it gives you.

That's it — run `npm run dev` and log in.
