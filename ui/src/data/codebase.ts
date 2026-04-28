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

// ─── Pipeline Projects ─────────────────────────────────────────────
export const projects: ProjectEntry[] = [
  // === SECURITY ===
  {
    name: 'Bro Hunter',
    dir: 'pipeline/work/bro_hunter',
    category: 'security',
    status: 'live',
    description: 'Network threat hunting platform. Zeek/Suricata log analysis with explainable scoring and MITRE mapping.',
    stack: ['React 18', 'TypeScript', 'Vite', 'FastAPI', 'Python', 'Recharts', 'Tailwind'],
    port: 5186,
    github: 'solomonneas/bro-hunter',
    entryPoints: [
      { label: 'Frontend App', path: 'web/src/variants/v3/App.tsx' },
      { label: 'Frontend Pages', path: 'web/src/variants/v3/pages/' },
      { label: 'Backend Entry', path: 'api/main.py' },
      { label: 'Config (REAL)', path: 'api/config/__init__.py' },
      { label: 'Routers', path: 'api/routers/' },
      { label: 'Services', path: 'api/services/' },
      { label: 'Demo Data', path: 'data/demo/' },
      { label: 'Styles', path: 'web/src/variants/v3/styles.css' },
    ],
    buildCmd: 'cd web && npx vite build',
    devCmd: 'cd web && npm run dev',
    deploy: 'Railway (auto-deploy on push to main)',
    notes: 'CRITICAL: api/config/__init__.py is the REAL config. api/config.py is DEAD CODE. BeaconAnalyzer method is analyze_connections not detect_beacons.',
  },
  {
    name: 'CyberBRIEF',
    dir: 'pipeline/work/cyberbrief',
    category: 'security',
    status: 'live',
    description: 'AI threat intelligence briefing generator. Perplexity-powered research with source analysis.',
    stack: ['React', 'TypeScript', 'Vite', 'FastAPI', 'Python', 'Perplexity API'],
    port: 5188,
    github: 'solomonneas/cyberbrief',
    entryPoints: [
      { label: 'Frontend', path: 'frontend/src/' },
      { label: 'Backend', path: 'backend/' },
      { label: 'API Routes', path: 'backend/routes/' },
    ],
    buildCmd: 'cd frontend && npx vite build',
    deploy: 'Railway (compassionate-rejoicing)',
    notes: 'Perplexity API keys may need regen ($5.31 burned). Deep Research hidden from UI unless BYOK.',
  },
  {
    name: 'SOC Showcase',
    dir: 'pipeline/work/soc-showcase',
    category: 'security',
    status: 'complete',
    description: 'Security Operations Center demo with Wazuh integration and live alert dashboard.',
    stack: ['React', 'TypeScript', 'Vite', 'Tailwind'],
    port: 5175,
    github: 'solomonneas/soc-showcase',
    entryPoints: [
      { label: 'App', path: 'src/App.tsx' },
      { label: 'Pages', path: 'src/pages/' },
    ],
    buildCmd: 'npx vite build',
  },
  {
    name: 'FortiSim',
    dir: 'pipeline/work/fortisim',
    category: 'security',
    status: 'active',
    description: 'Fortinet firewall policy simulator with rule analysis and conflict detection.',
    stack: ['React', 'TypeScript', 'Vite'],
    port: 5176,
    github: 'solomonneas/fortisim',
    entryPoints: [
      { label: 'App', path: 'src/App.tsx' },
    ],
    buildCmd: 'npx vite build',
  },
  {
    name: 'Playbook Forge',
    dir: 'pipeline/work/playbook-forge',
    category: 'security',
    status: 'active',
    description: 'Incident response playbook builder with MITRE mapping.',
    stack: ['React', 'TypeScript', 'Vite', 'FastAPI', 'Python'],
    port: 5177,
    github: 'solomonneas/playbook-forge',
    entryPoints: [
      { label: 'Frontend', path: 'web/src/' },
      { label: 'Backend', path: 'api/' },
    ],
    buildCmd: 'cd web && npx vite build',
    notes: 'Frontend is web/dist not root dist.',
  },
  {
    name: 'FortiLogForge',
    dir: 'pipeline/work/fortilogforge',
    category: 'security',
    status: 'active',
    description: 'Fortinet log parser and analyzer.',
    stack: ['React', 'TypeScript', 'Vite'],
    port: 5178,
    github: 'solomonneas/fortilogforge',
    entryPoints: [
      { label: 'Frontend', path: 'frontend/src/' },
    ],
    buildCmd: 'cd frontend && npx vite build',
  },
  {
    name: 'Intel Workbench',
    dir: 'pipeline/work/intel-workbench',
    category: 'security',
    status: 'active',
    description: 'Threat intelligence analysis workbench.',
    stack: ['React', 'TypeScript', 'Vite'],
    port: 5182,
    github: 'solomonneas/intel-workbench',
    entryPoints: [
      { label: 'App', path: 'src/App.tsx' },
    ],
    buildCmd: 'npx vite build',
  },
  {
    name: 'ProxGuard',
    dir: 'pipeline/work/proxguard',
    category: 'security',
    status: 'active',
    description: 'Proxmox security hardening and monitoring tool.',
    stack: ['React', 'TypeScript', 'Vite'],
    github: 'solomonneas/proxguard' ,
    entryPoints: [
      { label: 'App', path: 'src/App.tsx' },
    ],
    buildCmd: 'npx vite build',
  },

  // === DEVELOPER TOOLS ===
  {
    name: 'Dev Dashboard (Ops Deck)',
    dir: 'pipeline/work/dev-dashboard',
    category: 'developer',
    status: 'live',
    description: 'Central operations dashboard. Tasks, services, memory, usage, social, architecture, agent playbook.',
    stack: ['React 18', 'TypeScript', 'Vite', 'Tailwind', 'Recharts'],
    port: 5173,
    github: 'solomonneas/dev-dashboard',
    entryPoints: [
      { label: 'App', path: 'src/App.tsx' },
      { label: 'Pages', path: 'src/pages/' },
      { label: 'Components', path: 'src/components/' },
      { label: 'Data Files', path: 'src/data/' },
      { label: 'Sidebar', path: 'src/components/Sidebar.tsx' },
      { label: 'API Backend', path: 'server/' },
    ],
    devCmd: 'npm run dev',
    buildCmd: 'npx vite build',
    notes: 'Must run in vite dev mode (not preview) for health-check API. Server-side middleware plugins.',
  },
  {
    name: 'Model Arena',
    dir: 'pipeline/work/model-arena',
    category: 'developer',
    status: 'active',
    description: 'LLM model comparison and benchmarking tool.',
    stack: ['React', 'TypeScript', 'Vite'],
    port: 5174,
    github: 'solomonneas/model-arena',
    entryPoints: [
      { label: 'App', path: 'src/App.tsx' },
    ],
    buildCmd: 'npx vite build',
  },
  {
    name: 'Code Search',
    dir: 'pipeline/work/code-search',
    category: 'developer',
    status: 'active',
    description: 'Codebase search backend with semantic indexing.',
    stack: ['Node.js'],
    entryPoints: [
      { label: 'Server', path: 'index.js' },
    ],
  },
  {
    name: 'Code Search UI',
    dir: 'pipeline/work/code-search-ui',
    category: 'developer',
    status: 'active',
    description: 'Frontend for code search.',
    stack: ['React', 'TypeScript', 'Vite'],
    entryPoints: [
      { label: 'App', path: 'src/App.tsx' },
    ],
    buildCmd: 'npx vite build',
  },
  {
    name: 'Dev Tools API',
    dir: 'pipeline/work/dev-tools-api',
    category: 'developer',
    status: 'live',
    description: 'Backend API for dev dashboard (architecture, git info, health checks).',
    stack: ['Node.js', 'Express'],
    port: 8005,
    entryPoints: [
      { label: 'Server', path: 'index.js' },
    ],
    notes: 'Needs BIND_HOST=0.0.0.0 to be accessible from Windows.',
  },
  {
    name: 'Prompt Library',
    dir: 'pipeline/work/prompt-library',
    category: 'developer',
    status: 'active',
    description: 'Curated prompt library with version history and diff view.',
    stack: ['React', 'TypeScript', 'Vite', 'FastAPI', 'SQLite'],
    port: 5201,
    entryPoints: [
      { label: 'Frontend', path: 'frontend/src/' },
      { label: 'Backend', path: 'backend/' },
      { label: 'DB', path: 'backend/prompts.db' },
    ],
    notes: 'Caddy block has handle /api/* reverse_proxy to :5202.',
  },
  {
    name: 'Dev Journal',
    dir: 'pipeline/work/dev-journal',
    category: 'developer',
    status: 'active',
    description: 'Development journal and session logging.',
    stack: ['React', 'TypeScript'],
    entryPoints: [
      { label: 'Frontend', path: 'frontend/src/' },
    ],
  },
  {
    name: 'PortGrid',
    dir: 'pipeline/work/portgrid',
    category: 'developer',
    status: 'live',
    description: 'Port management dashboard for dev services.',
    stack: ['Next.js', 'TypeScript'],
    github: 'solomonneas/portgrid',
    entryPoints: [
      { label: 'App', path: 'src/' },
    ],
    notes: 'Stays on PM2 (Next.js API routes prevent static export).',
  },
  {
    name: 'Variant Gallery',
    dir: 'pipeline/work/variant-gallery',
    category: 'dev-tools',
    status: 'active',
    description: 'UI variant comparison gallery with screenshots and ratings.',
    stack: ['FastAPI', 'Python', 'HTML'],
    port: 5199,
    entryPoints: [
      { label: 'Backend', path: 'app.py' },
      { label: 'Data', path: 'variants.json' },
      { label: 'Screenshots', path: 'screenshots/' },
    ],
  },

  // === MCP SERVERS ===
  {
    name: 'Zeek MCP',
    dir: 'pipeline/work/zeek-mcp',
    category: 'mcp',
    status: 'complete',
    description: 'Model Context Protocol server for Zeek network monitoring.',
    stack: ['TypeScript', 'Node.js'],
    github: 'solomonneas/zeek-mcp',
    entryPoints: [{ label: 'Server', path: 'src/index.ts' }],
  },
  {
    name: 'Suricata MCP',
    dir: 'pipeline/work/suricata-mcp',
    category: 'mcp',
    status: 'complete',
    description: 'MCP server for Suricata IDS.',
    stack: ['TypeScript', 'Node.js'],
    github: 'solomonneas/suricata-mcp',
    entryPoints: [{ label: 'Server', path: 'src/index.ts' }],
  },
  {
    name: 'Wazuh MCP',
    dir: 'pipeline/work/wazuh-mcp',
    category: 'mcp',
    status: 'complete',
    description: 'MCP server for Wazuh SIEM.',
    stack: ['TypeScript', 'Node.js'],
    github: 'solomonneas/wazuh-mcp',
    entryPoints: [{ label: 'Server', path: 'src/index.ts' }],
  },
  {
    name: 'MITRE ATT&CK MCP',
    dir: 'pipeline/work/mitre-mcp',
    category: 'mcp',
    status: 'complete',
    description: 'MCP server for MITRE ATT&CK framework queries.',
    stack: ['TypeScript', 'Node.js'],
    github: 'solomonneas/mitre-mcp',
    entryPoints: [{ label: 'Server', path: 'src/index.ts' }],
  },
  {
    name: 'TheHive MCP',
    dir: 'pipeline/work/thehive-mcp-ts',
    category: 'mcp',
    status: 'complete',
    description: 'MCP server for TheHive incident response platform.',
    stack: ['TypeScript', 'Node.js'],
    github: 'solomonneas/thehive-mcp',
    entryPoints: [{ label: 'Server', path: 'src/index.ts' }],
  },
  {
    name: 'MISP MCP',
    dir: 'pipeline/work/misp-mcp',
    category: 'mcp',
    status: 'complete',
    description: 'MCP server for MISP threat intelligence sharing.',
    stack: ['TypeScript', 'Node.js'],
    github: 'solomonneas/misp-mcp',
    entryPoints: [{ label: 'Server', path: 'src/index.ts' }],
  },
  {
    name: 'Cortex MCP',
    dir: 'pipeline/work/cortex-mcp',
    category: 'mcp',
    status: 'complete',
    description: 'MCP server for Cortex analysis engine.',
    stack: ['TypeScript', 'Node.js'],
    github: 'solomonneas/cortex-mcp',
    entryPoints: [{ label: 'Server', path: 'src/index.ts' }],
  },
  {
    name: 'Rapid7 MCP',
    dir: 'pipeline/work/rapid7-mcp',
    category: 'mcp',
    status: 'complete',
    description: 'MCP server for Rapid7 InsightIDR.',
    stack: ['TypeScript', 'Node.js'],
    github: 'solomonneas/rapid7-mcp',
    entryPoints: [{ label: 'Server', path: 'src/index.ts' }],
  },
  {
    name: 'Sophos MCP',
    dir: 'pipeline/work/sophos-mcp',
    category: 'mcp',
    status: 'complete',
    description: 'MCP server for Sophos Central.',
    stack: ['TypeScript', 'Node.js'],
    github: 'solomonneas/sophos-mcp',
    entryPoints: [{ label: 'Server', path: 'src/index.ts' }],
  },

  // === PORTFOLIO / LANDING ===
  {
    name: 'Astro Portfolio',
    dir: 'pipeline/work/astro-portfolio',
    category: 'portfolio',
    status: 'live',
    description: 'Main portfolio site (solomonneas.dev). Astro-based with project pages.',
    stack: ['Astro', 'TypeScript', 'Tailwind'],
    port: 5187,
    github: 'solomonneas/astro-portfolio',
    entryPoints: [
      { label: 'Pages', path: 'src/pages/' },
      { label: 'Layouts', path: 'src/layouts/' },
      { label: 'Components', path: 'src/components/' },
    ],
    buildCmd: 'npx astro build',
    deploy: 'Vercel (auto-deploy on push)',
  },
  {
    name: 'Termfolio',
    dir: 'pipeline/work/termfolio',
    category: 'portfolio',
    status: 'live',
    description: 'Terminal-style portfolio with Easter eggs (traceroute, nmap, ssh, etc).',
    stack: ['React', 'TypeScript', 'Vite'],
    github: 'solomonneas/termfolio',
    entryPoints: [
      { label: 'App', path: 'src/App.tsx' },
      { label: 'Commands', path: 'src/commands/' },
    ],
    buildCmd: 'npx vite build',
    deploy: 'Vercel',
  },
  {
    name: 'SEU Landing',
    dir: 'pipeline/work/seu-landing',
    category: 'landing',
    status: 'active',
    description: 'Southeastern University landing page for job application.',
    stack: ['HTML', 'CSS', 'JS'],
    port: 5211,
    entryPoints: [
      { label: 'Page', path: 'index.html' },
    ],
  },
  {
    name: 'Polk State Landing',
    dir: 'pipeline/work/polk-state-landing',
    category: 'landing',
    status: 'active',
    description: 'Polk State College teaching portfolio.',
    stack: ['HTML', 'CSS', 'JS'],
    port: 5213,
    entryPoints: [
      { label: 'Page', path: 'index.html' },
    ],
  },
  {
    name: 'OpenClaw Service',
    dir: 'pipeline/work/openclaw-service',
    category: 'landing',
    status: 'active',
    description: 'OpenClaw managed service sales page.',
    stack: ['HTML', 'CSS', 'JS'],
    port: 5210,
    github: 'solomonneas/openclaw-service',
    entryPoints: [
      { label: 'Page', path: 'index.html' },
    ],
  },
  {
    name: 'USF ePortfolio',
    dir: 'pipeline/work/usf-portfolio',
    category: 'landing',
    status: 'active',
    description: 'USF Master\'s program ePortfolio.',
    stack: ['HTML', 'CSS', 'JS'],
    entryPoints: [
      { label: 'Page', path: 'index.html' },
    ],
  },

  // === INFRASTRUCTURE ===
  {
    name: 'Mock Watchtower',
    dir: 'pipeline/work/watchtower',
    category: 'infrastructure',
    status: 'active',
    description: 'Container monitoring dashboard mockup.',
    stack: ['React', 'TypeScript'],
    port: 5180,
    github: 'solomonneas/watchtower',
    entryPoints: [
      { label: 'Frontend', path: 'frontend/src/' },
    ],
  },
  {
    name: 'LAIM',
    dir: 'pipeline/work/laim',
    category: 'infrastructure',
    status: 'active',
    description: 'Log Analysis and Incident Management tool.',
    stack: ['Python', 'Flask'],
    port: 5179,
    github: 'solomonneas/laim',
    entryPoints: [
      { label: 'App', path: 'app.py' },
    ],
  },
  {
    name: 'MistPortBouncer',
    dir: 'pipeline/work/mistportbouncer',
    category: 'infrastructure',
    status: 'active',
    description: 'Mist network port bouncing automation.',
    stack: ['Python'],
    github: 'solomonneas/mistportbouncer',
    entryPoints: [
      { label: 'Main', path: 'main.py' },
    ],
  },
  {
    name: 'OpenClaw Overlay',
    dir: 'pipeline/work/openclaw-overlay',
    category: 'infrastructure',
    status: 'active',
    description: 'OpenClaw notification overlay UI.',
    stack: ['React', 'TypeScript', 'Vite'],
    entryPoints: [
      { label: 'App', path: 'src/App.tsx' },
    ],
    buildCmd: 'npx vite build',
  },
];

// ─── Workspace Directories ─────────────────────────────────────────
export const workspaceDirs: WorkspaceDir[] = [
  {
    name: 'pipeline/work/',
    path: 'pipeline/work/',
    description: 'All project source code. Each subdirectory is a project.',
  },
  {
    name: 'memory/',
    path: 'memory/',
    description: 'Daily session logs (YYYY-MM-DD.md). Clawdbot\'s raw memory.',
    keyFiles: ['memory/heartbeat-state.json'],
  },
  {
    name: 'tracking/',
    path: 'tracking/',
    description: 'Project tracking, review history, cost logs.',
    keyFiles: ['tracking/projects.json', 'tracking/COSTS.md', 'tracking/reviews/'],
  },
  {
    name: 'content/',
    path: 'content/',
    description: 'Social media content queue, screenshots, post drafts.',
    keyFiles: ['content/CONTENT-QUEUE.md', 'content/screenshots/'],
  },
  {
    name: 'scripts/',
    path: 'scripts/',
    description: 'Utility scripts (rebuild, port setup, organizer).',
    keyFiles: ['scripts/rebuild-frontend.sh', 'scripts/wsl-ports-setup.ps1', 'scripts/cerebro-inbox-organizer.py'],
  },
  {
    name: 'drafts/',
    path: 'drafts/',
    description: 'Resume drafts, LinkedIn posts, blog drafts.',
    keyFiles: ['drafts/resume-adjunct.md', 'drafts/resume-industry.md'],
  },
  {
    name: 'specs/',
    path: 'specs/',
    description: 'Build specifications and PRDs.',
    keyFiles: ['specs/variant-consolidation.md'],
  },
  {
    name: 'notes/',
    path: 'notes/',
    description: 'Class notes, research notes.',
    keyFiles: ['notes/class-notes-prompt.md'],
  },
  {
    name: 'skills/',
    path: 'skills/',
    description: 'Custom OpenClaw skills (frontend-design, humanizer, last30days, etc).',
  },
  {
    name: 'docs/',
    path: 'docs/',
    description: 'OpenClaw documentation mirror.',
  },
  {
    name: 'config/',
    path: 'config/',
    description: 'Configuration files and templates.',
  },
];

// ─── Important Root Files ──────────────────────────────────────────
export const rootFiles = [
  { name: 'MEMORY.md', description: 'Long-term curated memory (main session only)', critical: true },
  { name: 'SOUL.md', description: 'Clawdbot personality and behavior rules', critical: true },
  { name: 'USER.md', description: 'Information about Solomon', critical: true },
  { name: 'AGENTS.md', description: 'Agent behavior rules and workflow patterns', critical: true },
  { name: 'TOOLS.md', description: 'Local tool notes (cameras, SSH, voices, ports)', critical: true },
  { name: 'HEARTBEAT.md', description: 'Heartbeat checklist (keep small)', critical: false },
  { name: 'IDENTITY.md', description: 'Clawdbot identity (name, emoji, avatar)', critical: false },
  { name: 'Caddyfile', description: 'Caddy v2 reverse proxy config (21 site blocks)', critical: true },
  { name: 'ecosystem.config.cjs', description: 'PM2 process manager config', critical: true },
  { name: 'solomon_neas_resume.pdf', description: 'Current resume PDF', critical: false },
  { name: 'solomon_neas_resume.txt', description: 'Current resume text', critical: false },
];

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
