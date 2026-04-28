/**
 * Codebase Directory Map
 * Complete reference for all projects, workspace dirs, and important files.
 */

export type ProjectStatus = 'live' | 'active' | 'complete' | 'shelved' | 'archived';
export type ProjectCategory = 'security' | 'developer' | 'infrastructure' | 'mcp' | 'portfolio' | 'landing' | 'dev-tools';

export interface ProjectEntry {
  name: string;
  dir: string;
  category: ProjectCategory;
  status: ProjectStatus;
  description: string;
  stack: string[];
  port?: number;
  github?: string;
  entryPoints: { label: string; path: string }[];
  buildCmd?: string;
  devCmd?: string;
  notes?: string;
  deploy?: string;
}

export interface WorkspaceDir {
  name: string;
  path: string;
  description: string;
  keyFiles?: string[];
}

export interface RootFile {
  name: string;
  description: string;
  critical: boolean;
}

// ─── Pipeline Projects ─────────────────────────────────────────────
export const projects: ProjectEntry[] = [];

// ─── Workspace Directories ─────────────────────────────────────────
export const workspaceDirs: WorkspaceDir[] = [];

// ─── Important Root Files ──────────────────────────────────────────
export const rootFiles: RootFile[] = [];

// ─── Category metadata ─────────────────────────────────────────────
export const categoryMeta: Record<ProjectCategory, { label: string; color: string; icon: string }> = {
  security: { label: 'Security', color: '#ef4444', icon: '🛡️' },
  developer: { label: 'Developer Tools', color: '#7c5cfc', icon: '🔧' },
  infrastructure: { label: 'Infrastructure', color: '#06b6d4', icon: '🏗️' },
  mcp: { label: 'MCP Servers', color: '#22c55e', icon: '🔌' },
  portfolio: { label: 'Portfolio', color: '#f59e0b', icon: '🌐' },
  landing: { label: 'Landing Pages', color: '#8b5cf6', icon: '📄' },
  'dev-tools': { label: 'Dev Utilities', color: '#64748b', icon: '⚙️' },
};

export const statusMeta: Record<ProjectStatus, { label: string; color: string }> = {
  live: { label: 'LIVE', color: '#22c55e' },
  active: { label: 'ACTIVE', color: '#06b6d4' },
  complete: { label: 'COMPLETE', color: '#7c5cfc' },
  shelved: { label: 'SHELVED', color: '#f59e0b' },
  archived: { label: 'ARCHIVED', color: '#64748b' },
};
