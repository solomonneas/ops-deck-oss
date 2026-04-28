import { useCallback, useEffect, useState } from 'react';
import { FileText, Shield, Clock, Save, X, Edit3, ChevronDown, ChevronRight, Folder, Package, AlertCircle } from 'lucide-react';
import type { CronJob } from '../types';
import { getApiKey } from '../lib/apiKey';

/* ── Local fetch helpers (Config talks to a host-local config API,
 *    separate from the DataSource adapter layer) ── */

const CONFIG_API_BASE = (() => {
  if (typeof window === 'undefined') return 'http://localhost:8005';
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1'
    ? 'http://localhost:8005'
    : `http://${host}:8005`;
})();

function buildHeaders(headers?: HeadersInit): Headers {
  const merged = new Headers(headers);
  const apiKey = getApiKey();
  if (apiKey) merged.set('X-API-Key', apiKey);
  return merged;
}

async function configApiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${CONFIG_API_BASE}${path}`, { headers: buildHeaders() });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

async function configApiSend(path: string, options: RequestInit): Promise<void> {
  const headers = buildHeaders(options.headers);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const res = await fetch(`${CONFIG_API_BASE}${path}`, { ...options, headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
}

function useConfigApi<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    configApiGet<T>(path)
      .then((d) => { setData(d); setLoading(false); })
      .catch((e: Error) => { setError(e.message); setLoading(false); });
  }, [path]);

  useEffect(() => { refetch(); }, [refetch]);

  return { data, loading, error, refetch };
}

/* ── Types ────────────────────────────────────────── */

interface ConfigFile {
  name: string;
  path: string;
  size: number;
  mtime: string | null;
  content: string | null;
  missing?: boolean;
}

interface Skill {
  name: string;
  location: 'system' | 'workspace';
  path: string;
  description: string;
  hasSkillMd: boolean;
  content: string | null;
}

interface Rule {
  name: string;
  path: string;
  content: string;
  size: number;
  mtime: string;
}

interface CronDisplayJob extends Partial<CronJob> {
  id?: string;
  name?: string;
  schedule?: string;
  cron?: string;
  command?: string;
  task?: string;
}

type CronApiResponse = CronDisplayJob[] | { crons?: CronDisplayJob[]; raw?: string };

/* ── Helpers ──────────────────────────────────────── */

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return (bytes / 1024).toFixed(1) + ' KB';
}

function formatDate(d: string | null): string {
  if (!d) return 'N/A';
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

type Tab = 'files' | 'skills' | 'rules' | 'crons';

const TABS: { id: Tab; label: string; icon: typeof FileText }[] = [
  { id: 'files', label: 'Files', icon: FileText },
  { id: 'skills', label: 'Skills', icon: Package },
  { id: 'rules', label: 'Rules', icon: Shield },
  { id: 'crons', label: 'Crons', icon: Clock },
];

/* ── File Editor ─────────────────────────────────── */

function FileEditor({ file, onSave, onCancel }: { file: { name: string; content: string }; onSave: (content: string) => void; onCancel: () => void }) {
  const [content, setContent] = useState(file.content);
  const [saving, setSaving] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-white font-medium">{file.name}</span>
        <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded">Editing</span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={onCancel}
            className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1"
          >
            <X size={12} /> Cancel
          </button>
          <button
            onClick={async () => { setSaving(true); await onSave(content); setSaving(false); }}
            disabled={saving}
            className="text-xs text-white px-3 py-1 rounded bg-[#7c5cfc] hover:bg-[#6a4de0] transition-colors flex items-center gap-1 disabled:opacity-50"
          >
            <Save size={12} /> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        className="w-full h-[500px] bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-gray-300 font-mono resize-y focus:outline-none focus:border-[#7c5cfc]/50"
        spellCheck={false}
      />
    </div>
  );
}

/* ── File Viewer ─────────────────────────────────── */

function FileViewer({ file, content }: { file: string; content: string }) {
  return (
    <div className="space-y-2">
      <div className="text-sm text-white font-medium">{file}</div>
      <pre className="bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-gray-300 font-mono overflow-auto max-h-[500px] whitespace-pre-wrap">
        {content}
      </pre>
    </div>
  );
}

/* ── Files Tab ───────────────────────────────────── */

function FilesTab() {
  const { data: files, loading, error, refetch } = useConfigApi<ConfigFile[]>('/api/config/files');
  const [selected, setSelected] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const activeFile = files?.find(f => f.name === selected);

  async function handleSave(content: string) {
    await configApiSend(`/api/config/file?path=${encodeURIComponent(selected!)}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
    setEditing(false);
    refetch();
  }

  if (loading) return <div className="text-gray-500 text-sm animate-pulse">Loading files...</div>;
  if (error) return <div className="text-red-400 text-sm">Error: {error}</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* File list */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="px-3 py-2 border-b border-white/10 text-xs text-gray-500 uppercase tracking-wide">Workspace Files</div>
        {files?.map(f => (
          <button
            key={f.name}
            onClick={() => { setSelected(f.name); setEditing(false); }}
            className={`w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors ${
              selected === f.name
                ? 'bg-[#7c5cfc]/15 text-white border-l-2 border-[#7c5cfc]'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
            }`}
          >
            <FileText size={14} className="shrink-0 opacity-50" />
            <div className="flex-1 min-w-0">
              <div className="truncate">{f.name}</div>
              <div className="text-[10px] text-gray-600">
                {f.missing ? 'Missing' : `${formatSize(f.size)} · ${formatDate(f.mtime)}`}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="lg:col-span-3 bg-white/5 border border-white/10 rounded-xl p-4">
        {!selected ? (
          <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
            Select a file to view
          </div>
        ) : activeFile?.missing ? (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <AlertCircle size={14} /> File not found: {selected}
          </div>
        ) : editing ? (
          <FileEditor
            file={{ name: selected, content: activeFile?.content || '' }}
            onSave={handleSave}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-white font-medium">{selected}</span>
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1 ml-auto"
              >
                <Edit3 size={12} /> Edit
              </button>
            </div>
            <pre className="bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-gray-300 font-mono overflow-auto max-h-[500px] whitespace-pre-wrap">
              {activeFile?.content}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Skills Tab ──────────────────────────────────── */

function SkillsTab() {
  const { data: skills, loading, error } = useConfigApi<Skill[]>('/api/config/skills');
  const [expanded, setExpanded] = useState<string | null>(null);

  if (loading) return <div className="text-gray-500 text-sm animate-pulse">Loading skills...</div>;
  if (error) return <div className="text-red-400 text-sm">Error: {error}</div>;

  const systemSkills = skills?.filter(s => s.location === 'system') || [];
  const workspaceSkills = skills?.filter(s => s.location === 'workspace') || [];

  function SkillGroup({ title, items }: { title: string; items: Skill[] }) {
    return (
      <div>
        <div className="text-xs text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
          <Folder size={12} /> {title} <span className="text-gray-600">({items.length})</span>
        </div>
        <div className="space-y-1">
          {items.map(skill => (
            <div key={skill.path} className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === skill.path ? null : skill.path)}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-white/5 transition-colors"
              >
                {expanded === skill.path ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
                <Package size={14} className="text-[#7c5cfc] shrink-0" />
                <span className="text-sm text-white font-medium">{skill.name}</span>
                {!skill.hasSkillMd && <span className="text-[10px] text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded">No SKILL.md</span>}
                <span className="text-xs text-gray-500 ml-auto truncate max-w-[300px]">{skill.description}</span>
              </button>
              {expanded === skill.path && skill.content && (
                <div className="border-t border-white/5 px-3 pb-3">
                  <pre className="bg-black/40 rounded-lg p-3 text-xs text-gray-400 font-mono overflow-auto max-h-[400px] whitespace-pre-wrap mt-2">
                    {skill.content}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {systemSkills.length > 0 && <SkillGroup title="System Skills" items={systemSkills} />}
      {workspaceSkills.length > 0 && <SkillGroup title="Workspace Skills" items={workspaceSkills} />}
    </div>
  );
}

/* ── Rules Tab ───────────────────────────────────── */

function RulesTab() {
  const { data: rules, loading, error, refetch } = useConfigApi<Rule[]>('/api/config/rules');
  const [selected, setSelected] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const activeRule = rules?.find(r => r.name === selected);

  async function handleSave(content: string) {
    await configApiSend(`/api/config/rules/${encodeURIComponent(selected!)}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
    setEditing(false);
    refetch();
  }

  if (loading) return <div className="text-gray-500 text-sm animate-pulse">Loading rules...</div>;
  if (error) return <div className="text-red-400 text-sm">Error: {error}</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="px-3 py-2 border-b border-white/10 text-xs text-gray-500 uppercase tracking-wide">Rule Files</div>
        {rules?.map(r => (
          <button
            key={r.name}
            onClick={() => { setSelected(r.name); setEditing(false); }}
            className={`w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors ${
              selected === r.name
                ? 'bg-[#7c5cfc]/15 text-white border-l-2 border-[#7c5cfc]'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
            }`}
          >
            <Shield size={14} className="shrink-0 opacity-50" />
            <div className="flex-1 min-w-0">
              <div className="truncate">{r.name}</div>
              <div className="text-[10px] text-gray-600">{formatSize(r.size)} · {formatDate(r.mtime)}</div>
            </div>
          </button>
        ))}
        {(!rules || rules.length === 0) && (
          <div className="p-4 text-center text-gray-500 text-xs">No rule files found</div>
        )}
      </div>

      <div className="lg:col-span-3 bg-white/5 border border-white/10 rounded-xl p-4">
        {!selected ? (
          <div className="flex items-center justify-center h-48 text-gray-500 text-sm">Select a rule to view</div>
        ) : editing ? (
          <FileEditor
            file={{ name: selected, content: activeRule?.content || '' }}
            onSave={handleSave}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-white font-medium">{selected}</span>
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1 ml-auto"
              >
                <Edit3 size={12} /> Edit
              </button>
            </div>
            <pre className="bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-gray-300 font-mono overflow-auto max-h-[500px] whitespace-pre-wrap">
              {activeRule?.content}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Crons Tab ───────────────────────────────────── */

function CronsTab() {
  const { data, loading, error } = useConfigApi<CronApiResponse>('/api/crons');

  if (loading) return <div className="text-gray-500 text-sm animate-pulse">Loading crons...</div>;
  if (error) return <div className="text-red-400 text-sm">Error: {error}</div>;

  // Handle different response formats
  const crons = Array.isArray(data) ? data : data?.crons || [];
  const raw = !Array.isArray(data) ? data?.raw || null : null;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 text-sm text-white font-medium flex items-center gap-2">
        <Clock size={16} className="text-gray-500" /> Scheduled Jobs
      </div>
      {raw ? (
        <pre className="p-4 text-sm text-gray-300 font-mono whitespace-pre-wrap">{raw}</pre>
      ) : crons.length > 0 ? (
        <div className="divide-y divide-white/5">
          {crons.map((c, i) => (
            <div key={c.id || i} className="px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-white font-mono">{c.schedule || c.cron}</span>
                <span className="text-xs text-gray-500">{c.id || c.name}</span>
              </div>
              <div className="text-xs text-gray-400 mt-1 font-mono">{c.command || c.task}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-gray-500 text-sm">No cron jobs configured</div>
      )}
    </div>
  );
}

/* ── Main Component ──────────────────────────────── */

export default function Config() {
  const [tab, setTab] = useState<Tab>('files');

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#7c5cfc] to-[#06b6d4] bg-clip-text text-transparent">
          Config Viewer
        </h1>
        <p className="text-sm text-gray-500 mt-1">Workspace files, skills, rules, and scheduled jobs</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 rounded-lg p-1 w-fit">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t.id
                ? 'bg-[#7c5cfc]/20 text-white shadow-[inset_0_0_0_1px_rgba(124,92,252,0.3)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'files' && <FilesTab />}
      {tab === 'skills' && <SkillsTab />}
      {tab === 'rules' && <RulesTab />}
      {tab === 'crons' && <CronsTab />}
    </div>
  );
}
