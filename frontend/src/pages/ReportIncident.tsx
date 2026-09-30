import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  ArrowLeft, ArrowRight, Bug, CheckCircle2, Database, FileWarning, HelpCircle,
  KeyRound, Loader2, Lock, Mail, ShieldCheck, Users, Zap,
} from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import { Logo } from "@/components/Logo";
import { FadeIn } from "@/components/Reveal";

interface IncidentReport {
  id: string;
  case_id: string;
  title: string;
  incident_type: string;
  severity: string;
  description: string;
  reporter_email: string;
  affected_systems?: string | null;
  status: string;
  created_at: string;
}

interface ReportPayload {
  title: string;
  incident_type: string;
  severity: string;
  description: string;
  reporter_email: string;
  affected_systems?: string;
  occurred_at?: string;
}

const TYPES = [
  { value: "phishing", label: "Phishing", icon: Mail },
  { value: "ransomware", label: "Ransomware", icon: Lock },
  { value: "data_breach", label: "Data Leak", icon: Database },
  { value: "malware", label: "Malware", icon: Bug },
  { value: "social_engineering", label: "Social Eng.", icon: Users },
  { value: "unauthorized_access", label: "Unauth. Access", icon: KeyRound },
  { value: "ddos", label: "DDoS", icon: Zap },
  { value: "other", label: "Other", icon: HelpCircle },
];

const SEVERITIES = [
  { value: "low", label: "Low", cls: "data-[on=true]:border-slate-400 data-[on=true]:text-slate-200" },
  { value: "medium", label: "Medium", cls: "data-[on=true]:border-sky-400 data-[on=true]:text-sky-300" },
  { value: "high", label: "High", cls: "data-[on=true]:border-amber-400 data-[on=true]:text-amber-300" },
  { value: "critical", label: "Critical · P1", cls: "data-[on=true]:border-red-500 data-[on=true]:text-red-300" },
];

const SEV_BADGE: Record<string, string> = {
  low: "bg-slate-800 text-slate-300",
  medium: "bg-sky-950 text-sky-300",
  high: "bg-amber-950 text-amber-300",
  critical: "bg-red-950 text-red-300",
};

const RUNBOOK = [
  "Disconnect affected devices from the network — do not power them off.",
  "Change exposed passwords from a known-clean device.",
  "Preserve evidence: screenshots, email headers, logs.",
  "A responder will contact you at the address provided.",
];

export default function ReportIncident() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [severity, setSeverity] = useState("");
  const [description, setDescription] = useState("");
  const [systems, setSystems] = useState("");
  const [email, setEmail] = useState("");
  const [occurred, setOccurred] = useState("");
  const [confirmed, setConfirmed] = useState<IncidentReport | null>(null);

  const { data: recent } = useQuery({
    queryKey: ["reports"],
    queryFn: () => apiGet<IncidentReport[]>("/reports"),
    retry: 1,
  });

  const mutation = useMutation({
    mutationFn: (body: ReportPayload) => apiPost<IncidentReport>("/reports", body),
    onSuccess: (data) => {
      setConfirmed(data);
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    onError: () => toast.error("Transmission failed — the grid is unreachable. Try again."),
  });

  const submit = () => {
    if (title.trim().length < 4) return toast.error("Give the incident a short title (4+ characters).");
    if (!type) return toast.error("Select an incident category.");
    if (!severity) return toast.error("Select a severity rating.");
    if (description.trim().length < 20) return toast.error("Description needs at least 20 characters of detail.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast.error("Enter a valid contact email.");
    mutation.mutate({
      title: title.trim(),
      incident_type: type,
      severity,
      description: description.trim(),
      reporter_email: email.trim(),
      affected_systems: systems.trim() || undefined,
      occurred_at: occurred.trim() || undefined,
    });
  };

  const reset = () => {
    setConfirmed(null);
    setTitle(""); setType(""); setSeverity(""); setDescription(""); setSystems(""); setEmail(""); setOccurred("");
  };

  return (
    <div className="min-h-screen bg-[#070A0F] text-slate-100">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-800/80 bg-[#070a0f]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link to="/"><Logo /></Link>
          <Link
            to="/"
            data-testid="report-back-link"
            className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-slate-400 transition-colors hover:text-emerald-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Return to radar
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-24 pt-32">
        <FadeIn>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">// Incident intake · encrypted channel</p>
          <h1 className="mt-4 font-heading text-4xl font-black uppercase leading-none tracking-tight sm:text-5xl">
            Report a security incident
          </h1>
          <p className="mt-4 leading-relaxed text-slate-400">
            Under active attack right now? Isolate the machine first, then file. Speed of reporting
            matters more than completeness — you can amend the case later.
          </p>
        </FadeIn>

        {confirmed ? (
          <FadeIn className="mt-12">
            <div className="rounded-xl border border-emerald-500/40 bg-[#0D131F] p-8" data-testid="report-success-panel">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                <h2 className="font-heading text-xl font-black uppercase tracking-tight">Report received</h2>
              </div>
              <p className="mt-2 text-sm text-slate-400">Your case is logged on the grid. Quote this reference in all follow-ups:</p>
              <p data-testid="report-success-case-id" className="mt-5 rounded-md border border-emerald-500/30 bg-[#070A0F] px-5 py-4 text-center font-mono text-2xl font-bold tracking-[0.15em] text-emerald-400">
                {confirmed.case_id}
              </p>
              <div className="mt-8">
                <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">Immediate containment runbook</p>
                <ol className="space-y-3">
                  {RUNBOOK.map((s, i) => (
                    <li key={s} className="flex items-start gap-3 text-sm text-slate-300">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border border-emerald-500/40 font-mono text-[10px] text-emerald-400">{i + 1}</span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  onClick={reset}
                  data-testid="report-file-another-button"
                  className="rounded-md border border-slate-700 px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.15em] text-slate-300 transition-colors hover:border-emerald-500/50 hover:text-emerald-400"
                >
                  File another report
                </button>
                <Link
                  to="/"
                  className="flex items-center gap-2 rounded-md bg-emerald-500 px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.15em] text-[#03140d] transition-colors hover:bg-emerald-400"
                >
                  Back to radar <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </FadeIn>
        ) : (
          <FadeIn delay={0.1} className="mt-12">
            <div className="rounded-xl border border-slate-800 bg-[#0F172A] p-7 sm:p-9" data-testid="report-form">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">Step 01 — Incident title</p>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-testid="report-title-input"
                placeholder="e.g. Suspicious wire-transfer email from 'CFO'"
                className="w-full rounded-md border border-slate-700 bg-[#070A0F] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none"
              />

              <p className="mb-2 mt-8 font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">Step 02 — Category</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" data-testid="report-incident-type-select">
                {TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    data-on={type === t.value}
                    data-testid={`report-type-${t.value}`}
                    onClick={() => setType(t.value)}
                    className="flex items-center gap-2 rounded-md border border-slate-700 bg-[#070A0F] px-3 py-2.5 font-mono text-[11px] uppercase tracking-wider text-slate-400 transition-colors hover:border-slate-500 data-[on=true]:border-emerald-500 data-[on=true]:text-emerald-400"
                  >
                    <t.icon className="h-3.5 w-3.5" /> {t.label}
                  </button>
                ))}
              </div>

              <p className="mb-2 mt-8 font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">Step 03 — Severity</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" data-testid="report-severity-select">
                {SEVERITIES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    data-on={severity === s.value}
                    data-testid={`report-severity-${s.value}`}
                    onClick={() => setSeverity(s.value)}
                    className={`rounded-md border border-slate-700 bg-[#070A0F] px-3 py-2.5 font-mono text-[11px] uppercase tracking-wider text-slate-400 transition-colors hover:border-slate-500 ${s.cls}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <p className="mb-2 mt-8 font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">Step 04 — Evidence & detail</p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                data-testid="report-description-textarea"
                rows={5}
                placeholder="What happened, when, and what you observed. Include sender addresses, URLs, filenames…"
                className="w-full resize-none rounded-md border border-slate-700 bg-[#070A0F] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none"
              />
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <input
                  value={systems}
                  onChange={(e) => setSystems(e.target.value)}
                  data-testid="report-systems-input"
                  placeholder="Affected systems (optional)"
                  className="rounded-md border border-slate-700 bg-[#070A0F] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none"
                />
                <input
                  value={occurred}
                  onChange={(e) => setOccurred(e.target.value)}
                  data-testid="report-occurred-input"
                  placeholder="When did it happen? (optional)"
                  className="rounded-md border border-slate-700 bg-[#070A0F] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <p className="mb-2 mt-8 font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">Step 05 — Contact</p>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="report-email-input"
                type="email"
                placeholder="you@company.com"
                className="w-full rounded-md border border-slate-700 bg-[#070A0F] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none"
              />

              <button
                onClick={submit}
                disabled={mutation.isPending}
                data-testid="report-form-submit-button"
                className="mt-9 flex w-full items-center justify-center gap-2 rounded-md bg-emerald-500 px-6 py-4 font-mono text-sm font-bold uppercase tracking-[0.15em] text-[#03140d] transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {mutation.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Transmitting…</>
                ) : (
                  <><FileWarning className="h-4 w-4" /> Transmit incident report</>
                )}
              </button>
            </div>
          </FadeIn>
        )}

        {recent && recent.length > 0 && (
          <FadeIn className="mt-16">
            <div className="mb-6 flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <h2 className="font-heading text-lg font-black uppercase tracking-tight">Recent grid activity</h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">identities masked</span>
            </div>
            <div className="space-y-3" data-testid="recent-reports-list">
              {recent.slice(0, 6).map((r) => (
                <div key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-slate-800 bg-[#0D131F] px-5 py-4">
                  <span className={`rounded-sm px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${SEV_BADGE[r.severity] ?? SEV_BADGE.low}`}>
                    {r.severity}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-200">{r.title}</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                      {r.case_id} · {r.incident_type.replace("_", " ")} · {r.status}
                    </p>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500">
                    {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          </FadeIn>
        )}
      </main>
    </div>
  );
}
