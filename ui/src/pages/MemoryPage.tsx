import { useEffect, useMemo, useState } from "react";
import { MarkdownContent } from "../components/MarkdownContent";
import { SectionHeader } from "../components/SectionHeader";
import { api, type MemoryCardSummary } from "../lib/api";
import { useAsyncData } from "../lib/hooks";

export function MemoryPage() {
  const [query, setQuery] = useState("");
  const { data, loading, error } = useAsyncData(() => api.getMemoryCards(), []);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const selectedCard = useAsyncData(() => (selectedFile ? api.getMemoryCard(selectedFile) : Promise.resolve(null)), [selectedFile]);

  const filteredCards = useMemo(() => {
    const cards = data?.cards ?? [];
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return cards;
    }
    return cards.filter((card) => {
      const haystack = [card.title, card.category, card.tags.join(" "), card.excerpt].join(" ").toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [data, query]);

  useEffect(() => {
    if (!filteredCards.length) {
      setSelectedFile(null);
      return;
    }
    if (!selectedFile || !filteredCards.some((card) => card.filename === selectedFile)) {
      setSelectedFile(filteredCards[0].filename);
    }
  }, [filteredCards, selectedFile]);

  function renderCardRow(card: MemoryCardSummary) {
    const active = card.filename === selectedFile;
    return (
      <button
        key={card.filename}
        onClick={() => setSelectedFile(card.filename)}
        className={`w-full rounded-2xl border p-4 text-left transition ${
          active ? "border-sky-400/40 bg-sky-400/10" : "border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/70"
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-white">{card.title}</span>
          <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-300">{card.category}</span>
        </div>
        <p className="mt-3 text-sm text-slate-400">{card.excerpt}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {card.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-slate-700 px-2.5 py-1 text-xs text-slate-300">#{tag}</span>
          ))}
        </div>
      </button>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Knowledge"
        title="Memory Browser"
        description="Browse reusable knowledge cards, search by topic or tag, and inspect the full markdown body from the API-backed memory store."
        action={
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search cards, categories, or tags"
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-sm text-slate-200 md:w-80"
          />
        }
      />

      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <section className="panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Cards</h2>
            <span className="text-sm text-slate-400">{filteredCards.length} visible</span>
          </div>
          <div className="space-y-3">
            {loading && <div className="text-sm text-slate-400">Loading cards...</div>}
            {error && <div className="text-sm text-rose-300">{error}</div>}
            {!loading && !error && filteredCards.map(renderCardRow)}
            {!loading && !error && !filteredCards.length && <div className="text-sm text-slate-400">No cards match the current search.</div>}
          </div>
        </section>

        <section className="panel p-6">
          {selectedCard.loading && <div className="text-sm text-slate-400">Loading card details...</div>}
          {selectedCard.error && <div className="text-sm text-rose-300">{selectedCard.error}</div>}
          {selectedCard.data && (
            <div className="space-y-5">
              <div className="border-b border-slate-800 pb-5">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-bold text-white">{selectedCard.data.title}</h2>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">
                    {selectedCard.data.category}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedCard.data.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">#{tag}</span>
                  ))}
                </div>
              </div>
              <MarkdownContent content={selectedCard.data.content} />
            </div>
          )}
          {!selectedCard.loading && !selectedCard.error && !selectedCard.data && (
            <div className="text-sm text-slate-400">Select a memory card to inspect its contents.</div>
          )}
        </section>
      </div>
    </div>
  );
}
