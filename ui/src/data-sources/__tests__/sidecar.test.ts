import { describe, expect, it, vi, beforeEach } from "vitest";
import { createSidecarDataSource } from "../sidecar";

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

describe("sidecarDataSource", () => {
  it("getRepos hits /api/repos and returns parsed body", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ name: "foo", description: "Foo project" }],
    });
    const ds = createSidecarDataSource({
      baseUrl: "http://localhost:8005",
      capabilities: {
        repos: true, codebase: true,
        search: false, prompts: false, journal: true, memory: true,
      },
    });
    const repos = await ds.getRepos();
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8005/api/repos",
      expect.any(Object),
    );
    expect(repos).toEqual([{ name: "foo", description: "Foo project" }]);
  });

  it("getMemoryCard returns null on 404", async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 404 });
    const ds = createSidecarDataSource({
      baseUrl: "http://localhost:8005",
      capabilities: {
        repos: true, codebase: true,
        search: false, prompts: false, journal: true, memory: true,
      },
    });
    const card = await ds.getMemoryCard("missing");
    expect(card).toBeNull();
  });
});
