"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth/auth-context";
import { api, ApiError } from "../../lib/api";
import { Nav } from "../../components/nav";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  applicationCount: number;
}

interface PlatformStats {
  totalUsers: number;
  totalApplications: number;
  totalResumes: number;
  statusBreakdown: Record<string, number>;
  usersLast7Days: number;
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-line rounded-md p-5">
      <p className="text-sm text-ink-soft mb-1">{label}</p>
      <p className="font-display text-3xl">{value}</p>
    </div>
  );
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get<PlatformStats>("/admin/stats"),
      api.get<AdminUser[]>("/admin/users"),
    ])
      .then(([statsData, usersData]) => {
        setStats(statsData);
        setUsers(usersData);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Couldn't load admin data.");
      })
      .finally(() => setFetching(false));
  }, [user]);

  if (loading || !user || fetching) {
    return <div className="flex-1 flex items-center justify-center text-ink-soft">Loading...</div>;
  }

  if (error) {
    return (
      <>
        <Nav />
        <main className="flex-1 px-6 py-10 max-w-3xl mx-auto w-full">
          <p className="text-warn bg-warn-soft rounded-md px-4 py-3">{error}</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Nav />
      <main className="flex-1 px-6 py-10 max-w-3xl mx-auto w-full">
        <h1 className="font-display text-3xl mb-8">Admin</h1>

        {stats && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
              <StatCard label="Total users" value={stats.totalUsers} />
              <StatCard label="New this week" value={stats.usersLast7Days} />
              <StatCard label="Applications" value={stats.totalApplications} />
              <StatCard label="Resumes uploaded" value={stats.totalResumes} />
            </div>

            {Object.keys(stats.statusBreakdown).length > 0 && (
              <div className="mb-10">
                <h2 className="font-display text-xl mb-3">Applications by status</h2>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats.statusBreakdown).map(([status, count]) => (
                    <span key={status} className="text-xs bg-accent-soft text-accent rounded-full px-2.5 py-1">
                      {status.replace("_", " ")}: {count}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <h2 className="font-display text-xl mb-3">Users</h2>
        <div className="border border-line rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-line/30 text-left">
              <tr>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Applications</th>
                <th className="px-4 py-2">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-line">
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">{u.role}</td>
                  <td className="px-4 py-2">{u.applicationCount}</td>
                  <td className="px-4 py-2 text-ink-soft">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
