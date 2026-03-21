import { GitBranch, Network, Server } from "lucide-react";
import { SectionHeader } from "../components/SectionHeader";
import { api } from "../lib/api";
import { formatDate, useAsyncData } from "../lib/hooks";

export function InfrastructurePage() {
  const { data, loading, error } = useAsyncData(() => api.getArchitecture(), []);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Service Map"
        title="Infrastructure"
        description="Generic architecture metadata for the self-hosted stack, including service roles, ports, and runtime dependencies."
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="panel p-5">
          <div className="flex items-center justify-between">
            <p className="panel-title">Services</p>
            {data && <span className="text-sm text-slate-500">Updated {formatDate(data.updatedAt)}</span>}
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {loading && <div className="text-sm text-slate-400">Loading architecture...</div>}
            {error && <div className="text-sm text-rose-300">{error}</div>}
            {data?.services.map((service) => (
              <article key={service.id} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{service.name}</h3>
                    <p className="mt-2 text-sm text-slate-400">{service.role}</p>
                  </div>
                  <Server className="text-sky-300" size={18} />
                </div>
                <div className="mt-4 space-y-2 text-sm text-slate-300">
                  <div className="flex items-center gap-2"><Network size={14} /> Port {service.port}</div>
                  <div className="flex items-center gap-2"><GitBranch size={14} /> {service.language}</div>
                  <div className="text-slate-500">Depends on: {service.dependencies.length ? service.dependencies.join(", ") : "none"}</div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel p-5">
          <p className="panel-title">Data Flows</p>
          <div className="mt-5 space-y-3">
            {data?.flows.map((flow) => (
              <div key={flow} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-sm leading-6 text-slate-300">
                {flow}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

