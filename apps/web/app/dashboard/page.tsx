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

interface Notification {
  id: string;
  type: string;
  message: string;
  relatedApplicationId: string;
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
  const [notifications, setNotifications] = useState<Notification[]>([]);

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
      .get<Notification[]>("/notifications")
      .then(setNotifications)
      .catch(() => {});
  }, [user]);

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
          <ul className="space-y-2">
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
      </main>
    </>
  );
}
