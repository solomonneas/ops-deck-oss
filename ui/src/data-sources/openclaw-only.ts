import type { DataSource } from "./types";

export function createOpenclawOnlyDataSource(): DataSource {
  return {
    capabilities: {
      repos: false,
      codebase: false,
      search: false,
      prompts: false,
      journal: false,
      memory: false,
    },
    getRepos: async () => [],
    getRepoDetail: async () => null,
    getCodebase: async () => [],
    searchCode: async () => [],
    getPrompts: async () => [],
    getPrompt: async () => null,
    getJournal: async () => [],
    getMemoryCards: async () => [],
    getMemoryCard: async () => null,
  };
}
