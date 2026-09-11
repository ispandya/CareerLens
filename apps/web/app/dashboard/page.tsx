"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../lib/auth/auth-context";
import { api } from "../../lib/api";
import { Nav } from "../../components/nav";

interface Application {
  id: string;
  company: string;
  role: string;
  status: string;
  location: string | null;
  createdAt: string;
}

interface NotificationItem {
  id: string;
  type: string;
  message: string;
  relatedApplicationId: string;
}

interface JobResult {
  id: string;
  title: string;
  company: string;
  location: string;
  redirectUrl: string;
  matchScore: number | null;
  matchedSkills: string[];
}

const STATUS_LABELS: Record<string, string> = {
  SAVED: "Saved",
  APPLIED: "Applied",
  OA: "Online Assessment",
  PHONE_SCREEN: "Phone Screen",
  INTERVIEW: "Interview",
  FINAL_INTERVIEW: "Final Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

function statusClasses(status: string) {
  if (status === "OFFER") return "bg-accent-soft text-accent";
  if (status === "REJECTED" || status === "WITHDRAWN") return "bg-warn-soft text-warn";
  return "bg-line/60 text-ink-soft";
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [recommendations, setRecommendations] = useState<JobResult[]>([]);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    api
      .get<Application[]>("/applications")
      .then(setApplications)
      .finally(() => setLoadingApps(false));

    api
      .get<NotificationItem[]>("/notifications")
      .then(setNotifications)
      .catch(() => {});

    api
      .get<JobResult[]>("/jobs/recommendations")
      .then(setRecommendations)
      .catch(() => {});
  }, [user]);

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
      setAddedIds((prev) => new Set(prev).add(job.id));
    } catch {
      // non-fatal
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
      <main className="flex-1 px-6 py-10 max-w-3xl mx-auto w-full">
        {notifications.length > 0 && (
          <div className="mb-8 space-y-2">
            {notifications.map((n) => (
              <Link
                key={n.id}
                href={`/applications/${n.relatedApplicationId}`}
                className="block border border-accent/30 bg-accent-soft text-accent rounded-md px-4 py-3 text-sm hover:opacity-90"
              >
                {n.message}
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl">Your applications</h1>
          <Link
            href="/applications/new"
            className="bg-accent text-white rounded-md px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            Add application
          </Link>
        </div>

        {loadingApps ? (
          <p className="text-ink-soft">Loading...</p>
        ) : applications.length === 0 ? (
          <div className="border border-line rounded-md p-8 text-center">
            <p className="text-ink-soft mb-4">
              Nothing tracked yet. Add the first internship you applied to.
            </p>
            <Link href="/applications/new" className="text-accent underline">
              Add your first application
            </Link>
          </div>
        ) : (
          <ul className="space-y-2 mb-12">
            {applications.map((app) => (
              <li key={app.id}>
                <Link
                  href={`/applications/${app.id}`}
                  className="flex items-center justify-between border border-line rounded-md px-4 py-3 hover:border-accent"
                >
                  <div>
                    <p className="font-medium">{app.company}</p>
                    <p className="text-sm text-ink-soft">{app.role}</p>
                  </div>
                  <span className={`text-xs rounded-full px-2.5 py-1 ${statusClasses(app.status)}`}>
                    {STATUS_LABELS[app.status] ?? app.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {recommendations.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl">Recommended for you</h2>
              <Link href="/jobs" className="text-sm text-accent underline">
                Search more
              </Link>
            </div>
            <div className="space-y-2">
              {recommendations.map((job) => (
                <div
                  key={job.id}
                  className="border border-line rounded-md px-4 py-3 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{job.title}</p>
                    <p className="text-sm text-ink-soft truncate">
                      {job.company} &middot; {job.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {job.matchScore !== null && (
                      <span className="text-xs bg-accent-soft text-accent rounded-full px-2.5 py-1">
                        {job.matchScore}% match
                      </span>
                    )}
                    <button
                      onClick={() => handleAddToTracker(job)}
                      disabled={addingId === job.id || addedIds.has(job.id)}
                      className="text-sm text-ink-soft hover:text-ink disabled:opacity-50 whitespace-nowrap"
                    >
                      {addedIds.has(job.id)
                        ? "Added"
                        : addingId === job.id
                          ? "Adding..."
                          : "+ Add"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
