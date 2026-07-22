"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm({ from }: { from?: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.replace(from && from.startsWith("/admin") ? from : "/admin/dashboard");
      router.refresh();
    } else {
      setLoading(false);
      setError(res.status === 401 ? "Incorrect password." : "Login failed.");
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-20">
      <div className="mb-8 text-center">
        <span className="font-display text-5xl text-accent">🔐</span>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink">
          Admin sign in
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          Manage listings, the pipeline, and AI insights.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full space-y-4 rounded-2xl border border-line bg-surface p-6 shadow-sm"
      >
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-soft">
            Password
          </span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </label>

        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading || !password}
          className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <p className="text-center text-xs text-ink-faint">
          Demo password is set via <code className="text-ink-soft">ADMIN_PASSWORD</code>{" "}
          (default: <code className="text-ink-soft">admin123</code>).
        </p>
      </form>
    </div>
  );
}
