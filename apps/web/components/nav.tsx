"use client";

import Link from "next/link";
import { useAuth } from "../lib/auth/auth-context";

export function Nav() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-line px-6 py-4 flex items-center justify-between">
      <Link href="/dashboard" className="font-display text-xl">
        CareerLens
      </Link>
      {user && (
        <div className="flex items-center gap-4 text-sm">
          <span className="text-ink-soft">{user.email}</span>
          <button onClick={logout} className="text-accent underline">
            Sign out
          </button>
        </div>
      )}
    </header>
  );
}
