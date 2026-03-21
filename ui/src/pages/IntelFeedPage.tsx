import { useState } from "react";
import { SectionHeader } from "../components/SectionHeader";
import { StatusPill } from "../components/StatusPill";
import { api } from "../lib/api";
import { formatDate, useAsyncData } from "../lib/hooks";

export function IntelFeedPage() {
  const [category, setCategory] = useState("");
  const { data, loading, error, setData } = useAsyncData(() => api.getAgentIntel(category || undefined), [category]);

  async function handleSeedPost() {
    const created = await api.createIntel({
      title: "Manual operator note",
      category: "ops",
      severity: "low",
      source: "dashboard",
      summary: "An operator created a safe sample note from the public UI to verify write-path behavior.",
      tags: ["manual", "ui"]
    });
    setData((current) => current ? { ...current, items: [created, ...current.items] } : { categories: ["ops"], items: [created] });
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Activity Feed"
        title="Intel Feed"
        description="Track release notes, research updates, operational observations, and security-relevant activity from one endpoint."
        action={
          <div className="flex gap-3">
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-sm text-slate-200"
            >
              <option value="">All categories</option>
              {data?.categories.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
            <button onClick={handleSeedPost} className="rounded-xl bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950">
              Post Sample Intel
            </button>
          </div>
        }
      />

      <section className="grid gap-4">
        {loading && <div className="panel p-5 text-sm text-slate-400">Loading intel feed...</div>}
        {error && <div className="panel p-5 text-sm text-rose-300">{error}</div>}
        {data?.items.map((item) => (
          <article key={item.id} className="panel p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <StatusPill value={item.severity} />
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.category}</span>
                </div>
                <h3 className="mt-3 text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{item.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">#{tag}</span>
                  ))}
                </div>
              </div>
              <div className="text-right text-sm text-slate-500">
                <div>{item.source}</div>
                <div className="mt-2">{formatDate(item.createdAt)}</div>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

