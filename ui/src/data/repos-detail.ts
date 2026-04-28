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

// ─── SECURITY REPOS ──────────────────────────────────────────────────────────

const cyberbrief: RepoDetailData = {
  overview:
    'CyberBRIEF is a threat intelligence research and reporting platform. Users submit a topic (e.g., "Salt Typhoon"), and the system runs a multi-tier research pipeline: Brave Search for free-tier, Perplexity Sonar for standard, and Perplexity Deep Research for deep analysis. Results are synthesized by Gemini into BLUF-style intelligence reports with Chicago NB citations, IOC extraction via regex, and MITRE ATT&CK technique mapping against a local enterprise dataset. The backend is Python/FastAPI, the frontend is React/TypeScript with Zustand state management.',
  architectureLayers: [
    {
      label: 'User Input',
      color: '#06b6d4',
      nodes: [
        { id: 'topic', label: 'Topic Input', description: 'User enters threat topic + selects research tier', color: '#06b6d4' },
        { id: 'settings', label: 'Settings', description: 'API keys, TLP level, report preferences', color: '#0891b2' },
      ],
    },
    {
      label: 'Research Engine',
      color: '#7c5cfc',
      nodes: [
        { id: 'brave', label: 'Brave Search', description: 'Free tier: web search for initial intel gathering', color: '#f59e0b' },
        { id: 'perplexity', label: 'Perplexity Sonar', description: 'Standard tier: AI-powered search with citations', color: '#8b5cf6' },
        { id: 'deep-research', label: 'Deep Research', description: 'Deep tier: multi-step Perplexity analysis', color: '#7c3aed' },
        { id: 'gemini', label: 'Gemini Synthesis', description: 'Synthesizes raw search results into structured findings', color: '#10b981' },
      ],
    },
    {
      label: 'Processing Pipeline',
      color: '#ef4444',
      nodes: [
        { id: 'report-gen', label: 'Report Generator', description: 'BLUF methodology, confidence assessment, Chicago NB citations', color: '#ef4444' },
        { id: 'ioc-extract', label: 'IOC Extractor', description: 'Regex-based extraction: IPs, domains, hashes, CVEs, URLs', color: '#f97316' },
        { id: 'attack-map', label: 'ATT&CK Mapper', description: 'T-code extraction + keyword matching against enterprise dataset', color: '#dc2626' },
      ],
    },
    {
      label: 'Output',
      color: '#10b981',
      nodes: [
        { id: 'report', label: 'Intelligence Report', description: 'BLUF summary, sections, confidence levels, bibliography', color: '#10b981' },
        { id: 'navigator', label: 'ATT&CK Navigator', description: 'Exportable Navigator layer JSON for technique visualization', color: '#059669' },
        { id: 'export', label: 'Export (MD/HTML)', description: 'Markdown and HTML export with formatted citations', color: '#047857' },
      ],
    },
  ],
  architectureEdges: [
    { from: 'topic', to: 'brave', label: 'free tier' },
    { from: 'topic', to: 'perplexity', label: 'standard tier' },
    { from: 'topic', to: 'deep-research', label: 'deep tier' },
    { from: 'brave', to: 'gemini', label: 'raw results' },
    { from: 'perplexity', to: 'report-gen', label: 'structured findings' },
    { from: 'deep-research', to: 'report-gen', label: 'deep analysis' },
    { from: 'gemini', to: 'report-gen', label: 'synthesized intel' },
    { from: 'report-gen', to: 'ioc-extract', label: 'report text' },
    { from: 'report-gen', to: 'attack-map', label: 'report text' },
    { from: 'report-gen', to: 'report', label: 'final report' },
    { from: 'attack-map', to: 'navigator', label: 'technique list' },
    { from: 'report', to: 'export', label: 'formatted output' },
  ],
  dataFlow: [
    { step: 1, title: 'Topic Submission', description: 'User enters a threat topic (e.g., "Salt Typhoon APT") and selects a research tier (Free/Standard/Deep). Optional: custom TLP level and API keys from settings.' },
    { step: 2, title: 'Research Dispatch', description: 'The research engine routes to the appropriate provider. Free tier hits Brave Search API. Standard uses Perplexity Sonar. Deep triggers Perplexity Deep Research with multi-step analysis.' },
    { step: 3, title: 'Synthesis', description: 'For free tier, raw search results are sent to Gemini for synthesis into structured findings. Standard/Deep tiers return pre-synthesized results from Perplexity.' },
    { step: 4, title: 'Report Generation', description: 'The generator transforms findings into a BLUF-format report: executive summary first, then detailed sections. Each finding gets a confidence assessment (High/Medium/Low) based on source convergence. Citations formatted as Chicago NB footnotes.' },
    { step: 5, title: 'IOC Extraction', description: 'Regex patterns scan the report text for indicators: IPv4/IPv6 addresses, domains, URLs, MD5/SHA1/SHA256 hashes, and CVE IDs. False positives filtered against an exclusion list (example.com, schema.org, etc.).' },
    { step: 6, title: 'ATT&CK Mapping', description: 'Two-pass technique detection: first extracts explicit T-codes (T1059, T1566.001) via regex, then runs keyword matching against the local enterprise_attack.json dataset. Results enriched with tactic, description, and evidence snippets.' },
  ],
  codeSnippets: [
    {
      file: 'backend/research/engine.py',
      language: 'python',
      title: 'Research Tier Router',
      description: 'The orchestrator decides which search provider to use based on the selected tier. Free tier chains Brave → Gemini synthesis. Standard/Deep require a Perplexity API key.',
      code: `async def run_research(
    topic: str,
    tier: str | ResearchTier,
    api_keys: Optional[ApiKeys] = None,
) -> ResearchBundle:
    if isinstance(tier, str):
        tier = ResearchTier(tier)

    pplx_key = (api_keys.perplexity if api_keys else None) \\
               or os.environ.get("PERPLEXITY_API_KEY")

    if tier == ResearchTier.FREE:
        return await _run_free_tier(topic, api_keys, pplx_key, total_start)
    elif tier == ResearchTier.STANDARD:
        return await search_perplexity_sonar(topic, pplx_key)
    elif tier == ResearchTier.DEEP:
        return await deep_research_perplexity(topic, pplx_key)`,
    },
    {
      file: 'backend/report/ioc_extractor.py',
      language: 'python',
      title: 'IOC Regex Patterns',
      description: 'Regex-based indicator extraction. Each pattern targets a specific IOC type. IPv4 validates octet ranges. Hashes match by length (32/40/64 hex chars). CVE follows the standard CVE-YYYY-NNNNN format.',
      code: `# IPv4: dotted quad with octet validation
IPV4_RE = re.compile(
    r"\\b(?:(?:25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)\\.){3}"
    r"(?:25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)\\b"
)

# Hashes by length
MD5_RE = re.compile(r"\\b[a-fA-F0-9]{32}\\b")
SHA1_RE = re.compile(r"\\b[a-fA-F0-9]{40}\\b")
SHA256_RE = re.compile(r"\\b[a-fA-F0-9]{64}\\b")

# CVE IDs
CVE_RE = re.compile(r"\\bCVE-\\d{4}-\\d{4,}\\b", re.IGNORECASE)`,
    },
    {
      file: 'backend/attack/mapper.py',
      language: 'python',
      title: 'ATT&CK Technique Lookup',
      description: 'Lazy-loads enterprise_attack.json (MITRE dataset) and searches by T-code or keyword. Thread-safe with a lock for the initial load.',
      code: `_DATA_PATH = Path(__file__).parent / "enterprise_attack.json"
_TECHNIQUE_DB: list[dict] = []
_DB_LOCK = threading.Lock()

def _load_db() -> list[dict]:
    global _TECHNIQUE_DB
    if not _TECHNIQUE_DB:
        with _DB_LOCK:
            if not _TECHNIQUE_DB:
                with open(_DATA_PATH, "r", encoding="utf-8") as f:
                    _TECHNIQUE_DB = json.load(f)
    return _TECHNIQUE_DB

_TCODE_RE = re.compile(r"\\bT\\d{4}(?:\\.\\d{3})?\\b")

def lookup_technique(query: str) -> list[AttackTechnique]:
    db = _load_db()
    query_upper = query.strip().upper()
    results = []
    for entry in db:
        tid = entry["techniqueId"]
        if query_upper == tid or query_lower in entry["name"].lower():
            results.append(AttackTechnique(...))
    return results`,
    },
    {
      file: 'backend/report/generator.py',
      language: 'python',
      title: 'Confidence Assessment',
      description: 'Assigns confidence levels to report findings based on source convergence. 5+ sources = High, 3-4 = Medium, fewer = Low. Each assessment includes a rationale string.',
      code: `def _assess_confidence(
    source_count: int,
    finding: str,
) -> ConfidenceAssessment:
    if source_count >= 5:
        return ConfidenceAssessment(
            finding=finding,
            confidence=ConfidenceLevel.HIGH,
            rationale=(
                f"High — based on {source_count} converging sources "
                "with consistent reporting across multiple vendors."
            ),
        )
    elif source_count >= 3:
        return ConfidenceAssessment(
            finding=finding,
            confidence=ConfidenceLevel.MEDIUM,
            rationale=f"Medium — {source_count} sources with partial corroboration.",
        )
    else:
        return ConfidenceAssessment(
            finding=finding,
            confidence=ConfidenceLevel.LOW,
            rationale=f"Low — limited to {source_count} source(s).",
        )`,
    },
  ],
  techDecisions: [
    { decision: 'Multi-tier research architecture', reason: 'Free tier (Brave + Gemini) lets users try without API keys. Paid tiers (Perplexity) provide deeper analysis for serious research.' },
    { decision: 'BLUF report methodology', reason: 'Bottom Line Up Front is the intelligence community standard. Executives get the answer first, details follow for analysts.' },
    { decision: 'Chicago NB citations', reason: 'Formal citation style adds credibility and traceability. Each claim links back to its source.' },
    { decision: 'Regex-based IOC extraction', reason: 'Deterministic and fast. No ML model needed for well-defined patterns like IPs, hashes, and CVEs.' },
    { decision: 'Local ATT&CK dataset', reason: 'Offline lookup avoids API rate limits and latency. Dataset updated periodically from MITRE STIX feed.' },
    { decision: 'Zustand over Redux', reason: 'Simpler API for medium-complexity state. Report store, settings store, and research store stay independent.' },
  ],
  apiEndpoints: [
    { method: 'POST', path: '/api/research', description: 'Run research pipeline for a topic + tier' },
    { method: 'POST', path: '/api/research/sources', description: 'Research from user-provided URLs/text' },
    { method: 'POST', path: '/api/report/generate', description: 'Generate BLUF report from research bundle' },
    { method: 'POST', path: '/api/export/markdown', description: 'Export report as formatted Markdown' },
    { method: 'POST', path: '/api/export/html', description: 'Export report as styled HTML' },
    { method: 'GET', path: '/api/attack/lookup?q=', description: 'Search ATT&CK techniques by ID or keyword' },
    { method: 'POST', path: '/api/attack/map', description: 'Extract ATT&CK techniques from text' },
    { method: 'POST', path: '/api/attack/navigator', description: 'Generate ATT&CK Navigator layer JSON' },
    { method: 'GET', path: '/api/health', description: 'Health check with API key availability' },
  ],
};

const broHunter: RepoDetailData = {
  overview:
    'Bro Hunter is a threat hunting platform for analyzing Zeek (formerly Bro) and Suricata network logs. Users upload log files or PCAP captures, and the system parses them into structured records, runs behavioral analysis (beaconing detection, DNS anomalies, long connections), maps findings to MITRE ATT&CK, and provides an investigation workflow with case management. The backend is Python/FastAPI with 20+ analysis services. The frontend is React with 5 variant themes, real-time charts, and a hex packet viewer.',
  architectureLayers: [
    {
      label: 'Data Ingestion',
      color: '#06b6d4',
      nodes: [
        { id: 'zeek-upload', label: 'Zeek Logs', description: 'conn.log, dns.log, http.log, ssl.log, files.log', color: '#06b6d4' },
        { id: 'suricata-upload', label: 'Suricata EVE', description: 'eve.json alert and flow records', color: '#0891b2' },
        { id: 'pcap-upload', label: 'PCAP Files', description: 'Raw packet captures converted via tshark', color: '#0e7490' },
      ],
    },
    {
      label: 'Parsing Layer',
      color: '#f59e0b',
      nodes: [
        { id: 'zeek-parser', label: 'Zeek Parser', description: 'Tab-separated value parser with field type coercion', color: '#f59e0b' },
        { id: 'suricata-parser', label: 'Suricata Parser', description: 'JSON EVE log parser with alert extraction', color: '#d97706' },
        { id: 'unified', label: 'Unified Parser', description: 'Auto-detects format, routes to correct parser', color: '#b45309' },
        { id: 'pcap-converter', label: 'PCAP Converter', description: 'Converts PCAP to Zeek logs via tshark subprocess', color: '#92400e' },
      ],
    },
    {
      label: 'Analysis Services',
      color: '#ef4444',
      nodes: [
        { id: 'beacon', label: 'Beacon Analyzer', description: 'Detects C2 beaconing via interval regularity scoring', color: '#ef4444' },
        { id: 'dns-analyzer', label: 'DNS Analyzer', description: 'DGA detection, tunneling, fast-flux, NXDOMAIN spikes', color: '#dc2626' },
        { id: 'threat-engine', label: 'Unified Threat Engine', description: 'Combines all analyzers, scores hosts, maps to ATT&CK', color: '#b91c1c' },
        { id: 'session-recon', label: 'Session Reconstructor', description: 'Rebuilds full TCP sessions from connection logs', color: '#991b1b' },
        { id: 'anomaly', label: 'Anomaly Detector', description: 'Baseline deviation scoring for traffic patterns', color: '#7f1d1d' },
      ],
    },
    {
      label: 'Output & Investigation',
      color: '#10b981',
      nodes: [
        { id: 'dashboard', label: 'Dashboard', description: 'Threat heatmaps, severity donuts, timeline charts', color: '#10b981' },
        { id: 'cases', label: 'Case Manager', description: 'Create cases, attach evidence, track investigations', color: '#059669' },
        { id: 'reports', label: 'Report Generator', description: 'PDF/Markdown reports with executive summaries', color: '#047857' },
        { id: 'sigma', label: 'Sigma Converter', description: 'Convert findings to Sigma detection rules', color: '#065f46' },
      ],
    },
  ],
  architectureEdges: [
    { from: 'zeek-upload', to: 'zeek-parser', label: 'raw logs' },
    { from: 'suricata-upload', to: 'suricata-parser', label: 'eve.json' },
    { from: 'pcap-upload', to: 'pcap-converter', label: 'raw packets' },
    { from: 'pcap-converter', to: 'zeek-parser', label: 'converted logs' },
    { from: 'zeek-parser', to: 'unified', label: 'parsed records' },
    { from: 'suricata-parser', to: 'unified', label: 'parsed records' },
    { from: 'unified', to: 'beacon', label: 'connection data' },
    { from: 'unified', to: 'dns-analyzer', label: 'DNS records' },
    { from: 'unified', to: 'threat-engine', label: 'all records' },
    { from: 'unified', to: 'session-recon', label: 'flow data' },
    { from: 'unified', to: 'anomaly', label: 'traffic stats' },
    { from: 'threat-engine', to: 'dashboard', label: 'scored threats' },
    { from: 'threat-engine', to: 'cases', label: 'high-severity findings' },
    { from: 'cases', to: 'reports', label: 'case data' },
    { from: 'threat-engine', to: 'sigma', label: 'detection patterns' },
  ],
  dataFlow: [
    { step: 1, title: 'Log Upload', description: 'User uploads Zeek logs (conn.log, dns.log, etc.), Suricata eve.json, or raw PCAP files. The unified parser auto-detects the format and routes to the correct parser.' },
    { step: 2, title: 'Parsing & Normalization', description: 'Zeek parser handles tab-separated fields with type coercion (timestamps, integers, sets). Suricata parser extracts alert metadata from JSON. PCAPs are first converted to Zeek format via tshark subprocess.' },
    { step: 3, title: 'Behavioral Analysis', description: 'Multiple analysis services run in parallel. Beacon analyzer scores connection intervals for C2 regularity. DNS analyzer checks for DGA patterns, tunneling (high entropy + long queries), and fast-flux domains.' },
    { step: 4, title: 'Threat Scoring', description: 'The unified threat engine aggregates findings from all analyzers, calculates per-host risk scores, and maps behaviors to MITRE ATT&CK techniques (T1071 for beaconing, T1048 for DNS tunneling, etc.).' },
    { step: 5, title: 'Investigation', description: 'High-severity threats surface in the dashboard with heatmaps and timelines. Analysts can create cases, attach evidence, reconstruct TCP sessions, and inspect raw packets in the hex viewer.' },
    { step: 6, title: 'Output', description: 'Findings export as Sigma rules (for SIEM integration), PDF/Markdown reports (for stakeholders), or IOC lists. Cases track the full investigation lifecycle.' },
  ],
  codeSnippets: [
    {
      file: 'api/services/beacon_analyzer.py',
      language: 'python',
      title: 'C2 Beacon Detection',
      description: 'Detects command-and-control beaconing by analyzing connection interval regularity. Groups connections by src/dst pair, calculates interval standard deviation, and scores based on how consistent the timing is. Low jitter + regular intervals = high beacon score.',
      code: `def analyze_beacons(connections: list[dict]) -> list[BeaconResult]:
    # Group connections by (src_ip, dst_ip, dst_port)
    groups = defaultdict(list)
    for conn in connections:
        key = (conn["src_ip"], conn["dst_ip"], conn["dst_port"])
        groups[key].append(conn["timestamp"])

    results = []
    for (src, dst, port), timestamps in groups.items():
        if len(timestamps) < MIN_BEACON_COUNT:
            continue
        timestamps.sort()
        intervals = [t2 - t1 for t1, t2 in zip(timestamps, timestamps[1:])]
        avg_interval = statistics.mean(intervals)
        std_dev = statistics.stdev(intervals) if len(intervals) > 1 else 0
        # Score: lower jitter = higher beacon probability
        jitter_ratio = std_dev / avg_interval if avg_interval > 0 else 1
        score = max(0, 100 - int(jitter_ratio * 100))
        if score >= BEACON_THRESHOLD:
            results.append(BeaconResult(
                src_ip=src, dst_ip=dst, dst_port=port,
                count=len(timestamps), avg_interval=avg_interval,
                jitter=jitter_ratio, score=score,
            ))
    return sorted(results, key=lambda r: r.score, reverse=True)`,
    },
    {
      file: 'api/parsers/zeek_parser.py',
      language: 'python',
      title: 'Zeek Log Parser',
      description: 'Parses Zeek\'s tab-separated log format. Reads the #fields header to determine column names, then maps each line into a typed dictionary. Handles Zeek-specific types: timestamps (epoch float), sets (comma-separated in field), and the "-" empty marker.',
      code: `def parse_zeek_log(content: str) -> list[dict]:
    lines = content.strip().split("\\n")
    fields = []
    types = []
    records = []

    for line in lines:
        if line.startswith("#fields"):
            fields = line.split("\\t")[1:]
        elif line.startswith("#types"):
            types = line.split("\\t")[1:]
        elif not line.startswith("#"):
            values = line.split("\\t")
            record = {}
            for i, val in enumerate(values):
                if i >= len(fields):
                    break
                field = fields[i]
                if val == "-":
                    record[field] = None
                elif types[i] == "time":
                    record[field] = float(val)
                elif types[i] in ("count", "port"):
                    record[field] = int(val)
                elif types[i] == "set[string]":
                    record[field] = val.split(",")
                else:
                    record[field] = val
            records.append(record)
    return records`,
    },
    {
      file: 'api/services/dns_analyzer.py',
      language: 'python',
      title: 'DNS Threat Detection',
      description: 'Detects DNS-based threats: DGA domains (high entropy + random-looking labels), DNS tunneling (unusually long queries or high query volume to single domain), fast-flux (rapid IP rotation), and NXDOMAIN floods.',
      code: `def calculate_entropy(domain: str) -> float:
    """Shannon entropy of domain label characters."""
    label = domain.split(".")[0].lower()
    if not label:
        return 0.0
    freq = Counter(label)
    length = len(label)
    return -sum(
        (count / length) * math.log2(count / length)
        for count in freq.values()
    )

def detect_dga(queries: list[dict]) -> list[DGAResult]:
    results = []
    for q in queries:
        domain = q["query"]
        entropy = calculate_entropy(domain)
        label_len = len(domain.split(".")[0])
        # DGA heuristic: high entropy + long random label
        if entropy > DGA_ENTROPY_THRESHOLD and label_len > DGA_LENGTH_THRESHOLD:
            results.append(DGAResult(
                domain=domain, entropy=entropy,
                label_length=label_len, confidence="high"
            ))
    return results`,
    },
  ],
  techDecisions: [
    { decision: 'Unified parser with auto-detection', reason: 'Users shouldn\'t need to specify format. The parser checks for Zeek headers (#separator, #fields) vs JSON structure to route automatically.' },
    { decision: 'Behavioral analysis over signature-only', reason: 'Signatures catch known threats. Behavioral analysis (beaconing, entropy) catches novel C2 and exfiltration techniques.' },
    { decision: 'Per-host risk scoring', reason: 'Aggregating findings per host gives SOC analysts a prioritized list. One host with beacon + DNS anomaly + long connection = investigate first.' },
    { decision: 'PCAP to Zeek conversion', reason: 'Zeek produces richer metadata than raw PCAP parsing. Converting first gives consistent data regardless of input format.' },
    { decision: 'Sigma rule export', reason: 'Sigma is the universal detection format. Exporting findings as Sigma rules lets analysts deploy detections directly to their SIEM.' },
    { decision: '5 frontend variant themes', reason: 'Portfolio showcase: same data, different visual approaches. Demonstrates UI/UX flexibility without code duplication.' },
  ],
  apiEndpoints: [
    { method: 'POST', path: '/api/ingest', description: 'Upload and parse log files (Zeek/Suricata/PCAP)' },
    { method: 'GET', path: '/api/analysis/beacons', description: 'Get beacon detection results' },
    { method: 'GET', path: '/api/analysis/dns-threats', description: 'Get DNS anomaly findings' },
    { method: 'GET', path: '/api/hunt', description: 'Run threat hunting queries' },
    { method: 'GET', path: '/api/hosts', description: 'Host inventory with risk scores' },
    { method: 'POST', path: '/api/cases', description: 'Create investigation case' },
    { method: 'GET', path: '/api/sessions/{id}', description: 'Reconstruct TCP session' },
    { method: 'GET', path: '/api/packets/{id}', description: 'Inspect packet hex dump' },
    { method: 'GET', path: '/api/sigma/convert', description: 'Convert findings to Sigma rules' },
    { method: 'POST', path: '/api/export/report', description: 'Generate investigation report' },
    { method: 'GET', path: '/api/analytics/trends', description: 'Traffic trend analysis' },
    { method: 'GET', path: '/api/anomalies', description: 'Baseline deviation anomalies' },
  ],
};

const socShowcase: RepoDetailData = {
  overview:
    'SOC Showcase is an interactive portfolio piece that visualizes a complete Security Operations Center stack. It presents the architecture of 9 integrated SOC tools across 4 layers (AI, MCP, SOC Infrastructure, Network), shows animated data flow pipelines through 7 incident response stages, and demonstrates real investigation cases. Built as a single React SPA with structured data driving all visualizations.',
  architectureLayers: [
    {
      label: 'AI Layer',
      color: '#aa66ff',
      nodes: [
        { id: 'llm', label: 'LLM Engine', description: 'AI reasoning for alert triage and threat correlation', color: '#aa66ff' },
        { id: 'orchestrator', label: 'AI Orchestrator', description: 'MCP-based agent orchestration layer', color: '#8844dd' },
        { id: 'analyst', label: 'SOC Analyst', description: 'Human-in-the-loop oversight', color: '#6622bb' },
      ],
    },
    {
      label: 'MCP Layer',
      color: '#00f0ff',
      nodes: [
        { id: 'wazuh-mcp', label: 'Wazuh MCP', description: 'SIEM integration bridge', color: '#00f0ff' },
        { id: 'thehive-mcp', label: 'TheHive MCP', description: 'Incident response bridge', color: '#00ccff' },
        { id: 'cortex-mcp', label: 'Cortex MCP', description: 'Observable analysis bridge', color: '#0099ff' },
        { id: 'misp-mcp', label: 'MISP MCP', description: 'Threat intel bridge', color: '#0066ff' },
      ],
    },
    {
      label: 'SOC Infrastructure',
      color: '#10b981',
      nodes: [
        { id: 'wazuh', label: 'Wazuh SIEM', description: 'Log collection, correlation, alerting', color: '#10b981' },
        { id: 'thehive', label: 'TheHive 5', description: 'Case management and incident tracking', color: '#059669' },
        { id: 'cortex', label: 'Cortex', description: 'Automated observable analysis', color: '#047857' },
        { id: 'misp', label: 'MISP', description: 'Threat intelligence platform', color: '#065f46' },
      ],
    },
    {
      label: 'Network Detection',
      color: '#f59e0b',
      nodes: [
        { id: 'suricata', label: 'Suricata', description: 'Signature-based IDS/IPS', color: '#f59e0b' },
        { id: 'zeek', label: 'Zeek', description: 'Network metadata and behavioral analysis', color: '#d97706' },
      ],
    },
  ],
  architectureEdges: [
    { from: 'analyst', to: 'orchestrator', label: 'directs' },
    { from: 'orchestrator', to: 'llm', label: 'prompts' },
    { from: 'orchestrator', to: 'wazuh-mcp', label: 'tool calls' },
    { from: 'orchestrator', to: 'thehive-mcp', label: 'tool calls' },
    { from: 'orchestrator', to: 'cortex-mcp', label: 'tool calls' },
    { from: 'orchestrator', to: 'misp-mcp', label: 'tool calls' },
    { from: 'wazuh-mcp', to: 'wazuh', label: 'API' },
    { from: 'thehive-mcp', to: 'thehive', label: 'API' },
    { from: 'cortex-mcp', to: 'cortex', label: 'API' },
    { from: 'misp-mcp', to: 'misp', label: 'API' },
    { from: 'suricata', to: 'wazuh', label: 'alerts' },
    { from: 'zeek', to: 'wazuh', label: 'logs' },
  ],
  dataFlow: [
    { step: 1, title: 'Alert Ingestion', description: 'Raw alerts flow in from Wazuh, Suricata, Zeek, and external feeds. Normalized into a common schema for processing.' },
    { step: 2, title: 'Enrichment', description: 'Alerts enriched with MISP threat intel, GeoIP data, asset inventory context, and historical correlation.' },
    { step: 3, title: 'Triage', description: 'AI-assisted severity scoring and deduplication. Alerts categorized by type, prioritized by risk, grouped by related indicators.' },
    { step: 4, title: 'Investigation', description: 'Deep-dive analysis using Cortex analyzers, TheHive case management, and AI-powered threat hunting across telemetry.' },
    { step: 5, title: 'Containment', description: 'Isolate affected systems, block malicious IPs/domains, disable compromised accounts via Cortex responders or manual playbook steps.' },
    { step: 6, title: 'Eradication', description: 'Remove malware, patch vulnerabilities, rotate credentials. Verified through re-scanning and validation checks.' },
    { step: 7, title: 'Lessons Learned', description: 'Post-incident review, update detection rules, refine playbooks, share IOCs with MISP community feeds.' },
  ],
  codeSnippets: [
    {
      file: 'src/data/pipeline.ts',
      language: 'typescript',
      title: 'Pipeline Step Definition',
      description: 'Each stage of the incident response pipeline is defined as a typed object with inputs, outputs, and metadata. The frontend renders these as an animated flow diagram.',
      code: `export const pipelineSteps: PipelineStep[] = [
  {
    id: 'alert-ingestion',
    name: 'Alert Ingestion',
    description: 'Raw alerts flow in from Wazuh, Suricata, Zeek...',
    order: 1,
    icon: 'Download',
    color: '#00f0ff',
    inputs: ['Wazuh Alerts', 'Suricata EVE', 'Zeek Logs', 'External Feeds'],
    outputs: ['Normalized Alert Queue'],
  },
  // ... 6 more stages through Lessons Learned
];`,
    },
    {
      file: 'src/data/architecture.ts',
      language: 'typescript',
      title: 'Architecture Layer Rendering Data',
      description: 'The architecture visualization is driven by coordinate-based node positioning across layers. Each node has x/y position, dimensions, color, and description. Edges define connections between nodes.',
      code: `export const architectureLayers: ArchitectureLayer[] = [
  {
    id: 'ai-layer',
    label: 'AI Layer',
    color: '#aa66ff',
    y: 0,
    height: 140,
    nodes: [
      {
        id: 'claude',
        label: 'LLM Engine',
        layer: 'ai',
        x: 100, y: 40,
        width: 140, height: 60,
        color: '#aa66ff',
        description: 'AI reasoning engine for alert triage...',
      },
      // ... more nodes
    ],
  },
  // ... MCP Layer, SOC Infrastructure, Network Detection
];`,
    },
  ],
  techDecisions: [
    { decision: 'Data-driven architecture visualization', reason: 'All nodes, edges, and layers defined in TypeScript data files. The renderer is generic; changing the architecture means editing data, not components.' },
    { decision: '7-stage IR pipeline model', reason: 'Follows NIST SP 800-61 incident response lifecycle. Each stage maps to real SOC workflows with tool assignments.' },
    { decision: 'Case studies with real scenarios', reason: 'Demonstrates the SOC stack handling actual incident types (phishing, lateral movement, data exfiltration) rather than abstract capabilities.' },
  ],
};


const playbookForge: RepoDetailData = {
  overview:
    'Playbook Forge is a SOC playbook parser and visual editor. Users paste Markdown or Mermaid flowchart definitions, and the system parses them into node/edge graphs rendered with React Flow. The Python/FastAPI backend handles parsing (Markdown headers → steps, Mermaid syntax → nodes/edges). The React frontend provides an interactive canvas for viewing, editing, and exporting playbooks. Includes a SOAR action library for mapping steps to automated responses.',
  architectureLayers: [
    {
      label: 'Input Formats',
      color: '#06b6d4',
      nodes: [
        { id: 'markdown', label: 'Markdown', description: 'Structured playbook in Markdown with headers as steps', color: '#06b6d4' },
        { id: 'mermaid', label: 'Mermaid Flowchart', description: 'flowchart TD/LR syntax with node shapes and edges', color: '#0891b2' },
      ],
    },
    {
      label: 'Parsing Engine (Python)',
      color: '#f59e0b',
      nodes: [
        { id: 'md-parser', label: 'Markdown Parser', description: 'Extracts headers, decision points, and SOAR actions', color: '#f59e0b' },
        { id: 'mermaid-parser', label: 'Mermaid Parser', description: 'Regex-based syntax parser for flowchart definitions', color: '#d97706' },
        { id: 'auto-detect', label: 'Format Detector', description: 'Auto-detects markdown vs mermaid from content', color: '#b45309' },
      ],
    },
    {
      label: 'Graph Model',
      color: '#7c5cfc',
      nodes: [
        { id: 'nodes', label: 'PlaybookNode[]', description: 'Steps, decisions, phases with type and metadata', color: '#7c5cfc' },
        { id: 'edges', label: 'PlaybookEdge[]', description: 'Connections with optional labels (yes/no branches)', color: '#6d4edb' },
      ],
    },
    {
      label: 'React Flow Canvas',
      color: '#10b981',
      nodes: [
        { id: 'viewer', label: 'Playbook Viewer', description: 'Interactive flowchart with drag, zoom, and pan', color: '#10b981' },
        { id: 'library', label: 'Playbook Library', description: 'Pre-built playbooks for common incident types', color: '#059669' },
        { id: 'export', label: 'Export', description: 'SVG, PNG, and JSON export of flowcharts', color: '#047857' },
      ],
    },
  ],
  architectureEdges: [
    { from: 'markdown', to: 'auto-detect', label: 'raw text' },
    { from: 'mermaid', to: 'auto-detect', label: 'raw text' },
    { from: 'auto-detect', to: 'md-parser', label: 'if markdown' },
    { from: 'auto-detect', to: 'mermaid-parser', label: 'if mermaid' },
    { from: 'md-parser', to: 'nodes', label: 'graph' },
    { from: 'mermaid-parser', to: 'nodes', label: 'graph' },
    { from: 'nodes', to: 'viewer', label: 'render' },
    { from: 'edges', to: 'viewer', label: 'render' },
    { from: 'viewer', to: 'export', label: 'capture' },
  ],
  dataFlow: [
    { step: 1, title: 'Content Input', description: 'User pastes a playbook in Markdown (with ## headers as steps) or Mermaid flowchart syntax. The format detector checks for "flowchart" or "graph" keywords to auto-route.' },
    { step: 2, title: 'Parsing', description: 'Markdown parser extracts headers as step nodes, bullet lists as details, and "Decision:" markers as branching points. Mermaid parser uses regex to extract node shapes ([] = step, {} = decision, (()) = phase) and edge types (--> solid, -.-> dotted).' },
    { step: 3, title: 'Graph Construction', description: 'Both parsers output the same PlaybookGraph model: an array of typed nodes and labeled edges. Subgraphs in Mermaid become phase/group nodes.' },
    { step: 4, title: 'React Flow Rendering', description: 'The graph model maps to React Flow nodes (custom components per type: step, decision, phase, execute) and edges. Auto-layout positions nodes in a readable flow.' },
    { step: 5, title: 'Export', description: 'Playbooks export as JSON (for sharing/importing), SVG/PNG (for documentation), or can be saved to the library for reuse.' },
  ],
  codeSnippets: [
    {
      file: 'api/parsers/mermaid_parser.py',
      language: 'python',
      title: 'Mermaid Flowchart Parser',
      description: 'Converts Mermaid syntax into a graph. Uses regex patterns to match node shapes (brackets = step, braces = decision, double-parens = phase) and edge types (arrow style determines edge weight). Handles subgraphs as nested phase nodes.',
      code: `class MermaidParser:
    NODE_PATTERNS = {
        r'\\[([^\\]]+)\\]': 'step',        # [text] -> step
        r'\\{([^\\}]+)\\}': 'decision',    # {text} -> decision
        r'\\(\\(([^\\)]+)\\)\\)': 'phase', # ((text)) -> phase
        r'\\(([^\\)]+)\\)': 'step',        # (text) -> rounded step
    }

    EDGE_PATTERNS = [
        (r'--\\s*([^-]+?)\\s*-->', 'solid'),    # --text-->
        (r'-.\\s*([^-]+?)\\s*.->', 'dotted'),   # -.text.->
        (r'==\\s*([^=]+?)\\s*==>', 'bold'),     # ==text==>
        (r'-->', 'solid'),                       # -->
    ]

    def parse(self, content: str) -> PlaybookGraph:
        self.nodes = []
        self.edges = []
        for line in content.strip().split("\\n"):
            line = line.strip()
            if line.startswith("subgraph"):
                self._handle_subgraph(line)
            elif any(arrow in line for arrow in ["-->", ".->", "==>"]):
                self._parse_edge_line(line)
            elif self._looks_like_node(line):
                self._parse_node_definition(line)
        return PlaybookGraph(nodes=self.nodes, edges=self.edges)`,
    },
  ],
  techDecisions: [
    { decision: 'Dual-format input (Markdown + Mermaid)', reason: 'Markdown is natural for writers. Mermaid is natural for developers. Supporting both means playbooks can come from wikis, READMEs, or diagram tools.' },
    { decision: 'Python backend for parsing', reason: 'Regex-heavy parsing is cleaner in Python. FastAPI serves the parsed graph to the React frontend via REST.' },
    { decision: 'React Flow for rendering', reason: 'Handles complex graph layouts with built-in pan/zoom, edge routing, and custom node components. No need to build canvas interactions from scratch.' },
    { decision: 'Custom node types per step kind', reason: 'Decision nodes get diamond shapes, execute nodes get highlighted borders, phase nodes get group backgrounds. Visual distinction aids quick comprehension.' },
  ],
  apiEndpoints: [
    { method: 'POST', path: '/api/parse', description: 'Parse markdown or mermaid into graph (auto-detects format)' },
    { method: 'GET', path: '/api/playbooks', description: 'List saved playbooks in library' },
    { method: 'POST', path: '/api/playbooks', description: 'Save playbook to library' },
    { method: 'GET', path: '/api/playbooks/{id}', description: 'Get specific playbook by ID' },
  ],
};


const intelWorkbench: RepoDetailData = {
  overview:
    'Intel Workbench is a structured analytic technique (SAT) platform for intelligence analysis. The core feature is an Analysis of Competing Hypotheses (ACH) matrix where analysts define hypotheses, add evidence items with credibility/relevance scores, and rate each evidence-hypothesis pair as Consistent, Inconsistent, or Neutral. Includes a cognitive bias checklist (20+ biases) and STIX 2.1 export. All state managed locally via Zustand with localStorage persistence.',
  architectureLayers: [
    {
      label: 'Project Management',
      color: '#06b6d4',
      nodes: [
        { id: 'projects', label: 'Projects', description: 'Named analysis projects containing matrices and checklists', color: '#06b6d4' },
      ],
    },
    {
      label: 'Analysis Tools',
      color: '#7c5cfc',
      nodes: [
        { id: 'ach', label: 'ACH Matrix', description: 'Evidence vs hypotheses consistency matrix with weighted scoring', color: '#7c5cfc' },
        { id: 'bias', label: 'Bias Checklist', description: '20+ cognitive biases with mitigation notes per bias', color: '#6d4edb' },
      ],
    },
    {
      label: 'Evidence Layer',
      color: '#f59e0b',
      nodes: [
        { id: 'evidence', label: 'Evidence Items', description: 'Source, credibility (H/M/L), relevance (H/M/L)', color: '#f59e0b' },
        { id: 'ratings', label: 'Consistency Ratings', description: 'C (Consistent), I (Inconsistent), N (Neutral), NA', color: '#d97706' },
      ],
    },
    {
      label: 'Output',
      color: '#10b981',
      nodes: [
        { id: 'scoring', label: 'Hypothesis Scoring', description: 'Weighted inconsistency count determines least-refuted hypothesis', color: '#10b981' },
        { id: 'stix-export', label: 'STIX 2.1 Export', description: 'Export analysis as STIX bundle for sharing', color: '#059669' },
      ],
    },
  ],
  architectureEdges: [
    { from: 'projects', to: 'ach', label: 'contains' },
    { from: 'projects', to: 'bias', label: 'contains' },
    { from: 'evidence', to: 'ratings', label: 'rated against hypotheses' },
    { from: 'ratings', to: 'scoring', label: 'aggregated' },
    { from: 'ach', to: 'stix-export', label: 'export' },
  ],
  dataFlow: [
    { step: 1, title: 'Project Setup', description: 'Analyst creates a project and defines competing hypotheses (e.g., "Nation-state APT", "Insider threat", "Opportunistic criminal"). Each hypothesis gets a name and description.' },
    { step: 2, title: 'Evidence Collection', description: 'Add evidence items with metadata: description, source attribution, credibility rating (High/Medium/Low), and relevance rating (High/Medium/Low).' },
    { step: 3, title: 'Matrix Rating', description: 'For each evidence-hypothesis pair, rate consistency: C (evidence supports hypothesis), I (evidence contradicts), N (neutral/irrelevant), NA (not applicable). This creates the core ACH matrix.' },
    { step: 4, title: 'Hypothesis Scoring', description: 'The ACH methodology scores by inconsistency count: the hypothesis with the FEWEST "I" ratings is the least refuted, therefore most likely. Weighted by evidence credibility and relevance.' },
    { step: 5, title: 'Bias Review', description: 'Analyst reviews the cognitive bias checklist: anchoring, confirmation bias, mirror imaging, etc. Each bias can be marked as checked with mitigation notes.' },
    { step: 6, title: 'Export', description: 'Analysis exported as STIX 2.1 bundle for sharing with other analysts or ingestion into threat intel platforms.' },
  ],
  codeSnippets: [
    {
      file: 'src/types/index.ts',
      language: 'typescript',
      title: 'ACH Data Model',
      description: 'The core type definitions. An ACH matrix contains hypotheses and evidence arrays, plus a ratings map keyed by evidence ID → hypothesis ID → consistency rating. This nested Record structure enables O(1) lookup for any cell in the matrix.',
      code: `export type ConsistencyRating = 'C' | 'I' | 'N' | 'NA';

export interface Evidence {
  id: string;
  description: string;
  source: string;
  credibility: 'High' | 'Medium' | 'Low';
  relevance: 'High' | 'Medium' | 'Low';
}

export interface Hypothesis {
  id: string;
  name: string;
  description: string;
}

export interface ACHMatrix {
  id: string;
  name: string;
  hypotheses: Hypothesis[];
  evidence: Evidence[];
  // evidence.id -> hypothesis.id -> rating
  ratings: Record<string, Record<string, ConsistencyRating>>;
  createdAt: string;
  updatedAt: string;
}`,
    },
    {
      file: 'src/data/biasData.ts',
      language: 'typescript',
      title: 'Cognitive Bias Definitions',
      description: 'The bias checklist covers 20+ cognitive biases organized by category. Each bias has a description and category. Analysts mark biases as checked and add mitigation notes specific to their analysis.',
      code: `export interface CognitiveBias {
  id: string;
  name: string;
  description: string;
  category: string;
  checked: boolean;
  mitigationNotes: string;
}

// Example biases (20+ total):
// Anchoring - Over-relying on first piece of information
// Confirmation Bias - Favoring evidence that confirms existing beliefs
// Mirror Imaging - Assuming adversary thinks like you do
// Availability Heuristic - Overweighting easily recalled events
// Groupthink - Conforming to team consensus over independent analysis`,
    },
  ],
  techDecisions: [
    { decision: 'ACH methodology (Richards Heuer)', reason: 'Standard CIA/IC analytic technique. Forces explicit evaluation of all evidence against all hypotheses, reducing cognitive bias.' },
    { decision: 'Client-side only (no backend)', reason: 'Sensitive intelligence analysis shouldn\'t require uploading data to a server. Everything stays in the browser with localStorage.' },
    { decision: 'Zustand with localStorage persistence', reason: 'Simple state management with automatic persistence. Projects survive page refreshes without a database.' },
    { decision: 'STIX 2.1 export', reason: 'Industry standard for sharing threat intelligence. Enables interoperability with other CTI platforms.' },
    { decision: 'Nested Record for ratings', reason: 'O(1) cell lookup in the ACH matrix. ratings[evidenceId][hypothesisId] is instant regardless of matrix size.' },
  ],
};

const proxguard: RepoDetailData = {
  overview:
    'ProxGuard is a security auditor for Proxmox VE configurations. Users provide Proxmox config files (sshd_config, user.cfg, cluster.fw, storage.cfg, lxc.conf), and the engine parses each file type, runs security rules against the parsed config, and generates a graded audit report. Scoring uses weighted categories (SSH 25%, Firewall 25%, Auth 20%, Container 15%, Storage 10%, API 5%) with severity-based deductions. Includes sample configs at three security levels: insecure, partial, hardened.',
  architectureLayers: [
    {
      label: 'Config Input',
      color: '#06b6d4',
      nodes: [
        { id: 'sshd', label: 'sshd_config', description: 'SSH daemon configuration file', color: '#06b6d4' },
        { id: 'users', label: 'user.cfg', description: 'Proxmox user and role definitions', color: '#0891b2' },
        { id: 'firewall', label: 'cluster.fw', description: 'Proxmox cluster firewall rules', color: '#0e7490' },
        { id: 'storage', label: 'storage.cfg', description: 'Storage backend configuration', color: '#155e75' },
        { id: 'lxc', label: 'lxc.conf', description: 'Container security settings', color: '#164e63' },
      ],
    },
    {
      label: 'Parsing Engine',
      color: '#f59e0b',
      nodes: [
        { id: 'ssh-parser', label: 'SSH Parser', description: 'Extracts directives: PermitRootLogin, PasswordAuth, MaxAuthTries', color: '#f59e0b' },
        { id: 'fw-parser', label: 'Firewall Parser', description: 'Extracts rules, IP sets, policy defaults, enable state', color: '#d97706' },
        { id: 'user-parser', label: 'User Parser', description: 'Extracts users, roles, ACLs, token expiry', color: '#b45309' },
      ],
    },
    {
      label: 'Audit Engine',
      color: '#ef4444',
      nodes: [
        { id: 'rules', label: 'Security Rules', description: 'Per-category rules with severity: critical, high, medium, info', color: '#ef4444' },
        { id: 'scoring', label: 'Scoring Engine', description: 'Weighted category scores with severity deductions', color: '#dc2626' },
      ],
    },
    {
      label: 'Report',
      color: '#10b981',
      nodes: [
        { id: 'grade', label: 'Letter Grade', description: 'A (90+) through F (<60) overall security grade', color: '#10b981' },
        { id: 'findings', label: 'Findings List', description: 'Pass/fail per rule with remediation guidance', color: '#059669' },
        { id: 'history', label: 'Audit History', description: 'Track security posture over time', color: '#047857' },
      ],
    },
  ],
  architectureEdges: [
    { from: 'sshd', to: 'ssh-parser', label: 'raw config' },
    { from: 'users', to: 'user-parser', label: 'raw config' },
    { from: 'firewall', to: 'fw-parser', label: 'raw config' },
    { from: 'ssh-parser', to: 'rules', label: 'parsed config' },
    { from: 'fw-parser', to: 'rules', label: 'parsed config' },
    { from: 'user-parser', to: 'rules', label: 'parsed config' },
    { from: 'rules', to: 'scoring', label: 'pass/fail results' },
    { from: 'scoring', to: 'grade', label: 'weighted score' },
    { from: 'rules', to: 'findings', label: 'detailed results' },
  ],
  dataFlow: [
    { step: 1, title: 'Config Selection', description: 'User selects a security profile (insecure/partial/hardened sample configs) or pastes their own Proxmox configuration files.' },
    { step: 2, title: 'Parsing', description: 'Each config file type has a dedicated parser. SSH parser extracts key directives (PermitRootLogin, PasswordAuthentication, etc.). Firewall parser extracts rules, policies, and IP sets. User parser extracts accounts, roles, and ACLs.' },
    { step: 3, title: 'Rule Evaluation', description: 'Security rules run against parsed configs. Each rule has a category, severity, and check function. Example: "PermitRootLogin should be no" (SSH, critical). Rules return pass/fail with evidence.' },
    { step: 4, title: 'Scoring', description: 'Category scores start at 100 and deduct per failed rule: critical=-40, high=-25, medium=-10, info=-5. Overall score is a weighted average across categories.' },
    { step: 5, title: 'Report Generation', description: 'Final report shows letter grade (A-F), per-category breakdown with scores, and individual findings with remediation steps. History page tracks scores over time.' },
  ],
  codeSnippets: [
    {
      file: 'src/utils/scoring.ts',
      language: 'typescript',
      title: 'Weighted Scoring Engine',
      description: 'The scoring system uses category weights and severity-based deductions. SSH and Firewall carry the most weight (25% each) since they\'re the primary attack surface. Category scores floor at 0.',
      code: `const CATEGORY_WEIGHTS: Record<AuditCategory, number> = {
  ssh: 25, auth: 20, firewall: 25,
  container: 15, storage: 10, api: 5,
};

const SEVERITY_DEDUCTIONS: Record<Severity, number> = {
  critical: 40, high: 25, medium: 10, info: 5,
};

export function scoreToGrade(score: number): Grade {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

export function calculateCategoryScore(
  category: AuditCategory,
  findings: Finding[]
): CategoryScore {
  let score = 100;
  for (const finding of findings) {
    if (!finding.result.passed) {
      score -= SEVERITY_DEDUCTIONS[finding.rule.severity];
    }
  }
  return { category, score: Math.max(0, score), findings, maxScore: 100 };
}

export function calculateOverallScore(categories: CategoryScore[]): number {
  let totalWeight = 0, weightedSum = 0;
  for (const cat of categories) {
    const weight = CATEGORY_WEIGHTS[cat.category];
    weightedSum += cat.score * weight;
    totalWeight += weight;
  }
  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}`,
    },
  ],
  techDecisions: [
    { decision: 'Client-side audit engine', reason: 'Security configs shouldn\'t be uploaded to external servers. All parsing and scoring runs in the browser.' },
    { decision: 'CIS-aligned category weights', reason: 'SSH and firewall weighted highest because they\'re the primary attack surface on exposed Proxmox hosts.' },
    { decision: 'Severity-based deductions', reason: 'A single critical finding (e.g., root login enabled) should tank the category score. -40 for critical ensures this.' },
    { decision: 'Sample configs at three levels', reason: 'Users can see what insecure, partial, and hardened configs look like. Educational value plus easy demo.' },
  ],
};

const socStack: RepoDetailData = {
  overview:
    'SOC Stack is an automated deployment toolkit for spinning up a complete Security Operations Center on Proxmox VE. A single install script deploys Wazuh (SIEM), TheHive (IR), Cortex (SOAR), MISP (threat intel), Zeek (NSM), and Suricata (IDS/IPS) as LXC containers or VMs. Includes 7 MCP servers for AI integration, remediation playbooks, mock data generators for demos, and pre-built dashboards. The project is the deployment automation behind the SOC Showcase portfolio piece.',
  architectureLayers: [
    {
      label: 'Deployment Scripts',
      color: '#06b6d4',
      nodes: [
        { id: 'installer', label: 'install.sh', description: 'Interactive whiptail installer with component selection', color: '#06b6d4' },
        { id: 'setup', label: 'Setup Scripts', description: 'Per-component setup: wazuh.sh, thehive.sh, cortex.sh, etc.', color: '#0891b2' },
      ],
    },
    {
      label: 'SOC Components',
      color: '#10b981',
      nodes: [
        { id: 'wazuh', label: 'Wazuh 4.x', description: 'SIEM/XDR: log collection, correlation, alerting (port 443, 55000)', color: '#10b981' },
        { id: 'thehive', label: 'TheHive 5.x', description: 'Case management and incident tracking (port 9000)', color: '#059669' },
        { id: 'cortex', label: 'Cortex 3.x', description: 'Automated observable analysis (port 9001)', color: '#047857' },
        { id: 'misp', label: 'MISP', description: 'Threat intelligence platform (port 443)', color: '#065f46' },
        { id: 'zeek', label: 'Zeek', description: 'Network metadata and behavioral analysis', color: '#064e3b' },
        { id: 'suricata', label: 'Suricata', description: 'Signature-based IDS/IPS engine', color: '#022c22' },
      ],
    },
    {
      label: 'MCP Integration',
      color: '#7c5cfc',
      nodes: [
        { id: 'mcp-servers', label: '7 MCP Servers', description: 'AI tool bridges: Wazuh, TheHive, Cortex, MISP, Zeek, Suricata, ATT&CK', color: '#7c5cfc' },
      ],
    },
    {
      label: 'Supporting Tools',
      color: '#f59e0b',
      nodes: [
        { id: 'playbooks', label: 'Playbooks', description: 'Remediation playbooks for common incident types', color: '#f59e0b' },
        { id: 'mock-data', label: 'Mock Data', description: 'Generators for demo alerts, cases, and network traffic', color: '#d97706' },
        { id: 'dashboards', label: 'Dashboards', description: 'Pre-built Wazuh dashboards for monitoring', color: '#b45309' },
      ],
    },
  ],
  architectureEdges: [
    { from: 'installer', to: 'setup', label: 'component selection' },
    { from: 'setup', to: 'wazuh', label: 'deploys' },
    { from: 'setup', to: 'thehive', label: 'deploys' },
    { from: 'setup', to: 'cortex', label: 'deploys' },
    { from: 'setup', to: 'misp', label: 'deploys' },
    { from: 'setup', to: 'zeek', label: 'deploys' },
    { from: 'setup', to: 'suricata', label: 'deploys' },
    { from: 'mcp-servers', to: 'wazuh', label: 'API bridge' },
    { from: 'mcp-servers', to: 'thehive', label: 'API bridge' },
    { from: 'mcp-servers', to: 'cortex', label: 'API bridge' },
    { from: 'mcp-servers', to: 'misp', label: 'API bridge' },
  ],
  dataFlow: [
    { step: 1, title: 'Installer Launch', description: 'Run the one-liner on a Proxmox host. The whiptail TUI presents component selection, deployment type (LXC vs VM), resource presets, and network configuration.' },
    { step: 2, title: 'Component Deployment', description: 'Each selected component gets its own setup script. Scripts handle package installation, configuration file templating, service startup, and initial API key provisioning.' },
    { step: 3, title: 'Integration Wiring', description: 'Post-install scripts connect components: Suricata/Zeek feed logs to Wazuh, TheHive gets Cortex analyzer access, MISP feeds sync to Wazuh for IOC matching.' },
    { step: 4, title: 'MCP Server Setup', description: 'MCP servers deploy as Node.js processes, each configured with the local API endpoint and credentials for its target tool.' },
    { step: 5, title: 'Validation', description: 'Health checks verify each component is running, APIs are accessible, and integrations are working. Mock data generators can populate the stack for immediate testing.' },
  ],
  codeSnippets: [
    {
      file: 'scripts/setup/install.sh',
      language: 'bash',
      title: 'One-Liner Deployment',
      description: 'The entry point. Downloads the setup scripts, presents an interactive component picker via whiptail, and orchestrates the deployment of selected SOC components on Proxmox.',
      code: `#!/bin/bash
# SOC Stack Installer for Proxmox VE
set -euo pipefail

COMPONENTS=$(whiptail --title "SOC Stack Installer" \\
  --checklist "Select components to deploy:" 20 60 8 \\
  "wazuh"    "Wazuh SIEM/XDR"      ON \\
  "thehive"  "TheHive 5 (IR)"      ON \\
  "cortex"   "Cortex (SOAR)"       ON \\
  "misp"     "MISP (Threat Intel)" ON \\
  "zeek"     "Zeek (NSM)"          ON \\
  "suricata" "Suricata (IDS/IPS)"  ON \\
  3>&1 1>&2 2>&3)

for component in $COMPONENTS; do
  component=$(echo "$component" | tr -d '"')
  echo "[*] Deploying $component..."
  bash "scripts/setup/\${component}.sh"
done

echo "[+] SOC Stack deployment complete."`,
    },
  ],
  techDecisions: [
    { decision: 'LXC containers over VMs', reason: 'LXC containers use 60-70% less RAM than VMs for the same workload. Critical for fitting 6 services on a single Proxmox host.' },
    { decision: 'Whiptail interactive installer', reason: 'Terminal UI works over SSH. No X11 or web browser needed. Familiar to Linux admins.' },
    { decision: 'Per-component setup scripts', reason: 'Modular design: can deploy any subset of the stack. Each script is self-contained and idempotent.' },
    { decision: 'MCP servers for AI integration', reason: 'Model Context Protocol gives LLMs structured access to SOC tools. Enables AI-assisted triage without custom API wrappers.' },
  ],
};

// ─── DEVELOPER REPOS ─────────────────────────────────────────────────────────

const devDashboard: RepoDetailData = {
  overview:
    'The Ops Deck (Dev Dashboard) is a unified operational command center built as a React SPA. It consolidates 20+ pages of infrastructure data into a single interface: task management, calendar, service monitoring, memory browser, token usage analytics, semantic code search, prompt management, social scheduling, security auditing, architecture visualization, and this repos deep-dive system. All data flows through a shared Express.js API backend (dev-tools-api on port 8005) that reads from the filesystem, git, PM2, tmux, and system utilities.',
  architectureLayers: [
    {
      label: 'Frontend (React + TypeScript)',
      color: '#7c5cfc',
      nodes: [
        { id: 'pages', label: '20+ Pages', description: 'Tasks, Calendar, Services, Memory, Usage, Search, Prompts, Social, Repos, Architecture, etc.', color: '#7c5cfc' },
        { id: 'sidebar', label: 'Sidebar Navigation', description: 'Collapsible nav with mobile hamburger menu', color: '#6d4edb' },
        { id: 'hooks', label: 'useApi Hook', description: 'Shared data fetching with loading/error states and refetch', color: '#5e3fc7' },
        { id: 'starfield', label: 'Starfield Background', description: 'Animated canvas star particles behind all pages', color: '#4f30b2' },
      ],
    },
    {
      label: 'API Backend (Express.js)',
      color: '#10b981',
      nodes: [
        { id: 'api', label: 'Dev Tools API', description: 'Express server on :8005 serving all dashboard data', color: '#10b981' },
        { id: 'registry', label: 'Project Registry', description: 'tracking/projects.json with metadata for all repos', color: '#059669' },
        { id: 'git-info', label: 'Git Integration', description: 'Last commit, branch, remote URL via execSync', color: '#047857' },
        { id: 'port-check', label: 'Port Checker', description: 'TCP socket probes to verify service health', color: '#065f46' },
      ],
    },
    {
      label: 'Data Sources',
      color: '#f59e0b',
      nodes: [
        { id: 'filesystem', label: 'Filesystem', description: 'Workspace files, memory markdown, config files', color: '#f59e0b' },
        { id: 'pm2', label: 'PM2', description: 'Process list, CPU/memory, uptime, restart counts', color: '#d97706' },
        { id: 'system', label: 'System Info', description: 'CPU, RAM, disk, GPU via nvidia-smi, uptime', color: '#b45309' },
        { id: 'caddy', label: 'Caddyfile', description: 'Reverse proxy config parsed for site routing', color: '#92400e' },
      ],
    },
  ],
  architectureEdges: [
    { from: 'pages', to: 'hooks', label: 'useApi()' },
    { from: 'hooks', to: 'api', label: 'fetch :8005' },
    { from: 'api', to: 'registry', label: 'reads' },
    { from: 'api', to: 'git-info', label: 'execSync git' },
    { from: 'api', to: 'port-check', label: 'TCP probe' },
    { from: 'api', to: 'filesystem', label: 'readFile' },
    { from: 'api', to: 'pm2', label: 'pm2 jlist' },
    { from: 'api', to: 'system', label: 'os/exec' },
    { from: 'api', to: 'caddy', label: 'parse Caddyfile' },
  ],
  dataFlow: [
    { step: 1, title: 'Page Mount', description: 'A page component mounts and calls useApi("/api/some-endpoint"). The hook triggers a fetch to the Express API on port 8005.' },
    { step: 2, title: 'API Resolution', description: 'The Express server handles the route. Depending on the endpoint, it reads filesystem data, runs git commands (execSync), probes ports (TCP sockets), queries PM2 (pm2 jlist), or parses config files.' },
    { step: 3, title: 'Data Assembly', description: 'The API combines data from multiple sources into a unified JSON response. Example: /api/arch returns system info + PM2 processes + port scan + GPU stats + Caddy sites + Ollama models.' },
    { step: 4, title: 'Frontend Render', description: 'The useApi hook updates state with the response. The page renders data into the ops deck aesthetic: dashed-border cards, dark backgrounds (#0a0a14, #16162a), purple accents (#7c5cfc).' },
    { step: 5, title: 'Refresh Cycle', description: 'Pages can call refetch() for manual refresh. Some pages auto-refresh on interval. HMR keeps the dev server responsive to code changes.' },
  ],
  codeSnippets: [
    {
      file: 'src/hooks/useApi.ts',
      language: 'typescript',
      title: 'Shared API Hook',
      description: 'Every page uses this hook for data fetching. It handles loading states, errors, and provides a refetch callback. The API base URL auto-detects localhost vs network access.',
      code: `const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:8005'
  : \`http://\${window.location.hostname}:8005\`;

export function useApi<T>(path: string, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch(\`\${API_BASE}\${path}\`)
      .then(r => {
        if (!r.ok) throw new Error(\`\${r.status} \${r.statusText}\`);
        return r.json();
      })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [path]);

  useEffect(() => { refetch(); }, [refetch, ...deps]);
  return { data, loading, error, refetch };
}`,
    },
    {
      file: 'server.js (dev-tools-api)',
      language: 'javascript',
      title: 'Port Health Checker',
      description: 'TCP socket probe used by the Services page to check if each service is actually listening. 500ms timeout prevents hanging on dead ports.',
      code: `async function checkPort(port, timeout = 500) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeout);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, '127.0.0.1');
  });
}`,
    },
    {
      file: 'server.js (dev-tools-api)',
      language: 'javascript',
      title: 'CORS Allowlist',
      description: 'Regex-based origin validation. Only allows localhost and 192.168.x.x origins, blocking external access to the API even if the port is exposed.',
      code: `const ALLOWED_ORIGIN_RE =
  /^https?:\\/\\/(localhost|127\\.0\\.0\\.1|192\\.168\\.\\d{1,3}\\.\\d{1,3})(:\\d+)?$/;

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGIN_RE.test(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});`,
    },
  ],
  techDecisions: [
    { decision: 'Express.js API over direct filesystem access', reason: 'React can\'t access the filesystem. Express bridges the gap, running git commands, parsing configs, and probing ports server-side.' },
    { decision: 'Single API for all pages', reason: 'One Express server (dev-tools-api) serves 20+ pages. Avoids running separate backends per dashboard feature.' },
    { decision: 'PM2 for process management', reason: 'Auto-restart on crash, log aggregation, and process monitoring. ecosystem.config.cjs defines all services declaratively.' },
    { decision: 'Dashed-border card aesthetic', reason: 'Consistent visual language across all pages. The subtle dashed borders on dark backgrounds (#16162a) create a terminal/ops feel without being harsh.' },
    { decision: 'Vite dev server (not build)', reason: 'HMR gives instant feedback during development. The dashboard is an internal tool, not a production deploy, so dev mode is fine.' },
    { decision: 'No authentication', reason: 'Internal tool bound to localhost/LAN. CORS regex blocks external origins. Security through network boundary, not auth tokens.' },
  ],
  apiEndpoints: [
    { method: 'GET', path: '/api/health', description: 'Health check for the API itself' },
    { method: 'GET', path: '/api/projects', description: 'All projects from registry with git info' },
    { method: 'GET', path: '/api/arch', description: 'System info, PM2, ports, GPU, Caddy, Ollama models' },
    { method: 'GET', path: '/api/ports', description: 'All listening ports with process info' },
    { method: 'GET', path: '/api/memory', description: 'Memory markdown files from workspace' },
    { method: 'GET', path: '/api/tasks', description: 'Task items from tracking files' },
    { method: 'GET', path: '/api/calendar', description: 'Calendar events from Google Calendar API' },
    { method: 'GET', path: '/api/usage', description: 'Token usage statistics from OpenClaw logs' },
    { method: 'GET', path: '/api/search', description: 'Semantic code search via Ollama embeddings' },
    { method: 'GET', path: '/api/security', description: 'Security audit data from scan results' },
    { method: 'GET', path: '/api/social', description: 'Social media content queue and scheduling' },
  ],
};


// ─── DEV TOOLS REPOS ─────────────────────────────────────────────────────────

const promptLibrary: RepoDetailData = {
  overview:
    'Prompt Library is a dual-mode prompt management system with semantic search. The Python/FastAPI backend stores prompts in SQLite with version history. Each prompt gets an embedding vector via Ollama (qwen3-embedding:8b, 4096 dimensions) stored as packed binary in SQLite. Search queries are embedded on the fly and ranked by cosine similarity against all stored embeddings. The frontend is a React app with CRUD operations, category filtering, and variable interpolation. A REST API allows sub-agents (like OpenClaw) to query prompts programmatically.',
  architectureLayers: [
    {
      label: 'Frontend (React)',
      color: '#06b6d4',
      nodes: [
        { id: 'prompt-ui', label: 'Prompt Editor', description: 'Create/edit prompts with category, tags, variables', color: '#06b6d4' },
        { id: 'search-ui', label: 'Semantic Search', description: 'Natural language search ranked by embedding similarity', color: '#0891b2' },
        { id: 'version-ui', label: 'Version History', description: 'View/revert prompt versions with change notes', color: '#0e7490' },
      ],
    },
    {
      label: 'Backend (FastAPI)',
      color: '#7c5cfc',
      nodes: [
        { id: 'crud', label: 'CRUD API', description: 'Create, read, update, delete prompts with validation', color: '#7c5cfc' },
        { id: 'embed-service', label: 'Embedding Service', description: 'Calls Ollama qwen3-embedding:8b for 4096-dim vectors', color: '#6d4edb' },
        { id: 'search-engine', label: 'Search Engine', description: 'Cosine similarity ranking across all embeddings', color: '#5e3fc7' },
      ],
    },
    {
      label: 'Storage',
      color: '#f59e0b',
      nodes: [
        { id: 'sqlite', label: 'SQLite', description: 'Prompts table + versions table + binary embeddings', color: '#f59e0b' },
        { id: 'ollama', label: 'Ollama (Local GPU)', description: 'qwen3-embedding:8b model for embedding generation', color: '#d97706' },
      ],
    },
  ],
  architectureEdges: [
    { from: 'prompt-ui', to: 'crud', label: 'REST' },
    { from: 'search-ui', to: 'search-engine', label: 'query text' },
    { from: 'crud', to: 'sqlite', label: 'SQL' },
    { from: 'crud', to: 'embed-service', label: 'on save' },
    { from: 'embed-service', to: 'ollama', label: 'POST /api/embeddings' },
    { from: 'embed-service', to: 'sqlite', label: 'store vector' },
    { from: 'search-engine', to: 'embed-service', label: 'embed query' },
    { from: 'search-engine', to: 'sqlite', label: 'load all vectors' },
    { from: 'version-ui', to: 'crud', label: 'version API' },
  ],
  dataFlow: [
    { step: 1, title: 'Prompt Creation', description: 'User creates a prompt with name, title, category, tags, content, and optional variables (template placeholders). Saved via POST to the API.' },
    { step: 2, title: 'Embedding Generation', description: 'On save, the backend sends the prompt content to Ollama\'s qwen3-embedding:8b model. Returns a 4096-dimensional float vector. If Ollama is unavailable, the prompt saves without an embedding.' },
    { step: 3, title: 'Vector Storage', description: 'The embedding is packed as binary (struct.pack with 4096 floats = 16384 bytes) and stored in a BLOB column alongside the prompt. This avoids a separate vector DB.' },
    { step: 4, title: 'Semantic Search', description: 'Search query text is embedded via the same Ollama model. The backend loads all stored embeddings, unpacks them, and computes cosine similarity against the query vector. Results sorted by similarity score across 4096-dim vectors.' },
    { step: 5, title: 'Version Tracking', description: 'Each edit creates a new version record with the previous content and a change note. Users can view version history and revert to any previous version.' },
  ],
  codeSnippets: [
    {
      file: 'backend/app.py',
      language: 'python',
      title: 'Embedding & Cosine Similarity',
      description: 'The core of semantic search. Embeddings are packed/unpacked as binary structs for compact SQLite storage. Cosine similarity computes the dot product normalized by vector magnitudes.',
      code: `EMBED_MODEL = "qwen3-embedding:8b"
EMBED_DIM = 4096

def embed_text(text: str) -> list[float] | None:
    try:
        resp = httpx.post(OLLAMA_URL,
          json={"model": EMBED_MODEL, "prompt": text},
          timeout=10.0)
        resp.raise_for_status()
        return resp.json().get("embedding")
    except Exception:
        return None

def pack_embedding(emb: list[float]) -> bytes:
    return struct.pack(f"{len(emb)}f", *emb)

def unpack_embedding(data: bytes) -> list[float]:
    n = len(data) // 4
    return list(struct.unpack(f"{n}f", data))

def cosine_similarity(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    na = sqrt(sum(x * x for x in a))
    nb = sqrt(sum(x * x for x in b))
    if na == 0 or nb == 0:
        return 0.0
    return dot / (na * nb)`,
    },
  ],
  techDecisions: [
    { decision: 'SQLite with binary embeddings (no vector DB)', reason: 'At prompt-library scale (hundreds, not millions), cosine similarity over packed floats in SQLite is fast enough. No Pinecone/Chroma dependency.' },
    { decision: 'Ollama for local embeddings', reason: 'Runs on the local GPU (RTX Ada 2000). No external API calls, no data leaving the machine. qwen3-embedding:8b keeps prompt recall aligned with memory and code search.' },
    { decision: 'struct.pack for vector storage', reason: '768 floats * 4 bytes = 3072 bytes per embedding. Compact binary BLOB, much smaller than JSON arrays.' },
    { decision: 'Version history on every edit', reason: 'Prompts evolve. Being able to see what changed and revert is critical for prompt engineering workflows.' },
    { decision: 'REST API for sub-agents', reason: 'OpenClaw and other agents can query the prompt library programmatically. Prompts become a shared resource across the AI stack.' },
  ],
  apiEndpoints: [
    { method: 'GET', path: '/api/prompts', description: 'List all prompts (with optional category filter)' },
    { method: 'POST', path: '/api/prompts', description: 'Create a new prompt (auto-embeds)' },
    { method: 'GET', path: '/api/prompts/{id}', description: 'Get prompt by ID with full content' },
    { method: 'PUT', path: '/api/prompts/{id}', description: 'Update prompt (creates version, re-embeds)' },
    { method: 'DELETE', path: '/api/prompts/{id}', description: 'Soft-delete prompt' },
    { method: 'GET', path: '/api/prompts/{id}/versions', description: 'Get version history for a prompt' },
    { method: 'GET', path: '/api/search?q=', description: 'Semantic search across all prompts' },
    { method: 'GET', path: '/api/categories', description: 'List unique categories' },
  ],
};

const usageTracker: RepoDetailData = {
  overview:
    'Usage Tracker is a token usage and cost analytics dashboard for AI sessions. It\'s a single-file HTML application (2100+ lines) that reads session data and renders interactive dashboards with time-series charts, model breakdowns, cost calculations, and Ollama savings tracking. Supports 5 visual variant themes. All rendering is done with vanilla JavaScript and Tailwind CSS (CDN), no framework or build step. Designed to show how much AI infrastructure costs and where the money goes.',
  architectureLayers: [
    {
      label: 'Single HTML File',
      color: '#7c5cfc',
      nodes: [
        { id: 'html', label: 'index.html', description: '2100+ lines: HTML structure, CSS, JavaScript all inline', color: '#7c5cfc' },
        { id: 'tailwind', label: 'Tailwind CDN', description: 'Utility CSS loaded from CDN, no build step', color: '#06b6d4' },
        { id: 'lucide', label: 'Lucide Icons', description: 'Icon library loaded from unpkg CDN', color: '#6d4edb' },
      ],
    },
    {
      label: 'Data Processing (JavaScript)',
      color: '#f59e0b',
      nodes: [
        { id: 'data-loader', label: 'Data Loader', description: 'Reads session data from embedded or fetched JSON', color: '#f59e0b' },
        { id: 'cost-calc', label: 'Cost Calculator', description: 'Per-model pricing * token counts = session costs', color: '#d97706' },
        { id: 'aggregator', label: 'Aggregator', description: 'Groups by model, provider, day, week for chart data', color: '#b45309' },
      ],
    },
    {
      label: 'Visualizations',
      color: '#10b981',
      nodes: [
        { id: 'summary', label: 'Summary Cards', description: 'Total tokens, total cost, Ollama savings, session count', color: '#10b981' },
        { id: 'timeseries', label: 'Time Series', description: 'Token usage over time, bucketed by day/week', color: '#059669' },
        { id: 'breakdown', label: 'Model Breakdown', description: 'Per-model token counts and cost distribution', color: '#047857' },
        { id: 'savings', label: 'Ollama Savings', description: 'Cost avoided by running models locally on GPU', color: '#065f46' },
      ],
    },
  ],
  architectureEdges: [
    { from: 'html', to: 'data-loader', label: 'inline JS' },
    { from: 'data-loader', to: 'cost-calc', label: 'raw sessions' },
    { from: 'data-loader', to: 'aggregator', label: 'raw sessions' },
    { from: 'cost-calc', to: 'summary', label: 'totals' },
    { from: 'aggregator', to: 'timeseries', label: 'bucketed data' },
    { from: 'aggregator', to: 'breakdown', label: 'model groups' },
    { from: 'cost-calc', to: 'savings', label: 'Ollama vs cloud delta' },
  ],
  dataFlow: [
    { step: 1, title: 'Data Ingestion', description: 'Session data loaded from embedded JSON or fetched from the ops deck API. Each session record contains: model name, provider, token counts (input/output), timestamps, and duration.' },
    { step: 2, title: 'Cost Calculation', description: 'Each model has a known per-million-token price. The calculator multiplies token counts by rates. Ollama models (local GPU) are priced at $0, with a "would have cost" field showing cloud equivalent.' },
    { step: 3, title: 'Aggregation', description: 'Data grouped by multiple dimensions: by model (token/cost pie), by provider (Anthropic vs OpenAI vs Ollama), by time (daily/weekly usage trends), and by session (individual session details).' },
    { step: 4, title: 'Rendering', description: 'Charts rendered with DOM manipulation and CSS. Time-series uses scaled div bars. Breakdown uses colored segments. Summary cards show headline numbers with delta indicators.' },
    { step: 5, title: 'Variant Switching', description: 'Five visual themes selectable via URL parameter or picker. Each variant applies different fonts, colors, and layout tweaks while sharing the same data processing logic.' },
  ],
  codeSnippets: [
    {
      file: 'index.html',
      language: 'javascript',
      title: 'Cost Calculation Engine',
      description: 'Maps model names to per-million-token pricing. Calculates per-session cost and tracks "Ollama savings" (what local inference would have cost on cloud APIs).',
      code: `// Pricing per million tokens (input/output)
const MODEL_PRICING = {
  'claude-opus-4':    { input: 15.00, output: 75.00 },
  'claude-sonnet-4':  { input: 3.00,  output: 15.00 },
  'claude-haiku-3.5': { input: 0.80,  output: 4.00 },
  'gpt-4o':           { input: 5.00,  output: 15.00 },
  'gpt-4o-mini':      { input: 0.15,  output: 0.60 },
  // Ollama models: $0 (local GPU)
  'qwen2.5:14b':      { input: 0, output: 0 },
  'qwen3-embedding:8b': { input: 0, output: 0 },
};

function calculateSessionCost(session) {
  const pricing = MODEL_PRICING[session.model] || { input: 0, output: 0 };
  const inputCost = (session.inputTokens / 1_000_000) * pricing.input;
  const outputCost = (session.outputTokens / 1_000_000) * pricing.output;
  return { inputCost, outputCost, total: inputCost + outputCost };
}`,
    },
  ],
  techDecisions: [
    { decision: 'Single HTML file (no build step)', reason: 'Zero dependencies, zero setup. Open the file and it works. Perfect for an internal analytics tool that doesn\'t need React overhead.' },
    { decision: 'Tailwind via CDN', reason: 'Gets utility CSS without a build pipeline. Trade-off: larger initial CSS load, but acceptable for an internal tool.' },
    { decision: 'Ollama savings tracking', reason: 'Quantifies the value of local GPU inference. Shows exactly how much running models on the RTX Ada 2000 saves vs cloud API calls.' },
    { decision: '5 variant themes', reason: 'Same data, different visual approaches. Portfolio showcase pattern demonstrating design flexibility.' },
  ],
};

const portgrid: RepoDetailData = {
  overview:
    'PortGrid is a high-density switch port visualizer for network management. Built with Next.js, it connects to LibreNMS or NetDisco APIs to pull device inventories and port status data. The frontend renders a color-coded grid view of every switch port across the network: green (up), red (admin down), gray (oper down). Features instant search across port descriptions, VLAN display, neighbor discovery (CDP/LLDP), and per-port notes stored in localStorage. Uses a data source adapter pattern so it can swap between LibreNMS and NetDisco without code changes.',
  architectureLayers: [
    {
      label: 'Data Sources',
      color: '#06b6d4',
      nodes: [
        { id: 'librenms', label: 'LibreNMS API', description: 'Devices, ports, CDP/LLDP neighbor links', color: '#06b6d4' },
        { id: 'netdisco', label: 'NetDisco API', description: 'Alternative NMS with similar device/port data', color: '#0891b2' },
      ],
    },
    {
      label: 'Backend (Next.js API Routes)',
      color: '#7c5cfc',
      nodes: [
        { id: 'adapter', label: 'Data Source Adapter', description: 'Factory pattern: createDataSourceAdapter() picks LibreNMS or NetDisco', color: '#7c5cfc' },
        { id: 'cache', label: 'In-Memory Cache', description: '45-second TTL cache to reduce upstream API calls', color: '#6d4edb' },
        { id: 'auth', label: 'Bearer Token Auth', description: 'Optional API token for production deployments', color: '#5e3fc7' },
      ],
    },
    {
      label: 'Frontend (React + TanStack Table)',
      color: '#10b981',
      nodes: [
        { id: 'grid', label: 'Port Grid Table', description: 'Color-coded port rows with status, VLAN, neighbor, description', color: '#10b981' },
        { id: 'accordion', label: 'Switch Accordion', description: 'Collapsible sections per switch device', color: '#059669' },
        { id: 'search', label: 'Global Search', description: 'Instant filter across port descriptions (ifAlias)', color: '#047857' },
        { id: 'notes', label: 'Port Notes', description: 'Per-port notes stored in localStorage', color: '#065f46' },
      ],
    },
  ],
  architectureEdges: [
    { from: 'librenms', to: 'adapter', label: 'REST API' },
    { from: 'netdisco', to: 'adapter', label: 'REST API' },
    { from: 'adapter', to: 'cache', label: 'fetched data' },
    { from: 'cache', to: 'grid', label: 'JSON response' },
    { from: 'auth', to: 'adapter', label: 'gates access' },
    { from: 'grid', to: 'accordion', label: 'grouped by device' },
    { from: 'search', to: 'grid', label: 'filter' },
    { from: 'notes', to: 'grid', label: 'overlay' },
  ],
  dataFlow: [
    { step: 1, title: 'API Request', description: 'Frontend calls GET /api/ports. The API route checks optional Bearer token auth, then calls the data source adapter.' },
    { step: 2, title: 'Adapter Resolution', description: 'The factory reads DATA_SOURCE env var (default: "librenms"). Creates either LibreNMSAdapter or NetDiscoAdapter. Both implement the same DataSourceAdapter interface.' },
    { step: 3, title: 'Data Fetch & Cache', description: 'The adapter fetches devices and their ports from the upstream NMS API. Results cached in-memory for 45 seconds (CACHE_TTL_MS). Subsequent requests within TTL return cached data instantly.' },
    { step: 4, title: 'Port Enrichment', description: 'LibreNMS adapter merges device list with port details and CDP/LLDP neighbor links. Each port gets: ifName, ifAlias, admin status, oper status, VLAN, MAC, and neighbor hostname.' },
    { step: 5, title: 'Grid Rendering', description: 'TanStack Table renders port rows grouped by switch (accordion). Rows color-coded: green = up, red = admin down, gray = oper down. Search filters by ifAlias in real-time.' },
  ],
  codeSnippets: [
    {
      file: 'lib/adapters/index.ts',
      language: 'typescript',
      title: 'Data Source Adapter Factory',
      description: 'Factory pattern with in-memory caching. The CachedAdapter wraps any DataSourceAdapter with a 45-second TTL. The factory reads the DATA_SOURCE env var to pick the right adapter.',
      code: `const CACHE_TTL_MS = 45_000;

interface CacheEntry {
  data: DeviceWithPorts[];
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

class CachedAdapter implements DataSourceAdapter {
  constructor(
    private inner: DataSourceAdapter,
    private cacheKey: string
  ) {}

  async fetchDevicesWithPorts(): Promise<DeviceWithPorts[]> {
    const now = Date.now();
    const cached = cache.get(this.cacheKey);
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
    const data = await this.inner.fetchDevicesWithPorts();
    cache.set(this.cacheKey, { data, timestamp: now });
    return data;
  }
}

export function createDataSourceAdapter(): DataSourceAdapter {
  const source = process.env.DATA_SOURCE || "librenms";
  const inner = source === "netdisco"
    ? new NetDiscoAdapter()
    : new LibreNMSAdapter();
  return new CachedAdapter(inner, source);
}`,
    },
    {
      file: 'types/port.ts',
      language: 'typescript',
      title: 'Port Type Definitions',
      description: 'The unified port model. EnrichedPort contains all the data needed to render a port row: status indicators, VLAN, MAC address, and CDP/LLDP neighbor. The DataSourceAdapter interface ensures both LibreNMS and NetDisco return the same structure.',
      code: `export interface EnrichedPort {
  port_id: number;
  device_id: number;
  deviceName: string;
  ifName: string;
  ifAlias: string | null;    // port description
  ifDescr: string;
  ifAdminStatus: "up" | "down";
  ifOperStatus: "up" | "down";
  ifVlan: number | null;
  ifPhysAddress: string | null;
  neighbor: string | null;    // CDP/LLDP neighbor hostname
}

export interface DataSourceAdapter {
  fetchDevicesWithPorts(): Promise<DeviceWithPorts[]>;
}

export type DataSourceType = "librenms" | "netdisco";`,
    },
  ],
  techDecisions: [
    { decision: 'Adapter pattern for data sources', reason: 'LibreNMS and NetDisco have different APIs but provide the same data. The adapter normalizes both into DeviceWithPorts[], making the frontend data-source-agnostic.' },
    { decision: 'In-memory cache with TTL', reason: 'NMS APIs are slow (hundreds of devices with ports). 45-second cache means the grid loads instantly on refresh while staying reasonably fresh.' },
    { decision: 'Next.js over Vite/React', reason: 'API routes co-located with frontend. Server-side data fetching, environment variable handling, and zero-config deployment.' },
    { decision: 'TanStack Table for the grid', reason: 'Handles sorting, pagination, and column definitions declaratively. Scales to thousands of port rows without custom virtualization.' },
    { decision: 'localStorage for port notes', reason: 'Notes are personal annotations (e.g., "patch panel A3, port 7"). No need for a database; localStorage persists across sessions.' },
  ],
  apiEndpoints: [
    { method: 'GET', path: '/api/ports', description: 'All devices with their ports (supports Bearer auth)' },
  ],
};

const variantGallery: RepoDetailData = {
  overview:
    'Variant Gallery was a visual comparison tool for viewing all 5 design variants of portfolio projects side by side. Provided iframe-based previews of each variant with a toggle to switch between them. Superseded by the variant picker built into each project.',
  architectureLayers: [],
  architectureEdges: [],
  dataFlow: [],
  codeSnippets: [],
  techDecisions: [],
  brief: true,
};

const socialPreview: RepoDetailData = {
  overview:
    'Social Preview was a standalone content preview tool for social media posts. Showed how posts would render on different platforms (LinkedIn, Twitter/X, Bluesky). Superseded by the Social page in the Ops Deck which handles content queue management and preview in one place.',
  architectureLayers: [],
  architectureEdges: [],
  dataFlow: [],
  codeSnippets: [],
  techDecisions: [],
  brief: true,
};

// ─── INFRASTRUCTURE REPOS ────────────────────────────────────────────────────

const watchtower: RepoDetailData = {
  overview:
    'Watchtower is a real-time Network Operations Center (NOC) dashboard built for Polk State College\'s IT department. It aggregates data from LibreNMS (SNMP metrics), Netdisco (L2 discovery), Proxmox (virtualization), and Speedtest CLI into a unified monitoring interface. The backend is Python/FastAPI with APScheduler for timed polling, Redis for in-memory caching, and WebSocket for real-time push updates. The frontend is React/TypeScript with ReactFlow for interactive topology maps, Zustand for state management, and custom Cisco-style port grid visualizations. Features JWT authentication, InfluxDB historical data, L2/L3 topology view toggle, and Mermaid diagram export.',
  architectureLayers: [
    {
      label: 'Data Sources',
      color: '#06b6d4',
      nodes: [
        { id: 'librenms', label: 'LibreNMS', description: 'SNMP metrics: device status, interfaces, port traffic, CDP/LLDP neighbors', color: '#10b981' },
        { id: 'netdisco', label: 'Netdisco', description: 'L2 discovery: MAC tables, device inventory, switch port mappings', color: '#3b82f6' },
        { id: 'proxmox', label: 'Proxmox', description: 'Virtualization: VM/container lists, CPU/memory, storage pools', color: '#f59e0b' },
        { id: 'speedtest', label: 'Speedtest CLI', description: 'WAN health: download/upload speeds, latency, jitter', color: '#8b5cf6' },
      ],
    },
    {
      label: 'Backend (Python/FastAPI)',
      color: '#ef4444',
      nodes: [
        { id: 'scheduler', label: 'APScheduler', description: 'Timed polling jobs per data source at configurable intervals', color: '#ef4444' },
        { id: 'aggregator', label: 'Aggregator', description: 'Merges topology.yaml structure with live data from all sources', color: '#dc2626' },
        { id: 'redis', label: 'Redis Cache', description: 'In-memory cache for topology, metrics, and device status', color: '#b91c1c' },
        { id: 'fastapi', label: 'FastAPI', description: 'REST endpoints + WebSocket server for real-time push', color: '#991b1b' },
        { id: 'influx', label: 'InfluxDB', description: 'Time-series storage for historical metrics and charts', color: '#7f1d1d' },
      ],
    },
    {
      label: 'Real-Time Layer',
      color: '#7c5cfc',
      nodes: [
        { id: 'websocket', label: 'WebSocket Manager', description: 'Broadcasts topology updates, device status changes, alerts to all clients', color: '#7c5cfc' },
        { id: 'demo-sim', label: 'Demo Simulator', description: 'Generates realistic fake data for demo mode (no real infrastructure needed)', color: '#6d4edb' },
      ],
    },
    {
      label: 'Frontend (React + TypeScript)',
      color: '#10b981',
      nodes: [
        { id: 'topology', label: 'Topology Canvas', description: 'ReactFlow: draggable nodes, expandable clusters, L2/L3 toggle, zoom/pan', color: '#10b981' },
        { id: 'port-grid', label: 'Cisco Port Grid', description: 'Visual switch port layout with real-time status colors', color: '#059669' },
        { id: 'widgets', label: 'Sidebar Widgets', description: 'Speedtest, port groups, Proxmox panel, alert list', color: '#047857' },
        { id: 'zustand', label: 'Zustand Store', description: 'Global state with WebSocket sync and optimistic updates', color: '#065f46' },
      ],
    },
  ],
  architectureEdges: [
    { from: 'librenms', to: 'scheduler', label: 'REST API polling' },
    { from: 'netdisco', to: 'scheduler', label: 'REST API polling' },
    { from: 'proxmox', to: 'scheduler', label: 'REST API polling' },
    { from: 'speedtest', to: 'scheduler', label: 'CLI subprocess' },
    { from: 'scheduler', to: 'aggregator', label: 'raw data' },
    { from: 'aggregator', to: 'redis', label: 'merged topology' },
    { from: 'aggregator', to: 'influx', label: 'time-series metrics' },
    { from: 'redis', to: 'fastapi', label: 'cached reads' },
    { from: 'fastapi', to: 'websocket', label: 'push updates' },
    { from: 'websocket', to: 'zustand', label: 'WebSocket messages' },
    { from: 'zustand', to: 'topology', label: 'state' },
    { from: 'zustand', to: 'port-grid', label: 'state' },
    { from: 'zustand', to: 'widgets', label: 'state' },
  ],
  dataFlow: [
    { step: 1, title: 'Scheduled Polling', description: 'APScheduler triggers polling jobs at configurable intervals. LibreNMS polls every 60s for device status, Proxmox every 120s for VM metrics, Speedtest every 30 min for WAN health. Each poller is an async function that hits the source\'s REST API.' },
    { step: 2, title: 'Data Aggregation', description: 'The aggregator merges live data with the static topology.yaml (which defines what exists and where it\'s positioned). Device matching uses a priority system: explicit librenms_hostname > IP address match > fuzzy hostname contains. This decouples "what we monitor" from "how we draw it."' },
    { step: 3, title: 'Cache & Persist', description: 'Merged topology written to Redis for instant reads. Time-series metrics (CPU, memory, traffic) written to InfluxDB for historical charts. Redis keys use prefixes (watchtower:devices, watchtower:alerts) for organized namespacing.' },
    { step: 4, title: 'WebSocket Broadcast', description: 'After each poll cycle, the WebSocket manager broadcasts a topology_update message to all connected clients. The ConnectionManager tracks active connections with an async lock, gracefully removing dead sockets.' },
    { step: 5, title: 'Frontend State Update', description: 'Zustand store receives WebSocket messages and updates device/edge state immutably. ReactFlow re-renders only affected nodes (red border for down, green for up). Sidebar widgets update counters and charts.' },
    { step: 6, title: 'User Interaction', description: 'Users can drag nodes, expand/collapse clusters, toggle L2/L3 views, search ports by description, view Proxmox VM details, acknowledge alerts, and export topology as Mermaid diagrams.' },
  ],
  codeSnippets: [
    {
      file: 'backend/app/polling/aggregator.py',
      language: 'python',
      title: 'Device Matching Algorithm',
      description: 'Matches topology.yaml devices to their LibreNMS counterparts using a three-tier priority system. This decouples the visual topology definition from the monitoring data source.',
      code: `def match_librenms_device(
    device_id: str,
    device_config: dict[str, Any],
    librenms_by_ip: dict[str, dict],
    librenms_by_hostname: dict[str, dict],
) -> dict[str, Any] | None:
    """
    Match a topology device to its LibreNMS counterpart.

    Matching priority:
    1. Explicit librenms_hostname field in topology.yaml
    2. IP address match
    3. Hostname contains device_id (fuzzy)
    """
    # 1. Explicit mapping
    explicit = device_config.get("librenms_hostname")
    if explicit:
        lower = explicit.lower()
        if lower in librenms_by_hostname:
            return librenms_by_hostname[lower]

    # 2. IP address match
    device_ip = device_config.get("ip")
    if device_ip and device_ip in librenms_by_ip:
        return librenms_by_ip[device_ip]

    # 3. Fuzzy hostname match
    device_lower = device_id.lower()
    for hostname, data in librenms_by_hostname.items():
        if device_lower in hostname or hostname in device_lower:
            return data
    return None`,
    },
    {
      file: 'backend/app/websocket.py',
      language: 'python',
      title: 'WebSocket Connection Manager',
      description: 'Manages real-time connections. Uses an async lock to safely add/remove clients during concurrent broadcasts. Dead connections are cleaned up automatically.',
      code: `class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        async with self._lock:
            self.active_connections.append(websocket)

    async def disconnect(self, websocket: WebSocket) -> None:
        async with self._lock:
            if websocket in self.active_connections:
                self.active_connections.remove(websocket)

    async def broadcast(self, message: dict[str, Any]) -> None:
        if not self.active_connections:
            return
        disconnected = []
        async with self._lock:
            for conn in self.active_connections:
                try:
                    await conn.send_json(message)
                except Exception:
                    disconnected.append(conn)
        for conn in disconnected:
            await self.disconnect(conn)`,
    },
    {
      file: 'backend/app/cache.py',
      language: 'python',
      title: 'Redis Cache Client',
      description: 'Async Redis wrapper for Watchtower\'s data caching. All polled data lands in Redis keyed by type (watchtower:devices, watchtower:alerts, etc.) for instant REST and WebSocket reads.',
      code: `class RedisCache:
    def __init__(self):
        self._client: redis.Redis | None = None

    async def connect(self) -> None:
        self._client = redis.from_url(
            settings.redis_url,
            encoding="utf-8",
            decode_responses=True,
        )

    async def get(self, key: str) -> str | None:
        return await self.client.get(key)

    async def set(self, key: str, value: str, ex: int | None = None):
        await self.client.set(key, value, ex=ex)

    async def get_json(self, key: str) -> Any:
        raw = await self.get(key)
        return json.loads(raw) if raw else None

    async def set_json(self, key: str, data: Any, ex: int | None = None):
        await self.set(key, json.dumps(data), ex=ex)

redis_cache = RedisCache()`,
    },
  ],
  techDecisions: [
    { decision: 'WebSocket over polling', reason: 'Reduces latency and server load for real-time updates. Clients get topology changes within seconds of detection, not on the next poll cycle.' },
    { decision: 'Redis for caching', reason: 'Fast in-memory access for frequently-read topology data. Survives backend restarts. Redis pub/sub could enable multi-instance scaling later.' },
    { decision: 'topology.yaml + live data merge', reason: 'Decouples visual layout from monitoring. The YAML defines positions and groupings; LibreNMS provides live status. Change the diagram without touching monitoring config.' },
    { decision: 'APScheduler per data source', reason: 'Different sources need different poll intervals. LibreNMS every 60s (critical), Speedtest every 30min (slow operation). Each job is independent.' },
    { decision: 'ReactFlow for topology', reason: 'Handles complex graph layouts with built-in pan/zoom/drag. Custom node components for switches, routers, VMs. Edge animations show active connections.' },
    { decision: 'Demo mode with simulator', reason: 'Makes the dashboard demostrable without real infrastructure. Simulator generates realistic device status changes, alerts, and metrics.' },
    { decision: 'InfluxDB for time-series', reason: 'Purpose-built for metrics storage. Efficient range queries for historical charts. Built-in downsampling for long-term data retention.' },
    { decision: 'JWT authentication', reason: 'Stateless auth for the API. Tokens include user roles for future RBAC. Session management without server-side session storage.' },
  ],
  apiEndpoints: [
    { method: 'GET', path: '/api/topology', description: 'Full topology with nodes, edges, and device status' },
    { method: 'GET', path: '/api/devices', description: 'All monitored devices with live status' },
    { method: 'GET', path: '/api/devices/{id}/ports', description: 'Port details for a specific device' },
    { method: 'GET', path: '/api/speedtest', description: 'Latest speedtest results' },
    { method: 'GET', path: '/api/speedtest/history', description: 'Historical speedtest data (CSV)' },
    { method: 'GET', path: '/api/proxmox/nodes', description: 'Proxmox cluster overview' },
    { method: 'GET', path: '/api/proxmox/nodes/{node}', description: 'VMs and containers for a Proxmox node' },
    { method: 'GET', path: '/api/port-groups', description: 'Aggregated port group traffic stats' },
    { method: 'GET', path: '/api/alerts', description: 'Active alerts from device status changes' },
    { method: 'POST', path: '/api/alerts/{id}/ack', description: 'Acknowledge an alert' },
    { method: 'GET', path: '/api/mermaid', description: 'Export topology as Mermaid diagram' },
    { method: 'POST', path: '/api/auth/login', description: 'JWT authentication' },
    { method: 'GET', path: '/api/settings', description: 'Current configuration' },
    { method: 'PUT', path: '/api/settings', description: 'Update polling intervals and config' },
    { method: 'WS', path: '/ws', description: 'Real-time topology updates via WebSocket' },
    { method: 'GET', path: '/api/history/{metric}', description: 'Historical time-series from InfluxDB' },
  ],
};

const sambaAdMigration: RepoDetailData = {
  overview:
    'Samba AD Migration is an automation toolkit for migrating Windows Active Directory file shares to Samba on Proxmox VE. A master orchestrator script (samba-ad.sh) chains 7 phases: VM creation on Proxmox, storage provisioning, OS preparation, Samba installation, Active Directory domain join via Kerberos, data migration from Windows (PowerShell robocopy), and security hardening. Uses templated configs for smb.conf, krb5.conf, and audit logging. Designed for educational institutions migrating away from Windows file servers.',
  architectureLayers: [
    {
      label: 'Orchestrator',
      color: '#7c5cfc',
      nodes: [
        { id: 'master', label: 'samba-ad.sh', description: 'Master script: chains all phases with progress tracking', color: '#7c5cfc' },
      ],
    },
    {
      label: 'Phase Scripts',
      color: '#f59e0b',
      nodes: [
        { id: 'create-vm', label: '00-create-vm.sh', description: 'Creates Proxmox VM with specified resources', color: '#f59e0b' },
        { id: 'setup-storage', label: '01-setup-storage.sh', description: 'Provisions and mounts storage volumes', color: '#d97706' },
        { id: 'prepare-os', label: '02-prepare-os.sh', description: 'Updates OS, installs dependencies', color: '#b45309' },
        { id: 'install-samba', label: '03-install-samba.sh', description: 'Installs and configures Samba from templates', color: '#92400e' },
        { id: 'join-domain', label: '04-join-domain.sh', description: 'Kerberos config + AD domain join', color: '#78350f' },
        { id: 'migrate-data', label: '05-migrate-data.ps1', description: 'PowerShell robocopy from Windows with ACL preservation', color: '#713f12' },
        { id: 'harden', label: '06-harden-security.sh', description: 'SSH hardening, firewall rules, audit logging', color: '#6b5e10' },
      ],
    },
    {
      label: 'Config Templates',
      color: '#10b981',
      nodes: [
        { id: 'smb-conf', label: 'smb.conf.template', description: 'Samba share definitions with AD integration', color: '#10b981' },
        { id: 'krb5-conf', label: 'krb5.conf.template', description: 'Kerberos realm and KDC configuration', color: '#059669' },
        { id: 'audit-conf', label: 'samba-audit.conf', description: 'VFS audit logging for file access tracking', color: '#047857' },
      ],
    },
  ],
  architectureEdges: [
    { from: 'master', to: 'create-vm', label: 'phase 0' },
    { from: 'master', to: 'setup-storage', label: 'phase 1' },
    { from: 'master', to: 'prepare-os', label: 'phase 2' },
    { from: 'master', to: 'install-samba', label: 'phase 3' },
    { from: 'master', to: 'join-domain', label: 'phase 4' },
    { from: 'master', to: 'migrate-data', label: 'phase 5' },
    { from: 'master', to: 'harden', label: 'phase 6' },
    { from: 'install-samba', to: 'smb-conf', label: 'applies template' },
    { from: 'join-domain', to: 'krb5-conf', label: 'applies template' },
    { from: 'harden', to: 'audit-conf', label: 'enables audit' },
  ],
  dataFlow: [
    { step: 1, title: 'Environment Setup', description: 'The .env file defines all parameters: Proxmox host, VM specs (CPU, RAM, disk), AD domain name, admin credentials, share paths, and target IP. The master script sources this and validates before starting.' },
    { step: 2, title: 'VM Provisioning', description: 'Phase 0 creates a new VM on Proxmox via the API or CLI. Phase 1 provisions storage (ZFS dataset or LVM volume). Phase 2 prepares the OS with updates and required packages.' },
    { step: 3, title: 'Samba + AD Join', description: 'Phase 3 installs Samba and applies the smb.conf template with share definitions. Phase 4 configures Kerberos (krb5.conf template) and joins the Active Directory domain using net ads join.' },
    { step: 4, title: 'Data Migration', description: 'Phase 5 runs a PowerShell script on the Windows source server. Uses robocopy with /SEC /MIR flags to mirror file shares with full ACL preservation. Logs transferred file counts and errors.' },
    { step: 5, title: 'Hardening', description: 'Phase 6 locks down SSH (key-only auth, no root login), configures firewall rules (allow only Samba/Kerberos ports), enables VFS audit logging for file access tracking, and sets up SNMP for monitoring integration.' },
  ],
  codeSnippets: [
    {
      file: 'scripts/04-join-domain.sh',
      language: 'bash',
      title: 'Active Directory Domain Join',
      description: 'Configures Kerberos from template, obtains a Kerberos ticket, and joins the AD domain. The krb5.conf template gets variable substitution for realm and KDC server.',
      code: `#!/bin/bash
# Apply Kerberos configuration from template
envsubst < templates/krb5.conf.template > /etc/krb5.conf

# Obtain Kerberos ticket for domain admin
echo "$AD_ADMIN_PASSWORD" | kinit "$AD_ADMIN_USER@$AD_REALM"

# Join the Active Directory domain
net ads join -U "$AD_ADMIN_USER%$AD_ADMIN_PASSWORD" \\
  --no-dns-updates

# Verify domain membership
net ads testjoin && echo "[OK] Domain join successful" \\
  || echo "[FAIL] Domain join failed"

# Enable and start Samba services
systemctl enable --now smbd nmbd winbind`,
    },
  ],
  techDecisions: [
    { decision: 'Phased script architecture', reason: 'Each phase is independently runnable. Failed at domain join? Fix the issue and rerun phase 4 without redoing VM creation.' },
    { decision: 'Template-based configs', reason: 'smb.conf and krb5.conf use envsubst for variable substitution from .env. Same scripts work across different AD environments.' },
    { decision: 'PowerShell for data migration', reason: 'robocopy is the gold standard for Windows file migration with ACL preservation. Running it on the source (Windows) ensures native NTFS access.' },
    { decision: 'VFS audit logging', reason: 'Samba\'s vfs_full_audit module logs all file operations. Required for compliance and security monitoring integration with Wazuh.' },
  ],
};

const laim: RepoDetailData = {
  overview:
    'LAIM (LLM-Assisted Infrastructure Management) was an experimental project exploring AI-driven infrastructure automation. Designed to use LLMs for interpreting natural language infrastructure commands and translating them to Proxmox API calls, Ansible playbooks, or shell scripts. Shelved in favor of the MCP server approach which provides more structured tool access.',
  architectureLayers: [],
  architectureEdges: [],
  dataFlow: [],
  codeSnippets: [],
  techDecisions: [],
  brief: true,
};

const pvepostinstall: RepoDetailData = {
  overview:
    'PVE Post Install was a Proxmox VE post-installation configuration script. Automated common setup tasks: repository configuration (switching from enterprise to no-subscription repos), dark theme installation, IOMMU/PCI passthrough setup, and network bridge configuration. Superseded by the more comprehensive SOC Stack installer which handles post-install as part of full deployment.',
  architectureLayers: [],
  architectureEdges: [],
  dataFlow: [],
  codeSnippets: [],
  techDecisions: [],
  brief: true,
};

const hciViz: RepoDetailData = {
  overview:
    'HCI Viz was a hyper-converged infrastructure visualization tool. Rendered Proxmox cluster topologies with node status, storage pool utilization, and VM placement diagrams. The visualization concepts were absorbed into the Watchtower NOC Dashboard which provides a more comprehensive monitoring solution.',
  architectureLayers: [],
  architectureEdges: [],
  dataFlow: [],
  codeSnippets: [],
  techDecisions: [],
  brief: true,
};


// ─── MCP SERVERS ─────────────────────────────────────────────────────────────

const zeekMcp: RepoDetailData = {
  overview:
    'Zeek MCP is a Model Context Protocol server that exposes 18 tools for querying and analyzing Zeek network security monitor logs via AI assistants. It parses Zeek TSV log files (conn.log, dns.log, http.log, ssl.log, files.log, notice.log, ssh.log, software.log) with a custom query engine supporting time ranges, field filters, and aggregations. Features include cross-log host investigation, connection analysis, DNS query tracking, HTTP request inspection, SSL certificate analysis, and file hash lookups. Includes 2 resources for log directory metadata and 3 prompts for guided investigation workflows.',
  architectureLayers: [
    {
      label: 'MCP Protocol',
      color: '#7c5cfc',
      nodes: [
        { id: 'stdio', label: 'Stdio Transport', description: 'JSON-RPC over stdin/stdout for MCP client communication', color: '#7c5cfc' },
        { id: 'server', label: 'MCP Server', description: 'Tool, resource, and prompt registration via @modelcontextprotocol/sdk', color: '#8b5cf6' },
      ],
    },
    {
      label: 'Tool Layer',
      color: '#06b6d4',
      nodes: [
        { id: 'conn-tools', label: 'Connection Tools', description: 'Query conn.log: filter by IP, port, protocol, duration', color: '#06b6d4' },
        { id: 'dns-tools', label: 'DNS Tools', description: 'Query dns.log: domain lookups, query types, NXDOMAIN detection', color: '#0891b2' },
        { id: 'http-tools', label: 'HTTP Tools', description: 'Query http.log: URIs, user agents, status codes, methods', color: '#0e7490' },
        { id: 'invest-tools', label: 'Investigation Tools', description: 'Cross-log host investigation aggregating all log types', color: '#155e75' },
      ],
    },
    {
      label: 'Query Engine',
      color: '#10b981',
      nodes: [
        { id: 'parser', label: 'TSV Parser', description: 'Parses Zeek tab-separated log files with header detection', color: '#10b981' },
        { id: 'filter', label: 'Filter Engine', description: 'Field-level filtering with eq, neq, contains, regex operators', color: '#059669' },
        { id: 'aggregation', label: 'Aggregation', description: 'topN, sumField, countUnique for result summarization', color: '#047857' },
      ],
    },
  ],
  architectureEdges: [
    { from: 'stdio', to: 'server', label: 'JSON-RPC' },
    { from: 'server', to: 'conn-tools', label: 'tool dispatch' },
    { from: 'server', to: 'dns-tools', label: 'tool dispatch' },
    { from: 'server', to: 'http-tools', label: 'tool dispatch' },
    { from: 'server', to: 'invest-tools', label: 'tool dispatch' },
    { from: 'conn-tools', to: 'parser', label: 'conn.log' },
    { from: 'dns-tools', to: 'parser', label: 'dns.log' },
    { from: 'http-tools', to: 'parser', label: 'http.log' },
    { from: 'invest-tools', to: 'parser', label: 'all logs' },
    { from: 'parser', to: 'filter', label: 'parsed records' },
    { from: 'filter', to: 'aggregation', label: 'filtered results' },
  ],
  dataFlow: [
    { step: 1, title: 'Client Request', description: 'An AI assistant sends a tool call via MCP (e.g., zeek_investigate_host with an IP address and optional time range). The request arrives over stdio transport as JSON-RPC.' },
    { step: 2, title: 'Tool Dispatch', description: 'The MCP server routes to the registered tool handler. Each tool module (connections, dns, http, ssl, files, notices, ssh, investigation, software) handles its own Zeek log type.' },
    { step: 3, title: 'Log Parsing', description: 'The query engine reads the corresponding Zeek TSV log file from the configured log directory. The parser detects column headers from the #fields line and converts rows to typed objects.' },
    { step: 4, title: 'Filter and Aggregate', description: 'Filters are applied (IP matching, time ranges, field comparisons). Results pass through aggregation functions (topN talkers, connection counts, unique value counts) before formatting.' },
    { step: 5, title: 'Response', description: 'Formatted results return to the AI assistant as MCP tool response content. Investigation tools combine results from multiple log types into a unified host profile.' },
  ],
  codeSnippets: [
    {
      file: 'src/tools/investigation.ts',
      language: 'typescript',
      title: 'Cross-Log Host Investigation',
      description: 'The investigate_host tool runs parallel queries across all 8 Zeek log types for a single IP, building a comprehensive activity profile with connection stats, DNS queries, HTTP requests, and more.',
      code: `server.tool(
  "zeek_investigate_host",
  "Comprehensive investigation of all activity for a specific host across all Zeek log types",
  {
    ip: z.string().describe("IP address to investigate"),
    timeFrom: z.string().optional(),
    timeTo: z.string().optional(),
  },
  async (params) => {
    const [connSrc, connDst, dnsRecords, httpRecords,
           sslRecords, sshRecords, noticeRecords, softwareRecords] =
      await Promise.all([
        executeQuery(config, { logType: "conn", filters: ipFilters("id.orig_h"), ...timeRange }),
        executeQuery(config, { logType: "conn", filters: ipFilters("id.resp_h"), ...timeRange }),
        safeQuery(config, "dns", [...], timeRange),
        safeQuery(config, "http", ipFilters("id.orig_h"), timeRange),
        // ... ssl, ssh, notice, software
      ]);
    // Aggregate and format unified host profile
  }
);`,
    },
  ],
  techDecisions: [
    { decision: 'Direct TSV file parsing instead of Zeek API', reason: 'Zeek writes logs as flat TSV files. No database or API layer is needed. Parsing files directly keeps the server lightweight and works on any Zeek deployment.' },
    { decision: 'Parallel Promise.all for investigation queries', reason: 'Host investigation reads 8+ log files simultaneously. Parallel I/O reduces latency from seconds to sub-second for typical log volumes.' },
    { decision: 'Modular tool registration per log type', reason: 'Each Zeek log type (conn, dns, http, ssl, etc.) gets its own tool module. New log types can be added without modifying existing code.' },
  ],
};

const suricataMcp: RepoDetailData = {
  overview:
    'Suricata MCP is a Model Context Protocol server providing 20 tools for analyzing Suricata IDS/IPS EVE JSON logs and managing detection rules. It includes a full query engine for EVE events with support for alerts, flows, DNS, HTTP, TLS, SSH, file info, anomalies, and engine stats. Unique features include beaconing detection with statistical analysis (jitter, interval regularity, confidence scoring), live Suricata control via Unix socket, and rule management (enable/disable/reload). Includes 3 resources and 3 prompts.',
  architectureLayers: [
    {
      label: 'MCP Protocol',
      color: '#7c5cfc',
      nodes: [
        { id: 'stdio', label: 'Stdio Transport', description: 'JSON-RPC over stdin/stdout', color: '#7c5cfc' },
        { id: 'server', label: 'MCP Server', description: 'Registers 20 tools, 3 resources, 3 prompts', color: '#8b5cf6' },
      ],
    },
    {
      label: 'Tool Layer',
      color: '#06b6d4',
      nodes: [
        { id: 'alert-tools', label: 'Alert Tools', description: 'Query and analyze Suricata IDS alerts by signature, severity, IP', color: '#06b6d4' },
        { id: 'flow-tools', label: 'Flow Tools', description: 'Network flow analysis with duration, bytes, protocol stats', color: '#0891b2' },
        { id: 'beacon-tools', label: 'Beaconing Detection', description: 'Statistical C2 beacon detection via interval regularity analysis', color: '#0e7490' },
        { id: 'rule-tools', label: 'Rule Management', description: 'Enable, disable, and reload Suricata detection rules', color: '#155e75' },
        { id: 'socket-tools', label: 'Socket Commands', description: 'Live Suricata control via Unix socket (reload, stats, uptime)', color: '#164e63' },
      ],
    },
    {
      label: 'Backend',
      color: '#10b981',
      nodes: [
        { id: 'engine', label: 'Query Engine', description: 'EVE JSON parser with event type routing and field filtering', color: '#10b981' },
        { id: 'socket', label: 'Unix Socket Client', description: 'Communicates with running Suricata process for live commands', color: '#059669' },
      ],
    },
  ],
  architectureEdges: [
    { from: 'stdio', to: 'server', label: 'JSON-RPC' },
    { from: 'server', to: 'alert-tools', label: 'dispatch' },
    { from: 'server', to: 'flow-tools', label: 'dispatch' },
    { from: 'server', to: 'beacon-tools', label: 'dispatch' },
    { from: 'server', to: 'rule-tools', label: 'dispatch' },
    { from: 'server', to: 'socket-tools', label: 'dispatch' },
    { from: 'alert-tools', to: 'engine', label: 'EVE query' },
    { from: 'flow-tools', to: 'engine', label: 'EVE query' },
    { from: 'beacon-tools', to: 'engine', label: 'flow data' },
    { from: 'socket-tools', to: 'socket', label: 'unix socket' },
  ],
  dataFlow: [
    { step: 1, title: 'EVE JSON Ingestion', description: 'The query engine reads Suricata EVE JSON log files. Each line is a self-contained JSON event with an event_type field (alert, flow, dns, http, tls, ssh, fileinfo, anomaly, stats).' },
    { step: 2, title: 'Event Routing', description: 'Events are filtered by type and matched against tool-specific criteria: IP addresses, signatures, severity levels, time ranges, protocol fields.' },
    { step: 3, title: 'Analysis', description: 'Alert tools aggregate by signature and severity. Flow tools compute bandwidth stats. The beaconing detector groups flows by src/dst pair, calculates interval regularity, jitter ratios, and assigns confidence scores.' },
    { step: 4, title: 'Live Control', description: 'Socket tools connect to the Suricata Unix socket for runtime commands: rule reload, capture stats, running mode info. Requires Suricata to be running with socket enabled.' },
  ],
  codeSnippets: [
    {
      file: 'src/analytics/beaconing.ts',
      language: 'typescript',
      title: 'C2 Beacon Detection Algorithm',
      description: 'Groups flows by source/destination pair, computes interval statistics, and scores beacon confidence based on connection count, jitter ratio, and interval regularity.',
      code: `function calculateConfidence(
  connectionCount: number,
  jitter: number,
  avgInterval: number,
  stdDev: number,
): number {
  let score = 0;
  // More connections = higher confidence
  if (connectionCount >= 50) score += 30;
  else if (connectionCount >= 20) score += 20;
  else if (connectionCount >= 10) score += 10;
  // Low jitter relative to interval = higher confidence
  if (avgInterval > 0) {
    const jitterRatio = jitter / avgInterval;
    if (jitterRatio < 0.05) score += 35;
    else if (jitterRatio < 0.1) score += 25;
    else if (jitterRatio < 0.2) score += 15;
  }
  // Low standard deviation = more regular
  if (avgInterval > 0 && stdDev / avgInterval < 0.1) score += 35;
  return Math.min(score, 100);
}`,
    },
  ],
  techDecisions: [
    { decision: 'EVE JSON over unified2 format', reason: 'EVE JSON is Suricata\'s modern output format with all event types in one file. Self-describing, easy to parse, and includes full protocol metadata.' },
    { decision: 'Statistical beaconing detection', reason: 'C2 beacons have regular intervals. Measuring jitter ratio and standard deviation catches malware callbacks that simple threshold rules miss.' },
    { decision: 'Unix socket for live control', reason: 'Suricata exposes a Unix socket API for runtime management. Enables rule reloads without restarting the engine, preserving flow state and detection continuity.' },
  ],
};

const wazuhMcp: RepoDetailData = {
  overview:
    'Wazuh MCP is a Model Context Protocol server providing 11 tools for interacting with the Wazuh SIEM/XDR platform via its REST API. Covers agent management (list, status, OS info), alert querying with severity and rule ID filters, rule browsing and search, decoder inspection, and server version info. Uses a typed HTTP client with JWT authentication and automatic token refresh. Includes 3 resources and 3 prompts.',
  architectureLayers: [
    {
      label: 'MCP Protocol',
      color: '#7c5cfc',
      nodes: [
        { id: 'stdio', label: 'Stdio Transport', description: 'JSON-RPC over stdin/stdout', color: '#7c5cfc' },
        { id: 'server', label: 'MCP Server', description: 'Registers 11 tools, 3 resources, 3 prompts', color: '#8b5cf6' },
      ],
    },
    {
      label: 'Tool Layer',
      color: '#06b6d4',
      nodes: [
        { id: 'agent-tools', label: 'Agent Tools', description: 'List agents, get status, OS info, group membership', color: '#06b6d4' },
        { id: 'alert-tools', label: 'Alert Tools', description: 'Query alerts by severity, rule ID, agent, time range', color: '#0891b2' },
        { id: 'rule-tools', label: 'Rule Tools', description: 'Browse and search Wazuh detection rules', color: '#0e7490' },
        { id: 'decoder-tools', label: 'Decoder Tools', description: 'List and inspect log decoders', color: '#155e75' },
      ],
    },
    {
      label: 'API Client',
      color: '#10b981',
      nodes: [
        { id: 'client', label: 'Wazuh Client', description: 'Typed HTTP client with JWT auth and auto token refresh', color: '#10b981' },
        { id: 'wazuh-api', label: 'Wazuh REST API', description: 'Target Wazuh manager API (port 55000)', color: '#059669' },
      ],
    },
  ],
  architectureEdges: [
    { from: 'stdio', to: 'server', label: 'JSON-RPC' },
    { from: 'server', to: 'agent-tools', label: 'dispatch' },
    { from: 'server', to: 'alert-tools', label: 'dispatch' },
    { from: 'server', to: 'rule-tools', label: 'dispatch' },
    { from: 'server', to: 'decoder-tools', label: 'dispatch' },
    { from: 'agent-tools', to: 'client', label: 'API call' },
    { from: 'alert-tools', to: 'client', label: 'API call' },
    { from: 'rule-tools', to: 'client', label: 'API call' },
    { from: 'decoder-tools', to: 'client', label: 'API call' },
    { from: 'client', to: 'wazuh-api', label: 'HTTPS + JWT' },
  ],
  dataFlow: [
    { step: 1, title: 'Authentication', description: 'The Wazuh client authenticates with the Wazuh manager API using username/password credentials. Receives a JWT token that is cached and automatically refreshed on expiry.' },
    { step: 2, title: 'Tool Call', description: 'AI assistant calls a tool (e.g., wazuh_list_agents). The MCP server dispatches to the appropriate tool handler which constructs the API request.' },
    { step: 3, title: 'API Request', description: 'The typed HTTP client sends the request to the Wazuh REST API with the JWT bearer token. Handles pagination, query parameters, and response parsing.' },
    { step: 4, title: 'Response Formatting', description: 'Raw API responses are transformed into readable summaries. Agent lists show name, IP, status, and OS. Alerts show rule description, severity, and timestamp.' },
  ],
  codeSnippets: [
    {
      file: 'src/tools/alerts.ts',
      language: 'typescript',
      title: 'Alert Query Tool',
      description: 'Queries Wazuh alerts with filters for severity level, rule ID, agent ID, and time range. Formats results with rule descriptions and MITRE technique mappings.',
      code: `server.tool(
  "wazuh_get_alerts",
  "Query recent security alerts from Wazuh with optional filters",
  {
    limit: z.number().optional().default(20),
    level: z.number().optional().describe("Minimum alert level (1-15)"),
    agentId: z.string().optional().describe("Filter by agent ID"),
    ruleId: z.string().optional().describe("Filter by rule ID"),
    timeFrom: z.string().optional().describe("Start time (ISO 8601)"),
  },
  async (params) => {
    const queryParams: Record<string, string> = {
      limit: String(params.limit),
      sort: "-timestamp",
    };
    if (params.level) queryParams.level = String(params.level);
    if (params.agentId) queryParams["agent.id"] = params.agentId;
    const response = await client.get("/alerts", queryParams);
    // Format alerts with rule info, severity, MITRE mappings
  }
);`,
    },
  ],
  techDecisions: [
    { decision: 'JWT authentication with auto-refresh', reason: 'Wazuh API uses short-lived JWT tokens. The client transparently refreshes expired tokens so tool calls never fail due to auth timeouts.' },
    { decision: 'Optional TLS verification bypass', reason: 'Many Wazuh deployments use self-signed certificates. The verifySsl config option allows disabling TLS verification for lab and development environments.' },
    { decision: 'Separate tool modules per API domain', reason: 'Agents, alerts, rules, decoders, and version each get their own module. Keeps the codebase organized and each module independently testable.' },
  ],
};

const mitreMcp: RepoDetailData = {
  overview:
    'MITRE ATT&CK MCP is a Model Context Protocol server with 20 tools for querying the MITRE ATT&CK knowledge base. It downloads and caches the full Enterprise ATT&CK STIX dataset locally, then provides tools for technique lookup, tactic browsing, threat group profiling, software analysis, mitigation mapping, data source coverage, campaign attribution, and detection gap analysis. The data store parses STIX 2.1 bundles into indexed maps for fast lookup. Includes 3 resources and 4 prompts.',
  architectureLayers: [
    {
      label: 'MCP Protocol',
      color: '#7c5cfc',
      nodes: [
        { id: 'stdio', label: 'Stdio Transport', description: 'JSON-RPC over stdin/stdout', color: '#7c5cfc' },
        { id: 'server', label: 'MCP Server', description: 'Registers 20 tools, 3 resources, 4 prompts', color: '#8b5cf6' },
      ],
    },
    {
      label: 'Tool Layer',
      color: '#06b6d4',
      nodes: [
        { id: 'tech-tools', label: 'Technique Tools', description: 'Search, lookup, list techniques by tactic or platform', color: '#06b6d4' },
        { id: 'group-tools', label: 'Group Tools', description: 'Threat group profiles with associated techniques and software', color: '#0891b2' },
        { id: 'mapping-tools', label: 'Mapping Tools', description: 'Detection coverage analysis and gap identification', color: '#0e7490' },
        { id: 'campaign-tools', label: 'Campaign Tools', description: 'Campaign attribution linking groups to techniques over time', color: '#155e75' },
      ],
    },
    {
      label: 'Data Store',
      color: '#10b981',
      nodes: [
        { id: 'store', label: 'ATT&CK Data Store', description: 'In-memory indexed STIX 2.1 data with techniques, groups, software, mitigations', color: '#10b981' },
        { id: 'cache', label: 'Local Cache', description: 'Downloads STIX bundle on first run, caches to disk for offline use', color: '#059669' },
      ],
    },
  ],
  architectureEdges: [
    { from: 'stdio', to: 'server', label: 'JSON-RPC' },
    { from: 'server', to: 'tech-tools', label: 'dispatch' },
    { from: 'server', to: 'group-tools', label: 'dispatch' },
    { from: 'server', to: 'mapping-tools', label: 'dispatch' },
    { from: 'server', to: 'campaign-tools', label: 'dispatch' },
    { from: 'tech-tools', to: 'store', label: 'query' },
    { from: 'group-tools', to: 'store', label: 'query' },
    { from: 'mapping-tools', to: 'store', label: 'query' },
    { from: 'campaign-tools', to: 'store', label: 'query' },
    { from: 'store', to: 'cache', label: 'load/save' },
  ],
  dataFlow: [
    { step: 1, title: 'Data Initialization', description: 'On startup, the data store checks for a cached STIX bundle. If missing or stale, it downloads the Enterprise ATT&CK dataset from GitHub. The STIX 2.1 JSON is parsed into indexed maps keyed by ID, name, and tactic.' },
    { step: 2, title: 'Tool Query', description: 'Tools query the in-memory store using indexed lookups. Technique search supports ID (T1059), name substring, tactic filter, and platform filter. Group tools resolve relationships to list associated techniques.' },
    { step: 3, title: 'Relationship Resolution', description: 'STIX relationships connect objects (group uses technique, technique mitigated by mitigation). The store resolves these into enriched results with full context.' },
    { step: 4, title: 'Coverage Analysis', description: 'Mapping tools compare a list of detected techniques against the full ATT&CK matrix to identify detection gaps by tactic, highlighting blind spots in security monitoring.' },
  ],
  codeSnippets: [
    {
      file: 'src/data/index.ts',
      language: 'typescript',
      title: 'STIX Data Store Initialization',
      description: 'Downloads and indexes the full ATT&CK STIX bundle, building lookup maps for techniques, groups, software, mitigations, campaigns, and data sources.',
      code: `async initialize(): Promise<void> {
  const raw = await this.loadOrDownload();
  const bundle = JSON.parse(raw) as StixBundle;

  for (const obj of bundle.objects) {
    switch (obj.type) {
      case "attack-pattern":
        this.techniques.set(obj.id, this.parseTechnique(obj));
        break;
      case "intrusion-set":
        this.groups.set(obj.id, this.parseGroup(obj));
        break;
      case "malware":
      case "tool":
        this.software.set(obj.id, this.parseSoftware(obj));
        break;
      case "relationship":
        this.relationships.push(this.parseRelationship(obj));
        break;
    }
  }
  this.buildIndexes(); // name lookups, tactic maps
}`,
    },
  ],
  techDecisions: [
    { decision: 'Local STIX cache instead of live API', reason: 'The ATT&CK STIX bundle is ~25MB. Caching locally enables offline operation and sub-millisecond lookups instead of network round-trips for every query.' },
    { decision: 'In-memory indexed maps', reason: 'Building Map objects keyed by ID and name during initialization makes all lookups O(1). The dataset fits comfortably in memory (~50MB parsed).' },
    { decision: 'STIX 2.1 relationship resolution', reason: 'ATT&CK uses STIX relationships to connect techniques to groups, mitigations, and data sources. Resolving these at query time provides rich, contextual results.' },
  ],
};

const thehiveMcp: RepoDetailData = {
  overview:
    'TheHive MCP is a Model Context Protocol server with 25 tools for managing security incidents on TheHive platform. Covers the full incident response lifecycle: case creation and management, alert intake and promotion, task assignment and tracking, observable (IOC) management, task logs, comments, and user administration. Uses a typed HTTP client against TheHive4 API with API key authentication. Includes 3 resources and 3 prompts.',
  architectureLayers: [
    {
      label: 'MCP Protocol',
      color: '#7c5cfc',
      nodes: [
        { id: 'stdio', label: 'Stdio Transport', description: 'JSON-RPC over stdin/stdout', color: '#7c5cfc' },
        { id: 'server', label: 'MCP Server', description: 'Registers 25 tools, 3 resources, 3 prompts', color: '#8b5cf6' },
      ],
    },
    {
      label: 'Tool Layer',
      color: '#06b6d4',
      nodes: [
        { id: 'case-tools', label: 'Case Tools', description: 'Create, update, search, close, delete cases', color: '#06b6d4' },
        { id: 'alert-tools', label: 'Alert Tools', description: 'List, get, promote alerts to cases, merge alerts', color: '#0891b2' },
        { id: 'task-tools', label: 'Task Tools', description: 'Create, assign, update, complete tasks within cases', color: '#0e7490' },
        { id: 'observable-tools', label: 'Observable Tools', description: 'Add, search, update IOCs (IPs, domains, hashes, URLs)', color: '#155e75' },
        { id: 'comment-tools', label: 'Comments and Logs', description: 'Add task logs and case comments for investigation notes', color: '#164e63' },
      ],
    },
    {
      label: 'API Client',
      color: '#10b981',
      nodes: [
        { id: 'client', label: 'TheHive Client', description: 'Typed HTTP client with API key auth and query builder', color: '#10b981' },
        { id: 'hive-api', label: 'TheHive API', description: 'TheHive4 REST API (port 9000)', color: '#059669' },
      ],
    },
  ],
  architectureEdges: [
    { from: 'stdio', to: 'server', label: 'JSON-RPC' },
    { from: 'server', to: 'case-tools', label: 'dispatch' },
    { from: 'server', to: 'alert-tools', label: 'dispatch' },
    { from: 'server', to: 'task-tools', label: 'dispatch' },
    { from: 'server', to: 'observable-tools', label: 'dispatch' },
    { from: 'server', to: 'comment-tools', label: 'dispatch' },
    { from: 'case-tools', to: 'client', label: 'API call' },
    { from: 'alert-tools', to: 'client', label: 'API call' },
    { from: 'task-tools', to: 'client', label: 'API call' },
    { from: 'observable-tools', to: 'client', label: 'API call' },
    { from: 'client', to: 'hive-api', label: 'HTTPS + API key' },
  ],
  dataFlow: [
    { step: 1, title: 'Incident Intake', description: 'Alerts arrive in TheHive from SIEM integrations or manual creation. The alert tools list and inspect incoming alerts, then promote them to cases for investigation.' },
    { step: 2, title: 'Case Management', description: 'Cases are created with severity, TLP, PAP, and tag assignments. Tasks are added to track investigation steps. Each task can be assigned to an analyst.' },
    { step: 3, title: 'Observable Tracking', description: 'IOCs (IP addresses, domains, file hashes, URLs) are added as observables. Observables can be flagged as IOC, marked with sighting status, and tagged with TLP levels.' },
    { step: 4, title: 'Documentation', description: 'Task logs record investigation actions and findings. Case comments provide high-level notes. All entries are timestamped and attributed to the user/API key.' },
  ],
  codeSnippets: [
    {
      file: 'src/tools/cases.ts',
      language: 'typescript',
      title: 'Case Creation Tool',
      description: 'Creates a new incident case in TheHive with full metadata: title, description, severity, TLP/PAP markings, tags, and assignee.',
      code: `server.tool(
  "thehive_create_case",
  "Create a new case in TheHive for incident tracking",
  {
    title: z.string().describe("Case title"),
    description: z.string().optional(),
    severity: z.number().min(1).max(4).optional().default(2),
    tlp: z.number().min(0).max(4).optional().default(2),
    pap: z.number().min(0).max(3).optional().default(2),
    tags: z.array(z.string()).optional(),
    assignee: z.string().optional(),
  },
  async (params) => {
    const caseData = await client.createCase({
      title: params.title,
      description: params.description,
      severity: params.severity,
      tlp: params.tlp,
      pap: params.pap,
      tags: params.tags,
      owner: params.assignee,
    });
    return { content: [{ type: "text", text: formatCase(caseData) }] };
  }
);`,
    },
  ],
  techDecisions: [
    { decision: 'TheHive4 API (not TheHive5)', reason: 'TheHive4 API is widely deployed and stable. The typed client handles the v1 API endpoints with proper request/response typing.' },
    { decision: '7 tool modules matching TheHive domains', reason: 'Cases, alerts, tasks, observables, task logs, comments, and users each get a dedicated module. Mirrors TheHive\'s own domain model.' },
    { decision: 'API key authentication', reason: 'API keys are simpler than OAuth for server-to-server communication. TheHive supports per-user API keys with role-based access control.' },
  ],
};

const mispMcp: RepoDetailData = {
  overview:
    'MISP MCP is a Model Context Protocol server with 19 tools for the MISP threat intelligence sharing platform. Provides event management (create, search, publish), attribute/IOC operations (add, search, update), correlation discovery, tag management, intelligence export (STIX, CSV, OpenIOC), sighting tracking, and warning list management. Uses a typed HTTP client with MISP API key auth. Includes 3 resources and 3 prompts.',
  architectureLayers: [
    {
      label: 'MCP Protocol',
      color: '#7c5cfc',
      nodes: [
        { id: 'stdio', label: 'Stdio Transport', description: 'JSON-RPC over stdin/stdout', color: '#7c5cfc' },
        { id: 'server', label: 'MCP Server', description: 'Registers 19 tools, 3 resources, 3 prompts', color: '#8b5cf6' },
      ],
    },
    {
      label: 'Tool Layer',
      color: '#06b6d4',
      nodes: [
        { id: 'event-tools', label: 'Event Tools', description: 'Create, search, publish threat intelligence events', color: '#06b6d4' },
        { id: 'attr-tools', label: 'Attribute Tools', description: 'Add, search, update IOC attributes (IPs, hashes, domains)', color: '#0891b2' },
        { id: 'corr-tools', label: 'Correlation Tools', description: 'Discover attribute correlations across events', color: '#0e7490' },
        { id: 'export-tools', label: 'Export Tools', description: 'Export events as STIX, CSV, OpenIOC, and other formats', color: '#155e75' },
      ],
    },
    {
      label: 'API Client',
      color: '#10b981',
      nodes: [
        { id: 'client', label: 'MISP Client', description: 'Typed HTTP client with MISP API key authentication', color: '#10b981' },
        { id: 'misp-api', label: 'MISP REST API', description: 'Target MISP instance REST API', color: '#059669' },
      ],
    },
  ],
  architectureEdges: [
    { from: 'stdio', to: 'server', label: 'JSON-RPC' },
    { from: 'server', to: 'event-tools', label: 'dispatch' },
    { from: 'server', to: 'attr-tools', label: 'dispatch' },
    { from: 'server', to: 'corr-tools', label: 'dispatch' },
    { from: 'server', to: 'export-tools', label: 'dispatch' },
    { from: 'event-tools', to: 'client', label: 'API call' },
    { from: 'attr-tools', to: 'client', label: 'API call' },
    { from: 'corr-tools', to: 'client', label: 'API call' },
    { from: 'export-tools', to: 'client', label: 'API call' },
    { from: 'client', to: 'misp-api', label: 'HTTPS + API key' },
  ],
  dataFlow: [
    { step: 1, title: 'Event Creation', description: 'Threat intelligence events are created with distribution level, threat level, analysis status, and descriptive info. Events serve as containers for related IOCs.' },
    { step: 2, title: 'Attribute Management', description: 'IOC attributes (IP addresses, domains, file hashes, URLs, email addresses) are added to events with type, category, and to_ids flag for IDS export.' },
    { step: 3, title: 'Correlation Discovery', description: 'MISP automatically correlates attributes across events. The correlation tools expose these links, revealing shared infrastructure between threat actors.' },
    { step: 4, title: 'Intelligence Export', description: 'Events and attributes can be exported in STIX 1/2, CSV, OpenIOC, and other standard formats for sharing with partner organizations and feeding into security tools.' },
  ],
  codeSnippets: [
    {
      file: 'src/tools/correlation.ts',
      language: 'typescript',
      title: 'Correlation Discovery Tool',
      description: 'Finds attribute correlations across MISP events, revealing shared IOCs between different threat intelligence reports.',
      code: `server.tool(
  "misp_get_correlations",
  "Get correlations for an event showing shared attributes across events",
  {
    eventId: z.string().describe("MISP event ID to check correlations for"),
    limit: z.number().optional().default(50),
  },
  async (params) => {
    const event = await client.get(\`/events/view/\${params.eventId}\`);
    const attributes = event.Event?.Attribute || [];
    const correlated = attributes.filter(
      (a: any) => a.RelatedAttribute && a.RelatedAttribute.length > 0
    );
    // Format correlation map showing shared IOCs
  }
);`,
    },
  ],
  techDecisions: [
    { decision: 'MISP native API over PyMISP', reason: 'Direct REST API calls avoid Python dependencies. The TypeScript client provides type safety and runs in the same Node.js process as the MCP server.' },
    { decision: 'Export format variety', reason: 'MISP supports STIX 1.x, STIX 2.x, CSV, OpenIOC, and more. Exposing all formats enables intelligence sharing with diverse partner toolchains.' },
    { decision: 'Warning list integration', reason: 'MISP warning lists flag known false positives (CDN IPs, popular domains). Tools surface these warnings to prevent analysts from chasing benign indicators.' },
  ],
};

const cortexMcp: RepoDetailData = {
  overview:
    'Cortex MCP is a Model Context Protocol server with 12 tools for the Cortex observable analysis and response engine. Cortex is the analysis companion to TheHive, running analyzers (VirusTotal, AbuseIPDB, MISP lookups, etc.) and responders (block IP, disable user, etc.) on observables. Tools cover analyzer listing and execution, job tracking and result retrieval, responder execution, and bulk analysis. Includes 2 resources and 2 prompts.',
  architectureLayers: [
    {
      label: 'MCP Protocol',
      color: '#7c5cfc',
      nodes: [
        { id: 'stdio', label: 'Stdio Transport', description: 'JSON-RPC over stdin/stdout', color: '#7c5cfc' },
        { id: 'server', label: 'MCP Server', description: 'Registers 12 tools, 2 resources, 2 prompts', color: '#8b5cf6' },
      ],
    },
    {
      label: 'Tool Layer',
      color: '#06b6d4',
      nodes: [
        { id: 'analyzer-tools', label: 'Analyzer Tools', description: 'List analyzers, run analysis on observables, get analyzer details', color: '#06b6d4' },
        { id: 'job-tools', label: 'Job Tools', description: 'Track analysis jobs, get results, wait for completion', color: '#0891b2' },
        { id: 'responder-tools', label: 'Responder Tools', description: 'List and execute responders (active response actions)', color: '#0e7490' },
        { id: 'bulk-tools', label: 'Bulk Tools', description: 'Run multiple analyzers on multiple observables in batch', color: '#155e75' },
      ],
    },
    {
      label: 'API Client',
      color: '#10b981',
      nodes: [
        { id: 'client', label: 'Cortex Client', description: 'Typed HTTP client with API key authentication', color: '#10b981' },
        { id: 'cortex-api', label: 'Cortex API', description: 'Cortex REST API (port 9001)', color: '#059669' },
      ],
    },
  ],
  architectureEdges: [
    { from: 'stdio', to: 'server', label: 'JSON-RPC' },
    { from: 'server', to: 'analyzer-tools', label: 'dispatch' },
    { from: 'server', to: 'job-tools', label: 'dispatch' },
    { from: 'server', to: 'responder-tools', label: 'dispatch' },
    { from: 'server', to: 'bulk-tools', label: 'dispatch' },
    { from: 'analyzer-tools', to: 'client', label: 'API call' },
    { from: 'job-tools', to: 'client', label: 'API call' },
    { from: 'responder-tools', to: 'client', label: 'API call' },
    { from: 'bulk-tools', to: 'client', label: 'API call' },
    { from: 'client', to: 'cortex-api', label: 'HTTPS + API key' },
  ],
  dataFlow: [
    { step: 1, title: 'Analyzer Discovery', description: 'List available analyzers with their supported data types (IP, domain, hash, URL, etc.). Each analyzer has a name, version, and list of accepted observable types.' },
    { step: 2, title: 'Analysis Submission', description: 'Submit an observable (e.g., an IP address) to one or more analyzers. Each submission creates a job that runs asynchronously on the Cortex server.' },
    { step: 3, title: 'Job Tracking', description: 'Poll job status until completion. Jobs progress through Waiting, InProgress, and Success/Failure states. Results include taxonomies, artifacts, and full report data.' },
    { step: 4, title: 'Response Actions', description: 'Responders execute active response actions: block an IP on a firewall, disable a user account, quarantine an endpoint. Each responder targets a specific action type.' },
  ],
  codeSnippets: [
    {
      file: 'src/tools/analyzers.ts',
      language: 'typescript',
      title: 'Run Analyzer on Observable',
      description: 'Submits an observable to a Cortex analyzer, creating an async job. The AI can then track the job and retrieve results.',
      code: `server.tool(
  "cortex_run_analyzer",
  "Run a specific analyzer on an observable",
  {
    analyzerId: z.string().describe("Analyzer ID to run"),
    dataType: z.string().describe("Observable type: ip, domain, hash, url, etc."),
    data: z.string().describe("The observable value to analyze"),
    tlp: z.number().min(0).max(3).optional().default(2),
    message: z.string().optional().describe("Analysis context/reason"),
  },
  async (params) => {
    const job = await client.runAnalyzer(params.analyzerId, {
      dataType: params.dataType,
      data: params.data,
      tlp: params.tlp,
      message: params.message,
    });
    return { content: [{ type: "text", text: formatJob(job) }] };
  }
);`,
    },
  ],
  techDecisions: [
    { decision: 'Async job model', reason: 'Cortex analyzers can take seconds to minutes (network lookups, sandbox detonation). The async job model lets the AI submit and check back rather than blocking.' },
    { decision: 'Bulk analysis support', reason: 'Security investigations often involve dozens of IOCs. Bulk tools submit multiple observables to multiple analyzers in one call, reducing round-trips.' },
    { decision: 'Paired with TheHive MCP', reason: 'Cortex and TheHive are designed to work together. TheHive manages cases, Cortex analyzes observables. Both MCP servers can be used in the same AI session for full IR workflows.' },
  ],
};

const rapid7Mcp: RepoDetailData = {
  overview:
    'Rapid7 MCP is a Model Context Protocol server with 26 tools for Rapid7 InsightIDR. Covers investigation management (create, update, close, list investigations), LEQL log search with time ranges and aggregations, alert retrieval and management, asset inventory, user activity tracking, threat intelligence queries, and saved query management. Uses a typed HTTP client against the Rapid7 InsightIDR REST API with API key auth. Includes 3 resources and 4 prompts.',
  architectureLayers: [
    {
      label: 'MCP Protocol',
      color: '#7c5cfc',
      nodes: [
        { id: 'stdio', label: 'Stdio Transport', description: 'JSON-RPC over stdin/stdout', color: '#7c5cfc' },
        { id: 'server', label: 'MCP Server', description: 'Registers 26 tools, 3 resources, 4 prompts', color: '#8b5cf6' },
      ],
    },
    {
      label: 'Tool Layer',
      color: '#06b6d4',
      nodes: [
        { id: 'invest-tools', label: 'Investigation Tools', description: 'Create, update, close, assign, and list investigations', color: '#06b6d4' },
        { id: 'log-tools', label: 'Log Search Tools', description: 'LEQL query execution with time ranges and aggregations', color: '#0891b2' },
        { id: 'alert-tools', label: 'Alert Tools', description: 'List, get, update, and close alerts', color: '#0e7490' },
        { id: 'asset-tools', label: 'Asset Tools', description: 'Search and inspect assets in the environment', color: '#155e75' },
        { id: 'threat-tools', label: 'Threat Tools', description: 'Query threat intelligence indicators', color: '#164e63' },
      ],
    },
    {
      label: 'API Client',
      color: '#10b981',
      nodes: [
        { id: 'client', label: 'Rapid7 Client', description: 'Typed HTTP client with API key authentication', color: '#10b981' },
        { id: 'idr-api', label: 'InsightIDR API', description: 'Rapid7 InsightIDR cloud REST API', color: '#059669' },
      ],
    },
  ],
  architectureEdges: [
    { from: 'stdio', to: 'server', label: 'JSON-RPC' },
    { from: 'server', to: 'invest-tools', label: 'dispatch' },
    { from: 'server', to: 'log-tools', label: 'dispatch' },
    { from: 'server', to: 'alert-tools', label: 'dispatch' },
    { from: 'server', to: 'asset-tools', label: 'dispatch' },
    { from: 'server', to: 'threat-tools', label: 'dispatch' },
    { from: 'invest-tools', to: 'client', label: 'API call' },
    { from: 'log-tools', to: 'client', label: 'API call' },
    { from: 'alert-tools', to: 'client', label: 'API call' },
    { from: 'asset-tools', to: 'client', label: 'API call' },
    { from: 'threat-tools', to: 'client', label: 'API call' },
    { from: 'client', to: 'idr-api', label: 'HTTPS + API key' },
  ],
  dataFlow: [
    { step: 1, title: 'Log Search', description: 'LEQL (Log Entry Query Language) queries are submitted with log set, time range, and optional aggregation. InsightIDR executes the query across collected log data and returns matching events.' },
    { step: 2, title: 'Investigation Workflow', description: 'Investigations are created from alerts or manually. Each investigation tracks status, assignee, priority, and disposition. Tools support the full lifecycle from creation to closure.' },
    { step: 3, title: 'Alert Triage', description: 'Alerts from InsightIDR detection rules are listed and inspected. Analysts can update status, add comments, and link alerts to investigations.' },
    { step: 4, title: 'Asset and User Context', description: 'Asset tools provide host details (OS, IP, last seen). User tools show authentication activity and account status. Both enrich investigation context.' },
  ],
  codeSnippets: [
    {
      file: 'src/tools/logs.ts',
      language: 'typescript',
      title: 'LEQL Log Search Tool',
      description: 'Executes LEQL queries against InsightIDR log sets with time range filtering and result pagination.',
      code: `server.tool(
  "rapid7_search_logs",
  "Search InsightIDR logs using LEQL query language",
  {
    logSetId: z.string().describe("Log set to search"),
    query: z.string().describe("LEQL query string"),
    timeFrom: z.string().describe("Start time (ISO 8601)"),
    timeTo: z.string().describe("End time (ISO 8601)"),
    limit: z.number().optional().default(50),
  },
  async (params) => {
    const results = await client.searchLogs({
      log_set: params.logSetId,
      query: params.query,
      from: params.timeFrom,
      to: params.timeTo,
      limit: params.limit,
    });
    return { content: [{ type: "text", text: formatLogResults(results) }] };
  }
);`,
    },
  ],
  techDecisions: [
    { decision: 'LEQL as primary query interface', reason: 'LEQL is InsightIDR\'s native query language. Exposing it directly gives the AI full query power without abstraction loss. The AI can construct complex queries with aggregations and filters.' },
    { decision: 'Investigation lifecycle tools', reason: 'InsightIDR investigations are the core workflow unit. Full CRUD support lets the AI manage the entire investigation process from alert triage to closure.' },
    { decision: 'Cloud API with region routing', reason: 'InsightIDR is cloud-hosted. The client handles region-specific API endpoints (us, us2, us3, eu, ca, au, ap) based on configuration.' },
  ],
};

const sophosMcp: RepoDetailData = {
  overview:
    'Sophos MCP is a Model Context Protocol server with 31 tools for Sophos Central, the largest tool count in the MCP server collection. Covers endpoint management (list, isolate, scan, tamper protection), EDR/XDR detection analysis, alert management, event timeline queries, security policy management, tenant administration, and Live Discover queries (Sophos query language for real-time endpoint interrogation). Uses OAuth2 client credentials flow for Sophos Central API auth. Includes 3 resources and 4 prompts.',
  architectureLayers: [
    {
      label: 'MCP Protocol',
      color: '#7c5cfc',
      nodes: [
        { id: 'stdio', label: 'Stdio Transport', description: 'JSON-RPC over stdin/stdout', color: '#7c5cfc' },
        { id: 'server', label: 'MCP Server', description: 'Registers 31 tools, 3 resources, 4 prompts', color: '#8b5cf6' },
      ],
    },
    {
      label: 'Tool Layer',
      color: '#06b6d4',
      nodes: [
        { id: 'endpoint-tools', label: 'Endpoint Tools', description: 'List, isolate, scan, manage tamper protection on endpoints', color: '#06b6d4' },
        { id: 'detect-tools', label: 'Detection Tools', description: 'EDR/XDR detection analysis with MITRE technique mapping', color: '#0891b2' },
        { id: 'alert-tools', label: 'Alert Tools', description: 'Security alert management and triage', color: '#0e7490' },
        { id: 'policy-tools', label: 'Policy Tools', description: 'Endpoint protection and server protection policy management', color: '#155e75' },
        { id: 'ld-tools', label: 'Live Discover', description: 'Real-time endpoint queries using Sophos query language', color: '#164e63' },
      ],
    },
    {
      label: 'API Client',
      color: '#10b981',
      nodes: [
        { id: 'client', label: 'Sophos Client', description: 'OAuth2 client credentials with tenant ID resolution', color: '#10b981' },
        { id: 'sophos-api', label: 'Sophos Central API', description: 'Sophos Central cloud REST API', color: '#059669' },
      ],
    },
  ],
  architectureEdges: [
    { from: 'stdio', to: 'server', label: 'JSON-RPC' },
    { from: 'server', to: 'endpoint-tools', label: 'dispatch' },
    { from: 'server', to: 'detect-tools', label: 'dispatch' },
    { from: 'server', to: 'alert-tools', label: 'dispatch' },
    { from: 'server', to: 'policy-tools', label: 'dispatch' },
    { from: 'server', to: 'ld-tools', label: 'dispatch' },
    { from: 'endpoint-tools', to: 'client', label: 'API call' },
    { from: 'detect-tools', to: 'client', label: 'API call' },
    { from: 'alert-tools', to: 'client', label: 'API call' },
    { from: 'policy-tools', to: 'client', label: 'API call' },
    { from: 'ld-tools', to: 'client', label: 'API call' },
    { from: 'client', to: 'sophos-api', label: 'OAuth2 + tenant ID' },
  ],
  dataFlow: [
    { step: 1, title: 'Authentication', description: 'OAuth2 client credentials flow: exchange client ID and secret for a bearer token. Then resolve the tenant ID via the whoami endpoint to get the correct data region URL.' },
    { step: 2, title: 'Endpoint Management', description: 'List endpoints with health status, OS, last seen time. Isolate compromised endpoints from the network. Trigger on-demand scans. Toggle tamper protection for maintenance.' },
    { step: 3, title: 'Detection Analysis', description: 'EDR/XDR detections include process details, MITRE technique IDs, severity scores, and remediation status. Detection tools support filtering by severity, type, and time range.' },
    { step: 4, title: 'Live Discover', description: 'Submit queries to running endpoints for real-time data collection. Queries use the Sophos query language to interrogate processes, network connections, file system, and registry on live endpoints.' },
  ],
  codeSnippets: [
    {
      file: 'src/tools/endpoints.ts',
      language: 'typescript',
      title: 'Endpoint Isolation Tool',
      description: 'Isolates a compromised endpoint from the network via Sophos Central, cutting off lateral movement while maintaining management connectivity.',
      code: `server.tool(
  "sophos_isolate_endpoint",
  "Isolate an endpoint from the network (containment action)",
  {
    endpointId: z.string().describe("Endpoint ID to isolate"),
    comment: z.string().optional().describe("Reason for isolation"),
  },
  async (params) => {
    const result = await client.post(
      \`/endpoint/v1/endpoints/\${params.endpointId}/isolation\`,
      {
        enabled: true,
        comment: params.comment || "Isolated via MCP server",
      }
    );
    return {
      content: [{ type: "text",
        text: \`Endpoint \${params.endpointId} isolated successfully\` }],
    };
  }
);`,
    },
  ],
  techDecisions: [
    { decision: 'OAuth2 client credentials flow', reason: 'Sophos Central requires OAuth2 for API access. The client handles token acquisition, caching, and refresh transparently. Tenant ID resolution is automatic via the whoami endpoint.' },
    { decision: '31 tools across 7 modules', reason: 'Sophos Central is a broad platform covering endpoints, EDR/XDR, alerts, events, policies, tenants, and Live Discover. Each domain needs comprehensive tool coverage for effective security operations.' },
    { decision: 'Live Discover for real-time queries', reason: 'Unlike log-based tools that query historical data, Live Discover interrogates running endpoints. Critical for incident response when you need current process lists, network connections, or file system state.' },
  ],
};

// ─── EXPORT ──────────────────────────────────────────────────────────────────

export const REPO_DETAILS: Record<string, RepoDetailData> = {
  // Security
  cyberbrief: cyberbrief,
  'bro-hunter': broHunter,
  'soc-showcase': socShowcase,
  'playbook-forge': playbookForge,
  'intel-workbench': intelWorkbench,
  proxguard: proxguard,
  'soc-stack': socStack,
  // Developer
  'dev-dashboard': devDashboard,
  // Dev Tools
  'prompt-library': promptLibrary,
  'usage-tracker': usageTracker,
  portgrid: portgrid,
  'variant-gallery': variantGallery,
  'social-preview': socialPreview,
  // Infrastructure
  watchtower: watchtower,
  'samba-ad-migration': sambaAdMigration,
  laim: laim,
  pvepostinstall: pvepostinstall,
  'hci-viz': hciViz,
  // MCP Servers
  'zeek-mcp': zeekMcp,
  'suricata-mcp': suricataMcp,
  'wazuh-mcp': wazuhMcp,
  'mitre-mcp': mitreMcp,
  'thehive-mcp': thehiveMcp,
  'misp-mcp': mispMcp,
  'cortex-mcp': cortexMcp,
  'rapid7-mcp': rapid7Mcp,
  'sophos-mcp': sophosMcp,
};
