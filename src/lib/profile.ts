// ───────────────────────────────────────────────────────────────
//  Yadava H C — master profile.
//  This is the single source of truth used to auto-fill every job
//  application. Edit here whenever your details change.
// ───────────────────────────────────────────────────────────────

export const profile = {
  name: "Yadava H C",
  firstName: "Yadava",
  lastName: "H C",
  email: "yadavahc333@gmail.com",
  // Phone & address are read from env so they stay out of the repo. Set
  // PROFILE_PHONE and PROFILE_ADDRESS in .env.local (git-ignored).
  phone: process.env.PROFILE_PHONE || "+91 XXXXXXXXXX",
  location: {
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    address: process.env.PROFILE_ADDRESS || "Bengaluru, Karnataka, India",
    landmark: "",
    willingToRelocate: true,
    openToRemote: true,
  },

  links: {
    linkedin: "https://www.linkedin.com/in/yadava-hc-907067287",
    github: "https://github.com/yadavahc",
    portfolio: "", // add your portfolio URL if you have one
    leetcode: "https://leetcode.com/u/uDbVJTA37J/",
    gfg: "https://www.geeksforgeeks.org/profile/yadavahc",
    tuf: "https://takeuforward.org/profile/yadava_h_c",
  },

  // Used for filtering / matching jobs to you
  targeting: {
    // Fresher / final-year student — internships & entry-level
    seniority: ["intern", "internship", "apprentice", "trainee", "fresher", "entry", "junior", "new grad", "graduate"],
    roles: [
      "software engineer",
      "software developer",
      "full stack developer",
      "frontend developer",
      "backend developer",
      "web developer",
      "react developer",
      "next.js developer",
      "node developer",
      "python developer",
      "java developer",
      "javascript developer",
      "sde intern",
      "ai engineer",
      "ml engineer",
    ],
    preferredLocations: ["bengaluru", "bangalore", "remote", "india", "hybrid"],
    preferStartups: true,
  },

  education: [
    {
      institution: "The Oxford College of Engineering, Bengaluru",
      degree: "B.E. in Information Science and Engineering",
      score: "CGPA 8.9",
      start: "2023",
      end: "2027",
      current: true,
    },
    {
      institution: "Kumarans PU College, Bengaluru",
      degree: "Pre-University (PUC)",
      score: "95%",
      start: "2021",
      end: "2023",
    },
    {
      institution: "MMVS High School, Bengaluru",
      degree: "SSLC",
      score: "97.12%",
      start: "2011",
      end: "2021",
    },
  ],

  experience: [
    {
      company: "Appsetz",
      role: "Full Stack Developer",
      start: "Oct 2025",
      end: "Present",
      bullets: [
        "Developed responsive web apps with React.js, Next.js, Node.js, Express.js, MongoDB and Tailwind CSS.",
        "Built Vriddhi Psychological Services, Implanto 365 (clinic management), Sunwin Power Solutions (SEO landing) and OxyVerse (VTU student platform).",
      ],
    },
    {
      company: "Kiran Foundation, London, UK",
      role: "Web Developer Intern",
      start: "Jan 2024",
      end: "Apr 2024",
      bullets: [
        "Built a dynamic Astro-based blog module and customized the Around theme from Figma designs, improving accessibility and performance.",
      ],
    },
  ],

  skills: {
    languages: ["C++", "Java", "Python", "JavaScript"],
    frontend: ["HTML", "CSS", "Bootstrap", "Tailwind CSS", "React.js", "Next.js"],
    backend: ["Node.js", "Express.js", "MySQL", "MongoDB", "Firebase", "Supabase", "Flask", "Convex", "Inngest", "REST APIs", "JWT"],
    mlai: ["Supervised/Unsupervised Learning", "Regression", "Classification", "CNN", "ANN", "NLP", "TF-IDF", "Word2Vec", "NLTK"],
    tools: ["Git", "GitHub", "Docker", "Vercel", "Netlify", "AWS (Basics)", "OCI (Basics)"],
    core: ["DSA", "OOP", "DBMS", "Operating Systems", "Computer Networks", "System Design (Basics)"],
  },

  projects: [
    {
      name: "Legal Saathi",
      tech: "Next.js, TypeScript, Firebase, OpenAI, Qdrant, Sarvam AI",
      summary: "AI-powered multilingual legal assistant with document analysis, OCR, voice and RAG. HackBLR 2026 finalist; AI Agent Builders Award winner.",
      github: "https://github.com/yadavahc/Hack-Blr",
      live: "https://hack-blr-seven.vercel.app/",
    },
    {
      name: "WattWatch",
      tech: "Next.js, Firebase, TensorFlow.js, OpenAI",
      summary: "Smart campus energy monitoring with occupancy detection and AI insights. 2nd place, OxyHack 2026.",
      github: "https://github.com/yadavahc/wattwatch",
      live: "https://wattwatch-lemon.vercel.app/",
    },
    {
      name: "Sense-AI",
      tech: "Next.js, Gemini AI, Clerk, PostgreSQL",
      summary: "AI career assistant for resumes, cover letters and interview prep.",
      github: "https://github.com/yadavahc/sense-ai",
      live: "https://sense-ai-silk.vercel.app/",
    },
    {
      name: "OxyVerse-VTU",
      tech: "HTML, CSS, JavaScript, Firebase",
      summary: "Academic platform (notes, model papers, CGPA tools, scholarships) serving 1000+ students across 15+ colleges.",
      live: "https://oxyverse-vtu-notes.netlify.app/",
    },
  ],

  achievements: [
    "2nd Place — OxyHack 2026 Hackathon (150+ teams)",
    "Winner — India's First AI Agent Builders Award 2026 (Most Impactful Use Case)",
    "Winner — Google Gemini Arena: Top Prompt Creator (national dashboard)",
    "Finalist — HackBLR 2026 National Hackathon (Top 30 of 2000+)",
    "2nd Place — Devkreeda 2026, InnovateX Ideathon 2024 (BMS)",
    "3rd Place — CSI Web Hackathon",
  ],

  certifications: [
    "OCI AI Foundations Associate — Oracle",
    "IBM AI Agent Architect — IBM",
    "Introduction to Generative AI — Google",
    "SQL & CSS — HackerRank",
  ],

  // Default short pitch used to seed AI-written cover letters / "Why you?" answers
  pitch:
    "I'm Yadava, a final-year Information Science student at The Oxford College of Engineering (CGPA 8.9) and a full-stack developer at Appsetz. I build production web apps with Next.js, React, Node and Firebase/Supabase, and I've shipped several award-winning AI projects (Legal Saathi, WattWatch, Sense-AI). I'm looking for software engineering internships and fresher roles where I can contribute quickly and keep learning.",

  // Common structured answers many forms ask for
  answers: {
    noticePeriod: "Immediate (available for internships / part-time now)",
    expectedStipend: "Negotiable / as per company standards",
    yearsOfExperience: "0 (fresher, with internship + freelance experience)",
    currentCTC: "N/A (student)",
    graduationYear: "2027",
    workAuthorization: "Indian citizen — authorized to work in India",
    gender: "",
    dob: "",
  },

  // Path to the resume PDF that gets uploaded on applications.
  // Put your PDF in /public and point here.
  resumeFile: "/YADAVA_RESUME_2026.pdf",
} as const;

export type Profile = typeof profile;
