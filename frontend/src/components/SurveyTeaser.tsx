import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BarChart3, Users } from "lucide-react";
import { apiGet } from "@/lib/api";
import { FadeIn } from "@/components/Reveal";
import type { SurveyQuestion } from "@/components/SurveyChart";

interface Survey {
  respondents: number;
  questions: SurveyQuestion[];
}

const PREVIEW_IDS = ["device", "frequency", "heard"];
const COLORS = ["#34d399", "#38bdf8", "#fbbf24", "#f87171", "#a78bfa"];

function PreviewBars({ q }: { q: SurveyQuestion }) {
  const total = q.options.reduce((s, o) => s + o.count, 0) || 1;
  return (
    <div data-testid={`survey-preview-${q.id}`}>
      <p className="mb-3 line-clamp-1 text-sm font-semibold text-slate-200">{q.question}</p>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-800">
        {q.options.filter((o) => o.count > 0).map((o, i) => (
          <span key={o.label} style={{ width: `${(o.count / total) * 100}%`, background: COLORS[i % COLORS.length] }} />
        ))}
      </div>
      <ul className="mt-3 space-y-1">
        {q.options.slice(0, 3).map((o, i) => (
          <li key={o.label} className="flex items-center justify-between font-mono text-[11px] text-slate-400">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
              {o.label}
            </span>
            <span className="text-slate-500">{Math.round((o.count / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SurveyTeaser() {
  const { data } = useQuery({
    queryKey: ["survey"],
    queryFn: () => apiGet<Survey>("/survey"),
    retry: 1,
  });
  const previews = PREVIEW_IDS.map((id) => data?.questions.find((q) => q.id === id)).filter(Boolean) as SurveyQuestion[];

  return (
    <section id="responses" className="mx-auto max-w-7xl scroll-mt-24 px-6 pt-28" data-testid="home-survey-section">
      <FadeIn>
        <Link
          to="/responses"
          data-testid="home-survey-card"
          className="group grid gap-10 overflow-hidden rounded-2xl border border-slate-800 bg-[#0D131F] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/50 lg:grid-cols-12 lg:p-10"
        >
          <div className="lg:col-span-5">
            <p className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">// Survey responses</p>
            <h2 className="font-heading text-3xl font-black uppercase leading-none tracking-tight text-slate-100 sm:text-4xl">
              What people <span className="text-emerald-400">actually</span> do online
            </h2>
            <p className="mt-4 leading-relaxed text-slate-400">
              Results from our cybersecurity awareness survey — devices, habits, passwords, and how
              confident people feel spotting an attack.
            </p>
            {data && (
              <div className="mt-6 flex flex-wrap gap-3 font-mono text-xs uppercase tracking-[0.15em] text-slate-300">
                <span className="flex items-center gap-2 rounded-md border border-slate-800 px-3 py-2" data-testid="home-survey-respondents">
                  <Users className="h-3.5 w-3.5 text-emerald-400" /> {data.respondents} respondents
                </span>
                <span className="flex items-center gap-2 rounded-md border border-slate-800 px-3 py-2" data-testid="home-survey-questions">
                  <BarChart3 className="h-3.5 w-3.5 text-emerald-400" /> {data.questions.length} questions
                </span>
              </div>
            )}
            <span className="mt-8 inline-flex items-center gap-2 rounded-md bg-emerald-500 px-6 py-3.5 font-mono text-sm font-bold uppercase tracking-[0.15em] text-[#03140d] transition-colors duration-200 group-hover:bg-emerald-400">
              View all responses
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </div>
          <div className="grid gap-4 self-center sm:grid-cols-3 lg:col-span-7">
            {previews.map((q) => (
              <div key={q.id} className="rounded-xl border border-slate-800/80 bg-[#070a0f] p-5">
                <PreviewBars q={q} />
              </div>
            ))}
          </div>
        </Link>
      </FadeIn>
    </section>
  );
}
