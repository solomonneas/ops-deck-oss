import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ExternalLink,
  Github,
  Shield,
  Wrench,
  Server,
  Layers,
  BookOpen,
  Archive,
  Eye,
  EyeOff,
  Globe,
  Lock,
  ChevronDown,
  ChevronRight,
  FolderGit2,
  Rocket,
  Pause,
  ArrowRight,
} from 'lucide-react';
import { REPOS, type RepoCategory, type RepoStatus } from '../data/repos';
import { REPO_DETAILS } from '../data/repos-detail';

// Host for in-app links to running services. Defaults to the current page
// host (so the link resolves wherever the dashboard is being viewed from);
// override with the VITE_OPSDECK_HOST_IP env var if you want to pin it to a
// specific LAN IP or hostname.
const HOST_IP = import.meta.env.VITE_OPSDECK_HOST_IP
  || (typeof window !== 'undefined' ? window.location.hostname : 'localhost');

const CATEGORY_CONFIG: Record<RepoCategory, { label: string; icon: typeof Shield; color: string; order: number }> = {
  security: { label: 'Security', icon: Shield, color: '#ef4444', order: 0 },
  developer: { label: 'Developer Tools', icon: Wrench, color: '#7c5cfc', order: 1 },
  'dev-tools': { label: 'Dev Utilities', icon: Wrench, color: '#22c55e', order: 2 },
  infrastructure: { label: 'Infrastructure', icon: Server, color: '#f59e0b', order: 3 },
  mcp: { label: 'MCP Servers', icon: Layers, color: '#8b5cf6', order: 4 },
  portfolio: { label: 'Portfolio & Landing', icon: BookOpen, color: '#06b6d4', order: 5 },
  archived: { label: 'Archived', icon: Archive, color: '#6b7280', order: 6 },
};

const STATUS_CONFIG: Record<RepoStatus, { label: string; icon: typeof Rocket; bg: string; text: string; border: string }> = {
  live: { label: 'Live', icon: Rocket, bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  dev: { label: 'Dev', icon: Wrench, bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  shelved: { label: 'Shelved', icon: Pause, bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/30' },
  archived: { label: 'Archived', icon: Archive, bg: 'bg-gray-500/10', text: 'text-gray-500', border: 'border-gray-500/30' },
};

type FilterStatus = RepoStatus | 'all';

export default function Repos() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<RepoCategory>>(new Set(['archived']));

  const toggleSection = (cat: RepoCategory) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const { grouped, counts } = useMemo(() => {
    const q = query.trim().toLowerCase();
    let filtered = REPOS.filter((r) => {
      if (!showArchived && r.status === 'archived') return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (q && !r.name.toLowerCase().includes(q) && !r.description.toLowerCase().includes(q)) return false;
      return true;
    });

    const cats = Object.keys(CATEGORY_CONFIG) as RepoCategory[];
    const grouped = cats
      .map((cat) => ({
        category: cat,
        ...CATEGORY_CONFIG[cat],
        repos: filtered.filter((r) => r.category === cat),
      }))
      .filter((g) => g.repos.length > 0)
      .sort((a, b) => a.order - b.order);

    return {
      grouped,
      counts: {
        total: REPOS.filter((r) => r.status !== 'archived').length,
        live: REPOS.filter((r) => r.status === 'live').length,
        dev: REPOS.filter((r) => r.status === 'dev').length,
        shelved: REPOS.filter((r) => r.status === 'shelved').length,
        archived: REPOS.filter((r) => r.status === 'archived').length,
        public: REPOS.filter((r) => r.visibility === 'public' && r.status !== 'archived').length,
        private: REPOS.filter((r) => r.visibility === 'private' && r.status !== 'archived').length,
      },
    };
  }, [query, statusFilter, showArchived]);

  return (
    <div className="animate-fadeIn min-h-full" style={{ backgroundColor: '#0a0a14' }}>
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <FolderGit2 size={22} className="text-[#7c5cfc]" />
          <h1 className="text-xl font-semibold text-white">Repos</h1>
        </div>
        <p className="text-sm text-gray-500">
          All repositories at a glance. {counts.total} active ({counts.live} live, {counts.dev} dev, {counts.shelved} shelved) + {counts.archived} archived.
          &nbsp;
          <span className="text-gray-600">
            {counts.public} public, {counts.private} private
          </span>
        </p>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {([
          { label: 'Live', value: counts.live, color: '#10b981' },
          { label: 'Dev', value: counts.dev, color: '#f59e0b' },
          { label: 'Shelved', value: counts.shelved, color: '#6b7280' },
          { label: 'Archived', value: counts.archived, color: '#4b5563' },
        ] as const).map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-dashed border-white/10 bg-[#16162a] px-4 py-3"
          >
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {(['all', 'live', 'dev', 'shelved'] as FilterStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === s
                ? 'bg-[#7c5cfc]/20 text-white'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            {s === 'all' ? 'All Active' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
        <div className="w-px h-5 bg-white/10 mx-1" />
        <button
          onClick={() => {
            setShowArchived(!showArchived);
            if (!showArchived) {
              setCollapsedSections((prev) => {
                const next = new Set(prev);
                next.delete('archived');
                return next;
              });
            }
          }}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            showArchived
              ? 'bg-gray-500/20 text-gray-300'
              : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
          }`}
        >
          {showArchived ? <Eye size={12} /> : <EyeOff size={12} />}
          Archived ({counts.archived})
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search repos by name or description..."
          className="w-full rounded-xl border border-dashed border-white/10 bg-[#16162a] px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-[#7c5cfc]/40 focus:outline-none"
        />
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {grouped.map((section) => {
          const isCollapsed = collapsedSections.has(section.category);
          const SectionIcon = section.icon;
          return (
            <section key={section.category}>
              <button
                onClick={() => toggleSection(section.category)}
                className="flex items-center gap-2 mb-3 group w-full text-left"
              >
                {isCollapsed ? (
                  <ChevronRight size={14} className="text-gray-500 group-hover:text-gray-300" />
                ) : (
                  <ChevronDown size={14} className="text-gray-500 group-hover:text-gray-300" />
                )}
                <SectionIcon size={14} style={{ color: section.color }} />
                <h2
                  className="text-sm font-semibold uppercase tracking-wider"
                  style={{ color: section.color }}
                >
                  {section.label}
                </h2>
                <span className="text-xs text-gray-600 ml-1">({section.repos.length})</span>
              </button>

              {!isCollapsed && (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {section.repos.map((repo) => {
                    const status = STATUS_CONFIG[repo.status];
                    const StatusIcon = status.icon;
                    return (
                      <article
                        key={repo.slug}
                        className={`group relative rounded-xl border border-dashed border-white/10 bg-[#16162a] p-4 transition-all duration-200 hover:-translate-y-[2px] ${
                          repo.status === 'archived' ? 'opacity-60' : ''
                        }`}
                        style={{ borderLeft: `3px solid ${section.color}` }}
                      >
                        {/* Top row: name + badges */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-sm font-semibold text-white truncate">{repo.name}</h3>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Visibility badge */}
                            <span
                              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                repo.visibility === 'private'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-white/5 text-gray-400 border border-white/10'
                              }`}
                            >
                              {repo.visibility === 'private' ? <Lock size={9} /> : <Globe size={9} />}
                              {repo.visibility}
                            </span>
                            {/* Status badge */}
                            <span
                              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border ${status.bg} ${status.text} ${status.border}`}
                            >
                              <StatusIcon size={9} />
                              {status.label}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-gray-400 line-clamp-2 mb-3">{repo.description}</p>

                        {/* Links row */}
                        <div className="flex items-center gap-2 mb-3">
                          {repo.deploy && (
                            <a
                              href={repo.deploy}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-md border border-emerald-500/20 bg-emerald-500/10 p-1.5 text-emerald-400 transition-colors hover:text-emerald-300"
                              title={`Live: ${repo.deploy}`}
                            >
                              <Globe size={13} />
                            </a>
                          )}
                          {repo.port && (
                            <a
                              href={`http://${HOST_IP}:${repo.port}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-md border border-white/10 bg-white/5 p-1.5 text-gray-300 transition-colors hover:text-white"
                              title={`Local: ${HOST_IP}:${repo.port}`}
                            >
                              <ExternalLink size={13} />
                            </a>
                          )}
                          {repo.github && (
                            <a
                              href={repo.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-md border border-white/10 bg-white/5 p-1.5 text-gray-300 transition-colors hover:text-white"
                              title="GitHub"
                            >
                              <Github size={13} />
                            </a>
                          )}
                          {repo.port && (
                            <span className="ml-auto rounded-full bg-white/5 px-2 py-0.5 font-mono text-[10px] text-gray-500">
                              :{repo.port}
                            </span>
                          )}
                        </div>

                        {/* Stack tags + last push */}
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {(repo.stack || []).slice(0, 4).map((tag) => (
                              <span
                                key={`${repo.slug}-${tag}`}
                                className="rounded-full border border-dashed border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] text-gray-500"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <span className="text-[10px] text-gray-600 shrink-0 ml-2">{repo.lastPush}</span>
                        </div>

                        {/* Deep Dive link */}
                        {REPO_DETAILS[repo.slug] && (
                          <Link
                            to={`/repos/${repo.slug}`}
                            className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-[#7c5cfc] hover:text-[#9d84fc] transition-colors group/link"
                          >
                            <span>Deep Dive</span>
                            <ArrowRight size={11} className="transition-transform group-hover/link:translate-x-0.5" />
                          </Link>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
