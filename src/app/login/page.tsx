"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) window.location.href = "/";
    else setError((await res.json()).error || "Login failed");
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4">
      <form onSubmit={submit} className="card w-full max-w-sm">
        <div className="mb-5 flex items-center gap-2 text-xl font-bold">
          <Send className="h-5 w-5 text-accent" /> NaukriMitra
        </div>
        <p className="mb-4 text-sm text-muted">Private access. Enter your password.</p>
        <input
          type="password"
          autoFocus
          className="input mb-3"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="mb-3 text-sm text-danger">{error}</p>}
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "Checking…" : "Enter"}
        </button>
      </form>
    </div>
  );
}
