/**
 * Deep-dive data for each repository.
 * Keyed by repo slug. Contains architecture diagrams, data flows,
 * code snippets, tech decisions, and API surfaces.
 */

export interface DiagramNode {
  id: string;
  label: string;
  description: string;
  color: string;
}

export interface DiagramEdge {
  from: string;
  to: string;
  label: string;
}

export interface DiagramLayer {
  label: string;
  color: string;
  nodes: DiagramNode[];
}

export interface DataFlowStep {
  step: number;
  title: string;
  description: string;
}

export interface CodeSnippet {
  file: string;
  language: string;
  title: string;
  description: string;
  code: string;
}

export interface TechDecision {
  decision: string;
  reason: string;
}

export interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
}

export interface RepoDetailData {
  overview: string;
  architectureLayers: DiagramLayer[];
  architectureEdges: DiagramEdge[];
  dataFlow: DataFlowStep[];
  codeSnippets: CodeSnippet[];
  techDecisions: TechDecision[];
  apiEndpoints?: ApiEndpoint[];
  /** For archived/shelved repos: brief mode, skip diagrams */
  brief?: boolean;
}

export const REPO_DETAILS: Record<string, RepoDetailData> = {};
