import {
  Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, LabelList,
} from "recharts";

export interface SurveyOption {
  label: string;
  count: number;
}

export interface SurveyQuestion {
  id: string;
  order: number;
  question: string;
  responses: number;
  chart: "bar" | "hbar" | "pie";
  multi?: boolean;
  sample?: boolean;
  options: SurveyOption[];
}

const PALETTE = ["#34d399", "#38bdf8", "#fbbf24", "#f87171", "#a78bfa", "#f472b6"];

const pct = (n: number, total: number) => (total ? `${((n / total) * 100).toFixed(1).replace(/\.0$/, "")}%` : "0%");

const tooltipStyle = {
  contentStyle: { background: "#0b1017", border: "1px solid #1e293b", borderRadius: 6, fontFamily: "monospace", fontSize: 12 },
  itemStyle: { color: "#e2e8f0" },
  labelStyle: { color: "#94a3b8" },
  cursor: { fill: "rgba(148,163,184,0.06)" },
};

const RAD = Math.PI / 180;

// Percentage rendered inside the ring; tiny slices skip the label (the legend still lists them).
function renderSliceLabel(props: unknown) {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, payload } = props as {
    cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number;
    payload: { pct: string };
  };
  if (percent < 0.08) return null;
  const r = innerRadius + (outerRadius - innerRadius) / 2;
  const x = cx + r * Math.cos(-midAngle * RAD);
  const y = cy + r * Math.sin(-midAngle * RAD);
  return (
    <text x={x} y={y} fill="#03140d" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700} fontFamily="monospace">
      {payload.pct}
    </text>
  );
}

export function SurveyChart({ q }: { q: SurveyQuestion }) {
  const total = q.multi ? q.responses : q.options.reduce((s, o) => s + o.count, 0);
  const data = q.options.map((o, i) => ({ ...o, pct: pct(o.count, total), color: PALETTE[i % PALETTE.length] }));

  if (q.chart === "pie") {
    const slices = data.filter((d) => d.count > 0);
    return (
      <div className="flex flex-col gap-4" data-testid={`survey-chart-${q.id}`}>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slices}
                dataKey="count"
                nameKey="label"
                innerRadius={54}
                outerRadius={96}
                paddingAngle={2}
                stroke="#070a0f"
                strokeWidth={2}
                label={renderSliceLabel}
                labelLine={false}
                isAnimationActive
              >
                {slices.map((d) => (
                  <Cell key={d.label} fill={d.color} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} formatter={(v: number, _n, item) => [`${v} · ${(item.payload as { pct: string }).pct}`, "Responses"]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2" data-testid={`survey-legend-${q.id}`}>
          {data.map((d) => (
            <li key={d.label} className="flex items-center justify-between gap-4 font-mono text-xs">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.color }} />
                {d.label}
              </span>
              <span className="shrink-0 text-slate-500">{d.count} · {d.pct}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (q.chart === "hbar") {
    const labelWidth = Math.min(140, Math.max(48, Math.max(...data.map((d) => d.label.length)) * 7.5));
    return (
      <div style={{ height: Math.max(180, data.length * 46 + 60) }} data-testid={`survey-chart-${q.id}`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 72, top: 8, bottom: 8 }} barCategoryGap={18}>
            <CartesianGrid horizontal={false} stroke="#1e293b" strokeDasharray="3 3" />
            <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11, fontFamily: "monospace" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <YAxis type="category" dataKey="label" width={labelWidth} tick={{ fill: "#cbd5e1", fontSize: 12, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipStyle} formatter={(v: number, _n, item) => [`${v} · ${(item.payload as { pct: string }).pct}`, "Responses"]} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={44}>
              {data.map((d) => <Cell key={d.label} fill={d.color} />)}
              <LabelList dataKey="pct" position="right" style={{ fill: "#94a3b8", fontSize: 11, fontFamily: "monospace" }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="h-64" data-testid={`survey-chart-${q.id}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -16, right: 8, top: 20, bottom: 0 }} barCategoryGap="28%">
          <CartesianGrid vertical={false} stroke="#1e293b" strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={{ fill: "#cbd5e1", fontSize: 11, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#64748b", fontSize: 11, fontFamily: "monospace" }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip {...tooltipStyle} formatter={(v: number, _n, item) => [`${v} · ${(item.payload as { pct: string }).pct}`, "Responses"]} />
          <Bar dataKey="count" fill="#34d399" radius={[4, 4, 0, 0]}>
            <LabelList dataKey="count" position="top" style={{ fill: "#94a3b8", fontSize: 11, fontFamily: "monospace" }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
