import { Link } from "react-router-dom";
import { LogoMark } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-[#05080E]">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-6 py-14 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <LogoMark size={34} />
          <div>
            <p className="font-heading text-sm font-black uppercase tracking-tight text-slate-100">
              AEGIS <span className="text-emerald-400">//</span> PROTOCOL
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
              Autonomous threat radar & incident response grid
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-6 font-mono text-xs uppercase tracking-[0.2em] text-slate-500">
          <a href="#threats" className="transition-colors hover:text-emerald-400">Threats</a>
          <a href="#tips" className="transition-colors hover:text-emerald-400">Safety Tips</a>
          <a href="#stats" className="transition-colors hover:text-emerald-400">Intelligence</a>
          <Link to="/report" data-testid="footer-cta-report" className="text-emerald-400 transition-colors hover:text-emerald-300">
            Report Incident
          </Link>
        </div>
      </div>
      <div className="border-t border-slate-800/60 py-5 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-slate-600">
        © 2026 Aegis Protocol — Awareness is the first firewall
      </div>
    </footer>
  );
}
