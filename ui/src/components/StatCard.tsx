type StatCardProps = {
  label: string;
  value: string;
  detail: string;
};

export function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <div className="panel p-5">
      <p className="panel-title">{label}</p>
      <div className="mt-4 text-3xl font-bold text-slate-100">{value}</div>
      <p className="mt-2 text-sm text-slate-400">{detail}</p>
    </div>
  );
}

