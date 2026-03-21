const toneClasses: Record<string, string> = {
  healthy: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/20",
  passing: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/20",
  warning: "bg-amber-500/15 text-amber-200 ring-amber-300/20",
  degraded: "bg-rose-500/15 text-rose-200 ring-rose-300/20",
  high: "bg-rose-500/15 text-rose-200 ring-rose-300/20",
  medium: "bg-amber-500/15 text-amber-200 ring-amber-300/20",
  low: "bg-sky-500/15 text-sky-200 ring-sky-300/20",
  planned: "bg-slate-500/15 text-slate-200 ring-slate-300/20",
  ready: "bg-cyan-500/15 text-cyan-200 ring-cyan-300/20",
  "in-progress": "bg-fuchsia-500/15 text-fuchsia-200 ring-fuchsia-300/20",
  open: "bg-rose-500/15 text-rose-200 ring-rose-300/20"
};

export function StatusPill({ value }: { value: string }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ${toneClasses[value] ?? toneClasses.low}`}>
      {value.replace("-", " ")}
    </span>
  );
}

