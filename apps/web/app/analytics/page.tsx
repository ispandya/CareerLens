"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth/auth-context";
import { api } from "../../lib/api";
import { Nav } from "../../components/nav";

interface Dashboard {
  totalApplications: number;
  pipeline: Record<string, number>;
  interviews: number;
  offers: number;
  responseRate: number;
  funnel: {
    applicationToResponse: number;
    responseToInterview: number;
    interviewToOffer: number;
  };
}

const STAGE_ORDER = [
  "SAVED", "APPLIED", "OA", "PHONE_SCREEN", "INTERVIEW",
  "FINAL_INTERVIEW", "OFFER", "REJECTED", "WITHDRAWN",
];

const STAGE_LABELS: Record<string, string> = {
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

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-line rounded-md p-5">
      <p className="text-sm text-ink-soft mb-1">{label}</p>
      <p className="font-display text-3xl">{value}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<Dashboard | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    api
      .get<Dashboard>("/analytics/dashboard")
      .then(setData)
      .finally(() => setFetching(false));
  }, [user]);

  if (loading || !user || fetching || !data) {
    return <div className="flex-1 flex items-center justify-center text-ink-soft">Loading...</div>;
  }

  const maxCount = Math.max(1, ...Object.values(data.pipeline));

  return (
    <>
      <Nav />
      <main className="flex-1 px-6 py-10 max-w-3xl mx-auto w-full">
        <h1 className="font-display text-3xl mb-8">Your search, by the numbers</h1>

        {data.totalApplications === 0 ? (
          <p className="text-ink-soft">Add some applications to see your stats here.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
              <StatCard label="Total applications" value={data.totalApplications} />
              <StatCard label="Response rate" value={`${data.responseRate}%`} />
              <StatCard label="Interviews" value={data.interviews} />
              <StatCard label="Offers" value={data.offers} />
            </div>

            <h2 className="font-display text-xl mb-4">Pipeline</h2>
            <div className="space-y-2 mb-10">
              {STAGE_ORDER.filter((s) => data.pipeline[s]).map((stage) => (
                <div key={stage} className="flex items-center gap-3">
                  <span className="w-36 text-sm text-ink-soft shrink-0">
                    {STAGE_LABELS[stage]}
                  </span>
                  <div className="flex-1 bg-line/40 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-accent h-full rounded-full"
                      style={{ width: `${(data.pipeline[stage] / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-sm text-right">{data.pipeline[stage]}</span>
                </div>
              ))}
            </div>

            <h2 className="font-display text-xl mb-4">Conversion funnel</h2>
            <div className="grid grid-cols-3 gap-4">
              <StatCard label="Application -> Response" value={`${data.funnel.applicationToResponse}%`} />
              <StatCard label="Response -> Interview" value={`${data.funnel.responseToInterview}%`} />
              <StatCard label="Interview -> Offer" value={`${data.funnel.interviewToOffer}%`} />
            </div>
          </>
        )}
      </main>
    </>
  );
}
