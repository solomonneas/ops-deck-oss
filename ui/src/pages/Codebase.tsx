import { useMemo, useState } from 'react';
import {
  Copy,
  FolderOpen,
  Github,
  Search,
  Terminal,
  FileCode2,
  FolderTree,
  FileText,
  Compass,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import {
  projects,
  workspaceDirs,
  rootFiles,
  categoryMeta,
  statusMeta,
  type ProjectCategory,
  type ProjectStatus,
  type ProjectEntry,
} from '../data/codebase';

type TabKey = 'projects' | 'workspace' | 'files' | 'quick-nav';
type CategoryFilter = 'all' | ProjectCategory;
type StatusFilter = 'all' | ProjectStatus;

const TAB_ITEMS: { key: TabKey; label: string; icon: typeof FolderOpen }[] = [
  { key: 'projects', label: 'Projects', icon: FolderOpen },
  { key: 'workspace', label: 'Workspace Structure', icon: FolderTree },
  { key: 'files', label: 'Key Files', icon: FileText },
  { key: 'quick-nav', label: 'Quick Nav', icon: Compass },
];

const CATEGORY_FILTERS: { key: CategoryFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'security', label: 'Security' },
  { key: 'developer', label: 'Developer' },
  { key: 'infrastructure', label: 'Infrastructure' },
  { key: 'mcp', label: 'MCP' },
  { key: 'portfolio', label: 'Portfolio' },
  { key: 'landing', label: 'Landing' },
  { key: 'dev-tools', label: 'Dev Utilities' },
];

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'live', label: 'Live' },
  { key: 'active', label: 'Active' },
  { key: 'complete', label: 'Complete' },
  { key: 'shelved', label: 'Shelved' },
];

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setOk(true);
        setTimeout(() => setOk(false), 1500);
      }}
      className="text-[10px] text-gray-500 hover:text-[#7c5cfc] font-mono transition-colors"
      title="Copy to clipboard"
    >
      {ok ? '✓' : '⎘'}
    </button>
  );
}

function toWorkspacePath(path: string) {
  return `~/workspace/${path}`;
}

function toGithubUrl(github?: string) {
  if (!github) return '';
  if (github.startsWith('http://') || github.startsWith('https://')) return github;
  return `https://github.com/${github}`;
}

function ProjectCard({ project }: { project: ProjectEntry }) {
  const [open, setOpen] = useState(false);
  const category = categoryMeta[project.category];
  const status = statusMeta[project.status];
  const fullProjectPath = toWorkspacePath(project.dir);
  const firstEntry = project.entryPoints[0];
  const firstEntryPath = firstEntry ? `${project.dir}/${firstEntry.path}` : project.dir;
  const githubUrl = toGithubUrl(project.github);

  return (
    <article className="rounded-xl border border-dashed border-white/10 bg-[#16162a] p-4">
      <button onClick={() => setOpen(!open)} className="w-full text-left">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-white truncate">{project.name}</h3>
              <span
                className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                style={{ backgroundColor: `${status.color}26`, color: status.color }}
              >
                {status.label}
              </span>
              <span
                className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                style={{ backgroundColor: `${category.color}1a`, color: category.color }}
              >
                {category.label}
              </span>
            </div>
            <p className="text-xs text-gray-400 line-clamp-1">{project.description}</p>
          </div>
          {open ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          {project.stack.slice(0, 5).map((tag) => (
            <span key={`${project.name}-${tag}`} className="rounded-full border border-dashed border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] text-gray-400 font-mono">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-gray-500">
          {project.port && <span className="font-mono">:{project.port}</span>}
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-white transition-colors"
              onClick={(e) => e.stopPropagation()}
              title="Open GitHub"
            >
              <Github size={12} />
            </a>
          )}
        </div>
      </button>

      {open && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
          <div className="rounded-lg border border-dashed border-white/10 bg-[#0a0a14] p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-gray-500">Path</span>
              <CopyBtn text={fullProjectPath} />
            </div>
            <p className="text-xs text-gray-300 font-mono mt-1 break-all">{fullProjectPath}</p>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] text-gray-500 uppercase tracking-wider">Entry Points</p>
            {project.entryPoints.map((entry) => {
              const full = `${project.dir}/${entry.path}`;
              return (
                <div key={`${project.name}-${entry.label}`} className="rounded-lg border border-dashed border-white/10 bg-[#0a0a14] p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-white">{entry.label}</span>
                    <CopyBtn text={toWorkspacePath(full)} />
                  </div>
                  <p className="text-[11px] text-gray-400 font-mono mt-1 break-all">{toWorkspacePath(full)}</p>
                </div>
              );
            })}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {project.buildCmd && (
              <div className="rounded-lg border border-dashed border-white/10 bg-[#0a0a14] p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-gray-500 uppercase">Build</span>
                  <CopyBtn text={project.buildCmd} />
                </div>
                <p className="text-[11px] text-gray-300 font-mono mt-1 break-all">{project.buildCmd}</p>
              </div>
            )}
            {project.devCmd && (
              <div className="rounded-lg border border-dashed border-white/10 bg-[#0a0a14] p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-gray-500 uppercase">Dev</span>
                  <CopyBtn text={project.devCmd} />
                </div>
                <p className="text-[11px] text-gray-300 font-mono mt-1 break-all">{project.devCmd}</p>
              </div>
            )}
          </div>

          {project.deploy && (
            <div className="rounded-lg border border-dashed border-white/10 bg-[#0a0a14] p-2.5">
              <p className="text-[11px] text-gray-500 uppercase">Deploy</p>
              <p className="text-xs text-gray-300 mt-1">{project.deploy}</p>
            </div>
          )}

          {project.notes && (
            <div className="rounded-lg border border-dashed border-yellow-500/30 bg-yellow-500/10 p-2.5">
              <div className="flex items-center gap-1.5 text-yellow-300 text-xs font-semibold mb-1">
                <AlertTriangle size={12} /> Notes
              </div>
              <p className="text-xs text-yellow-100/85">{project.notes}</p>
            </div>
          )}

          {githubUrl && (
            <div className="rounded-lg border border-dashed border-white/10 bg-[#0a0a14] p-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-gray-500 uppercase">GitHub</span>
                <CopyBtn text={githubUrl} />
              </div>
              <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#06b6d4] hover:underline break-all">
                {githubUrl}
              </a>
            </div>
          )}

          <div className="rounded-lg border border-dashed border-white/10 bg-[#0a0a14] p-2.5 space-y-2">
            <p className="text-[11px] text-gray-500 uppercase">Quick Commands</p>
            {[
              `cd ${fullProjectPath}`,
              `nvim ${toWorkspacePath(firstEntryPath)}`,
              `code ${project.dir}`,
            ].map((cmd) => (
              <div key={cmd} className="flex items-center justify-between gap-2">
                <code className="text-[11px] text-gray-300 font-mono break-all">{cmd}</code>
                <CopyBtn text={cmd} />
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

export default function Codebase() {
  const [tab, setTab] = useState<TabKey>('projects');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [query, setQuery] = useState('');

  const stats = useMemo(() => {
    return {
      total: projects.length,
      live: projects.filter((p) => p.status === 'live').length,
      active: projects.filter((p) => p.status === 'active').length,
      complete: projects.filter((p) => p.status === 'complete').length,
      shelved: projects.filter((p) => p.status === 'shelved').length,
    };
  }, []);

  const filteredProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (q && !p.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [categoryFilter, statusFilter, query]);

  const liveProjects = useMemo(() => projects.filter((p) => p.status === 'live'), []);

  const byCategory = useMemo(() => {
    const map = new Map<ProjectCategory, ProjectEntry[]>();
    projects.forEach((p) => {
      const current = map.get(p.category) || [];
      current.push(p);
      map.set(p.category, current);
    });
    return map;
  }, []);

  return (
    <div className="animate-fadeIn min-h-full bg-[#0a0a14]">
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <FolderOpen size={22} className="text-[#7c5cfc]" />
          <h1 className="text-xl font-semibold text-white">Codebase</h1>
        </div>
        <p className="text-sm text-gray-500">Complete directory and project reference for ~/workspace</p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
        {[
          { label: 'Projects', value: stats.total, color: '#7c5cfc' },
          { label: 'Live', value: stats.live, color: '#22c55e' },
          { label: 'Active', value: stats.active, color: '#06b6d4' },
          { label: 'Complete', value: stats.complete, color: '#a78bfa' },
          { label: 'Shelved', value: stats.shelved, color: '#f59e0b' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-dashed border-white/10 bg-[#16162a] px-4 py-3">
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mb-5 rounded-xl border border-dashed border-white/10 bg-[#16162a] p-2 flex flex-wrap gap-1">
        {TAB_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = tab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? 'bg-[#7c5cfc]/15 text-white shadow-[inset_0_0_0_1px_rgba(124,92,252,0.3)]'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              <Icon size={12} />
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === 'projects' && (
        <section>
          <div className="mb-3 flex flex-wrap gap-2">
            {CATEGORY_FILTERS.map((item) => {
              const active = categoryFilter === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setCategoryFilter(item.key)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    active ? 'bg-[#7c5cfc]/20 text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            {STATUS_FILTERS.map((item) => {
              const active = statusFilter === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setStatusFilter(item.key)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    active ? 'bg-[#06b6d4]/15 text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="mb-5 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by project name..."
              className="w-full rounded-xl border border-dashed border-white/10 bg-[#16162a] pl-9 pr-3 py-3 text-sm text-white placeholder:text-gray-500 focus:border-[#7c5cfc]/40 focus:outline-none"
            />
          </div>

          {filteredProjects.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-[#16162a] p-6 text-sm text-gray-500">No projects match current filters.</div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.name} project={project} />
              ))}
            </div>
          )}
        </section>
      )}

      {tab === 'workspace' && (
        <section className="rounded-xl border border-dashed border-white/10 bg-[#16162a] p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Workspace Directory Tree</h2>
          <div className="space-y-3">
            {workspaceDirs.map((dir) => (
              <div key={dir.path} className="relative pl-4 border-l border-dashed border-white/10">
                <div className="rounded-lg border border-dashed border-white/10 bg-[#0a0a14] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FolderOpen size={13} className="text-[#06b6d4]" />
                      <p className="text-xs text-white font-mono truncate">{toWorkspacePath(dir.path)}</p>
                    </div>
                    <CopyBtn text={toWorkspacePath(dir.path)} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{dir.description}</p>
                  {dir.keyFiles && dir.keyFiles.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {dir.keyFiles.map((file) => (
                        <div key={file} className="flex items-center justify-between gap-2">
                          <span className="text-[11px] text-gray-500 font-mono break-all">└─ {toWorkspacePath(file)}</span>
                          <CopyBtn text={toWorkspacePath(file)} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === 'files' && (
        <section className="rounded-xl border border-dashed border-white/10 bg-[#16162a] p-5 overflow-x-auto">
          <h2 className="text-sm font-semibold text-white mb-4">Key Root Files</h2>
          <table className="w-full text-left min-w-[680px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-2 pr-3 text-xs font-semibold text-gray-400 uppercase">File</th>
                <th className="py-2 pr-3 text-xs font-semibold text-gray-400 uppercase">Description</th>
                <th className="py-2 pr-3 text-xs font-semibold text-gray-400 uppercase">Critical</th>
                <th className="py-2 text-xs font-semibold text-gray-400 uppercase">Path</th>
              </tr>
            </thead>
            <tbody>
              {rootFiles.map((file) => {
                const path = toWorkspacePath(file.name);
                return (
                  <tr key={file.name} className={`border-b border-white/5 ${file.critical ? 'bg-red-500/[0.03]' : ''}`}>
                    <td className="py-2 pr-3 text-xs text-white font-mono">{file.name}</td>
                    <td className="py-2 pr-3 text-xs text-gray-400">{file.description}</td>
                    <td className="py-2 pr-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${file.critical ? 'text-red-300 bg-red-500/15' : 'text-gray-500 bg-white/5'}`}>
                        {file.critical ? 'Critical' : 'Standard'}
                      </span>
                    </td>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-500 font-mono break-all">{path}</span>
                        <CopyBtn text={path} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}

      {tab === 'quick-nav' && (
        <section className="space-y-4">
          <div className="rounded-xl border border-dashed border-white/10 bg-[#16162a] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Terminal size={14} className="text-[#7c5cfc]" />
              <h3 className="text-sm font-semibold text-white">Open in Terminal (by Category)</h3>
            </div>
            <div className="space-y-3">
              {CATEGORY_FILTERS.filter((c) => c.key !== 'all').map((cat) => {
                const key = cat.key as ProjectCategory;
                const list = byCategory.get(key) || [];
                if (!list.length) return null;
                return (
                  <div key={cat.key}>
                    <p className="text-[11px] text-gray-500 uppercase mb-1">{cat.label}</p>
                    <div className="space-y-1">
                      {list.map((p) => {
                        const cmd = `cd ${toWorkspacePath(p.dir)}`;
                        return (
                          <div key={`${p.name}-cd`} className="flex items-center justify-between gap-2">
                            <code className="text-[11px] text-gray-300 font-mono break-all">{cmd}</code>
                            <CopyBtn text={cmd} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="rounded-xl border border-dashed border-white/10 bg-[#16162a] p-4">
              <h3 className="text-sm font-semibold text-white mb-2">Live Projects: cd Commands</h3>
              <div className="space-y-1.5">
                {liveProjects.map((p) => {
                  const cmd = `cd ${toWorkspacePath(p.dir)}`;
                  return (
                    <div key={`${p.name}-live-cd`} className="flex items-center justify-between gap-2">
                      <code className="text-[11px] text-gray-300 font-mono break-all">{cmd}</code>
                      <CopyBtn text={cmd} />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-white/10 bg-[#16162a] p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileCode2 size={14} className="text-[#06b6d4]" />
                <h3 className="text-sm font-semibold text-white">Main Entry nvim Commands</h3>
              </div>
              <div className="space-y-1.5">
                {projects.slice(0, 16).map((p) => {
                  const first = p.entryPoints[0];
                  if (!first) return null;
                  const full = `${p.dir}/${first.path}`;
                  const cmd = `nvim ${toWorkspacePath(full)}`;
                  return (
                    <div key={`${p.name}-nvim`} className="flex items-center justify-between gap-2">
                      <code className="text-[11px] text-gray-300 font-mono break-all">{cmd}</code>
                      <CopyBtn text={cmd} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-white/10 bg-[#16162a] p-4">
            <h3 className="text-sm font-semibold text-white mb-2">Common Search Commands</h3>
            <div className="space-y-1.5">
              {[
                'grep -r "TODO" pipeline/work/',
                'grep -r "FIXME" pipeline/work/',
                'find pipeline/work -name "*.tsx" -newer pipeline/work/dev-dashboard/src/App.tsx',
                'find pipeline/work -type f -name "package.json"',
                'find pipeline/work -type d -name "node_modules" -prune',
              ].map((cmd) => (
                <div key={cmd} className="flex items-center justify-between gap-2">
                  <code className="text-[11px] text-gray-300 font-mono break-all">{cmd}</code>
                  <CopyBtn text={cmd} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="h-8" />
      <div className="text-[11px] text-gray-600 flex items-center gap-1.5">
        <Copy size={11} /> All paths shown with <span className="font-mono text-gray-500">~/workspace/</span> prefix for terminal-ready commands.
      </div>
    </div>
  );
}
