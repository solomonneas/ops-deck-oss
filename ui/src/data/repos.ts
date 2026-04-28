export type RepoStatus = 'live' | 'dev' | 'archived' | 'shelved';
export type RepoVisibility = 'public' | 'private';
export type RepoCategory = 'security' | 'developer' | 'infrastructure' | 'mcp' | 'portfolio' | 'dev-tools' | 'archived';

export interface Repo {
  name: string;
  slug: string;
  category: RepoCategory;
  description: string;
  status: RepoStatus;
  visibility: RepoVisibility;
  github?: string;
  port?: number;
  deploy?: string; // live URL
  demo?: string;
  lastPush: string; // YYYY-MM-DD
  stack?: string[];
}

export const REPOS: Repo[] = [];
