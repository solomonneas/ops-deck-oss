import { useEffect, useState } from 'react';
import {
  Settings,
  Server,
  Search as SearchIcon,
  Library,
  KeyRound,
  Eye,
  EyeOff,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { useDataSource } from '../data-sources/useDataSource';
import { getApiKey } from '../lib/apiKey';

interface EnvRow {
  name: string;
  defaultValue: string;
  resolved: string;
  description: string;
  icon: typeof Settings;
}

const ENV_ROWS: EnvRow[] = [
  {
    name: 'VITE_SIDECAR_BASE_URL',
    defaultValue: 'http://localhost:8005',
    resolved: import.meta.env.VITE_SIDECAR_BASE_URL || 'http://localhost:8005',
    description: 'agent-intel sidecar (journal, repos, memory cards, codebase).',
    icon: Server,
  },
  {
    name: 'VITE_SEARCH_BASE_URL',
    defaultValue: 'http://localhost:5204',
    resolved: import.meta.env.VITE_SEARCH_BASE_URL || 'http://localhost:5204',
    description: 'Optional code-search service from the ops-deck-lite skill.',
    icon: SearchIcon,
  },
  {
    name: 'VITE_PROMPTS_BASE_URL',
    defaultValue: 'http://localhost:5202',
    resolved: import.meta.env.VITE_PROMPTS_BASE_URL || 'http://localhost:5202',
    description: 'Optional prompt-library service from the ops-deck-lite skill.',
    icon: Library,
  },
  {
    name: 'VITE_OPSDECK_HOST_IP',
    defaultValue: '(window.location.hostname)',
    resolved: import.meta.env.VITE_OPSDECK_HOST_IP
      || (typeof window !== 'undefined' ? window.location.hostname : 'localhost'),
    description: 'Host used to build links to running services. Defaults to the page host.',
    icon: Server,
  },
];

export default function Config() {
  const ds = useDataSource();
  const [showApiKey, setShowApiKey] = useState(false);
  const [storedKey, setStoredKey] = useState('');

  useEffect(() => {
    setStoredKey(getApiKey());
  }, []);

  const apiKeyMasked = storedKey
    ? `${storedKey.slice(0, 4)}${'•'.repeat(Math.max(0, storedKey.length - 4))}`
    : '(not set)';

  return (
    <div className="animate-fadeIn min-h-full" style={{ backgroundColor: '#0a0a14' }}>
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Settings size={22} className="text-[#7c5cfc]" />
          <h1 className="text-xl font-semibold text-white">Config</h1>
        </div>
        <p className="text-sm text-gray-500">
          Build-time configuration for this dashboard. Set values in <code className="text-gray-400">.env</code> or
          via the Vite dev server before <code className="text-gray-400">npm run build</code>.
        </p>
      </header>

      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <KeyRound size={14} className="text-[#7c5cfc]" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300">API Key</h2>
        </div>
        <div className="rounded-xl border border-dashed border-white/10 bg-[#16162a] p-4">
          <p className="text-xs text-gray-400 mb-3">
            If your sidecar is configured with <code className="text-gray-300">OPSDECK_API_KEY</code>, the dashboard
            sends it as the <code className="text-gray-300">X-API-Key</code> header on every request. The key is read
            from <code className="text-gray-300">VITE_OPSDECK_API_KEY</code> at build time, falling back to the
            <code className="text-gray-300"> opsdeck_api_key</code> entry in <code className="text-gray-300">localStorage</code>.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg border border-white/5 bg-black/40 px-3 py-2 text-xs font-mono text-gray-300">
              {showApiKey ? (storedKey || '(not set)') : apiKeyMasked}
            </code>
            <button
              onClick={() => setShowApiKey((v) => !v)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              title={showApiKey ? 'Hide key' : 'Show key'}
            >
              {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Server size={14} className="text-[#7c5cfc]" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300">Service Endpoints</h2>
        </div>
        <div className="space-y-2">
          {ENV_ROWS.map((row) => {
            const Icon = row.icon;
            return (
              <div
                key={row.name}
                className="rounded-xl border border-dashed border-white/10 bg-[#16162a] p-4"
              >
                <div className="flex items-start gap-3">
                  <Icon size={16} className="text-[#7c5cfc] mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <code className="text-xs font-mono text-white">{row.name}</code>
                      <span className="text-[11px] text-gray-500">default: <code>{row.defaultValue}</code></span>
                    </div>
                    <div className="mt-1 text-xs text-gray-400">{row.description}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[11px] text-gray-500 shrink-0">resolved:</span>
                      <code className="rounded-md bg-black/40 px-2 py-0.5 text-[11px] font-mono text-emerald-400">
                        {row.resolved}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Settings size={14} className="text-[#7c5cfc]" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300">Active Adapter</h2>
        </div>
        <div className="rounded-xl border border-dashed border-white/10 bg-[#16162a] p-4">
          <p className="text-xs text-gray-400 mb-3">
            The dashboard probes <code className="text-gray-300">/healthz</code> on the sidecar at boot and picks an
            adapter based on what's reachable. If the probe fails, the openclaw-only fallback is used (all data
            sources return empty).
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(Object.entries(ds.capabilities) as [keyof typeof ds.capabilities, boolean][]).map(([cap, ok]) => (
              <div
                key={cap}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs ${
                  ok
                    ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300'
                    : 'border-white/10 bg-white/[0.02] text-gray-500'
                }`}
              >
                <span className="font-mono">{cap}</span>
                <span className={`text-[10px] font-bold ${ok ? 'text-emerald-400' : 'text-gray-600'}`}>
                  {ok ? 'LIVE' : 'OFF'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle size={14} className="text-[#7c5cfc]" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300">Setup Notes</h2>
        </div>
        <div className="rounded-xl border border-dashed border-white/10 bg-[#16162a] p-4 text-xs text-gray-400 space-y-2">
          <p>
            Editing config in this dashboard is intentionally read-only. To change settings, edit your
            <code className="text-gray-300"> .env</code> file and rebuild, or set environment variables on the
            container running the UI.
          </p>
          <p>
            The sidecar's <code className="text-gray-300">CARDS_DIR</code>, <code className="text-gray-300">REPOS_OVERLAY</code>,
            and <code className="text-gray-300">CODEBASE_OVERLAY</code> env vars control what gets served to the
            dashboard. See the repo README for the full list.
          </p>
          <a
            href="https://github.com/solomonneas/ops-deck-oss"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 mt-1 text-[#7c5cfc] hover:text-[#9b7cff] transition-colors"
          >
            Documentation <ExternalLink size={11} />
          </a>
        </div>
      </section>
    </div>
  );
}
