import { describe, expect, it } from "vitest";
import { createOpenclawOnlyDataSource } from "../openclaw-only";

describe("openclawOnlyDataSource", () => {
  it("reports all capabilities false", () => {
    const ds = createOpenclawOnlyDataSource();
    expect(ds.capabilities.repos).toBe(false);
    expect(ds.capabilities.search).toBe(false);
    expect(ds.capabilities.journal).toBe(false);
  });

  it("getRepos returns empty list", async () => {
    const ds = createOpenclawOnlyDataSource();
    expect(await ds.getRepos()).toEqual([]);
  });

  it("getMemoryCard returns null", async () => {
    const ds = createOpenclawOnlyDataSource();
    expect(await ds.getMemoryCard("anything")).toBeNull();
  });
});
