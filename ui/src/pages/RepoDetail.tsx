import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronDown,
  ExternalLink,
  Github,
  Globe,
  Lock,
} from 'lucide-react';
import { REPOS } from '../data/repos';
import { REPO_DETAILS, type RepoDetailData, type DiagramLayer, type DataFlowStep, type CodeSnippet, type TechDecision, type ApiEndpoint } from '../data/repos-detail';

const HOST_IP = '192.168.4.86';

/* ── Architecture Diagram ─────────────────────────────────────────────── */

function ArchitectureDiagram({ layers }: { layers: DiagramLayer[] }) {
  return (
    <div className="space-y-0">
      {layers.map((layer, li) => (
        <div key={layer.label}>
          {/* Layer */}
          <div className="rounded-xl border border-dashed border-white/10 bg-[#16162a] p-4">
            <div
              className="mb-3 text-[11px] font-bold uppercase tracking-widest"
              style={{ color: layer.color }}
            >
              {layer.label}
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {layer.nodes.map((node) => (
                <div
                  key={node.id}
                  className="rounded-lg bg-white/[0.03] p-3"
                  style={{ borderLeft: `3px solid ${node.color}` }}
                >
                  <div className="text-xs font-semibold text-white">{node.label}</div>
                  <div className="mt-1 text-[11px] leading-relaxed text-gray-400">{node.description}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Connector between layers */}
          {li < layers.length - 1 && (
            <div className="flex justify-center py-2">
              <div className="flex flex-col items-center gap-0.5">
                <div className="h-3 w-px bg-white/15" />
                <ChevronDown size={12} className="text-white/25" />
                <div className="h-3 w-px bg-white/15" />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Data Flow ────────────────────────────────────────────────────────── */

function DataFlow({ steps }: { steps: DataFlowStep[] }) {
  return (
    <div className="space-y-0">
      {steps.map((step, i) => (
        <div key={step.step}>
          <div className="flex gap-3 rounded-xl border border-dashed border-white/10 bg-[#16162a] p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#7c5cfc]/30 bg-[#7c5cfc]/10 font-mono text-xs font-bold text-[#7c5cfc]">
              {step.step}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">{step.title}</div>
              <div className="mt-1 text-xs leading-relaxed text-gray-400">{step.description}</div>
            </div>
          </div>
          {i < steps.length - 1 && (
            <div className="flex justify-center py-1.5">
              <div className="h-4 w-px bg-[#7c5cfc]/20" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Code Snippet ─────────────────────────────────────────────────────── */

function CodeBlock({ snippet }: { snippet: CodeSnippet }) {
  return (
    <div className="rounded-xl border border-dashed border-white/10 bg-[#16162a] overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5">
        <div>
          <div className="text-xs font-semibold text-white">{snippet.title}</div>
          <div className="mt-0.5 font-mono text-[10px] text-gray-500">{snippet.file}</div>
        </div>
        <span className="rounded-full border border-dashed border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] text-gray-500">
          {snippet.language}
        </span>
      </div>
      <div className="px-4 py-2">
        <p className="text-[11px] leading-relaxed text-gray-400 mb-3">{snippet.description}</p>
      </div>
      <div className="border-t border-white/5 bg-[#0d0d1a] px-4 py-3 overflow-x-auto">
        <pre className="text-[11px] leading-relaxed text-gray-300">
          <code>{snippet.code}</code>
        </pre>
      </div>
    </div>
  );
}

/* ── Tech Decisions ───────────────────────────────────────────────────── */

function TechDecisions({ decisions }: { decisions: TechDecision[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {decisions.map((d) => (
        <div
          key={d.decision}
          className="rounded-xl border border-dashed border-white/10 bg-[#16162a] p-4"
        >
          <div className="text-xs font-semibold text-[#7c5cfc]">{d.decision}</div>
          <div className="mt-1.5 text-[11px] leading-relaxed text-gray-400">{d.reason}</div>
        </div>
      ))}
    </div>
  );
}

/* ── API Surface ──────────────────────────────────────────────────────── */

function ApiSurface({ endpoints }: { endpoints: ApiEndpoint[] }) {
  return (
    <div className="rounded-xl border border-dashed border-white/10 bg-[#16162a] overflow-hidden">
      <div className="divide-y divide-white/5">
        {endpoints.map((ep) => {
          const methodColors: Record<string, string> = {
            GET: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
            POST: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
            PUT: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
            DELETE: 'text-red-400 bg-red-500/10 border-red-500/20',
          };
          const cls = methodColors[ep.method] || 'text-gray-400 bg-white/5 border-white/10';
          return (
            <div key={`${ep.method}-${ep.path}`} className="flex items-center gap-3 px-4 py-2.5">
              <span className={`shrink-0 rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold ${cls}`}>
                {ep.method}
              </span>
              <code className="text-[11px] font-mono text-gray-300">{ep.path}</code>
              <span className="ml-auto text-[11px] text-gray-500 hidden sm:block">{ep.description}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Section Heading ──────────────────────────────────────────────────── */

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 mt-8 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-300 first:mt-0">
      <div className="h-px flex-1 bg-white/10" />
      <span>{children}</span>
      <div className="h-px flex-1 bg-white/10" />
    </h2>
  );
}

/* ── Main Page ────────────────────────────────────────────────────────── */

export default function RepoDetail() {
  const { slug } = useParams<{ slug: string }>();

  const repo = REPOS.find((r) => r.slug === slug);
  const detail = slug ? REPO_DETAILS[slug] : undefined;

  if (!repo || !detail) {
    return (
      <div className="animate-fadeIn min-h-full" style={{ backgroundColor: '#0a0a14' }}>
        <Link to="/repos" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-6">
          <ArrowLeft size={14} /> Back to Repos
        </Link>
        <div className="text-center py-20">
          <div className="text-lg text-gray-500">Repo not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn min-h-full" style={{ backgroundColor: '#0a0a14' }}>
      {/* Back Link */}
      <Link
        to="/repos"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Back to Repos
      </Link>

      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-white">{repo.name}</h1>
          {/* Badges */}
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${
              repo.visibility === 'private'
                ? 'border-amber-500/20 bg-amber-500/10 text-amber-400'
                : 'border-white/10 bg-white/5 text-gray-400'
            }`}
          >
            {repo.visibility === 'private' ? <Lock size={9} className="inline mr-1" /> : <Globe size={9} className="inline mr-1" />}
            {repo.visibility}
          </span>
          <span className="rounded-full border border-[#7c5cfc]/30 bg-[#7c5cfc]/10 px-2.5 py-0.5 text-[10px] font-medium text-[#7c5cfc]">
            {repo.status}
          </span>
        </div>
        <p className="text-sm text-gray-400 max-w-3xl">{repo.description}</p>

        {/* Links */}
        <div className="flex items-center gap-2 mt-3">
          {repo.deploy && (
            <a
              href={repo.deploy}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:text-emerald-300"
            >
              <Globe size={12} /> Live Demo
            </a>
          )}
          {repo.port && (
            <a
              href={`http://${HOST_IP}:${repo.port}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:text-white"
            >
              <ExternalLink size={12} /> :{repo.port}
            </a>
          )}
          {repo.github && (
            <a
              href={repo.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:text-white"
            >
              <Github size={12} /> GitHub
            </a>
          )}
        </div>

        {/* Stack tags */}
        {repo.stack && repo.stack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {repo.stack.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-dashed border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[10px] text-gray-500"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Overview */}
      <SectionHeading>Overview</SectionHeading>
      <div className="rounded-xl border border-dashed border-white/10 bg-[#16162a] p-5 mb-2">
        <p className="text-sm leading-relaxed text-gray-300">{detail.overview}</p>
      </div>

      {/* Brief mode: stop here for archived/shelved repos */}
      {detail.brief && (
        <div className="mt-6 rounded-xl border border-dashed border-white/10 bg-[#16162a] p-5 text-center">
          <p className="text-xs text-gray-500">This project has been archived. No deep-dive available.</p>
        </div>
      )}

      {!detail.brief && (
        <>
          {/* Architecture Diagram */}
          {detail.architectureLayers.length > 0 && (
            <>
              <SectionHeading>Architecture</SectionHeading>
              <ArchitectureDiagram layers={detail.architectureLayers} />
            </>
          )}

          {/* Data Flow */}
          {detail.dataFlow.length > 0 && (
            <>
              <SectionHeading>Data Flow</SectionHeading>
              <DataFlow steps={detail.dataFlow} />
            </>
          )}

          {/* Code Snippets */}
          {detail.codeSnippets.length > 0 && (
            <>
              <SectionHeading>Key Code</SectionHeading>
              <div className="space-y-4">
                {detail.codeSnippets.map((snippet) => (
                  <CodeBlock key={snippet.file + snippet.title} snippet={snippet} />
                ))}
              </div>
            </>
          )}

          {/* Tech Decisions */}
          {detail.techDecisions.length > 0 && (
            <>
              <SectionHeading>Technical Decisions</SectionHeading>
              <TechDecisions decisions={detail.techDecisions} />
            </>
          )}

          {/* API Surface */}
          {detail.apiEndpoints && detail.apiEndpoints.length > 0 && (
            <>
              <SectionHeading>API Surface</SectionHeading>
              <ApiSurface endpoints={detail.apiEndpoints} />
            </>
          )}
        </>
      )}
    </div>
  );
}
