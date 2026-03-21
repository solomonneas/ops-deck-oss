import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { SectionHeader } from "../components/SectionHeader";
import { StatCard } from "../components/StatCard";
import { StatusPill } from "../components/StatusPill";
import { api } from "../lib/api";
import { formatDate, useAsyncData } from "../lib/hooks";

const pieColors = ["#38bdf8", "#4ade80", "#f59e0b", "#fb7185"];

export function DashboardPage() {
  const cron = useAsyncData(() => api.getCronJobs(), []);
  const intel = useAsyncData(() => api.getAgentIntel(), []);
  const security = useAsyncData(() => api.getSecurityAudit(), []);
  const backlog = useAsyncData(() => api.getBacklog(), []);

  const jobs = cron.data?.jobs ?? [];
  const summaryData = Object.entries(
    jobs.reduce<Record<string, number>>((acc, job) => {
      acc[job.status] = (acc[job.status] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Overview"
        title="Dashboard Summary"
        description="One page for the highest-signal metrics across cron health, active findings, feed activity, and delivery pressure."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Cron Jobs" value={String(jobs.length)} detail="Seeded schedules from the telemetry API" />
        <StatCard label="Intel Entries" value={String(intel.data?.items.length ?? 0)} detail="Filterable agent and research feed" />
        <StatCard label="Security Score" value={String(security.data?.score ?? "--")} detail="Generic posture score from latest audit" />
        <StatCard label="Backlog Items" value={String(backlog.data?.items.length ?? 0)} detail="Engineering tasks with estimates" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="panel p-5">
          <p className="panel-title">Runtime Trend</p>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={jobs.map((job) => ({ name: job.name.split(" ").slice(0, 2).join(" "), runtime: job.runtimeSeconds }))}>
                <defs>
                  <linearGradient id="runtimeFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
                <Area type="monotone" dataKey="runtime" stroke="#38bdf8" fill="url(#runtimeFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel p-5">
          <p className="panel-title">Job Health Mix</p>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={summaryData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={88} paddingAngle={4}>
                  {summaryData.map((entry, index) => (
                    <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="panel p-5">
          <p className="panel-title">Recent Intel</p>
          <div className="mt-4 space-y-3">
            {intel.data?.items.slice(0, 4).map((item) => (
              <article key={item.id} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm text-slate-400">{item.summary}</p>
                  </div>
                  <StatusPill value={item.severity} />
                </div>
                <div className="mt-3 text-xs text-slate-500">{formatDate(item.createdAt)}</div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel p-5">
          <p className="panel-title">Open Findings</p>
          <div className="mt-4 space-y-3">
            {security.data?.findings.map((finding) => (
              <article key={finding.id} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <div>
                  <h3 className="font-semibold text-white">{finding.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{finding.owner} • {finding.status}</p>
                </div>
                <StatusPill value={finding.severity} />
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

