"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/auth/auth-context";
import { api, ApiError } from "../../../lib/api";
import { Nav } from "../../../components/nav";

const STATUS_OPTIONS = [
  "SAVED", "APPLIED", "OA", "PHONE_SCREEN", "INTERVIEW",
  "FINAL_INTERVIEW", "OFFER", "REJECTED", "WITHDRAWN",
];

export default function NewApplicationPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("APPLIED");
  const [location, setLocation] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading || !user) {
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post("/applications", {
        company,
        role,
        status,
        location: location || undefined,
        jobUrl: jobUrl || undefined,
        notes: notes || undefined,
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <>
      <Nav />
      <main className="flex-1 px-6 py-10 max-w-lg mx-auto w-full">
        <h1 className="font-display text-3xl mb-8">Add application</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1.5">Company</label>
            <input
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full rounded-md border border-line bg-surface px-3 py-2 outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm mb-1.5">Role</label>
            <input
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-md border border-line bg-surface px-3 py-2 outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm mb-1.5">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-md border border-line bg-surface px-3 py-2 outline-none focus:ring-2 focus:ring-accent"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.replace("_", " ")}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1.5">Location (optional)</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-md border border-line bg-surface px-3 py-2 outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm mb-1.5">Job URL (optional)</label>
            <input
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              className="w-full rounded-md border border-line bg-surface px-3 py-2 outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm mb-1.5">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
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
            {submitting ? "Saving..." : "Save application"}
          </button>
        </form>
      </main>
    </>
  );
}
