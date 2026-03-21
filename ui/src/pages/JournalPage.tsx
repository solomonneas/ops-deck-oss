import { useEffect, useState } from "react";
import { MarkdownContent } from "../components/MarkdownContent";
import { SectionHeader } from "../components/SectionHeader";
import { api } from "../lib/api";
import { useAsyncData } from "../lib/hooks";

function formatJournalDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(`${date}T12:00:00Z`));
}

export function JournalPage() {
  const { data, loading, error } = useAsyncData(() => api.getJournalDates(), []);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const selectedEntry = useAsyncData(() => (selectedDate ? api.getJournalEntry(selectedDate) : Promise.resolve(null)), [selectedDate]);

  useEffect(() => {
    if (data?.dates?.length && !selectedDate) {
      setSelectedDate(data.dates[0]);
    }
  }, [data, selectedDate]);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Activity Log"
        title="Journal"
        description="Review daily notes by date, see which days have entries, and open an entry to inspect the rendered markdown details."
      />

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <section className="panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Available Dates</h2>
            <span className="text-sm text-slate-400">{data?.dates.length ?? 0} entries</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {loading && <div className="text-sm text-slate-400">Loading journal dates...</div>}
            {error && <div className="text-sm text-rose-300">{error}</div>}
            {data?.dates.map((date) => {
              const active = date === selectedDate;
              return (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    active ? "border-emerald-400/40 bg-emerald-400/10" : "border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/70"
                  }`}
                >
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Entry</div>
                  <div className="mt-2 text-sm font-semibold text-white">{formatJournalDate(date)}</div>
                  <div className="mt-2 text-xs text-slate-400">{date}</div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="panel p-6">
          {selectedEntry.loading && <div className="text-sm text-slate-400">Loading journal entry...</div>}
          {selectedEntry.error && <div className="text-sm text-rose-300">{selectedEntry.error}</div>}
          {selectedEntry.data && (
            <div className="space-y-5">
              <div className="border-b border-slate-800 pb-5">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Selected Date</div>
                <h2 className="mt-2 text-2xl font-bold text-white">{formatJournalDate(selectedEntry.data.date)}</h2>
              </div>
              <MarkdownContent content={selectedEntry.data.content} />
            </div>
          )}
          {!selectedEntry.loading && !selectedEntry.error && !selectedEntry.data && (
            <div className="text-sm text-slate-400">Select a date to read that journal entry.</div>
          )}
        </section>
      </div>
    </div>
  );
}
