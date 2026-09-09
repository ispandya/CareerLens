"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth, ApiError } from "../../lib/auth/auth-context";
import { api } from "../../lib/api";
import { Nav } from "../../components/nav";

interface JobResult {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  redirectUrl: string;
  salaryMin: number | null;
  salaryMax: number | null;
  matchScore: number | null;
  matchedSkills: string[];
  missingSkills: string[];
}

export default function JobsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [what, setWhat] = useState("software engineer intern");
  const [where, setWhere] = useState("");
  const [results, setResults] = useState<JobResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSearching(true);
    try {
      const params = new URLSearchParams({ what });
      if (where) params.set("where", where);
      const data = await api.get<JobResult[]>(`/jobs/search?${params.toString()}`);
      setResults(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't search jobs.");
    } finally {
      setSearching(false);
      setHasSearched(true);
    }
  }

  async function handleAddToTracker(job: JobResult) {
    setAddingId(job.id);
    try {
      await api.post("/applications", {
        company: job.company,
        role: job.title,
        location: job.location,
        jobUrl: job.redirectUrl,
        status: "SAVED",
      });
    } catch {
      // non-fatal, just leave the button as-is
    } finally {
      setAddingId(null);
    }
  }

  if (loading || !user) {
    return <div className="flex-1 flex items-center justify-center text-ink-soft">Loading...</div>;
  }

  return (
    <>
      <Nav />
      <main className="flex-1 px-6 py-10 max-w-2xl mx-auto w-full">
        <h1 className="font-display text-3xl mb-8">Find jobs</h1>

        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <input
            value={what}
            onChange={(e) => setWhat(e.target.value)}
            placeholder="e.g. software engineer intern"
            className="flex-1 rounded-md border border-line bg-surface px-3 py-2 outline-none focus:ring-2 focus:ring-accent"
          />
          <input
            value={where}
            onChange={(e) => setWhere(e.target.value)}
            placeholder="Location (optional)"
            className="w-40 rounded-md border border-line bg-surface px-3 py-2 outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="submit"
            disabled={searching}
            className="bg-accent text-white rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </form>

        {error && (
          <p className="text-warn text-sm bg-warn-soft rounded-md px-3 py-2 mb-4">{error}</p>
        )}

        {hasSearched && !searching && !error && results.length === 0 && (
          <div className="border border-line rounded-md p-6 text-center text-sm text-ink-soft">
            <p className="mb-2">
              No postings found for &quot;{what}&quot;{where ? ` in "${where}"` : ""} right now.
            </p>
            <p>Try a broader job title, or search a nearby larger city.</p>
          </div>
        )}

        <div className="space-y-3">
          {results.map((job) => (
            <div key={job.id} className="border border-line rounded-md p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{job.title}</p>
                  <p className="text-sm text-ink-soft">{job.company} &middot; {job.location}</p>
                </div>
                {job.matchScore !== null && (
                  <span className="text-xs bg-accent-soft text-accent rounded-full px-2.5 py-1 shrink-0">
                    {job.matchScore}% match
                  </span>
                )}
              </div>

              {job.matchedSkills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {job.matchedSkills.map((s) => (
                    <span key={s} className="text-xs bg-accent-soft text-accent rounded-full px-2 py-0.5">
                      {s}
                    </span>
                  ))}
                  {job.missingSkills.map((s) => (
                    <span key={s} className="text-xs bg-warn-soft text-warn rounded-full px-2 py-0.5">
                      {s}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 mt-3">
                <a
                  href={job.redirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline text-sm"
                >
                  View posting
                </a>
                <button
                  onClick={() => handleAddToTracker(job)}
                  disabled={addingId === job.id}
                  className="text-sm text-ink-soft hover:text-ink disabled:opacity-50"
                >
                  {addingId === job.id ? "Adding..." : "+ Add to tracker"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
