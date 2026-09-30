import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Loader2, Send } from "lucide-react";
import { apiGet, apiPost, ApiError } from "@/lib/api";
import { Logo } from "@/components/Logo";
import { FadeIn } from "@/components/Reveal";
import type { SurveyQuestion } from "@/components/SurveyChart";

interface Survey {
  title: string;
  respondents: number;
  questions: SurveyQuestion[];
}

type Answer = string | string[];

const OPTION_BTN =
  "flex items-center gap-2 rounded-md border border-slate-800 bg-[#070a0f] px-3 py-2.5 text-left font-mono text-xs uppercase tracking-[0.12em] text-slate-400 transition-all duration-200 hover:border-slate-600 hover:text-slate-200 data-[on=true]:border-emerald-400 data-[on=true]:text-emerald-300";

export default function TakeSurvey() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [answers, setAnswers] = useState<Record<string, Answer>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["survey"],
    queryFn: () => apiGet<Survey>("/survey"),
    retry: 1,
  });

  const questions = data?.questions.slice().sort((a, b) => a.order - b.order) ?? [];

  const mutation = useMutation({
    mutationFn: (body: { answers: Record<string, Answer> }) =>
      apiPost<{ id: string; live_responses: number }>("/survey/responses", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["survey"] });
      toast.success("Response recorded — the charts have been updated.");
      window.scrollTo({ top: 0 });
      navigate("/responses");
    },
    onError: (err) => {
      const detail = err instanceof ApiError && typeof (err.body as { detail?: unknown })?.detail === "string"
        ? (err.body as { detail: string }).detail
        : "Transmission failed — the grid is unreachable. Try again.";
      toast.error(detail);
    },
  });

  const setSingle = (qid: string, label: string) => setAnswers((a) => ({ ...a, [qid]: label }));
  const toggleMulti = (qid: string, label: string) =>
    setAnswers((a) => {
      const cur = Array.isArray(a[qid]) ? (a[qid] as string[]) : [];
      return { ...a, [qid]: cur.includes(label) ? cur.filter((l) => l !== label) : [...cur, label] };
    });

  const missing = questions.filter((q) => {
    const v = answers[q.id];
    return v === undefined || v === "" || (Array.isArray(v) && v.length === 0);
  });

  const submit = () => {
    if (missing.length) {
      toast.error(`Answer all questions — ${missing.length} remaining.`);
      document.querySelector(`[data-testid="survey-q-${missing[0].id}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    mutation.mutate({ answers });
  };

  return (
    <div className="min-h-screen bg-[#070A0F] text-slate-100">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-800/80 bg-[#070a0f]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link to="/"><Logo /></Link>
          <Link
            to="/responses"
            data-testid="survey-view-results-link"
            className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-slate-400 transition-colors hover:text-emerald-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> View results
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-24 pt-32">
        <FadeIn>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">// Awareness survey · 2 minutes</p>
          <h1 className="mt-4 font-heading text-4xl font-black uppercase leading-none tracking-tight sm:text-5xl" data-testid="survey-title">
            Take the survey
          </h1>
          <p className="mt-4 leading-relaxed text-slate-400">
            Your answers are anonymous and feed straight into the live results charts.
            {data && <> Joining <span className="text-slate-200">{data.respondents}</span> people who have already responded.</>}
          </p>
        </FadeIn>

        {isLoading && (
          <div className="mt-16 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-slate-500" data-testid="survey-loading">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading questions…
          </div>
        )}

        <div className="mt-12 space-y-4">
          {questions.map((q, i) => {
            const value = answers[q.id];
            const done = value !== undefined && value !== "" && !(Array.isArray(value) && value.length === 0);
            return (
              <FadeIn key={q.id} delay={Math.min(i, 6) * 0.04}>
                <section
                  data-testid={`survey-q-${q.id}`}
                  className={`rounded-xl border bg-[#0b1017] p-6 transition-colors ${done ? "border-emerald-500/30" : "border-slate-800"}`}
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-400">
                        Q{String(q.order).padStart(2, "0")}{q.multi && " · select all that apply"}
                      </p>
                      <h2 className="mt-1 text-base font-semibold text-slate-100 md:text-lg">{q.question}</h2>
                    </div>
                    {done && <Check className="h-4 w-4 shrink-0 text-emerald-400" data-testid={`survey-q-${q.id}-done`} />}
                  </div>

                  {q.id === "age" ? (
                    <input
                      type="number"
                      min={10}
                      max={100}
                      inputMode="numeric"
                      placeholder="Your age"
                      value={typeof value === "string" ? value : ""}
                      onChange={(e) => setSingle(q.id, e.target.value)}
                      data-testid="survey-input-age"
                      className="w-40 rounded-md border border-slate-800 bg-[#070a0f] px-3 py-2.5 font-mono text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-600 focus:border-emerald-400"
                    />
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {q.options.map((o) => {
                        const on = q.multi ? Array.isArray(value) && value.includes(o.label) : value === o.label;
                        return (
                          <button
                            key={o.label}
                            type="button"
                            data-on={on}
                            data-testid={`survey-opt-${q.id}-${o.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                            onClick={() => (q.multi ? toggleMulti(q.id, o.label) : setSingle(q.id, o.label))}
                            className={OPTION_BTN}
                          >
                            <span className={`h-3 w-3 shrink-0 border ${q.multi ? "rounded-sm" : "rounded-full"} ${on ? "border-emerald-400 bg-emerald-400" : "border-slate-600"}`} />
                            {o.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </section>
              </FadeIn>
            );
          })}
        </div>

        {questions.length > 0 && (
          <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500" data-testid="survey-progress">
              {questions.length - missing.length} / {questions.length} answered
            </p>
            <button
              type="button"
              onClick={submit}
              disabled={mutation.isPending}
              data-testid="survey-submit-button"
              className="flex items-center gap-2 rounded-md bg-emerald-500 px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.15em] text-[#03140d] transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {mutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Submit response
            </button>
          </div>
        )}

        <Link to="/responses" className="mt-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-slate-500 transition-colors hover:text-emerald-400" data-testid="survey-skip-to-results">
          Skip to results <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </main>
    </div>
  );
}
