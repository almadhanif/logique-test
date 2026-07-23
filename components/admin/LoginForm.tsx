"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Lock, Loader2 } from "lucide-react";

const inputClass =
  "h-12 w-full cursor-text rounded-xl border border-border bg-background px-4 text-base text-primary shadow-sm outline-none transition-colors placeholder:text-secondary focus:border-accent focus:ring-2 focus:ring-accent/20";

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
      window.location.replace(target);
    } else {
      setLoading(false);
      setError(res.status === 401 ? "Incorrect password." : "Login failed.");
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col md:flex-row">
      {/* Left — branded dark panel */}
      <div className="relative flex flex-col justify-center overflow-hidden bg-primary px-8 py-12 text-on-primary md:w-1/2 md:px-12 lg:px-16">
        <div className="block-grid absolute inset-0 opacity-60" aria-hidden />
        <div className="relative">
          <Image
            src="/logique-logo.png"
            alt="AutoListing"
            width={48}
            height={64}
            priority
            className="h-12 w-auto"
          />
          <h1 className="mt-8 font-display text-4xl font-bold uppercase leading-[0.9] sm:text-5xl">
            AutoListing
            <br />
            <span className="text-accent">Admin</span>
          </h1>
          <p className="mt-4  text-sm leading-relaxed text-on-primary/70">
            Manage listings, track the pipeline, and leverage AI-driven
            marketability insights.
          </p>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 border-t border-on-primary/15 pt-6">
            <div>
              <p className="font-display text-2xl font-bold">AI</p>
              <p className="label text-[10px] text-on-primary/50">Scoring</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold">Kanban</p>
              <p className="label text-[10px] text-on-primary/50">Pipeline</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold">CRUD</p>
              <p className="label text-[10px] text-on-primary/50">Inventory</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 md:w-1/2">
        <div className="w-full px-24">
          <div className="mb-8 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-white shadow-md">
              <Lock className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <div>
              <h2 className="font-display text-xl font-bold uppercase tracking-wide text-primary">
                Sign in
              </h2>
              <p className="text-xs text-secondary">
                Enter your admin password
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="label mb-2 block text-[10px] text-secondary">
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
                className="rounded-lg bg-accent/10 px-4 py-2.5 text-sm font-medium text-accent"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading || !password}
              className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:opacity-90 hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <Link
            href="/"
            className="mt-6 inline-flex cursor-pointer items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-secondary transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
            Back to site
          </Link>
        </div>
      </div>
    </div>
  );
}
