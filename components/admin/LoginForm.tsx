"use client";

import { useState } from "react";
import { Lock } from "lucide-react";

const inputClass =
  "h-12 w-full rounded-xl border border-border bg-background px-4 text-base text-primary shadow-sm outline-none transition-colors placeholder:text-secondary focus:border-accent focus:ring-2 focus:ring-accent/20";

export function LoginForm({ from }: { from?: string }) {
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
      const target =
        from && from.startsWith("/admin") && from !== "/admin/login"
          ? from
          : "/admin/dashboard";
      // Hard navigation (not router.replace + refresh). The login response
      // just set the httpOnly session cookie; a full page load guarantees the
      // next request carries it, so the proxy admits us immediately. The
      // soft-nav variant can race the cookie and leave the page stuck.
      window.location.replace(target);
    } else {
      setLoading(false);
      setError(res.status === 401 ? "Incorrect password." : "Login failed.");
    }
  }

  return (
    <div className="mx-auto flex w-1/2 flex-col items-center px-4 py-16 sm:py-20">
      <div className="mb-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-white shadow-md">
          <Lock className="h-6 w-6" strokeWidth={2.5} />
        </span>
        <h1 className="mt-5 font-display text-3xl font-bold uppercase tracking-wide text-primary">
          Admin sign in
        </h1>
        <p className="mt-2 text-sm text-secondary">
          Manage listings, the pipeline, and AI insights.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full space-y-5 rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8"
      >
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-primary">
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
            className={inputClass}
          />
        </label>

        {error ? (
          <p
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading || !password}
          className="h-12 w-full cursor-pointer rounded-xl bg-accent px-4 text-sm font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:opacity-90 hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <p className="text-center text-xs text-secondary">
          Password is set via{" "}
          <code className="text-secondary">ADMIN_PASSWORD</code> in the server
          environment.
        </p>
      </form>
    </div>
  );
}
