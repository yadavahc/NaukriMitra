# NaukriMitra — Yadava's Job Autopilot 🚀

A **private, single-user** web app that discovers software / internship / fresher jobs from many sources, **auto-applies** where it's legal and safe, generates AI-tailored cover letters & answers everywhere else, and **tracks every application** on a dashboard with weekly / monthly / all-time stats.

Built with **Next.js 15 · TypeScript · Tailwind · Firebase (Firestore) · OpenAI→Gemini fallback**.

---

## ⚖️ How applying actually works (read this first)

| Mode | Where | What happens |
|------|-------|--------------|
| ⚡ **Auto-apply** | Greenhouse, Lever, Google Forms | Submitted programmatically via **official/public** endpoints. Real one-click. |
| ✋ **Assisted** | LinkedIn, Naukri, Internshala, Indeed | These **ban bots** and will kill your account. So we generate your cover letter + answers and hand you a **one-click link** to finish the submit yourself. **No bot ever touches your LinkedIn/Naukri account.** |

The big **"Apply to N jobs"** button applies to a batch of 10–25: auto-submits the ATS ones, queues the rest as assisted with everything pre-written.

> Why not fully bot LinkedIn/Naukri? Their ToS forbid automation and their detection is aggressive — a banned account is not worth it. This design gets you the same volume without the risk.

---

## 🛠 Setup (≈ 10 minutes)

### 1. Install
```bash
cd NaukriMitra
npm install
```

### 2. Create the database (Firebase / Firestore)
Follow [`firebase/SETUP.md`](firebase/SETUP.md) — it's a 4-step walkthrough:
1. Create a Firebase project + enable **Firestore** (region `asia-south1`, Mumbai).
2. Publish the locked security rules from [`firebase/firestore.rules`](firebase/firestore.rules).
3. **Project settings → Service accounts → Generate new private key** → copy `project_id`, `client_email`, `private_key` into `.env.local`.
4. Collections (`jobs`, `applications`, `posts`) are created automatically on first write.

### 3. Configure env
```bash
cp .env.local.example .env.local
```
Fill in `.env.local`:
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (paste the key in quotes, keep the `\n`s)
- `APP_PASSWORD` — the password **you** log in with
- `AUTH_SECRET` — any long random string (e.g. run `openssl rand -hex 32`)
- `OPENAI_API_KEY` and/or `GEMINI_API_KEY` — OpenAI is tried first, Gemini is the automatic fallback
- *(optional but recommended)* `ADZUNA_APP_ID` + `ADZUNA_APP_KEY` — free key from https://developer.adzuna.com/ for India/Bengaluru jobs
- *(optional)* `GREENHOUSE_BOARDS` / `LEVER_BOARDS` — comma-separated company slugs of startups you like (these unlock real auto-apply). Example: `GREENHOUSE_BOARDS=razorpay,gitlab`

### 4. Run
```bash
npm run dev
```
Open **http://localhost:3000**, log in with `APP_PASSWORD`. Done.

---

## 🧭 Pages
- **Dashboard** — weekly/monthly/all-time stats, 30-day trend chart, recent applications.
- **Find & Apply** — aggregated ranked jobs + the big auto-apply button.
- **Applications** — every company you applied to. Change status, tick **Responded** and **Useful** when a company gets back to you. Filter by responded / useful / internship.
- **LinkedIn & Referrals** — freshness-sorted deep links to LinkedIn jobs, **hiring posts**, **referral posts**, Naukri, Internshala, Indeed, Instahyre, Wellfound.
- **Interns & Freshers** — big-company early-career/apprenticeship programs + live internships matched to you.

---

## 🔒 Access
Locked behind a password gate (`APP_PASSWORD`) enforced in [`src/middleware.ts`](src/middleware.ts). Only you can get in. Deploy privately (e.g. Vercel) and keep the env secret.

## 🧠 Your data
All of your details live in [`src/lib/profile.ts`](src/lib/profile.ts) (auto-extracted from your resume + portfolio). Edit that one file whenever anything changes — every application and AI answer uses it. Your resume PDF is in [`public/YADAVA_RESUME_2026.pdf`](public/).

---

## 🧩 Adding more auto-apply coverage
Real auto-apply grows as you add ATS company slugs. Find companies that use Greenhouse (`boards.greenhouse.io/<slug>`) or Lever (`jobs.lever.co/<slug>`) and add their slugs to `GREENHOUSE_BOARDS` / `LEVER_BOARDS`. Many Bengaluru startups use these.

## 🗺 Roadmap ideas (not yet built)
- Google Forms auto-fill via prefilled-URL generation
- Scheduled daily auto-apply (cron) with a per-day cap
- Email inbox scanning to auto-detect company responses
- Browser-extension companion for true 1-click assisted submit

## ⚠️ Disclaimer
For your **personal use only**. Respect each platform's Terms of Service — the assisted model exists precisely so you don't violate them. Never share your `.env.local`.
