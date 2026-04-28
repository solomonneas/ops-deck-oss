import type { Repo } from "../data/repos";
import type { RepoDetailData } from "../data/repos-detail";
import type { ProjectEntry as CodebaseEntry } from "../data/codebase";

export interface MemoryCard {
  slug: string;
  topic: string;
  category: string;
  tags: string[];
  body?: string;
}

export interface JournalEntry {
  date: string;
  sections: { heading: string | null; lines: string[] }[];
  tags: string[];
}

export interface Prompt {
  id: string;
  name: string;
  category: string;
  body: string;
}

export interface SearchResult {
  path: string;
  snippet: string;
  score: number;
}

export interface SearchOptions {
  limit?: number;
  mode?: "semantic" | "keyword";
}

export interface Capabilities {
  repos: boolean;       // covers both /api/repos and /api/repos/{slug}
  codebase: boolean;
  search: boolean;
  prompts: boolean;
  journal: boolean;
  memory: boolean;
}

export interface DataSource {
  capabilities: Capabilities;

  getRepos(): Promise<Repo[]>;
  getRepoDetail(slug: string): Promise<RepoDetailData | null>;

  getCodebase(): Promise<CodebaseEntry[]>;

  searchCode(query: string, opts?: SearchOptions): Promise<SearchResult[]>;

  getPrompts(): Promise<Prompt[]>;
  getPrompt(id: string): Promise<Prompt | null>;

  getJournal(): Promise<JournalEntry[]>;

  getMemoryCards(): Promise<MemoryCard[]>;
  getMemoryCard(slug: string): Promise<MemoryCard | null>;
}
