import { SectionHeader } from "../components/SectionHeader";
import { StatusPill } from "../components/StatusPill";
import { api } from "../lib/api";
import { useAsyncData } from "../lib/hooks";

export function BacklogPage() {
  const { data, loading, error } = useAsyncData(() => api.getBacklog(), []);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Delivery"
        title="Backlog"
        description="Public-safe engineering backlog with estimates, ownership, and execution status."
      />

      <section className="panel p-5">
        <div className="space-y-4">
          {loading && <div className="text-sm text-slate-400">Loading backlog...</div>}
          {error && <div className="text-sm text-rose-300">{error}</div>}
          {data?.items.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.team}</div>
                  <h3 className="mt-2 text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-400">Estimate: {item.estimate} points</p>
                </div>
                <div className="flex gap-3">
                  <StatusPill value={item.priority} />
                  <StatusPill value={item.status} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

