"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth/auth-context";

const STEPS = [
  {
    n: "01",
    title: "Add your resume",
    body: "Paste your resume or upload a PDF. We extract your real skills automatically.",
  },
  {
    n: "02",
    title: "See your match",
    body: "Paste any job posting and get an honest match score, plus exactly what skills you're missing.",
  },
  {
    n: "03",
    title: "Track your search",
    body: "Every application, every interview round, every follow-up - in one organized pipeline.",
  },
  {
    n: "04",
    title: "Prepare with AI",
    body: "Get resume feedback and realistic interview questions, generated for the specific role.",
  },
];

const AI_FEATURES = [
  {
    title: "AI resume feedback",
    body: "Real critique on your writing, not just keywords - what's strong, what's weak, and specific ways to fix it.",
  },
  {
    title: "AI interview prep",
    body: "Given a job description and your resume, get realistic technical topics and behavioral questions to prepare for.",
  },
  {
    title: "Smart skill matching",
    body: "Skill detection blends keyword extraction with AI analysis, catching skills a simple keyword search would miss.",
  },
];

const FEATURES = [
  { title: "Live job search", body: "Real, current postings pulled directly from the market, not stale listings." },
  { title: "Personalized recommendations", body: "Jobs automatically surfaced based on your own resume, no manual search needed." },
  { title: "Application tracking", body: "Company, role, status, notes, and job links, all in one organized pipeline." },
  { title: "Interview tracking", body: "Multiple rounds per application, with dates and notes for each stage." },
  { title: "Company insights", body: "See your full history and outcomes with every company you've applied to." },
  { title: "Smart notifications", body: "Reminders when it's time to follow up, or an interview is coming up." },
  { title: "Progress analytics", body: "Response rate and conversion funnel, calculated from your own real data." },
  { title: "PDF resume upload", body: "Upload your resume as a PDF and we extract the text automatically." },
];

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="flex-1 flex items-center justify-center text-ink-soft">
        Loading...
      </div>
    );
  }

  return (
    <main className="flex-1">
      <header className="px-6 py-5 flex items-center justify-between border-b border-line">
        <span className="font-display text-xl">CareerLens</span>
        <Link href="/login" className="text-sm text-ink-soft hover:text-ink">
          Sign in
        </Link>
      </header>

      <section className="px-6 pt-20 pb-16 max-w-2xl mx-auto text-center">
        <span className="inline-block text-xs uppercase tracking-wide text-accent bg-accent-soft rounded-full px-3 py-1 mb-6">
          Built for the internship search
        </span>
        <h1 className="font-display text-5xl leading-tight mb-5">
          See exactly why you&apos;re not getting interviews.
        </h1>
        <p className="text-lg text-ink-soft mb-8">
          CareerLens tracks your applications, matches your resume against real job postings,
          and tells you what&apos;s actually missing - not just another spreadsheet.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/register"
            className="bg-accent text-white rounded-md px-6 py-3 font-medium hover:opacity-90"
          >
            Get started free
          </Link>
          <Link
            href="/login"
            className="border border-line rounded-md px-6 py-3 font-medium hover:border-accent"
          >
            Sign in
          </Link>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-md mx-auto border border-line rounded-lg p-6 bg-surface">
          <p className="text-sm text-ink-soft mb-1">Your match</p>
          <p className="font-display text-5xl mb-5">87%</p>
          <p className="text-sm text-ink-soft mb-2">Matched skills</p>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs bg-accent-soft text-accent rounded-full px-2.5 py-1">React</span>
            <span className="text-xs bg-accent-soft text-accent rounded-full px-2.5 py-1">Node.js</span>
            <span className="text-xs bg-accent-soft text-accent rounded-full px-2.5 py-1">AWS</span>
          </div>
          <p className="text-sm text-ink-soft mb-2">Missing from your resume</p>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs bg-warn-soft text-warn rounded-full px-2.5 py-1">Docker</span>
            <span className="text-xs bg-warn-soft text-warn rounded-full px-2.5 py-1">PostgreSQL</span>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 border-t border-line">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-3xl text-center mb-12">How it works</h2>
          <div className="space-y-8">
            {STEPS.map((s) => (
              <div key={s.n} className="flex gap-5">
                <span className="font-display text-2xl text-accent shrink-0 w-10">{s.n}</span>
                <div>
                  <h3 className="font-medium mb-1">{s.title}</h3>
                  <p className="text-ink-soft">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 border-t border-line bg-accent-soft/30">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block text-xs uppercase tracking-wide text-accent bg-accent-soft rounded-full px-3 py-1 mb-4">
            Powered by AI
          </span>
          <h2 className="font-display text-3xl mb-12">More than a tracker</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {AI_FEATURES.map((f) => (
              <div key={f.title} className="bg-surface border border-line rounded-lg p-5">
                <h3 className="font-medium mb-2">{f.title}</h3>
                <p className="text-sm text-ink-soft">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 border-t border-line">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl text-center mb-12">Everything in one place</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {FEATURES.map((f) => (
              <div key={f.title}>
                <h3 className="font-medium mb-1.5">{f.title}</h3>
                <p className="text-sm text-ink-soft">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 border-t border-line text-center">
        <h2 className="font-display text-3xl mb-4">Start tracking your search today.</h2>
        <p className="text-ink-soft mb-8">Free to use. No credit card required.</p>
        <Link
          href="/register"
          className="bg-accent text-white rounded-md px-6 py-3 font-medium hover:opacity-90"
        >
          Create your free account
        </Link>
      </section>
    </main>
  );
}
