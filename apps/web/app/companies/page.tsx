"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth/auth-context";
import { api } from "../../lib/api";
import { Nav } from "../../components/nav";

interface CompanyInsight {
  company: string;
  totalApplications: number;
  statusBreakdown: Record<string, number>;
  interviewCount: number;
  offerCount: number;
  rejectionCount: number;
  lastActivity: string;
}

export default function CompaniesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [companies, setCompanies] = useState<CompanyInsight[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    api
      .get<CompanyInsight[]>("/companies")
      .then(setCompanies)
      .finally(() => setFetching(false));
  }, [user]);

  if (loading || !user || fetching) {
    return <div className="flex-1 flex items-center justify-center text-ink-soft">Loading...</div>;
  }

  return (
    <>
      <Nav />
      <main className="flex-1 px-6 py-10 max-w-2xl mx-auto w-full">
        <h1 className="font-display text-3xl mb-8">Companies</h1>

        {companies.length === 0 ? (
          <p className="text-ink-soft">
            No companies tracked yet. Add an application to see insights here.
          </p>
        ) : (
          <div className="space-y-3">
            {companies.map((c) => (
              <div key={c.company} className="border border-line rounded-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{c.company}</p>
                  <span className="text-xs text-ink-soft">
                    Last activity {new Date(c.lastActivity).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="text-xs bg-line/60 text-ink-soft rounded-full px-2.5 py-1">
                    {c.totalApplications} application{c.totalApplications === 1 ? "" : "s"}
                  </span>
                  {c.interviewCount > 0 && (
                    <span className="text-xs bg-accent-soft text-accent rounded-full px-2.5 py-1">
                      {c.interviewCount} interview{c.interviewCount === 1 ? "" : "s"}
                    </span>
                  )}
                  {c.offerCount > 0 && (
                    <span className="text-xs bg-accent-soft text-accent rounded-full px-2.5 py-1">
                      {c.offerCount} offer{c.offerCount === 1 ? "" : "s"}
                    </span>
                  )}
                  {c.rejectionCount > 0 && (
                    <span className="text-xs bg-warn-soft text-warn rounded-full px-2.5 py-1">
                      {c.rejectionCount} rejection{c.rejectionCount === 1 ? "" : "s"}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(c.statusBreakdown).map(([status, count]) => (
                    <span key={status} className="text-xs text-ink-soft">
                      {status.replace("_", " ")}: {count}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
