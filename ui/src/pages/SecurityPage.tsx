import { BarChart, Bar, ResponsiveContainer, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { SectionHeader } from "../components/SectionHeader";
import { StatusPill } from "../components/StatusPill";
import { api } from "../lib/api";
import { formatDate, useAsyncData } from "../lib/hooks";

export function SecurityPage() {
  const { data, loading, error } = useAsyncData(() => api.getSecurityAudit(), []);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Risk Posture"
        title="Security"
        description="Audit score, control coverage, and current findings with generic public-safe example data."
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="panel p-5">
          <p className="panel-title">Control Coverage</p>
          <div className="mt-5 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.controls ?? []}>
                <CartesianGrid stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" hide />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
                <Bar dataKey="coverage" fill="#38bdf8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel p-5">
          <p className="panel-title">Audit Snapshot</p>
          {loading && <div className="mt-4 text-sm text-slate-400">Loading audit...</div>}
          {error && <div className="mt-4 text-sm text-rose-300">{error}</div>}
          {data && (
            <div className="mt-4 space-y-5">
              <div>
                <div className="text-6xl font-bold text-white">{data.score}</div>
                <p className="mt-2 text-sm text-slate-400">Latest audit run {formatDate(data.lastAudit)}</p>
              </div>
              <div className="space-y-3">
                {data.findings.map((finding) => (
                  <div key={finding.id} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-white">{finding.title}</h3>
                        <p className="mt-1 text-sm text-slate-400">{finding.owner} • {finding.status}</p>
                      </div>
                      <StatusPill value={finding.severity} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

