export interface Project {
  name: string;
  slug: string;
  category: string;
  description: string;
  status: string;
  port?: number;
  backendPort?: number;
  github?: string;
  variants?: number;
  stack?: Record<string, string>;
  deployment?: Record<string, unknown>;
}

export interface TaskStats {
  thisWeek: number;
  inProgress: number;
  total: number;
  completionPercent: number;
}

export interface CronJob {
  id: string;
  name: string;
  schedule: string;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  category?: string;
  model?: string;
  sessionTarget?: string;
  deleteAfterRun?: boolean;
  payload?: {
    kind?: string;
    message?: string;
    text?: string;
    model?: string;
  };
  state?: {
    lastRunAtMs?: number;
    lastStatus?: string;
    lastDurationMs?: number;
    nextRunAtMs?: number;
    consecutiveErrors?: number;
  };
}

export interface HeartbeatSummaryItem {
  kind: 'response' | 'skip' | 'overlay' | 'note';
  title: string;
  detail: string;
}

export interface HeartbeatConfig {
  enabled: boolean;
  every?: string | null;
  model?: string | null;
  runsPerDay?: number | null;
  instructions?: string[];
  summary?: HeartbeatSummaryItem[];
}

export interface CronsResponse {
  jobs?: CronJob[];
  heartbeat?: HeartbeatConfig | null;
  error?: string;
}

export interface MemoryFile {
  name: string;
  path: string;
  size: number;
  wordCount: number;
  mtime: string;
}

export interface PM2Process {
  name: string;
  pm_id: number;
  pid: number;
  status: string;
  cpu: number;
  memory: number;
  uptime: number;
  restarts: number;
  pm2_env?: {
    status: string;
    pm_uptime: number;
    restart_time: number;
    unstable_restarts: number;
  };
  monit?: {
    cpu: number;
    memory: number;
  };
}
