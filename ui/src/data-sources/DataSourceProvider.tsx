import { createContext, useEffect, useState, type ReactNode } from "react";
import type { DataSource } from "./types";
import { selectDataSource } from ".";
import { createOpenclawOnlyDataSource } from "./openclaw-only";

export const DataSourceContext = createContext<DataSource>(createOpenclawOnlyDataSource());

interface Props {
  children: ReactNode;
}

export function DataSourceProvider({ children }: Props) {
  const [ds, setDs] = useState<DataSource>(createOpenclawOnlyDataSource());

  useEffect(() => {
    const sidecarBaseUrl = import.meta.env.VITE_SIDECAR_BASE_URL ?? "http://localhost:8005";
    const apiKey = import.meta.env.VITE_OPSDECK_API_KEY ?? undefined;
    const searchBaseUrl = import.meta.env.VITE_SEARCH_BASE_URL ?? "http://localhost:5204";
    const promptsBaseUrl = import.meta.env.VITE_PROMPTS_BASE_URL ?? "http://localhost:5202";
    selectDataSource({ sidecarBaseUrl, apiKey, searchBaseUrl, promptsBaseUrl }).then(setDs);
  }, []);

  return <DataSourceContext.Provider value={ds}>{children}</DataSourceContext.Provider>;
}
