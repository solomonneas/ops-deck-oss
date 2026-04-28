import { useEffect, useState } from 'react';
import { useDataSource } from '../data-sources/useDataSource';
import type { Prompt } from '../data-sources/types';
import { BookOpen, X, Search, Tag, Copy, Check } from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  development: '#3b82f6',
  content: '#eab308',
  analysis: '#a855f7',
  automation: '#22c55e',
  research: '#ec4899',
  ops: '#f97316',
};

export default function Prompts() {
  const ds = useDataSource();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<Error | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    ds.getPrompts()
      .then((d) => { setPrompts(d); setLoading(false); })
      .catch((e) => { setError(e); setLoading(false); });
  }, [ds]);

  const allCategories = Array.from(new Set(prompts.map(p => p.category))).sort();

  const filteredPrompts = prompts.filter(p => {
    const q = search.toLowerCase();
    const matchesSearch = !search ||
      p.name.toLowerCase().includes(q) ||
      p.body.toLowerCase().includes(q);
    const matchesCategory = !filterCategory || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopy = () => {
    if (selectedPrompt) {
      navigator.clipboard.writeText(selectedPrompt.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const highlightVariables = (body: string) => {
    const parts = body.split(/({{[^}]+}})/g);
    return parts.map((part, i) => {
      if (part.match(/^{{[^}]+}}$/)) {
        return (
          <span key={i} className="bg-[#7c5cfc]/20 text-[#7c5cfc] px-1 rounded">
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-white">Prompt Library</h1>
        <div className="flex items-center gap-3">
          {/* Category Filter Pills */}
          {allCategories.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterCategory(null)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
                  !filterCategory
                    ? 'bg-[#7c5cfc] text-white'
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                All
              </button>
              {allCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
                    filterCategory === cat
                      ? 'text-white'
                      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                  style={filterCategory === cat ? {
                    backgroundColor: (CATEGORY_COLORS[cat] || '#6b7280') + '30',
                    color: CATEGORY_COLORS[cat] || '#6b7280'
                  } : {}}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
          
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search prompts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-64 bg-[#16162a] border border-dashed border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#7c5cfc]/30"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-500 text-sm">Loading prompts...</div>
      ) : filteredPrompts.length > 0 ? (
        <>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-400">{filteredPrompts.length} prompt{filteredPrompts.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPrompts.map(prompt => (
              <button
                key={prompt.id}
                onClick={() => { setSelectedPrompt(prompt); setCopied(false); }}
                className="bg-[#16162a] border border-dashed border-white/10 rounded-xl p-5 text-left hover:border-[#7c5cfc]/30 hover:shadow-[0_0_20px_rgba(124,92,252,0.08)] transition-all animate-fadeIn group"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-[#7c5cfc]/15 flex items-center justify-center shrink-0">
                    <BookOpen size={18} className="text-[#7c5cfc]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-[#7c5cfc] transition-colors">
                      {prompt.name}
                    </h3>
                    <span
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full inline-block"
                      style={{
                        backgroundColor: (CATEGORY_COLORS[prompt.category] || '#6b7280') + '20',
                        color: CATEGORY_COLORS[prompt.category] || '#6b7280',
                      }}
                    >
                      {prompt.category}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed mb-3 line-clamp-3">
                  {prompt.body.substring(0, 120)}...
                </p>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-[#16162a] border border-dashed border-white/10 rounded-xl p-12 text-center">
          <BookOpen size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">
            {search || filterCategory ? 'No prompts match your filters' : 'No prompts available'}
          </p>
        </div>
      )}

      {/* Modal */}
      {selectedPrompt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedPrompt(null)}
        >
          <div
            className="bg-[#16162a] border border-dashed border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[0_0_40px_rgba(124,92,252,0.15)]"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-dashed border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#7c5cfc]/15 flex items-center justify-center">
                  <BookOpen size={20} className="text-[#7c5cfc]" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">{selectedPrompt.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: (CATEGORY_COLORS[selectedPrompt.category] || '#6b7280') + '20',
                        color: CATEGORY_COLORS[selectedPrompt.category] || '#6b7280',
                      }}
                    >
                      {selectedPrompt.category}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-[#7c5cfc] text-white text-xs font-medium rounded-lg hover:bg-[#6b4de0] transition-colors flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check size={14} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copy
                    </>
                  )}
                </button>
                <button
                  onClick={() => setSelectedPrompt(null)}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto px-6 py-5">
              <pre className="text-sm text-gray-300 font-mono leading-relaxed whitespace-pre-wrap font-['JetBrains_Mono']">
                {highlightVariables(selectedPrompt.body)}
              </pre>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-dashed border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag size={14} className="text-gray-500" />
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#7c5cfc]/15 text-[#7c5cfc]">
                    {selectedPrompt.category}
                  </span>
                </div>
                <div className="text-[10px] text-gray-500">
                  {selectedPrompt.body.split(' ').length} words
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
