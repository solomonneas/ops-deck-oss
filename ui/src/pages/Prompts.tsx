import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { BookOpen, X, Search, Tag, Copy, Check } from 'lucide-react';

interface Variable {
  name: string;
  description: string;
}

interface Prompt {
  id: string;
  name: string;
  title: string;
  category: string;
  tags: string[];
  content: string;
  variables: Variable[];
  current_version: number;
  created_at: string;
  updated_at: string;
}

interface PromptsData {
  prompts: Prompt[];
}

const CATEGORY_COLORS: Record<string, string> = {
  development: '#3b82f6',
  content: '#eab308',
  analysis: '#a855f7',
  automation: '#22c55e',
  research: '#ec4899',
  ops: '#f97316',
};

export default function Prompts() {
  const { data, loading } = useApi<PromptsData>('/api/prompt-library');
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const prompts = data?.prompts ?? [];
  const allCategories = Array.from(new Set(prompts.map(p => p.category))).sort();

  const filteredPrompts = prompts.filter(p => {
    const matchesSearch = !search || 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.content.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = !filterCategory || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopy = () => {
    if (selectedPrompt) {
      navigator.clipboard.writeText(selectedPrompt.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const highlightVariables = (content: string) => {
    const parts = content.split(/({{[^}]+}})/g);
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
                      {prompt.title || prompt.name}
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
                  {prompt.content.substring(0, 120)}...
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {prompt.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#7c5cfc]/15 text-[#7c5cfc]"
                      >
                        {tag}
                      </span>
                    ))}
                    {prompt.tags.length > 3 && (
                      <span className="text-[10px] text-gray-500">+{prompt.tags.length - 3}</span>
                    )}
                  </div>
                  {prompt.variables.length > 0 && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 text-gray-400">
                      {prompt.variables.length} var{prompt.variables.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
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
                  <h3 className="text-base font-semibold text-white">{selectedPrompt.title || selectedPrompt.name}</h3>
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
                    <span className="text-[10px] text-gray-500">v{selectedPrompt.current_version}</span>
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
              {selectedPrompt.variables.length > 0 && (
                <div className="mb-4 p-4 bg-white/5 border border-dashed border-white/10 rounded-lg">
                  <div className="text-xs font-semibold text-white mb-2 uppercase tracking-wider">Variables</div>
                  <div className="space-y-2">
                    {selectedPrompt.variables.map((v, i) => (
                      <div key={i} className="text-xs">
                        <span className="font-mono text-[#7c5cfc]">{`{{${v.name}}}`}</span>
                        <span className="text-gray-400 ml-2">- {v.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <pre className="text-sm text-gray-300 font-mono leading-relaxed whitespace-pre-wrap font-['JetBrains_Mono']">
                {highlightVariables(selectedPrompt.content)}
              </pre>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-dashed border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag size={14} className="text-gray-500" />
                  {selectedPrompt.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#7c5cfc]/15 text-[#7c5cfc]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="text-[10px] text-gray-500">
                  {selectedPrompt.content.split(' ').length} words
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
