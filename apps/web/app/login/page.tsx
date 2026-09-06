"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useAuth, ApiError } from "../../lib/auth/auth-context";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't sign in. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl mb-1">Welcome back</h1>
        <p className="text-ink-soft mb-8">Sign in to keep tracking your search.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm mb-1.5">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-line bg-surface px-3 py-2 outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm mb-1.5">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-line bg-surface px-3 py-2 outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {error && (
            <p className="text-warn text-sm bg-warn-soft rounded-md px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-accent text-white rounded-md py-2 font-medium hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-sm text-ink-soft mt-6">
          New here?{" "}
          <Link href="/register" className="text-accent underline">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
