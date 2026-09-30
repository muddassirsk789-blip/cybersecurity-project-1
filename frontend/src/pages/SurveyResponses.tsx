import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, BarChart3, Loader2, Users } from "lucide-react";
import { apiGet } from "@/lib/api";
import { Logo } from "@/components/Logo";
import { FadeIn } from "@/components/Reveal";
import { SurveyChart, type SurveyQuestion } from "@/components/SurveyChart";

interface Survey {
  title: string;
  respondents: number;
  questions: SurveyQuestion[];
}

export default function SurveyResponses() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["survey"],
    queryFn: () => apiGet<Survey>("/survey"),
    retry: 1,
  });

  return (
    <div className="min-h-screen bg-[#070A0F] text-slate-100">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-800/80 bg-[#070a0f]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link to="/"><Logo /></Link>
          <Link
            to="/"
            data-testid="responses-back-link"
            className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-slate-400 transition-colors hover:text-emerald-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Return to radar
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-24 pt-32">
        <FadeIn>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">// Survey responses · field data</p>
          <h1 className="mt-4 font-heading text-4xl font-black uppercase leading-none tracking-tight sm:text-5xl" data-testid="responses-title">
            Awareness survey results
          </h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-slate-400">
            What people told us about how they use the internet and how much they already know about
            cybersecurity. Every chart below is drawn from the raw survey responses. Charts tagged
            <span className="mx-1 font-mono text-xs uppercase text-amber-400">sample data</span>
            use placeholder answers until real responses are collected.
          </p>
          {data && (
            <div className="mt-8 flex flex-wrap gap-3 font-mono text-xs uppercase tracking-[0.15em]">
              <span className="flex items-center gap-2 rounded-md border border-slate-800 bg-[#0b1017] px-3 py-2 text-slate-300" data-testid="responses-respondents">
                <Users className="h-3.5 w-3.5 text-emerald-400" /> {data.respondents} respondents
              </span>
              <span className="flex items-center gap-2 rounded-md border border-slate-800 bg-[#0b1017] px-3 py-2 text-slate-300" data-testid="responses-question-count">
                <BarChart3 className="h-3.5 w-3.5 text-emerald-400" /> {data.questions.length} questions
              </span>
            </div>
          )}
        </FadeIn>

        {isLoading && (
          <div className="mt-16 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-slate-500" data-testid="responses-loading">
            <Loader2 className="h-4 w-4 animate-spin" /> Decrypting survey data…
          </div>
        )}
        {isError && (
          <p className="mt-16 font-mono text-sm text-red-400" data-testid="responses-error">
            Survey data unavailable — the grid is unreachable.
          </p>
        )}

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {data?.questions
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((q, i) => (
              <FadeIn
                key={q.id}
                delay={i * 0.06}
                className={`rounded-xl border border-slate-800 bg-[#0b1017] p-6 ${q.chart === "bar" ? "md:col-span-2" : ""}`}
              >
                <article data-testid={`survey-question-${q.id}`}>
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-400">
                        Q{String(q.order).padStart(2, "0")}
                      </p>
                      <h2 className="mt-1 text-base font-semibold text-slate-100 md:text-lg">{q.question}</h2>
                    </div>
                    <span className="flex shrink-0 flex-col items-end gap-1 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                      {q.responses} responses
                      {q.sample && (
                        <span className="rounded border border-amber-500/40 px-1.5 py-0.5 text-[9px] text-amber-400" data-testid={`survey-sample-tag-${q.id}`}>
                          Sample data
                        </span>
                      )}
                    </span>
                  </div>
                  <SurveyChart q={q} />
                </article>
              </FadeIn>
            ))}
        </div>

        <FadeIn className="mt-16 flex flex-col items-start gap-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">Seen something suspicious?</p>
            <p className="mt-1 text-slate-300">Awareness is step one. Reporting is step two.</p>
          </div>
          <Link
            to="/report"
            data-testid="responses-report-cta"
            className="flex items-center gap-2 rounded-md bg-emerald-500 px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.15em] text-[#03140d] transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-400"
          >
            Report an incident <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </FadeIn>
      </main>
    </div>
  );
}
