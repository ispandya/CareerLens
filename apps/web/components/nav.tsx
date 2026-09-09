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
        <div className="flex items-center gap-6 text-sm">
          <Link href="/resume" className="text-ink-soft hover:text-ink">
            Resume
          </Link>
          <Link href="/analytics" className="text-ink-soft hover:text-ink">
            Analytics
          </Link>
          {user.role === "ADMIN" && (
            <Link href="/admin" className="text-ink-soft hover:text-ink">
              Admin
            </Link>
          )}
          <span className="text-ink-soft">{user.email}</span>
          <button onClick={logout} className="text-accent underline">
            Sign out
          </button>
        </div>
      )}
    </header>
  );
}
