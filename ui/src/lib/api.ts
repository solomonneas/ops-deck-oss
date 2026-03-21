export type CronJob = {
  id: string;
  name: string;
  schedule: string;
  owner: string;
  lastRun: string;
  nextRun: string;
  status: string;
  runtimeSeconds: number;
  target: string;
};

export type IntelItem = {
  id: string;
  title: string;
  category: string;
  severity: string;
  source: string;
  summary: string;
  createdAt: string;
  tags: string[];
};

export type SecurityAudit = {
  score: number;
  lastAudit: string;
  controls: { name: string; status: string; coverage: number }[];
  findings: { id: string; severity: string; title: string; owner: string; status: string }[];
};

export type Architecture = {
  updatedAt: string;
  services: { id: string; name: string; port: number; language: string; role: string; dependencies: string[] }[];
  flows: string[];
};

export type BacklogItem = {
  id: string;
  title: string;
  priority: string;
  status: string;
  team: string;
  estimate: number;
};

export type PromptRecord = {
  id: string;
  title: string;
  category: string;
  content: string;
  notes: string;
  tags: string[];
  updatedAt: string;
};

export type SearchResult = {
  path: string;
  title: string;
  snippet: string;
  score: number;
  lexicalScore: number;
  semanticScore: number;
  indexedAt: string;
};

const apiBase = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8005";
const promptsBase = import.meta.env.VITE_PROMPT_LIBRARY_BASE_URL ?? "http://localhost:5202";
const searchBase = import.meta.env.VITE_CODE_SEARCH_BASE_URL ?? "http://localhost:5204";

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  getCronJobs: () => requestJson<{ jobs: CronJob[] }>(`${apiBase}/api/cron-jobs`),
  getAgentIntel: (category?: string) =>
    requestJson<{ categories: string[]; items: IntelItem[] }>(
      `${apiBase}/api/agent-intel${category ? `?category=${encodeURIComponent(category)}` : ""}`
    ),
  createIntel: (payload: Partial<IntelItem>) =>
    requestJson<IntelItem>(`${apiBase}/api/agents/intel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }),
  getSecurityAudit: () => requestJson<SecurityAudit>(`${apiBase}/api/security-audit`),
  getArchitecture: () => requestJson<Architecture>(`${apiBase}/api/architecture`),
  getBacklog: () => requestJson<{ items: BacklogItem[] }>(`${apiBase}/api/backlog`),
  getPrompts: () => requestJson<PromptRecord[]>(`${promptsBase}/api/prompts`),
  createPrompt: (payload: Partial<PromptRecord>) =>
    requestJson<PromptRecord>(`${promptsBase}/api/prompts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }),
  updatePrompt: (id: string, payload: Partial<PromptRecord>) =>
    requestJson<PromptRecord>(`${promptsBase}/api/prompts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }),
  deletePrompt: async (id: string) => {
    const response = await fetch(`${promptsBase}/api/prompts/${id}`, { method: "DELETE" });
    if (!response.ok) {
      throw new Error(`Delete failed: ${response.status}`);
    }
  },
  searchCode: (payload: { query: string; mode: string; limit: number }) =>
    requestJson<{ embeddingProvider: string; results: SearchResult[] }>(`${searchBase}/api/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }),
  reindexCode: () =>
    requestJson<{ indexed: number; total: number; embeddingProvider: string }>(`${searchBase}/api/index`, {
      method: "POST"
    }),
  getSearchHealth: () => requestJson<{ status: string; documents: number; model: string }>(`${searchBase}/api/health`)
};

