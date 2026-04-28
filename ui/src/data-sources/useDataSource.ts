import { useContext } from "react";
import { DataSourceContext } from "./DataSourceProvider";

export function useDataSource() {
  return useContext(DataSourceContext);
}
