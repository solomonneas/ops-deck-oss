import type { DataSource, Capabilities } from "./types";
import { createSidecarDataSource } from "./sidecar";
import { createOpenclawOnlyDataSource } from "./openclaw-only";

interface SelectorEnv {
  sidecarBaseUrl: string;
  apiKey?: string;
  searchBaseUrl?: string;
  promptsBaseUrl?: string;
}

export async function selectDataSource(env: SelectorEnv): Promise<DataSource> {
  const probeUrl = `${env.sidecarBaseUrl}/healthz`;
  try {
    const res = await fetch(probeUrl, {
      headers: env.apiKey ? { "X-API-Key": env.apiKey } : {},
      signal: AbortSignal.timeout(1500),
    });
    if (!res.ok) return createOpenclawOnlyDataSource();
    const body = (await res.json()) as { ok: boolean; capabilities: Capabilities };
    if (!body.ok) return createOpenclawOnlyDataSource();
    return createSidecarDataSource({
      baseUrl: env.sidecarBaseUrl,
      apiKey: env.apiKey,
      capabilities: body.capabilities,
      searchBaseUrl: env.searchBaseUrl,
      promptsBaseUrl: env.promptsBaseUrl,
    });
  } catch {
    return createOpenclawOnlyDataSource();
  }
}
