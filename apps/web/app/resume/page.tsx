"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth, ApiError } from "../../lib/auth/auth-context";
import { api } from "../../lib/api";
import { Nav } from "../../components/nav";

interface Resume {
  rawText: string;
  skills: string[];
}

interface JobAnalysis {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  jobSkills: string[];
}

interface ResumeCritique {
  overallImpression: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

interface InterviewPrep {
  technicalTopics: string[];
  technicalQuestions: string[];
  behavioralQuestions: string[];
}

export default function ResumePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [resumeText, setResumeText] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [savingResume, setSavingResume] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);

  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const [critique, setCritique] = useState<ResumeCritique | null>(null);
  const [critiquing, setCritiquing] = useState(false);
  const [critiqueError, setCritiqueError] = useState<string | null>(null);

  const [prep, setPrep] = useState<InterviewPrep | null>(null);
  const [prepping, setPrepping] = useState(false);
  const [prepError, setPrepError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    api
      .get<Resume>("/resume")
      .then((data) => {
        setResumeText(data.rawText);
        setSkills(data.skills);
      })
      .catch(() => {});
  }, [user]);

  async function handleSaveResume(e: FormEvent) {
    e.preventDefault();
    setResumeError(null);
    setSavingResume(true);
    try {
      const data = await api.post<Resume>("/resume", { text: resumeText });
      setSkills(data.skills);
    } catch (err) {
      setResumeError(err instanceof ApiError ? err.message : "Couldn't save resume.");
    } finally {
      setSavingResume(false);
    }
  }

  async function handleAnalyze(e: FormEvent) {
    e.preventDefault();
    setAnalyzeError(null);
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const data = await api.post<JobAnalysis>("/resume/analyze", { jobDescription });
      setAnalysis(data);
    } catch (err) {
      setAnalyzeError(err instanceof ApiError ? err.message : "Couldn't analyze this job.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleGetFeedback() {
    setCritiqueError(null);
    setCritiquing(true);
    setCritique(null);
    try {
      const data = await api.post<ResumeCritique>("/ai/resume-feedback", { resumeText });
      setCritique(data);
    } catch (err) {
      setCritiqueError(err instanceof ApiError ? err.message : "Couldn't get AI feedback.");
    } finally {
      setCritiquing(false);
    }
  }

  async function handleInterviewPrep() {
    setPrepError(null);
    setPrepping(true);
    setPrep(null);
    try {
      const data = await api.post<InterviewPrep>("/ai/interview-prep", {
        jobDescription,
        resumeText,
      });
      setPrep(data);
    } catch (err) {
      setPrepError(err instanceof ApiError ? err.message : "Couldn't generate interview prep.");
    } finally {
      setPrepping(false);
    }
  }

  if (loading || !user) {
    return <div className="flex-1 flex items-center justify-center text-ink-soft">Loading...</div>;
  }

  return (
    <>
      <Nav />
      <main className="flex-1 px-6 py-10 max-w-2xl mx-auto w-full">
        <h1 className="font-display text-3xl mb-8">Resume & job matching</h1>

        <section className="mb-12">
          <h2 className="font-display text-xl mb-3">Your resume</h2>
          <form onSubmit={handleSaveResume} className="space-y-3">
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={8}
              placeholder="Paste your resume text here..."
              className="w-full rounded-md border border-line bg-surface px-3 py-2 outline-none focus:ring-2 focus:ring-accent"
            />
            {resumeError && (
              <p className="text-warn text-sm bg-warn-soft rounded-md px-3 py-2">{resumeError}</p>
            )}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={savingResume || resumeText.trim().length < 20}
                className="bg-accent text-white rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                {savingResume ? "Saving..." : "Save resume"}
              </button>
              <button
                type="button"
                onClick={handleGetFeedback}
                disabled={critiquing || resumeText.trim().length < 20}
                className="border border-accent text-accent rounded-md px-4 py-2 text-sm font-medium hover:bg-accent-soft disabled:opacity-50"
              >
                {critiquing ? "Thinking..." : "Get AI feedback"}
              </button>
            </div>
          </form>

          {skills.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-ink-soft mb-2">Skills detected:</p>
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span key={s} className="text-xs bg-accent-soft text-accent rounded-full px-2.5 py-1">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {critiqueError && (
            <p className="text-warn text-sm bg-warn-soft rounded-md px-3 py-2 mt-4">{critiqueError}</p>
          )}

          {critique && (
            <div className="mt-6 border border-line rounded-md p-6 space-y-4">
              <div>
                <p className="text-sm text-ink-soft mb-1">Overall</p>
                <p>{critique.overallImpression}</p>
              </div>
              {critique.strengths.length > 0 && (
                <div>
                  <p className="text-sm text-ink-soft mb-1">Strengths</p>
                  <ul className="list-disc list-inside space-y-1">
                    {critique.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
              {critique.weaknesses.length > 0 && (
                <div>
                  <p className="text-sm text-ink-soft mb-1">Weaknesses</p>
                  <ul className="list-disc list-inside space-y-1">
                    {critique.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
              {critique.suggestions.length > 0 && (
                <div>
                  <p className="text-sm text-ink-soft mb-1">Suggestions</p>
                  <ul className="list-disc list-inside space-y-1">
                    {critique.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>

        <section>
          <h2 className="font-display text-xl mb-3">Analyze a job posting</h2>
          <form onSubmit={handleAnalyze} className="space-y-3">
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={6}
              placeholder="Paste a job description here..."
              className="w-full rounded-md border border-line bg-surface px-3 py-2 outline-none focus:ring-2 focus:ring-accent"
            />
            {analyzeError && (
              <p className="text-warn text-sm bg-warn-soft rounded-md px-3 py-2">{analyzeError}</p>
            )}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={analyzing || jobDescription.trim().length < 20}
                className="bg-accent text-white rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                {analyzing ? "Analyzing..." : "Analyze match"}
              </button>
              <button
                type="button"
                onClick={handleInterviewPrep}
                disabled={prepping || jobDescription.trim().length < 20 || resumeText.trim().length < 20}
                className="border border-accent text-accent rounded-md px-4 py-2 text-sm font-medium hover:bg-accent-soft disabled:opacity-50"
              >
                {prepping ? "Thinking..." : "Generate interview prep"}
              </button>
            </div>
          </form>

          {analysis && (
            <div className="mt-6 border border-line rounded-md p-6">
              <p className="text-sm text-ink-soft mb-1">Your match</p>
              <p className="font-display text-4xl mb-4">{analysis.matchScore}%</p>

              {analysis.matchedSkills.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-ink-soft mb-2">Matched skills</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.matchedSkills.map((s) => (
                      <span key={s} className="text-xs bg-accent-soft text-accent rounded-full px-2.5 py-1">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {analysis.missingSkills.length > 0 && (
                <div>
                  <p className="text-sm text-ink-soft mb-2">Missing from your resume</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.missingSkills.map((s) => (
                      <span key={s} className="text-xs bg-warn-soft text-warn rounded-full px-2.5 py-1">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {prepError && (
            <p className="text-warn text-sm bg-warn-soft rounded-md px-3 py-2 mt-4">{prepError}</p>
          )}

          {prep && (
            <div className="mt-6 border border-line rounded-md p-6 space-y-4">
              <div>
                <p className="text-sm text-ink-soft mb-2">Topics to review</p>
                <div className="flex flex-wrap gap-2">
                  {prep.technicalTopics.map((t, i) => (
                    <span key={i} className="text-xs bg-accent-soft text-accent rounded-full px-2.5 py-1">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-ink-soft mb-1">Technical questions</p>
                <ul className="list-disc list-inside space-y-1">
                  {prep.technicalQuestions.map((q, i) => <li key={i}>{q}</li>)}
                </ul>
              </div>
              <div>
                <p className="text-sm text-ink-soft mb-1">Behavioral questions</p>
                <ul className="list-disc list-inside space-y-1">
                  {prep.behavioralQuestions.map((q, i) => <li key={i}>{q}</li>)}
                </ul>
              </div>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
