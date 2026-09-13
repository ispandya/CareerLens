"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth/auth-context";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.push(user ? "/dashboard" : "/login");
  }, [user, loading, router]);

  return (
    <div className="flex-1 flex items-center justify-center text-ink-soft">
      Loading...
    </div>
  );
}
