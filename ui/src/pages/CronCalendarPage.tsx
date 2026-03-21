import { SectionHeader } from "../components/SectionHeader";
import { StatusPill } from "../components/StatusPill";
import { api } from "../lib/api";
import { formatDate, useAsyncData } from "../lib/hooks";

export function CronCalendarPage() {
  const { data, loading, error } = useAsyncData(() => api.getCronJobs(), []);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Schedules"
        title="Cron Calendar"
        description="A single operational view across recurring jobs, owners, cadence, and runtime health."
      />

      <section className="panel overflow-hidden">
        <div className="grid grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr_0.7fr] gap-4 border-b border-slate-800 px-5 py-4 text-xs uppercase tracking-[0.2em] text-slate-500">
          <span>Job</span>
          <span>Schedule</span>
          <span>Last Run</span>
          <span>Next Run</span>
          <span>Status</span>
        </div>
        <div className="divide-y divide-slate-800">
          {loading && <div className="px-5 py-6 text-sm text-slate-400">Loading cron jobs...</div>}
          {error && <div className="px-5 py-6 text-sm text-rose-300">{error}</div>}
          {data?.jobs.map((job) => (
            <div key={job.id} className="grid grid-cols-1 gap-3 px-5 py-5 md:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr_0.7fr] md:items-center">
              <div>
                <h3 className="font-semibold text-white">{job.name}</h3>
                <p className="mt-1 text-sm text-slate-400">{job.owner} • {job.target} • {job.runtimeSeconds}s</p>
              </div>
              <div className="text-sm text-slate-300">{job.schedule}</div>
              <div className="text-sm text-slate-300">{formatDate(job.lastRun)}</div>
              <div className="text-sm text-slate-300">{formatDate(job.nextRun)}</div>
              <div><StatusPill value={job.status} /></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

