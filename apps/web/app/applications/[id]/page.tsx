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

interface Interview {
  id: string;
  round: string;
  scheduledAt: string | null;
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

  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [round, setRound] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [interviewNotes, setInterviewNotes] = useState("");
  const [addingInterview, setAddingInterview] = useState(false);
  const [interviewError, setInterviewError] = useState<string | null>(null);

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

  function loadInterviews() {
    api
      .get<Interview[]>(`/applications/${id}/interviews`)
      .then(setInterviews)
      .catch(() => {});
  }

  useEffect(() => {
    if (!user) return;
    loadInterviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  async function handleAddInterview(e: FormEvent) {
    e.preventDefault();
    setInterviewError(null);
    setAddingInterview(true);
    try {
      await api.post(`/applications/${id}/interviews`, {
        round,
        scheduledAt: scheduledAt || undefined,
        notes: interviewNotes || undefined,
      });
      setRound("");
      setScheduledAt("");
      setInterviewNotes("");
      loadInterviews();
    } catch (err) {
      setInterviewError(err instanceof ApiError ? err.message : "Couldn't add interview round.");
    } finally {
      setAddingInterview(false);
    }
  }

  async function handleDeleteInterview(interviewId: string) {
    try {
      await api.delete(`/interviews/${interviewId}`);
      loadInterviews();
    } catch {
      setInterviewError("Couldn't delete this round.");
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

        <form onSubmit={handleSave} className="space-y-4 mb-12">
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

        <section>
          <h2 className="font-display text-xl mb-4">Interview rounds</h2>

          {interviews.length > 0 && (
            <ul className="space-y-2 mb-6">
              {interviews.map((iv) => (
                <li key={iv.id} className="border border-line rounded-md px-4 py-3 flex items-start justify-between">
                  <div>
                    <p className="font-medium">{iv.round}</p>
                    {iv.scheduledAt && (
                      <p className="text-sm text-ink-soft">
                        {new Date(iv.scheduledAt).toLocaleString()}
                      </p>
                    )}
                    {iv.notes && <p className="text-sm text-ink-soft mt-1">{iv.notes}</p>}
                  </div>
                  <button
                    onClick={() => handleDeleteInterview(iv.id)}
                    className="text-warn text-xs underline shrink-0 ml-4"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleAddInterview} className="space-y-3">
            <div>
              <label className="block text-sm mb-1.5">Round name</label>
              <input
                required
                placeholder="e.g. Phone Screen, Onsite, Final Round"
                value={round}
                onChange={(e) => setRound(e.target.value)}
                className="w-full rounded-md border border-line bg-surface px-3 py-2 outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-sm mb-1.5">Scheduled date (optional)</label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full rounded-md border border-line bg-surface px-3 py-2 outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-sm mb-1.5">Notes (optional)</label>
              <textarea
                value={interviewNotes}
                onChange={(e) => setInterviewNotes(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-line bg-surface px-3 py-2 outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {interviewError && (
              <p className="text-warn text-sm bg-warn-soft rounded-md px-3 py-2">{interviewError}</p>
            )}

            <button
              type="submit"
              disabled={addingInterview}
              className="bg-accent text-white rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {addingInterview ? "Adding..." : "Add round"}
            </button>
          </form>
        </section>
      </main>
    </>
  );
}
