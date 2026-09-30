import { Link } from "react-router-dom";
import { Siren } from "lucide-react";
import { Logo } from "@/components/Logo";

const LINKS = [
  { label: "Threats", href: "#threats", testid: "nav-link-threats" },
  { label: "Safety Tips", href: "#tips", testid: "nav-link-tips" },
  { label: "Intelligence", href: "#stats", testid: "nav-link-stats" },
];

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-800/80 bg-[#070a0f]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" aria-label="AEGIS home">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              data-testid={l.testid}
              className="font-mono text-xs uppercase tracking-[0.2em] text-slate-400 transition-colors duration-200 hover:text-emerald-400"
            >
              {l.label}
            </a>
          ))}
          <Link
            to="/responses"
            data-testid="nav-link-responses"
            className="font-mono text-xs uppercase tracking-[0.2em] text-slate-400 transition-colors duration-200 hover:text-emerald-400"
          >
            Responses
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <span className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 sm:flex">
            <span className="beacon-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Grid online
          </span>
          <Link
            to="/report"
            data-testid="nav-cta-report-incident"
            className="flex items-center gap-2 rounded-md bg-emerald-500 px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.15em] text-[#03140d] transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-400"
          >
            <Siren className="h-3.5 w-3.5" />
            Report Incident
          </Link>
        </div>
      </div>
    </header>
  );
}
