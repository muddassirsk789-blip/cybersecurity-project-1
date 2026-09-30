import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import {
  ArrowRight, Bug, CheckCircle2, Clock, Fingerprint, HardDrive, LifeBuoy,
  Lock, Mail, ShieldCheck, Users, Wifi, Zap,
} from "lucide-react";
import { apiGet } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FadeIn, MaskLine, SectionHeading } from "@/components/Reveal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const HERO_IMG =
  "https://static.prod-images.emergentagent.com/jobs/10d605f9-0f87-46b1-aa5d-b6e99d808c55/images/c3f3e88ee5b299b87c41883d75b6141e31717cb718c19fd9a2875ce150c8e9f8.jpeg";
const CIRCUIT_IMG =
  "https://static.prod-images.emergentagent.com/jobs/10d605f9-0f87-46b1-aa5d-b6e99d808c55/images/e1a4fda458ab3716f97c5ff049c51794fee3bd1d070599da82d71edc5b90af9a.jpeg";
const PHISH_IMG =
  "https://static.prod-images.emergentagent.com/jobs/10d605f9-0f87-46b1-aa5d-b6e99d808c55/images/3d24b286130ad6d5c2714bef495fe2cf86dd2b112aa6ca90e30f0ec200157b37.jpeg";

interface StatsSummary {
  total: number;
  received: number;
  triaged: number;
  investigating: number;
  resolved: number;
  active: number;
  by_type: Record<string, number>;
}

const TICKER = [
  "[02:14:07Z] SYN flood absorbed at edge fra-02 · 24ms",
  "[02:14:11Z] lookalike domain flagged: paypa1-secure.net",
  "[02:14:18Z] honeypot ws-09 captured brute-force burst · 312 tries",
  "[02:14:26Z] patch window verified · fleet compliance 98.4%",
  "[02:14:33Z] phishing kit signature added to mail filter",
  "[02:14:41Z] TLS cert rotation complete · 0 errors",
];

const MARQUEE_ITEMS = [
  "NIST CSF 2.0", "ISO/IEC 27001", "ZERO TRUST ARCHITECTURE", "MITRE ATT&CK",
  "GDPR DPO READY", "OWASP TOP 10", "SOC 2 TYPE II", "CIS CONTROLS v8",
];

const VECTORS = [
  { name: "Phishing", attacks: 3.4 },
  { name: "Malware", attacks: 2.8 },
  { name: "DDoS", attacks: 1.9 },
  { name: "Credential", attacks: 1.2 },
  { name: "Ransomware", attacks: 0.6 },
];

const TIPS = [
  {
    value: "identity",
    label: "Identity & MFA",
    icon: Fingerprint,
    items: [
      { title: "Phishing-resistant MFA", desc: "Prefer hardware keys or authenticator apps over SMS codes — SIM-swap attacks bypass text messages in minutes." },
      { title: "Unique passphrases", desc: "14+ characters, one per account. A password manager removes every excuse for reuse." },
      { title: "Verify reset requests", desc: "Never approve an MFA prompt you didn't trigger. Unexpected push = someone has your password." },
      { title: "Audit recovery emails", desc: "Attackers target your recovery inbox first. It deserves your strongest password and MFA." },
    ],
  },
  {
    value: "devices",
    label: "Device Hardening",
    icon: HardDrive,
    items: [
      { title: "Patch within 72 hours", desc: "Most breaches exploit vulnerabilities that already had a fix available. Auto-update everything." },
      { title: "Full-disk encryption", desc: "BitLocker, FileVault, LUKS — a stolen laptop should be a paperweight, not a breach." },
      { title: "Kill unused software", desc: "Every installed app is attack surface. Uninstall what you haven't opened in 90 days." },
      { title: "Lock in 60 seconds", desc: "Auto-lock after one minute of idle. Shoulder surfing is still the cheapest exploit there is." },
    ],
  },
  {
    value: "network",
    label: "Network Hygiene",
    icon: Wifi,
    items: [
      { title: "Treat public Wi-Fi as hostile", desc: "Use a VPN or hotspot. Rogue access points harvest credentials with zero sophistication." },
      { title: "Segment your home network", desc: "IoT gadgets live on a guest network. Your smart fridge should never see your work laptop." },
      { title: "HTTPS or walk away", desc: "No padlock, no credentials. Browser warnings exist because downgrade attacks are real." },
      { title: "Rotate router defaults", desc: "Default admin credentials are printed in public manuals. Change them on day one." },
    ],
  },
  {
    value: "crisis",
    label: "Crisis Runbook",
    icon: LifeBuoy,
    items: [
      { title: "Disconnect, don't power off", desc: "Pull the network cable or kill Wi-Fi. Keeping RAM alive preserves forensic evidence." },
      { title: "Report within the hour", desc: "Speed beats perfection. File an incident report even if you're unsure it matters." },
      { title: "Rotate credentials from a clean device", desc: "Never change passwords on a machine you suspect is compromised." },
      { title: "Preserve the evidence", desc: "Screenshot everything — emails, ransom notes, URLs. Deleting proof helps the attacker." },
    ],
  },
];

function ThreatRadar() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 2000);
    return () => clearInterval(i);
  }, []);
  const lines = [0, 1, 2].map((i) => TICKER[(tick + i) % TICKER.length]);

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-800/80 bg-[#0D131F]/80 backdrop-blur-xl" data-testid="hero-threat-radar">
      <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-400">Live threat radar</span>
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400">
          <span className="beacon-dot h-1.5 w-1.5 rounded-full bg-emerald-400" /> scanning
        </span>
      </div>
      <div className="p-6">
        <div className="relative mx-auto aspect-square max-w-[260px]">
          <div className="absolute inset-0 rounded-full border border-slate-800" />
          <div className="absolute inset-8 rounded-full border border-slate-800/80" />
          <div className="absolute inset-16 rounded-full border border-slate-800/60" />
          <div className="absolute inset-24 rounded-full border border-slate-800/40" />
          <div className="radar-sweep absolute inset-0 rounded-full" />
          <span className="radar-blip absolute left-[24%] top-[30%] h-2 w-2 rounded-full bg-emerald-400" />
          <span className="radar-blip absolute left-[68%] top-[55%] h-2 w-2 rounded-full bg-amber-400" style={{ animationDelay: "0.8s" }} />
          <span className="radar-blip absolute left-[45%] top-[72%] h-2 w-2 rounded-full bg-red-400" style={{ animationDelay: "1.5s" }} />
          <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-300" />
        </div>
        <div className="mt-6 space-y-2 border-t border-slate-800/80 pt-4">
          {lines.map((l, i) => (
            <p key={`${tick}-${i}`} className="truncate font-mono text-[11px] text-slate-500" style={{ opacity: 1 - i * 0.3 }}>
              <span className="text-emerald-500">$</span> {l}
            </p>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between rounded-md border border-slate-800 bg-[#070A0F] px-4 py-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">Defense health</span>
          <span className="font-mono text-lg font-bold text-emerald-400">98.4%</span>
        </div>
      </div>
    </div>
  );
}

function ChartTip(props: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  const { active, payload, label } = props;
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-800 bg-[#0D131F] px-3 py-2 font-mono text-xs">
      <p className="text-slate-400">{label}</p>
      <p className="font-bold text-emerald-400">{payload[0].value}B attacks / yr</p>
    </div>
  );
}

export default function Home() {
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 800], [0, 140]);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 55, damping: 18 });
  const sy = useSpring(my, { stiffness: 55, damping: 18 });
  const bgX = useTransform(sx, [-0.5, 0.5], [16, -16]);
  const bgY = useTransform(sy, [-0.5, 0.5], [12, -12]);

  const { data: live } = useQuery({
    queryKey: ["stats"],
    queryFn: () => apiGet<StatsSummary>("/stats"),
    retry: 1,
    refetchInterval: 30000,
  });
  const gridTotal = live?.total ?? 8;
  const gridActive = live?.active ?? 4;
  const gridResolved = live?.resolved ?? 2;

  return (
    <div className="min-h-screen bg-[#070A0F] text-slate-100">
      <Navbar />

      {/* ============ HERO ============ */}
      <section
        className="relative flex min-h-screen items-center overflow-hidden pt-16"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          mx.set((e.clientX - r.left) / r.width - 0.5);
          my.set((e.clientY - r.top) / r.height - 0.5);
        }}
      >
        <motion.div className="absolute -inset-8" style={{ y: parallaxY, x: bgX, top: bgY }}>
          <img src={HERO_IMG} alt="" className="h-full w-full object-cover opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#070A0F]/70 via-[#070A0F]/60 to-[#070A0F]" />
        </motion.div>
        <div className="grid-matrix absolute inset-0" />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-12 items-center gap-10 px-6 py-24">
          <div className="col-span-12 lg:col-span-7">
            <MaskLine delay={0.1}>
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">
                // Cybersecurity Awareness Grid — 2026
              </span>
            </MaskLine>
            <h1 className="mt-6 font-heading text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
              <MaskLine delay={0.25}>Every click</MaskLine>
              <MaskLine delay={0.4}>
                is a <span className="text-glow-emerald text-emerald-400">door.</span>
              </MaskLine>
              <MaskLine delay={0.55}>Learn to lock it.</MaskLine>
            </h1>
            <FadeIn delay={0.75} className="mt-8 max-w-xl">
              <p className="leading-relaxed text-slate-400">
                95% of breaches start with a human decision, not a broken firewall. AEGIS // PROTOCOL
                turns your team into the strongest layer of defense — live threat intelligence,
                practical drills, and a 60-second incident reporting pipeline.
              </p>
            </FadeIn>
            <FadeIn delay={0.9} className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/report"
                data-testid="hero-cta-report"
                className="group flex items-center gap-2 rounded-md bg-emerald-500 px-6 py-3.5 font-mono text-sm font-bold uppercase tracking-[0.15em] text-[#03140d] transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-400"
              >
                Report active incident
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <a
                href="#threats"
                data-testid="hero-cta-explore"
                className="rounded-md border border-slate-700 px-6 py-3.5 font-mono text-sm font-bold uppercase tracking-[0.15em] text-slate-300 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500/50 hover:text-emerald-400"
              >
                Explore threat matrix
              </a>
            </FadeIn>
            <FadeIn delay={1.05} className="mt-14 grid max-w-xl grid-cols-3 gap-6 border-t border-slate-800/80 pt-6">
              {[
                { v: "$4.45M", l: "Avg breach cost" },
                { v: "39s", l: "Attack frequency" },
                { v: "95%", l: "Human-error driven" },
              ].map((s) => (
                <div key={s.l}>
                  <p className="font-mono text-2xl font-bold tracking-tight text-slate-100">{s.v}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">{s.l}</p>
                </div>
              ))}
            </FadeIn>
          </div>
          <div className="col-span-12 lg:col-span-5">
            <FadeIn delay={0.6}>
              <ThreatRadar />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ============ MARQUEE ============ */}
      <div className="overflow-hidden border-y border-slate-800/80 bg-[#0a0f18] py-4" data-testid="standards-marquee">
        <div className="marquee-track flex w-max">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((m, i) => (
            <span key={`${m}-${i}`} className="mx-8 whitespace-nowrap font-mono text-xs uppercase tracking-[0.3em] text-slate-500">
              {m} <span className="ml-8 text-emerald-500">//</span>
            </span>
          ))}
        </div>
      </div>

      {/* ============ THREATS BENTO ============ */}
      <section id="threats" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-28">
        <SectionHeading
          kicker="// Threat overview"
          title={<>Know your enemy</>}
          copy="Four attack vectors account for the overwhelming majority of breaches. Understand the mechanic and the trap loses its power."
        />
        <div className="grid grid-cols-12 gap-6">
          <FadeIn className="col-span-12 lg:col-span-7">
            <article
              data-testid="threat-tab-phishing"
              className="group relative h-full overflow-hidden rounded-xl border border-slate-800 bg-[#0D131F] transition-colors duration-300 hover:border-emerald-500/40"
            >
              <div className="relative h-56 overflow-hidden">
                <img src={PHISH_IMG} alt="Phishing lure over a terminal" className="h-full w-full object-cover opacity-70 transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D131F] to-transparent" />
              </div>
              <div className="p-7">
                <div className="mb-3 flex items-center gap-3">
                  <Mail className="h-5 w-5 text-emerald-400" />
                  <h3 className="font-heading text-xl font-black uppercase tracking-tight">Phishing & BEC</h3>
                  <span className="ml-auto rounded-sm bg-[#450A0A] px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-red-300">Critical vector</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-400">
                  3.4 billion malicious emails are sent daily. Business email compromise alone cost
                  organizations $2.9B last year — usually one urgent, plausible message.
                </p>
                <ul className="mt-5 space-y-2">
                  {["Lookalike domains (paypa1, arnazon)", "Urgency + authority pressure", "Reply-to address pivots"].map((f) => (
                    <li key={f} className="flex items-center gap-2 font-mono text-xs text-slate-500">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </FadeIn>

          <FadeIn delay={0.1} className="col-span-12 lg:col-span-5">
            <article
              data-testid="threat-tab-ransomware"
              className="flex h-full flex-col rounded-xl border border-slate-800 bg-[#0D131F] p-7 transition-colors duration-300 hover:border-emerald-500/40"
            >
              <div className="mb-3 flex items-center gap-3">
                <Lock className="h-5 w-5 text-emerald-400" />
                <h3 className="font-heading text-xl font-black uppercase tracking-tight">Ransomware</h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">
                Encryption begins within minutes of execution. Average downtime: 21 days. Median
                ransom demand: $1.5M — and paying restores data only 65% of the time.
              </p>
              <div className="mt-auto rounded-md border border-red-900/60 bg-[#1a0b0b] p-4 pt-4 font-mono text-xs text-red-300">
                <p className="mb-1 uppercase tracking-widest text-red-400/70">// intercepted payload</p>
                <p>&gt; YOUR FILES HAVE BEEN ENCRYPTED</p>
                <p>&gt; demand: 12.4 BTC · deadline 71:59:42</p>
                <p className="mt-2 text-slate-500">counter: isolate host · kill switch · restore from immutable backup</p>
              </div>
            </article>
          </FadeIn>

          <FadeIn className="col-span-12 lg:col-span-5">
            <article className="flex h-full flex-col rounded-xl border border-slate-800 bg-[#0D131F] p-7 transition-colors duration-300 hover:border-emerald-500/40">
              <div className="mb-3 flex items-center gap-3">
                <Users className="h-5 w-5 text-emerald-400" />
                <h3 className="font-heading text-xl font-black uppercase tracking-tight">Social engineering</h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">
                No exploit kit needed — just a convincing voice. Vishing calls spoofing internal
                helpdesks reset MFA in one polite conversation.
              </p>
              <div className="mt-auto space-y-2 font-mono text-xs">
                <p className="rounded-md bg-[#132130] px-3 py-2 text-sky-300">"Hi, IT here — we need to re-verify your login…"</p>
                <p className="rounded-md border border-slate-800 px-3 py-2 text-slate-500">defense: hang up, call back on the official number</p>
              </div>
            </article>
          </FadeIn>

          <FadeIn delay={0.1} className="col-span-12 lg:col-span-7">
            <article
              data-testid="threat-tab-malware"
              className="group relative h-full overflow-hidden rounded-xl border border-slate-800 bg-[#0D131F] transition-colors duration-300 hover:border-emerald-500/40"
            >
              <div className="relative h-56 overflow-hidden">
                <img src={CIRCUIT_IMG} alt="Glowing circuit macro" className="h-full w-full object-cover opacity-70 transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D131F] to-transparent" />
              </div>
              <div className="p-7">
                <div className="mb-3 flex items-center gap-3">
                  <Bug className="h-5 w-5 text-emerald-400" />
                  <h3 className="font-heading text-xl font-black uppercase tracking-tight">Malware & zero-days</h3>
                  <span className="ml-auto rounded-sm bg-[#132130] px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-sky-300">Stealth vector</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-400">
                  Infostealers and loaders hide inside cracked tools and poisoned ads, beaconing out
                  every 60 seconds. Mean time to detect is still 204 days without EDR.
                </p>
                <p className="mt-5 font-mono text-xs text-slate-500">
                  <span className="text-emerald-500">$</span> sandbox inspect · hash 9f2a…e41c · verdict: <span className="text-amber-400">suspicious</span> · C2 beacon blocked
                </p>
              </div>
            </article>
          </FadeIn>
        </div>
      </section>

      {/* ============ SAFETY TIPS ============ */}
      <section id="tips" className="scroll-mt-24 border-y border-slate-800/60 bg-[#0a0f18] py-28">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            kicker="// Tactical defense matrix"
            title={<>Harden the human layer</>}
            copy="Four tiers of practical defenses. No theory — every card is something you can do before lunch."
          />
          <Tabs defaultValue="identity">
            <FadeIn>
              <TabsList className="mb-10 flex h-auto flex-wrap gap-2 bg-transparent p-0">
                {TIPS.map((t) => (
                  <TabsTrigger
                    key={t.value}
                    value={t.value}
                    data-testid={`tips-tab-${t.value}`}
                    className="flex items-center gap-2 rounded-md border border-slate-800 bg-[#0D131F] px-4 py-2.5 font-mono text-xs uppercase tracking-[0.15em] text-slate-400 transition-colors data-[selected]:border-emerald-500/50 data-[selected]:text-emerald-400"
                  >
                    <t.icon className="h-4 w-4" /> {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </FadeIn>
            {TIPS.map((t) => (
              <TabsContent key={t.value} value={t.value}>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {t.items.map((item, i) => (
                    <FadeIn key={item.title} delay={i * 0.08}>
                      <div className="h-full rounded-xl border border-slate-800 bg-[#0D131F] p-6 transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500/40">
                        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-500">
                          {String(i + 1).padStart(2, "0")}
                        </p>
                        <h4 className="font-heading text-base font-bold uppercase tracking-tight text-slate-100">{item.title}</h4>
                        <p className="mt-3 text-sm leading-relaxed text-slate-400">{item.desc}</p>
                      </div>
                    </FadeIn>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* ============ STATISTICS ============ */}
      <section id="stats" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-28">
        <SectionHeading
          kicker="// Intelligence briefing"
          title={<>The numbers don't blink</>}
          copy="Global attack telemetry for 2026, paired with live signal from the AEGIS incident grid."
        />
        <div className="grid grid-cols-12 gap-6">
          <FadeIn className="col-span-12 lg:col-span-7">
            <div data-testid="stats-chart-container" className="h-full rounded-xl border border-slate-800 bg-[#0D131F] p-7">
              <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">Global attack volume by vector</p>
              <p className="mb-6 font-heading text-lg font-bold uppercase tracking-tight text-slate-100">Billions of attacks per year</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={VECTORS} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fill: "#64748B", fontSize: 11, fontFamily: "JetBrains Mono Variable" }} axisLine={{ stroke: "#1E293B" }} tickLine={false} />
                    <YAxis tick={{ fill: "#64748B", fontSize: 11, fontFamily: "JetBrains Mono Variable" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(16,185,129,0.06)" }} />
                    <Bar dataKey="attacks" radius={[4, 4, 0, 0]}>
                      {VECTORS.map((v, i) => (
                        <Cell key={v.name} fill={i === 0 ? "#10B981" : i === 1 ? "#06B6D4" : "#1E3A5F"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </FadeIn>
          <div className="col-span-12 grid gap-6 lg:col-span-5">
            <FadeIn delay={0.05}>
              <div className="rounded-xl border border-slate-800 bg-[#0D131F] p-6">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">
                  <Clock className="h-3.5 w-3.5 text-emerald-400" /> Detection gap
                </div>
                <div className="mt-4 flex items-end gap-8">
                  <div>
                    <p className="font-mono text-3xl font-bold text-slate-100">204<span className="text-base text-slate-500">d</span></p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Mean time to detect</p>
                  </div>
                  <div>
                    <p className="font-mono text-3xl font-bold text-amber-400">73<span className="text-base text-slate-500">d</span></p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Mean time to respond</p>
                  </div>
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="rounded-xl border border-emerald-500/30 bg-[#0D131F] p-6" data-testid="stats-live-grid">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-400">
                  <Zap className="h-3.5 w-3.5" /> Live grid telemetry {live ? "" : "(cached)"}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div>
                    <p className="font-mono text-2xl font-bold text-slate-100">{gridTotal}</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Reports filed</p>
                  </div>
                  <div>
                    <p className="font-mono text-2xl font-bold text-amber-400">{gridActive}</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Active triage</p>
                  </div>
                  <div>
                    <p className="font-mono text-2xl font-bold text-emerald-400">{gridResolved}</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Resolved</p>
                  </div>
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="rounded-xl border border-slate-800 bg-[#0D131F] p-6">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> 2026 forecast
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-400">
                  AI-generated phishing is projected to grow <span className="font-mono font-bold text-emerald-400">1,265%</span> —
                  deepfake voice fraud is the fastest-rising vector on the radar.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="border-t border-slate-800/60 bg-[#0a0f18]">
        <div className="mx-auto max-w-7xl px-6 py-24 text-center">
          <FadeIn>
            <p className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">// See something?</p>
            <h2 className="mx-auto max-w-3xl font-heading text-3xl font-black uppercase leading-tight tracking-tight sm:text-5xl">
              Report it in under <span className="text-glow-emerald text-emerald-400">60 seconds</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-slate-400">
              Every report triggers instant triage and a cryptographic case ID. Silence is the attacker's best friend.
            </p>
            <Link
              to="/report"
              data-testid="cta-report-bottom"
              className="mt-10 inline-flex items-center gap-2 rounded-md bg-emerald-500 px-8 py-4 font-mono text-sm font-bold uppercase tracking-[0.15em] text-[#03140d] transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-400"
            >
              Open incident intake <ArrowRight className="h-4 w-4" />
            </Link>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}
