export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="6" fill="#0B0F17" stroke="#1E293B" />
      <path
        d="M16 4L6 9V17C6 23.5 10.3 29.4 16 31C21.7 29.4 26 23.5 26 17V9L16 4Z"
        stroke="#10B981"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M12 16L15 19L20 13" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2.5" data-testid="nav-brand-logo">
      <LogoMark />
      <span className="font-heading text-sm font-black uppercase tracking-tight text-slate-100">
        AEGIS <span className="text-emerald-400">//</span> PROTOCOL
      </span>
    </span>
  );
}
