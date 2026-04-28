import type {
  DataSource,
  Capabilities,
  MemoryCard,
  JournalEntry,
  Prompt,
  SearchResult,
  SearchOptions,
} from "./types";
import type { Repo } from "../data/repos";
import type { RepoDetailData } from "../data/repos-detail";
import type { ProjectEntry as CodebaseEntry } from "../data/codebase";

interface SidecarConfig {
  baseUrl: string;
  apiKey?: string;
  capabilities: Capabilities;
  searchBaseUrl?: string;
  promptsBaseUrl?: string;
}

export function createSidecarDataSource(cfg: SidecarConfig): DataSource {
  const headers: Record<string, string> = {};
  if (cfg.apiKey) headers["X-API-Key"] = cfg.apiKey;

  async function jsonGet<T>(url: string, fallback: T): Promise<T> {
    const res = await fetch(url, { headers });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  }

  async function jsonGetOrNull<T>(url: string): Promise<T | null> {
    const res = await fetch(url, { headers });
    if (!res.ok) return null;
    return (await res.json()) as T;
  }

  return {
    capabilities: cfg.capabilities,

    getRepos: () => jsonGet<Repo[]>(`${cfg.baseUrl}/api/repos`, []),
    getRepoDetail: (slug) =>
      jsonGetOrNull<RepoDetailData>(`${cfg.baseUrl}/api/repos/${slug}`),
    getCodebase: () =>
      jsonGet<CodebaseEntry[]>(`${cfg.baseUrl}/api/codebase`, []),

    searchCode: async (query: string, opts?: SearchOptions) => {
      if (!cfg.searchBaseUrl) return [];
      const params = new URLSearchParams({
        query,
        limit: String(opts?.limit ?? 25),
      });
      return jsonGet<SearchResult[]>(
        `${cfg.searchBaseUrl}/api/search?${params}`,
        [],
      );
    },

    getPrompts: () => {
      if (!cfg.promptsBaseUrl) return Promise.resolve([]);
      return jsonGet<Prompt[]>(`${cfg.promptsBaseUrl}/api/prompts`, []);
    },
    getPrompt: (id) => {
      if (!cfg.promptsBaseUrl) return Promise.resolve(null);
      return jsonGetOrNull<Prompt>(`${cfg.promptsBaseUrl}/api/prompts/${id}`);
    },

    getJournal: () =>
      jsonGet<JournalEntry[]>(`${cfg.baseUrl}/api/entries`, []),
    getMemoryCards: () =>
      jsonGet<MemoryCard[]>(`${cfg.baseUrl}/api/memory-cards`, []),
    getMemoryCard: (slug) =>
      jsonGetOrNull<MemoryCard>(`${cfg.baseUrl}/api/memory-cards/${slug}`),
  };
}
