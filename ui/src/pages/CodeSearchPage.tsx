import { useEffect, useState, type FormEvent } from "react";
import { RefreshCcw, Search } from "lucide-react";
import { SectionHeader } from "../components/SectionHeader";
import { api, type SearchResult } from "../lib/api";
import { useAsyncData } from "../lib/hooks";

export function CodeSearchPage() {
  const [query, setQuery] = useState("cron fallback");
  const [mode, setMode] = useState("hybrid");
  const [results, setResults] = useState<{ embeddingProvider: string; results: SearchResult[] } | null>(null);
  const health = useAsyncData(() => api.getSearchHealth(), []);

  useEffect(() => {
    api.searchCode({ query, mode, limit: 6 }).then(setResults).catch(() => undefined);
  }, []);

  async function handleSearch(event: FormEvent) {
    event.preventDefault();
    const next = await api.searchCode({ query, mode, limit: 6 });
    setResults(next);
  }

  async function handleReindex() {
    await api.reindexCode();
    const next = await api.searchCode({ query, mode, limit: 6 });
    setResults(next);
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Retrieval"
        title="Code Search"
        description="Hybrid lexical and semantic search over a seeded local corpus. Ollama embeddings improve ranking when available, but fallback mode still works."
        action={
          <button onClick={handleReindex} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200">
            <RefreshCcw size={16} />
            Reindex
          </button>
        }
      />

      <section className="panel p-5">
        <form onSubmit={handleSearch} className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_120px]">
          <label className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 px-4">
            <Search size={16} className="text-slate-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full border-0 bg-transparent py-3 text-sm text-white outline-none"
              placeholder="Search indexed architecture notes, runbooks, and prompt patterns"
            />
          </label>
          <select value={mode} onChange={(event) => setMode(event.target.value)} className="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-white">
            <option value="hybrid">Hybrid</option>
            <option value="lexical">Lexical</option>
            <option value="semantic">Semantic</option>
          </select>
          <button className="rounded-2xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950">Search</button>
        </form>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-400">
          <span>Documents: {health.data?.documents ?? "--"}</span>
          <span>Model: {health.data?.model ?? "--"}</span>
          <span>Status: {health.data?.status ?? "loading"}</span>
        </div>
      </section>

      <section className="grid gap-4">
        {(results?.results ?? []).map((result) => (
          <article key={result.path} className="panel p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">{result.title}</h3>
                <div className="mt-1 text-sm text-slate-500">{result.path}</div>
                <p className="mt-4 text-sm leading-6 text-slate-300">{result.snippet}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-300">
                <div>Score {result.score}</div>
                <div className="mt-2 text-slate-500">Lexical {result.lexicalScore}</div>
                <div className="text-slate-500">Semantic {result.semanticScore}</div>
              </div>
            </div>
          </article>
        ))}
        {!results && <div className="panel p-5 text-sm text-slate-400">Running the default search over the seeded corpus...</div>}
      </section>
    </div>
  );
}
