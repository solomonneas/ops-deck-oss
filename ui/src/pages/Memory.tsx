import { useEffect, useState } from 'react';
import { useDataSource } from '../data-sources/useDataSource';
import type { MemoryCard } from '../data-sources/types';
import { Search, ChevronDown, ChevronRight, Tag, Layers } from 'lucide-react';

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

export default function Memory() {
  const ds = useDataSource();
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<Error | null>(null);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [cardBody, setCardBody] = useState<string>('');
  const [bodyLoading, setBodyLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    ds.getMemoryCards()
      .then((d) => { setCards(d); setLoading(false); })
      .catch((e) => { setError(e); setLoading(false); });
  }, [ds]);

  useEffect(() => {
    if (!expandedCard) {
      setCardBody('');
      return;
    }
    // Use body from list if present, otherwise lazy-load
    const card = cards.find(c => c.slug === expandedCard);
    if (card?.body) {
      setCardBody(card.body);
      return;
    }
    setBodyLoading(true);
    ds.getMemoryCard(expandedCard)
      .then((d) => {
        setCardBody(d?.body ?? '');
        setBodyLoading(false);
      })
      .catch(() => {
        setCardBody('');
        setBodyLoading(false);
      });
  }, [ds, expandedCard, cards]);

  const categories = [...new Set(cards.map(c => c.category))].sort();

  const filtered = cards.filter(c => {
    if (selectedCategory && c.category !== selectedCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.topic.toLowerCase().includes(q) ||
        (c.body ?? '').toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const grouped = filtered.reduce((acc, c) => {
    if (!acc[c.category]) acc[c.category] = [];
    acc[c.category].push(c);
    return acc;
  }, {} as Record<string, MemoryCard[]>);

  if (loading) return <div className="text-gray-500 text-sm p-4">Loading cards...</div>;

  return (
    <div className="animate-fadeIn flex flex-col h-full gap-3">
      {/* Stats bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="bg-[#16162a] border border-dashed border-[#7c5cfc]/20 rounded-lg px-3 py-1.5 flex items-center gap-2">
          <Layers size={12} className="text-[#7c5cfc]" />
          <span className="text-[11px] text-white font-semibold">{cards.length} cards</span>
        </div>
        <div className="bg-[#16162a] border border-dashed border-white/10 rounded-lg px-3 py-1.5">
          <span className="text-[11px] text-gray-500">{categories.length} categories</span>
        </div>
      </div>

      {/* Search */}
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
                const isExpanded = expandedCard === card.slug;

                return (
                  <div key={card.slug} className="border border-dashed border-white/10 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedCard(isExpanded ? null : card.slug)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/[0.02] transition-colors"
                    >
                      {isExpanded ? <ChevronDown size={12} className="text-gray-500" /> : <ChevronRight size={12} className="text-gray-500" />}
                      <span className="text-xs font-medium text-white flex-1 truncate">{card.topic}</span>
                      <div className="flex gap-1 shrink-0">
                        {card.tags.slice(0, 3).map(t => (
                          <span key={t} className="text-[9px] text-gray-600 bg-white/5 px-1.5 py-0.5 rounded">{t}</span>
                        ))}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-3 pb-3 border-t border-white/5">
                        <div className="flex items-center justify-between mt-2 mb-2">
                          <div className="flex gap-2 flex-wrap">
                            {card.tags.map(t => (
                              <span key={t} className="text-[9px] px-1.5 py-0.5 rounded border border-dashed" style={{ borderColor: (CATEGORY_COLORS[card.category] || '#666') + '40', color: CATEGORY_COLORS[card.category] || '#666' }}>
                                <Tag size={8} className="inline mr-0.5" />{t}
                              </span>
                            ))}
                          </div>
                        </div>
                        {bodyLoading ? (
                          <div className="text-gray-500 text-xs">Loading...</div>
                        ) : (
                          <pre className="text-[11px] text-gray-400 leading-relaxed whitespace-pre-wrap font-sans">{cardBody || '(empty)'}</pre>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-12">
            {search || selectedCategory ? 'No cards match your filters' : 'No memory cards available'}
          </div>
        )}
      </div>
    </div>
  );
}
