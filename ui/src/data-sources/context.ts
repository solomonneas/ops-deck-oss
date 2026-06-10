import { createContext } from "react";
import type { DataSource } from "./types";
import { createOpenclawOnlyDataSource } from "./openclaw-only";

export const DataSourceContext = createContext<DataSource>(createOpenclawOnlyDataSource());
