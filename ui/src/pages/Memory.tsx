import { useState, useEffect } from 'react';
import { useApi, apiText, authenticatedFetch } from '../hooks/useApi';
import type { MemoryFile } from '../types';
import { Search, Calendar, Brain, FileText, ChevronDown, ChevronRight, Tag, Edit3, Check, X, Layers } from 'lucide-react';

/* ── Knowledge Cards Types ─────────────────────────── */
interface KnowledgeCard {
  id: string;
  name: string;
  path: string;
  topic: string;
  category: string;
  tags: string[];
  created: string;
  updated: string;
  body: string;
  size: number;
  wordCount: number;
  mtime: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  system: '#7c5cfc',
  human: '#f472b6',
  infrastructure: '#06b6d4',
  models: '#f59e0b',
  workflow: '#22c55e',
  career: '#ef4444',
  tools: '#8b5cf6',
  business: '#f97316',
  projects: '#14b8a6',
  security: '#dc2626',
  school: '#6366f1',
  research: '#0ea5e9',
  lessons: '#eab308',
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return (bytes / 1024).toFixed(1) + ' KB';
}

function formatRelativeDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `about ${hrs} hours ago`;
  const days = Math.floor(hrs / 24);
  return `${days} days ago`;
}

interface GroupedFiles {
  label: string;
  files: MemoryFile[];
}

function groupFiles(files: MemoryFile[]): GroupedFiles[] {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const yesterday = new Date(now.getTime() - 86400000).toISOString().split('T')[0];
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const monthAgo = new Date(now.getTime() - 30 * 86400000);

  const groups: Record<string, MemoryFile[]> = {
    Today: [],
    Yesterday: [],
    'This Week': [],
    'This Month': [],
    Older: [],
  };

  for (const f of files) {
    if (f.name === 'MEMORY.md') continue;
    const dateMatch = f.name.match(/(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      const d = dateMatch[1];
      if (d === today) groups['Today'].push(f);
      else if (d === yesterday) groups['Yesterday'].push(f);
      else if (new Date(d) >= weekAgo) groups['This Week'].push(f);
      else if (new Date(d) >= monthAgo) groups['This Month'].push(f);
      else groups['Older'].push(f);
    } else {
      groups['Older'].push(f);
    }
  }

  return Object.entries(groups)
    .filter(([, files]) => files.length > 0)
    .map(([label, files]) => ({ label, files: files.sort((a, b) => b.name.localeCompare(a.name)) }));
}

function formatFileName(name: string): string {
  const match = name.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return name;
  const d = new Date(`${match[1]}-${match[2]}-${match[3]}T12:00:00`);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

interface Section {
  title: string;
  content: string;
  level: number;
}

function parseMarkdownSections(content: string): Section[] {
  const lines = content.split('\n');
  const sections: Section[] = [];
  let currentSection: Section | null = null;

  for (const line of lines) {
    const h2Match = line.match(/^## (.+)$/);
    const h3Match = line.match(/^### (.+)$/);
    
    if (h2Match) {
      if (currentSection) sections.push(currentSection);
      currentSection = { title: h2Match[1], content: '', level: 2 };
    } else if (h3Match) {
      if (currentSection) sections.push(currentSection);
      currentSection = { title: h3Match[1], content: '', level: 3 };
    } else if (currentSection) {
      currentSection.content += line + '\n';
    } else {
      // Content before first heading
      if (sections.length === 0) {
        sections.push({ title: '', content: line + '\n', level: 0 });
      } else {
        sections[0].content += line + '\n';
      }
    }
  }
  
  if (currentSection) sections.push(currentSection);
  return sections.filter(s => s.title || s.content.trim());
}

/* ── Knowledge Cards Panel ─────────────────────────── */
function KnowledgeCards() {
  const { data, loading } = useApi<{ cards: KnowledgeCard[]; count: number }>('/api/memory/cards');
  const cards = data?.cards ?? [];
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showIndex, setShowIndex] = useState(false);
  const [indexContent, setIndexContent] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState(false);
  const [indexEditContent, setIndexEditContent] = useState('');

  useEffect(() => {
    apiText('/api/memory/MEMORY.md').then(setIndexContent).catch(() => {});
  }, []);

  const categories = [...new Set(cards.map(c => c.category))].sort();

  const filtered = cards.filter(c => {
    if (selectedCategory && c.category !== selectedCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.topic.toLowerCase().includes(q) || c.body.toLowerCase().includes(q) || c.tags.some(t => t.includes(q));
    }
    return true;
  });

  const grouped = filtered.reduce((acc, c) => {
    if (!acc[c.category]) acc[c.category] = [];
    acc[c.category].push(c);
    return acc;
  }, {} as Record<string, KnowledgeCard[]>);

  const handleEdit = (card: KnowledgeCard) => {
    // Reconstruct full file content
    const frontmatter = `---\ntopic: ${card.topic}\ncategory: ${card.category}\ntags: [${card.tags.join(', ')}]\ncreated: ${card.created}\nupdated: ${new Date().toISOString().split('T')[0]}\n---\n${card.body}`;
    setEditContent(frontmatter);
    setEditingCard(card.id);
  };

  const handleSave = async (id: string) => {
    try {
      await authenticatedFetch(`/api/memory/cards/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      });
      setEditingCard(null);
      window.location.reload();
    } catch { /* silent */ }
  };

  if (loading) return <div className="text-gray-500 text-sm p-4">Loading cards...</div>;

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Stats bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="bg-[#16162a] border border-dashed border-[#7c5cfc]/20 rounded-lg px-3 py-1.5 flex items-center gap-2">
          <Layers size={12} className="text-[#7c5cfc]" />
          <span className="text-[11px] text-white font-semibold">{cards.length} cards</span>
        </div>
        <div className="bg-[#16162a] border border-dashed border-white/10 rounded-lg px-3 py-1.5">
          <span className="text-[11px] text-gray-500">{categories.length} categories</span>
        </div>
        <div className="bg-[#16162a] border border-dashed border-white/10 rounded-lg px-3 py-1.5">
          <span className="text-[11px] text-gray-500">~{Math.round(cards.reduce((a, c) => a + c.wordCount, 0) * 1.3)} tokens total</span>
        </div>
      </div>

      {/* MEMORY.md Master Index */}
      {indexContent && (
        <div className="border border-dashed border-[#7c5cfc]/20 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowIndex(!showIndex)}
            className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-white/[0.02] transition-colors text-left"
          >
            {showIndex ? <ChevronDown size={12} className="text-[#7c5cfc]" /> : <ChevronRight size={12} className="text-[#7c5cfc]" />}
            <Brain size={14} className="text-[#7c5cfc]" />
            <span className="text-xs font-semibold text-white">MEMORY.md</span>
            <span className="text-[10px] text-gray-500 ml-1">Master Index ({(indexContent.length / 1024).toFixed(1)} KB)</span>
          </button>
          {showIndex && !editingIndex && (
            <div className="px-4 pb-3 border-t border-white/5">
              <div className="flex justify-end mb-2 mt-2">
                <button onClick={() => { setIndexEditContent(indexContent); setEditingIndex(true); }} className="text-[10px] text-gray-500 hover:text-[#7c5cfc] flex items-center gap-1 transition-colors">
                  <Edit3 size={10} /> Edit
                </button>
              </div>
              <pre className="text-[11px] text-gray-400 leading-relaxed whitespace-pre-wrap font-sans max-h-[400px] overflow-y-auto">{indexContent}</pre>
            </div>
          )}
          {showIndex && editingIndex && (
            <div className="px-4 pb-3 border-t border-white/5">
              <textarea
                value={indexEditContent}
                onChange={e => setIndexEditContent(e.target.value)}
                className="w-full bg-[#0d0d1a] border border-dashed border-[#7c5cfc]/30 rounded-lg p-3 mt-2 text-[11px] text-gray-300 font-mono leading-relaxed focus:outline-none resize-y"
                rows={20}
              />
              <div className="flex gap-2 mt-2">
                <button onClick={async () => {
                  await authenticatedFetch('/api/memory/MEMORY.md', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'text/plain' },
                    body: indexEditContent,
                  });
                  setIndexContent(indexEditContent);
                  setEditingIndex(false);
                }} className="text-[10px] bg-[#7c5cfc]/20 text-[#7c5cfc] border border-[#7c5cfc]/30 rounded px-3 py-1 flex items-center gap-1 hover:bg-[#7c5cfc]/30 transition-colors">
                  <Check size={10} /> Save
                </button>
                <button onClick={() => setEditingIndex(false)} className="text-[10px] text-gray-500 border border-white/10 rounded px-3 py-1 flex items-center gap-1 hover:text-white transition-colors">
                  <X size={10} /> Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search + category filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search cards..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#16162a] border border-dashed border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#7c5cfc]/30"
          />
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-1.5 flex-wrap">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${!selectedCategory ? 'bg-[#7c5cfc]/20 border-[#7c5cfc]/40 text-[#7c5cfc]' : 'border-white/10 text-gray-500 hover:text-white'}`}
        >All</button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
            className="text-[10px] px-2 py-1 rounded-full border transition-colors"
            style={{
              borderColor: selectedCategory === cat ? (CATEGORY_COLORS[cat] || '#666') + '66' : 'rgba(255,255,255,0.1)',
              backgroundColor: selectedCategory === cat ? (CATEGORY_COLORS[cat] || '#666') + '20' : 'transparent',
              color: selectedCategory === cat ? (CATEGORY_COLORS[cat] || '#999') : '#6b7280',
            }}
          >{cat} ({cards.filter(c => c.category === cat).length})</button>
        ))}
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([category, catCards]) => (
          <div key={category}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[category] || '#666' }} />
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: CATEGORY_COLORS[category] || '#666' }}>{category}</span>
              <span className="text-[10px] text-gray-600">({catCards.length})</span>
            </div>

            <div className="space-y-1.5">
              {catCards.map(card => {
                const isExpanded = expandedCard === card.id;
                const isEditing = editingCard === card.id;

                return (
                  <div key={card.id} className="border border-dashed border-white/10 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedCard(isExpanded ? null : card.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/[0.02] transition-colors"
                    >
                      {isExpanded ? <ChevronDown size={12} className="text-gray-500" /> : <ChevronRight size={12} className="text-gray-500" />}
                      <span className="text-xs font-medium text-white flex-1 truncate">{card.topic}</span>
                      <div className="flex gap-1 shrink-0">
                        {card.tags.slice(0, 3).map(t => (
                          <span key={t} className="text-[9px] text-gray-600 bg-white/5 px-1.5 py-0.5 rounded">{t}</span>
                        ))}
                      </div>
                      <span className="text-[9px] text-gray-600 shrink-0">{card.wordCount}w</span>
                    </button>

                    {isExpanded && !isEditing && (
                      <div className="px-3 pb-3 border-t border-white/5">
                        <div className="flex items-center justify-between mt-2 mb-2">
                          <div className="flex gap-2">
                            {card.tags.map(t => (
                              <span key={t} className="text-[9px] px-1.5 py-0.5 rounded border border-dashed" style={{ borderColor: (CATEGORY_COLORS[card.category] || '#666') + '40', color: CATEGORY_COLORS[card.category] || '#666' }}>
                                <Tag size={8} className="inline mr-0.5" />{t}
                              </span>
                            ))}
                          </div>
                          <button onClick={() => handleEdit(card)} className="text-[10px] text-gray-500 hover:text-[#7c5cfc] flex items-center gap-1 transition-colors">
                            <Edit3 size={10} /> Edit
                          </button>
                        </div>
                        <pre className="text-[11px] text-gray-400 leading-relaxed whitespace-pre-wrap font-sans">{card.body}</pre>
                        <div className="flex gap-4 mt-2 text-[9px] text-gray-600">
                          <span>Created: {card.created}</span>
                          <span>Updated: {card.updated}</span>
                          <span>{card.size} bytes</span>
                        </div>
                      </div>
                    )}

                    {isExpanded && isEditing && (
                      <div className="px-3 pb-3 border-t border-white/5">
                        <textarea
                          value={editContent}
                          onChange={e => setEditContent(e.target.value)}
                          className="w-full bg-[#0d0d1a] border border-dashed border-[#7c5cfc]/30 rounded-lg p-3 mt-2 text-[11px] text-gray-300 font-mono leading-relaxed focus:outline-none resize-y"
                          rows={Math.min(20, editContent.split('\n').length + 2)}
                        />
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => handleSave(card.id)} className="text-[10px] bg-[#7c5cfc]/20 text-[#7c5cfc] border border-[#7c5cfc]/30 rounded px-3 py-1 flex items-center gap-1 hover:bg-[#7c5cfc]/30 transition-colors">
                            <Check size={10} /> Save
                          </button>
                          <button onClick={() => setEditingCard(null)} className="text-[10px] text-gray-500 border border-white/10 rounded px-3 py-1 flex items-center gap-1 hover:text-white transition-colors">
                            <X size={10} /> Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Memory() {
  const [tab, setTab] = useState<'cards' | 'logs'>('cards');
  const { data, loading } = useApi<{ files: MemoryFile[] }>('/api/memory');
  const files = data?.files ?? [];
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState(false);
  const [search, setSearch] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0, 1, 2, 3, 4]));
  const [showAll, setShowAll] = useState(false);

  const memoryMd = files.find(f => f.name === 'MEMORY.md');
  const grouped = groupFiles(files);
  const filteredGroups = search
    ? grouped.map(g => ({ ...g, files: g.files.filter(f => f.name.toLowerCase().includes(search.toLowerCase())) })).filter(g => g.files.length > 0)
    : grouped;

  useEffect(() => {
    if (!selectedFile && memoryMd) {
      setSelectedFile('MEMORY.md');
    }
  }, [memoryMd]);

  useEffect(() => {
    if (!selectedFile) return;
    setLoadingContent(true);
    apiText(`/api/memory/${encodeURIComponent(selectedFile)}`)
      .then(text => {
        setContent(text);
        const parsed = parseMarkdownSections(text);
        setSections(parsed);
        setExpandedSections(new Set([0, 1, 2, 3, 4]));
        setShowAll(false);
      })
      .catch(() => {
        setContent('Error loading file');
        setSections([]);
      })
      .finally(() => setLoadingContent(false));
  }, [selectedFile]);

  const selectedMeta = files.find(f => f.name === selectedFile);
  const visibleSections = showAll ? sections : sections.slice(0, Math.min(sections.length, 5));
  const hiddenCount = sections.length - visibleSections.length;

  const toggleSection = (index: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div className="animate-fadeIn flex flex-col gap-4 h-auto md:h-[calc(100vh-7rem)]">
      {/* Tab switcher */}
      <div className="flex gap-2 shrink-0">
        <button
          onClick={() => setTab('cards')}
          className={`text-xs px-4 py-2 rounded-lg border border-dashed transition-colors flex items-center gap-2 ${tab === 'cards' ? 'bg-[#7c5cfc]/15 border-[#7c5cfc]/40 text-[#7c5cfc]' : 'border-white/10 text-gray-500 hover:text-white'}`}
        >
          <Layers size={14} /> Knowledge Cards
        </button>
        <button
          onClick={() => setTab('logs')}
          className={`text-xs px-4 py-2 rounded-lg border border-dashed transition-colors flex items-center gap-2 ${tab === 'logs' ? 'bg-[#7c5cfc]/15 border-[#7c5cfc]/40 text-[#7c5cfc]' : 'border-white/10 text-gray-500 hover:text-white'}`}
        >
          <Calendar size={14} /> Daily Logs & Files
        </button>
      </div>

      {tab === 'cards' && <KnowledgeCards />}

      {tab === 'logs' && <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
      {/* Left panel - file tree with timeline */}
      <div className="w-full md:w-96 shrink-0 flex flex-col overflow-hidden max-h-[40vh] md:max-h-none">
        {/* Search */}
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search memory..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#16162a] border border-dashed border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#7c5cfc]/30"
          />
        </div>

        {/* MEMORY.md pinned */}
        {memoryMd && (
          <button
            onClick={() => setSelectedFile('MEMORY.md')}
            className={`w-full text-left p-3 rounded-xl mb-3 transition-all border border-dashed ${
              selectedFile === 'MEMORY.md'
                ? 'bg-[#7c5cfc]/15 border-[#7c5cfc]/30 shadow-[0_0_20px_rgba(124,92,252,0.15)]'
                : 'bg-[#16162a] border-white/10 hover:border-[#7c5cfc]/30 hover:shadow-[0_0_20px_rgba(124,92,252,0.08)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#7c5cfc]/20 flex items-center justify-center">
                <Brain size={16} className="text-[#7c5cfc]" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">Long-Term Memory <span>🚀</span></div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#7c5cfc]/15 text-[#7c5cfc]">
                    {memoryMd.wordCount} words
                  </span>
                  <span className="text-[10px] text-gray-500">
                    Updated {formatRelativeDate(memoryMd.mtime)}
                  </span>
                </div>
              </div>
            </div>
          </button>
        )}

        {/* Daily journal with timeline */}
        <div className="flex items-center gap-2 mb-3 px-1">
          <FileText size={14} className="text-gray-500" />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Daily Journal</span>
          <span className="text-[10px] bg-[#7c5cfc]/15 text-[#7c5cfc] px-1.5 py-0.5 rounded-full font-medium">
            {files.filter(f => f.name !== 'MEMORY.md').length} entries
          </span>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          {filteredGroups.map((group, groupIdx) => (
            <div key={group.label} className="mb-4">
              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2 px-1">
                <span>▾</span> {group.label} <span className="text-gray-600">({group.files.length})</span>
              </div>
              
              {/* Timeline */}
              <div className="relative pl-6">
                {/* Vertical line */}
                {group.files.length > 1 && (
                  <div className="absolute left-2 top-2 bottom-2 w-px bg-gradient-to-b from-[#7c5cfc]/30 via-[#7c5cfc]/10 to-transparent" />
                )}
                
                <div className="space-y-2">
                  {group.files.map((f, idx) => (
                    <div key={f.name} className="relative">
                      {/* Timeline dot */}
                      <div className="absolute left-[-1.125rem] top-2.5 w-2 h-2 rounded-full bg-[#7c5cfc]/40 border border-[#7c5cfc]/60" />
                      
                      <button
                        onClick={() => setSelectedFile(f.name)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all border border-dashed ${
                          selectedFile === f.name
                            ? 'bg-[#7c5cfc]/10 border-[#7c5cfc]/30 text-white'
                            : 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5 hover:border-[#7c5cfc]/30'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <Calendar size={12} className="mt-0.5 shrink-0 text-gray-600" />
                          <div className="flex-1">
                            <div className="font-medium">{formatFileName(f.name)}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[#7c5cfc]/15 text-[#7c5cfc]">
                                {f.wordCount} words
                              </span>
                              <span className="text-[10px] text-gray-600">{formatSize(f.size)}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Dotted separator between groups */}
              {groupIdx < filteredGroups.length - 1 && (
                <div className="mt-4 border-t border-dashed border-white/5" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - markdown preview with section cards */}
      <div className="flex-1 bg-[#16162a] border border-dashed border-white/10 rounded-xl overflow-hidden flex flex-col">
        {selectedFile ? (
          <>
            <div className="px-6 py-4 border-b border-dashed border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#7c5cfc]/15 flex items-center justify-center">
                  {selectedFile === 'MEMORY.md' ? <Brain size={18} className="text-[#7c5cfc]" /> : <FileText size={18} className="text-gray-400" />}
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    {selectedFile === 'MEMORY.md' ? 'Long-Term Memory' : formatFileName(selectedFile)}
                  </h2>
                  {selectedMeta && (
                    <p className="text-[10px] text-gray-500">
                      {selectedFile === 'MEMORY.md' ? 'Curated insights and lessons' : selectedFile}
                    </p>
                  )}
                </div>
              </div>
              {selectedMeta && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#7c5cfc]/15 text-[#7c5cfc]">
                    {selectedMeta.wordCount} words
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 text-gray-400">
                    {formatSize(selectedMeta.size)}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {formatRelativeDate(selectedMeta.mtime)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {loadingContent ? (
                <div className="text-gray-500 text-sm">Loading...</div>
              ) : sections.length > 0 ? (
                <>
                  {visibleSections.map((section, idx) => (
                    <div
                      key={idx}
                      className="border border-dashed border-white/10 rounded-lg overflow-hidden hover:border-[#7c5cfc]/30 hover:shadow-[0_0_20px_rgba(124,92,252,0.08)] transition-all animate-fadeIn"
                    >
                      {section.title && (
                        <button
                          onClick={() => toggleSection(idx)}
                          className="w-full px-4 py-3 flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                        >
                          <h3 className="text-sm font-semibold text-white font-mono flex items-center gap-2">
                            <span className="text-[#7c5cfc]">$</span>
                            {section.title}
                          </h3>
                          {expandedSections.has(idx) ? (
                            <ChevronDown size={16} className="text-gray-500" />
                          ) : (
                            <ChevronRight size={16} className="text-gray-500" />
                          )}
                        </button>
                      )}
                      {(expandedSections.has(idx) || !section.title) && (
                        <div className="px-4 py-3 prose prose-invert prose-sm max-w-none
                          prose-headings:text-white prose-headings:font-semibold
                          prose-p:text-gray-300 prose-p:leading-relaxed
                          prose-a:text-[#7c5cfc] prose-a:no-underline hover:prose-a:underline
                          prose-strong:text-white
                          prose-code:text-[#7c5cfc] prose-code:bg-[#7c5cfc]/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono
                          prose-pre:bg-[#0d0d15] prose-pre:border prose-pre:border-dashed prose-pre:border-white/5
                          prose-blockquote:border-[#7c5cfc]/30 prose-blockquote:text-gray-400
                          prose-li:text-gray-300
                          prose-hr:border-dashed prose-hr:border-white/5
                        ">
                          {section.content.split('\n').map((line, i) => (
                            <p key={i} className="my-2">{line}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {hiddenCount > 0 && !showAll && (
                    <button
                      onClick={() => setShowAll(true)}
                      className="w-full px-4 py-3 border border-dashed border-white/10 rounded-lg text-sm text-gray-400 hover:text-white hover:border-[#7c5cfc]/30 transition-all"
                    >
                      Show {hiddenCount} more section{hiddenCount > 1 ? 's' : ''}
                    </button>
                  )}
                </>
              ) : (
                <div className="text-gray-500 text-sm">{content || 'No content'}</div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">
            Select a file to preview
          </div>
        )}
      </div>
    </div>}
    </div>
  );
}
