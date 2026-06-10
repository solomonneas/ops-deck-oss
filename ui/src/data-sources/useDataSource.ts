import { useContext } from "react";
import { DataSourceContext } from "./context";

export function useDataSource() {
  return useContext(DataSourceContext);
}
