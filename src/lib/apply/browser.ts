// ───────────────────────────────────────────────────────────────
//  Browser auto-apply (Playwright) — fills & submits real ATS forms.
//
//  SCOPE (honest): Greenhouse, Lever, Google Forms only. NOT
//  LinkedIn / Naukri / Internshala (bot-banned → account death).
//  Forms with reCAPTCHA can't be auto-submitted (we detect and skip).
//
//  FLAGS (.env.local):
//   AUTO_APPLY_BROWSER=true → open headless browser and FILL
//   AUTO_SUBMIT=true        → also click Submit (else dry-run + screenshot)
// ───────────────────────────────────────────────────────────────

import path from "path";
import { profile } from "@/lib/profile";

const RESUME_PATH = path.join(process.cwd(), "public", profile.resumeFile.replace(/^\//, ""));
const SUBMIT = process.env.AUTO_SUBMIT === "true";
const T = { timeout: 1500 }; // short op timeout so missing elements don't hang 30s

export type Ats = "greenhouse" | "lever" | "google-form" | "unknown";
export interface BrowserApplyResult { submitted: boolean; detail: string }

export function detectAts(url: string): Ats {
  if (/greenhouse\.io|boards\.greenhouse/.test(url)) return "greenhouse";
  if (/lever\.co/.test(url)) return "lever";
  if (/docs\.google\.com\/forms|forms\.gle/.test(url)) return "google-form";
  return "unknown";
}

async function getChromium() {
  const { chromium } = await import("playwright");
  return chromium;
}

async function has(loc: any): Promise<boolean> {
  return (await loc.count().catch(() => 0)) > 0;
}

async function fill(page: any, selectors: string[], value: string) {
  for (const sel of selectors) {
    const el = page.locator(sel).first();
    if (await has(el)) {
      await el.fill(value, T).catch(() => {});
      return true;
    }
  }
  return false;
}

// ── Answer policy for Yadava (final-year fresher, Bengaluru) ──
function radioPrefs(label: string): string[] {
  const l = label.toLowerCase();
  if (/gender/.test(l)) return ["prefer not", "male"];
  if (/experience|years|yrs/.test(l)) return ["0 to", "0-", "fresher", "less than", "0"];
  if (/notice/.test(l)) return ["0 to 30", "immediate", "15", "less than", "0"];
  if (/hear|know about|source|referr/.test(l)) return ["linkedin", "job site", "others", "other"];
  if (/hispanic|latino|veteran|disab/.test(l)) return ["prefer not", "no", "not"];
  if (/relocat|based|bangalore|bengaluru|onsite|on-site|willing|able to work|authoriz|eligible|comfortable/.test(l))
    return ["yes"];
  return ["yes"]; // default yes/no
}
function textAnswer(label: string): string {
  const l = label.toLowerCase();
  if (/current.*comp|current ctc|present.*salary/.test(l)) return "Not applicable — final-year student";
  if (/expected.*comp|expected ctc|expected.*salary/.test(l)) return "As per company standards";
  if (/notice/.test(l)) return "Immediate";
  if (/location|city|where/.test(l)) return `${profile.location.city}, ${profile.location.country}`;
  if (/college|university|institution|school/.test(l)) return profile.education[0].institution;
  if (/why|cover|interest|motivat/.test(l)) return profile.pitch;
  return profile.pitch.slice(0, 140);
}

// Fill Lever's custom question blocks (radios / checkboxes / text / textarea).
async function fillCustomQuestions(page: any) {
  const blocks = page.locator("li.application-question, .application-question, .application-additional li");
  const n = Math.min(await blocks.count().catch(() => 0), 40);
  for (let i = 0; i < n; i++) {
    const q = blocks.nth(i);
    const label = ((await q.locator(".application-label, label, .text").first().innerText(T).catch(() => "")) || "").trim();
    const radios = q.locator('input[type="radio"], input[type="checkbox"]');
    const rn = await radios.count().catch(() => 0);
    if (rn > 0) {
      const prefs = radioPrefs(label);
      let picked = false;
      for (let r = 0; r < rn && !picked; r++) {
        const opt = radios.nth(r);
        const val = ((await opt.getAttribute("value").catch(() => "")) || "").toLowerCase();
        if (prefs.some((p) => val.includes(p))) {
          await opt.check(T).catch(() => {});
          picked = true;
        }
      }
      if (!picked) await radios.first().check(T).catch(() => {}); // satisfy required
    } else {
      const ta = q.locator("textarea").first();
      if (await has(ta)) await ta.fill(textAnswer(label), T).catch(() => {});
      const ti = q.locator('input[type="text"], input[type="number"]').first();
      if (await has(ti)) await ti.fill(textAnswer(label), T).catch(() => {});
    }
  }
}

async function fillByLabel(page: any, re: RegExp, value: string) {
  const inputs = page.locator('input[type="text"], input[type="url"]');
  const n = Math.min(await inputs.count().catch(() => 0), 40);
  for (let i = 0; i < n; i++) {
    const el = inputs.nth(i);
    const name = ((await el.getAttribute("name").catch(() => "")) || "").toLowerCase();
    const aria = ((await el.getAttribute("aria-label").catch(() => "")) || "").toLowerCase();
    const ph = ((await el.getAttribute("placeholder").catch(() => "")) || "").toLowerCase();
    if (re.test(`${name} ${aria} ${ph}`)) {
      await el.fill(value, T).catch(() => {});
      return true;
    }
  }
  return false;
}

async function fillCommon(page: any) {
  await fillByLabel(page, /linked\s?in/i, profile.links.linkedin);
  await fillByLabel(page, /git\s?hub/i, profile.links.github);
  await fillByLabel(page, /portfolio|website/i, profile.links.portfolio || profile.links.github);
  await fillByLabel(page, /location|city/i, `${profile.location.city}, ${profile.location.country}`);
  await fillByLabel(page, /current\s*company|employer/i, profile.experience[0].company);
  await fillCustomQuestions(page);
}

async function applyGreenhouse(page: any, coverLetter: string): Promise<BrowserApplyResult> {
  await fill(page, ["#first_name", 'input[name="first_name"]'], profile.firstName);
  await fill(page, ["#last_name", 'input[name="last_name"]'], profile.lastName);
  await fill(page, ["#email", 'input[name="email"]', 'input[type="email"]'], profile.email);
  await fill(page, ["#phone", 'input[name="phone"]', 'input[type="tel"]'], profile.phone);
  const cl = page.locator('textarea[name="cover_letter_text"], #cover_letter_text').first();
  if (await has(cl)) await cl.fill(coverLetter, T).catch(() => {});
  const file = page.locator('input[type="file"]').first();
  if (await has(file)) await file.setInputFiles(RESUME_PATH).catch(() => {});
  await fillCommon(page);
  return finish(page, ['button[type="submit"]', "#submit_app", 'text="Submit Application"']);
}

async function applyLever(page: any, coverLetter: string): Promise<BrowserApplyResult> {
  await fill(page, ['input[name="name"]', "#name"], profile.name);
  await fill(page, ['input[name="email"]', 'input[type="email"]'], profile.email);
  await fill(page, ['input[name="phone"]', 'input[type="tel"]'], profile.phone);
  await fill(page, ['textarea[name="comments"]'], coverLetter);
  const file = page.locator('input[type="file"]').first();
  if (await has(file)) {
    await file.setInputFiles(RESUME_PATH).catch(() => {});
    await page.waitForTimeout(2500); // let Lever parse the resume
  }
  await fillCommon(page);
  return finish(page, ['button[type="submit"]', ".template-btn-submit", 'text="Submit application"']);
}

async function applyGoogleForm(page: any, coverLetter: string): Promise<BrowserApplyResult> {
  const shorts = page.locator('input[type="text"], input[type="email"]');
  const n = Math.min(await shorts.count().catch(() => 0), 40);
  for (let i = 0; i < n; i++) {
    const el = shorts.nth(i);
    const aria = ((await el.getAttribute("aria-label").catch(() => "")) || "").toLowerCase();
    let val = profile.pitch.slice(0, 120);
    if (/email/.test(aria)) val = profile.email;
    else if (/name/.test(aria)) val = profile.name;
    else if (/phone|mobile/.test(aria)) val = profile.phone;
    else if (/college|university/.test(aria)) val = profile.education[0].institution;
    await el.fill(val, T).catch(() => {});
  }
  const paras = page.locator("textarea");
  const pn = Math.min(await paras.count().catch(() => 0), 20);
  for (let i = 0; i < pn; i++) await paras.nth(i).fill(coverLetter, T).catch(() => {});
  return finish(page, ['div[role="button"]:has-text("Submit")', 'span:has-text("Submit")']);
}

async function finish(page: any, submitSelectors: string[]): Promise<BrowserApplyResult> {
  const hasCaptcha =
    (await page.locator('iframe[src*="recaptcha"], iframe[src*="hcaptcha"], .g-recaptcha, [data-sitekey]').count().catch(() => 0)) > 0;

  if (!SUBMIT) {
    const shot = path.join(process.cwd(), ".apply-screenshots", `dryrun-${Date.now()}.png`);
    await page.screenshot({ path: shot, fullPage: true }).catch(() => {});
    return { submitted: false, detail: `Dry run: filled${hasCaptcha ? " (⚠ CAPTCHA present)" : ", no CAPTCHA"}, not submitted. ${shot}` };
  }
  if (hasCaptcha) {
    const shot = path.join(process.cwd(), ".apply-screenshots", `captcha-${Date.now()}.png`);
    await page.screenshot({ path: shot }).catch(() => {});
    return { submitted: false, detail: `CAPTCHA on this form — filled it, finish manually. (${shot})` };
  }
  for (const sel of submitSelectors) {
    const btn = page.locator(sel).first();
    if (await has(btn)) {
      await btn.click(T).catch(() => {});
      await page.waitForTimeout(4000);
      const body = ((await page.locator("body").innerText(T).catch(() => "")) || "").toLowerCase();
      const url = page.url().toLowerCase();
      const ok =
        /thank you|thanks for applying|application (has been )?(submitted|received)|response has been recorded|successfully|we('| ha)ve received/i.test(body) ||
        /thank|confirmation|success|submitted/.test(url);
      if (!ok) {
        const shot = path.join(process.cwd(), ".apply-screenshots", `failed-${Date.now()}.png`);
        await page.screenshot({ path: shot, fullPage: true }).catch(() => {});
        return { submitted: false, detail: `Submit clicked but not confirmed (a required field may be unanswered) — finish manually. (${shot})` };
      }
      return { submitted: true, detail: "Submitted — confirmation detected. ✅" };
    }
  }
  return { submitted: false, detail: "No submit button found — left as assisted." };
}

export async function browserApply(url: string, ats: Ats, coverLetter: string): Promise<BrowserApplyResult> {
  const chromium = await getChromium();
  const browser = await chromium.launch({ headless: true });
  try {
    const ctx = await browser.newContext({ acceptDownloads: false });
    const page = await ctx.newPage();
    page.setDefaultTimeout(4000);
    const target = ats === "lever" ? url.replace(/\/$/, "").replace(/\/apply$/, "") + "/apply" : url;
    await page.goto(target, { waitUntil: "domcontentloaded", timeout: 30000 });
    const applyBtn = page.locator('a:has-text("Apply"), button:has-text("Apply")').first();
    if (ats === "greenhouse" && (await has(applyBtn))) {
      await applyBtn.click(T).catch(() => {});
      await page.waitForTimeout(1200);
    }
    if (ats === "greenhouse") return await applyGreenhouse(page, coverLetter);
    if (ats === "lever") return await applyLever(page, coverLetter);
    if (ats === "google-form") return await applyGoogleForm(page, coverLetter);
    return { submitted: false, detail: "Unsupported form — assisted." };
  } catch (e) {
    return { submitted: false, detail: `Browser error (${(e as Error).message}) — assisted.` };
  } finally {
    await browser.close().catch(() => {});
  }
}
