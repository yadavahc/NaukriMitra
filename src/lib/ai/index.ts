// ───────────────────────────────────────────────────────────────
//  AI layer — OpenAI primary, Gemini fallback.
//  If OpenAI errors or hits its quota/limit, we automatically retry
//  the same prompt on Gemini. If neither key is set, we return a
//  sensible template-based answer so the app still works offline.
// ───────────────────────────────────────────────────────────────

import { profile } from "@/lib/profile";

type ChatOpts = { system: string; user: string; maxTokens?: number };

async function callOpenAI({ system, user, maxTokens = 700 }: ChatOpts): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("no-openai");
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature: 0.6,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`openai ${res.status}: ${t.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}

async function callGemini({ system, user, maxTokens = 700 }: ChatOpts): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("no-gemini");
  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: { temperature: 0.6, maxOutputTokens: maxTokens },
      }),
    }
  );
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`gemini ${res.status}: ${t.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
}

/** Try OpenAI, fall back to Gemini, then to a local template. */
export async function askAI(opts: ChatOpts): Promise<{ text: string; provider: string }> {
  try {
    const text = await callOpenAI(opts);
    if (text) return { text, provider: "openai" };
  } catch (e) {
    console.warn("[ai] openai failed, trying gemini:", (e as Error).message);
  }
  try {
    const text = await callGemini(opts);
    if (text) return { text, provider: "gemini" };
  } catch (e) {
    console.warn("[ai] gemini failed, using template:", (e as Error).message);
  }
  return { text: opts.user.includes("cover letter") ? profile.pitch : "", provider: "template" };
}

const SYSTEM = `You are the job-application assistant for ${profile.name}, a final-year Information Science engineering student and full-stack developer in Bengaluru. Write in first person as the candidate. Be specific, confident, concise and honest — never invent facts beyond the provided profile. Prefer short, human, non-generic phrasing.`;

const profileContext = () =>
  `PROFILE:\n${JSON.stringify(
    {
      name: profile.name,
      education: profile.education,
      experience: profile.experience,
      skills: profile.skills,
      projects: profile.projects.map((p) => ({ name: p.name, tech: p.tech, summary: p.summary })),
      achievements: profile.achievements,
      pitch: profile.pitch,
    },
    null,
    2
  )}`;

export async function generateCoverLetter(job: { title: string; company: string; description?: string }) {
  const { text, provider } = await askAI({
    system: SYSTEM,
    user: `Write a tight, tailored cover letter (max 160 words) for this role. Reference 1-2 of my most relevant projects/skills.\n\nROLE: ${job.title} at ${job.company}\nJD: ${(job.description || "").slice(0, 1500)}\n\n${profileContext()}`,
  });
  return { coverLetter: text || profile.pitch, provider };
}

export async function answerQuestion(question: string, job?: { title?: string; company?: string }) {
  const { text, provider } = await askAI({
    system: SYSTEM,
    maxTokens: 300,
    user: `Answer this application question in 1-3 sentences, first person, tailored to ${
      job?.title ? `the ${job.title} role at ${job.company}` : "a software role"
    }.\n\nQUESTION: ${question}\n\n${profileContext()}`,
  });
  return { answer: text, provider };
}
