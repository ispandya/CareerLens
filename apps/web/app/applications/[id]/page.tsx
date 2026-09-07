"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../../lib/auth/auth-context";
import { api, ApiError } from "../../../lib/api";
import { Nav } from "../../../components/nav";

const STATUS_OPTIONS = [
  "SAVED", "APPLIED", "OA", "PHONE_SCREEN", "INTERVIEW",
  "FINAL_INTERVIEW", "OFFER", "REJECTED", "WITHDRAWN",
];

interface Application {
  id: string;
  company: string;
  role: string;
  status: string;
  location: string | null;
  jobUrl: string | null;
  notes: string | null;
}

export default function ApplicationDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [app, setApp] = useState<Application | null>(null);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("APPLIED");
  const [location, setLocation] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    api
      .get<Application>(`/applications/${id}`)
      .then((data) => {
        setApp(data);
        setCompany(data.company);
        setRole(data.role);
        setStatus(data.status);
        setLocation(data.location ?? "");
        setJobUrl(data.jobUrl ?? "");
        setNotes(data.notes ?? "");
      })
      .catch(() => setError("Couldn't load this application."))
      .finally(() => setFetching(false));
  }, [user, id]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await api.patch(`/applications/${id}`, {
        company, role, status,
        location: location || undefined,
        jobUrl: jobUrl || undefined,
        notes: notes || undefined,
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save changes.");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this application? This can't be undone.")) return;
    try {
      await api.delete(`/applications/${id}`);
      router.push("/dashboard");
    } catch {
      setError("Couldn't delete this application.");
    }
  }

  if (loading || !user || fetching) {
    return <div className="flex-1 flex items-center justify-center text-ink-soft">Loading...</div>;
  }

  if (!app) {
    return (
      <>
        <Nav />
        <main className="flex-1 px-6 py-10 max-w-lg mx-auto w-full">
          <p className="text-warn">{error ?? "Application not found."}</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Nav />
      <main className="flex-1 px-6 py-10 max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl">{app.company}</h1>
          <button onClick={handleDelete} className="text-warn text-sm underline">
            Delete
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
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
            <label className="block text-sm mb-1.5">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-md border border-line bg-surface px-3 py-2 outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm mb-1.5">Job URL</label>
            <input
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              className="w-full rounded-md border border-line bg-surface px-3 py-2 outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm mb-1.5">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-line bg-surface px-3 py-2 outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {error && (
            <p className="text-warn text-sm bg-warn-soft rounded-md px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-accent text-white rounded-md py-2 font-medium hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </main>
    </>
  );
}
