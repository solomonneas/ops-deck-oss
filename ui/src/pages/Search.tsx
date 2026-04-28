import { useState, useEffect } from 'react';
import { useApi, apiFetch } from '../hooks/useApi';
import { Search as SearchIcon, Code2, FileText, ChevronDown, ChevronRight } from 'lucide-react';

interface SearchResult {
  score: number;
  file_path: string;
  project: string;
  chunk_type: string;
  summary: string;
  content: string;
}

interface SearchResponse {
  results: SearchResult[];
}

interface ProjectStats {
  files: number;
  lines: number;
  languages: Record<string, number>;
}

interface StatsResponse {
  projects: Record<string, ProjectStats>;
  totals: {
    files: number;
    lines: number;
    languages: Record<string, number>;
  };
}

const PROJECT_COLORS: Record<string, string> = {
  'openclaw': '#7c5cfc',
  'dev-dashboard': '#3b82f6',
  'mcp-server': '#22c55e',
  'prompt-library': '#eab308',
  'social-showcase': '#ec4899',
};

const CHUNK_TYPE_LABELS: Record<string, string> = {
  function: 'Function',
  class: 'Class',
  template: 'Template',
  component: 'Component',
  config: 'Config',
  doc: 'Documentation',
};

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedResults, setExpandedResults] = useState<Set<number>>(new Set());
  const { data: stats } = useApi<StatsResponse>('/api/search/stats');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setExpandedResults(new Set());
    
    try {
      const data = await apiFetch<SearchResponse>('/api/code-search', {
        method: 'POST',
        body: JSON.stringify({ query: query.trim() }),
      });
      setResults(data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleResult = (index: number) => {
    setExpandedResults(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const formatNumber = (n: number): string => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return String(n);
  };

  return (
    <div className="animate-fadeIn max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-white mb-3">Code Search</h1>
        <p className="text-sm text-gray-500">Semantic search across all projects</p>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative">
          <SearchIcon size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search functions, components, configs..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-[#16162a] border border-dashed border-white/10 rounded-2xl pl-14 pr-6 py-4 text-base text-white placeholder:text-gray-600 focus:outline-none focus:border-[#7c5cfc]/30 focus:shadow-[0_0_20px_rgba(124,92,252,0.08)] transition-all"
          />
          {query && (
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-[#7c5cfc] text-white text-sm font-medium rounded-lg hover:bg-[#6b4de0] transition-colors"
            >
              Search
            </button>
          )}
        </div>
      </form>

      {/* Stats Section */}
      {stats && (
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-[#16162a] border border-dashed border-white/10 rounded-xl p-4 hover:border-[#7c5cfc]/30 hover:shadow-[0_0_20px_rgba(124,92,252,0.08)] transition-all">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-[#7c5cfc]" />
                <div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">Total Files</div>
                  <div className="text-lg font-bold text-white font-mono">{formatNumber(stats.totals.files)}</div>
                </div>
              </div>
            </div>

            <div className="bg-[#16162a] border border-dashed border-white/10 rounded-xl p-4 hover:border-[#7c5cfc]/30 hover:shadow-[0_0_20px_rgba(124,92,252,0.08)] transition-all">
              <div className="flex items-center gap-3">
                <Code2 size={18} className="text-[#7c5cfc]" />
                <div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">Lines of Code</div>
                  <div className="text-lg font-bold text-white font-mono">{formatNumber(stats.totals.lines)}</div>
                </div>
              </div>
            </div>

            <div className="bg-[#16162a] border border-dashed border-white/10 rounded-xl p-4 hover:border-[#7c5cfc]/30 hover:shadow-[0_0_20px_rgba(124,92,252,0.08)] transition-all">
              <div className="flex items-center gap-3">
                <SearchIcon size={18} className="text-[#7c5cfc]" />
                <div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">Projects</div>
                  <div className="text-lg font-bold text-white font-mono">{Object.keys(stats.projects).length}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Per-project breakdown */}
          <div className="bg-[#16162a] border border-dashed border-white/10 rounded-xl p-4">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Projects</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(stats.projects).map(([name, proj]) => {
                const color = PROJECT_COLORS[name] || '#6b7280';
                return (
                  <div key={name} className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-sm font-medium text-white">{name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="text-gray-500">Files:</span>
                        <span className="text-white ml-1 font-mono">{proj.files}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Lines:</span>
                        <span className="text-white ml-1 font-mono">{formatNumber(proj.lines)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {error && (
        <div className="bg-[#ef4444]/10 border border-dashed border-[#ef4444]/30 rounded-xl p-4 text-center text-[#ef4444] text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-500 py-12">Searching...</div>
      ) : results.length > 0 ? (
        <div>
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Results ({results.length})
            </h2>
            <span className="text-xs text-gray-500 min-w-0 text-right">
              Query: <span className="font-mono text-[#7c5cfc] inline-block max-w-[180px] sm:max-w-[320px] truncate align-bottom">{query}</span>
            </span>
          </div>
          
          <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto">
            <div className="min-w-full space-y-3">
              {results.map((result, idx) => {
                const isExpanded = expandedResults.has(idx);
                const color = PROJECT_COLORS[result.project] || '#6b7280';
                
                return (
                  <div
                    key={idx}
                    className="bg-[#16162a] border border-dashed border-white/10 rounded-xl overflow-hidden hover:border-[#7c5cfc]/30 hover:shadow-[0_0_20px_rgba(124,92,252,0.08)] transition-all animate-fadeIn"
                  >
                  <button
                    onClick={() => toggleResult(idx)}
                    className="w-full px-5 py-4 text-left"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FileText size={14} className="text-gray-500 shrink-0" />
                        <span className="text-sm font-mono text-white truncate">{result.file_path}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 shrink-0 sm:ml-4">
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: color + '20',
                            color: color,
                          }}
                        >
                          {result.project}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 text-gray-400">
                          {CHUNK_TYPE_LABELS[result.chunk_type] || result.chunk_type}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#7c5cfc]/15 text-[#7c5cfc]">
                          {(result.score * 100).toFixed(0)}% match
                        </span>
                        {isExpanded ? (
                          <ChevronDown size={16} className="text-gray-500" />
                        ) : (
                          <ChevronRight size={16} className="text-gray-500" />
                        )}
                      </div>
                    </div>
                    
                    {result.summary && (
                      <p className="text-xs text-gray-400 leading-relaxed break-words">{result.summary}</p>
                    )}
                  </button>

                  {isExpanded && result.content && (
                    <div className="px-5 pb-4">
                      <div className="border-t border-dashed border-white/5 pt-3">
                        <pre className="bg-[#0d0d15] border border-dashed border-white/5 rounded-lg p-3 text-xs text-gray-300 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap break-words">
                          {result.content}
                        </pre>
                      </div>
                    </div>
                  )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : query && !loading && !error ? (
        <div className="text-center py-12">
          <SearchIcon size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">No results found for "{query}"</p>
        </div>
      ) : !query && !loading ? (
        <div className="text-center py-12">
          <Code2 size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">Search across all projects</p>
          <p className="text-xs text-gray-600">Try: "authentication", "api handler", "config", etc.</p>
        </div>
      ) : null}
    </div>
  );
}
