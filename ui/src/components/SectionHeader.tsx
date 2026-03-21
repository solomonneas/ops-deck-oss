import type { ReactNode } from "react";

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export function SectionHeader({ eyebrow, title, description, action }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="panel-title">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-bold text-white">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">{description}</p>
      </div>
      {action}
    </div>
  );
}
