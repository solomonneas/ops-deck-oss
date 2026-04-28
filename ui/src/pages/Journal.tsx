import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { Notebook, ChevronDown, ChevronRight, Tag } from 'lucide-react';

interface Section {
  heading: string;
  content: string;
  tags: string[];
}

interface JournalEntry {
  date: string;
  title: string;
  sections: Section[];
  rawMarkdown: string;
}

const TAG_COLORS: Record<string, string> = {
  build: '#3b82f6',
  fix: '#ef4444',
  research: '#a855f7',
  strategy: '#eab308',
  ops: '#22c55e',
  feature: '#06b6d4',
  refactor: '#f97316',
  doc: '#6b7280',
};

export default function Journal() {
  const { data, loading } = useApi<JournalEntry[]>('/api/journal');
  const entries = data ?? [];
  
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [filterTag, setFilterTag] = useState<string | null>(null);

  const allTags = Array.from(
    new Set(entries.flatMap(e => e.sections.flatMap(s => s.tags)))
  ).sort();

  const filteredEntries = filterTag
    ? entries.filter(e => e.sections.some(s => s.tags.includes(filterTag)))
    : entries;

  const toggleSection = (key: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getMonthGroup = (dateStr: string): string => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Group entries by month
  const groupedEntries = filteredEntries.reduce((acc, entry) => {
    const month = getMonthGroup(entry.date);
    if (!acc[month]) acc[month] = [];
    acc[month].push(entry);
    return acc;
  }, {} as Record<string, JournalEntry[]>);

  return (
    <div className="animate-fadeIn max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#7c5cfc]/15 flex items-center justify-center">
            <Notebook size={20} className="text-[#7c5cfc]" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Dev Journal</h1>
            <p className="text-xs text-gray-500">{entries.length} entries</p>
          </div>
        </div>

        {/* Tag Filter */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Tag size={14} className="text-gray-500" />
            <button
              onClick={() => setFilterTag(null)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
                !filterTag
                  ? 'bg-[#7c5cfc] text-white'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              All
            </button>
            {allTags.map(tag => {
              const color = TAG_COLORS[tag] || '#6b7280';
              return (
                <button
                  key={tag}
                  onClick={() => setFilterTag(tag)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
                    filterTag === tag ? 'text-white' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                  style={filterTag === tag ? {
                    backgroundColor: color + '30',
                    color: color
                  } : {}}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-gray-500 text-sm">Loading journal...</div>
      ) : Object.keys(groupedEntries).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedEntries).map(([month, monthEntries]) => (
            <div key={month}>
              {/* Month Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#7c5cfc]/30 to-transparent" />
                <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  {month}
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#7c5cfc]/30 to-transparent" />
              </div>

              {/* Timeline */}
              <div className="relative pl-8">
                {/* Vertical line */}
                {monthEntries.length > 1 && (
                  <div className="absolute left-2.5 top-3 bottom-3 w-px bg-gradient-to-b from-[#7c5cfc]/40 via-[#7c5cfc]/20 to-[#7c5cfc]/10" />
                )}

                <div className="space-y-6">
                  {monthEntries.map((entry, entryIdx) => (
                    <div key={entry.date} className="relative">
                      {/* Timeline dot */}
                      <div className="absolute left-[-1.75rem] top-3 w-3 h-3 rounded-full bg-[#7c5cfc]/60 border-2 border-[#7c5cfc] shadow-[0_0_8px_rgba(124,92,252,0.5)]" />
                      
                      {/* Entry Card */}
                      <div className="bg-[#16162a] border border-dashed border-white/10 rounded-xl overflow-hidden hover:border-[#7c5cfc]/30 hover:shadow-[0_0_20px_rgba(124,92,252,0.08)] transition-all">
                        {/* Entry Header */}
                        <div className="px-5 py-4 border-b border-dashed border-white/5">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-base font-semibold text-white mb-1">{entry.title}</h3>
                              <p className="text-xs text-gray-500">{formatDate(entry.date)}</p>
                            </div>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#7c5cfc]/15 text-[#7c5cfc]">
                              {entry.sections.length} section{entry.sections.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>

                        {/* Sections */}
                        <div className="divide-y divide-dashed divide-white/5">
                          {entry.sections.map((section, sectionIdx) => {
                            const sectionKey = `${entry.date}-${sectionIdx}`;
                            const isExpanded = expandedSections.has(sectionKey);
                            const preview = section.content.split('\n').slice(0, 2).join('\n');
                            const hasMore = section.content.split('\n').length > 2;

                            return (
                              <div key={sectionIdx} className="px-5 py-4">
                                <button
                                  onClick={() => hasMore && toggleSection(sectionKey)}
                                  className="w-full text-left"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-sm font-semibold text-white font-mono flex items-center gap-2">
                                      <span className="text-[#7c5cfc]">$</span>
                                      {section.heading}
                                    </h4>
                                    {hasMore && (
                                      isExpanded ? (
                                        <ChevronDown size={16} className="text-gray-500" />
                                      ) : (
                                        <ChevronRight size={16} className="text-gray-500" />
                                      )
                                    )}
                                  </div>

                                  {/* Tags */}
                                  {section.tags.length > 0 && (
                                    <div className="flex items-center gap-1.5 mb-2">
                                      {section.tags.map(tag => {
                                        const color = TAG_COLORS[tag] || '#6b7280';
                                        return (
                                          <span
                                            key={tag}
                                            className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                                            style={{
                                              backgroundColor: color + '20',
                                              color: color,
                                            }}
                                          >
                                            {tag}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  )}
                                </button>

                                {/* Content */}
                                <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                                  {isExpanded ? section.content : preview}
                                  {!isExpanded && hasMore && (
                                    <button
                                      onClick={() => toggleSection(sectionKey)}
                                      className="text-xs text-[#7c5cfc] hover:text-white mt-2 transition-colors"
                                    >
                                      Show more...
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#16162a] border border-dashed border-white/10 rounded-xl p-12 text-center">
          <Notebook size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">
            {filterTag ? `No entries with tag "${filterTag}"` : 'No journal entries'}
          </p>
        </div>
      )}
    </div>
  );
}
