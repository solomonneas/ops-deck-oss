import {
  Activity,
  BookCopy,
  BookOpen,
  Brain,
  CalendarClock,
  LayoutDashboard,
  Radar,
  SearchCode,
  ServerCog,
  Settings,
  ShieldCheck
} from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/cron-calendar", label: "Cron Calendar", icon: CalendarClock },
  { to: "/intel-feed", label: "Intel Feed", icon: Radar },
  { to: "/security", label: "Security", icon: ShieldCheck },
  { to: "/infrastructure", label: "Infrastructure", icon: ServerCog },
  { to: "/memory", label: "Memory Browser", icon: Brain },
  { to: "/journal", label: "Journal", icon: BookOpen },
  { to: "/workspace", label: "Workspace Config", icon: Settings },
  { to: "/code-search", label: "Code Search", icon: SearchCode },
  { to: "/prompts", label: "Prompts", icon: BookCopy },
  { to: "/backlog", label: "Backlog", icon: Activity }
];

export function AppShell() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-transparent text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 gap-6 p-4 md:grid-cols-[280px_minmax(0,1fr)] md:p-6">
        <aside className="panel flex flex-col p-5">
          <div>
            <div className="inline-flex items-center rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-sky-200">
              Ops Deck OSS
            </div>
            <h1 className="mt-4 text-2xl font-bold text-white">Operational control plane for local AI stacks</h1>
            <p className="mt-3 text-sm text-slate-400">A dark, self-hosted dashboard for telemetry, search, prompt operations, and engineering backlog flow.</p>
          </div>

          <nav className="mt-8 flex flex-1 flex-col gap-2">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-900/70 hover:text-white"
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <p className="panel-title">Current Route</p>
            <div className="mt-3 text-sm text-slate-200">{location.pathname}</div>
          </div>
        </aside>

        <main className="flex min-w-0 flex-col gap-6">
          <header className="panel flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="panel-title">Workspace</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Self-hosted visibility across services, search, prompts, and working memory</h2>
            </div>
            <div className="flex gap-3 text-sm text-slate-400">
              <div className="rounded-full border border-slate-800 px-4 py-2">UI :5173</div>
              <div className="rounded-full border border-slate-800 px-4 py-2">API :8005</div>
              <div className="rounded-full border border-slate-800 px-4 py-2">Search :5204</div>
              <div className="rounded-full border border-slate-800 px-4 py-2">Prompts :5202</div>
            </div>
          </header>

          <Outlet />
        </main>
      </div>
    </div>
  );
}
