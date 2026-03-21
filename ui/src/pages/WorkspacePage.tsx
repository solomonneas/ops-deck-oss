import { useEffect, useState } from "react";
import { MarkdownContent } from "../components/MarkdownContent";
import { SectionHeader } from "../components/SectionHeader";
import { api } from "../lib/api";
import { useAsyncData } from "../lib/hooks";

export function WorkspacePage() {
  const { data, loading, error } = useAsyncData(() => api.getWorkspaceFiles(), []);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const selectedDocument = useAsyncData(() => (selectedFile ? api.getWorkspaceFile(selectedFile) : Promise.resolve(null)), [selectedFile]);

  useEffect(() => {
    if (data?.files?.length && !selectedFile) {
      setSelectedFile(data.files[0]);
    }
  }, [data, selectedFile]);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Workspace"
        title="Config Browser"
        description="Browse the core workspace reference files, switch between configs quickly, and read their markdown content without leaving the dashboard."
      />

      <section className="panel p-5">
        <div className="flex flex-wrap gap-3">
          {loading && <div className="text-sm text-slate-400">Loading workspace files...</div>}
          {error && <div className="text-sm text-rose-300">{error}</div>}
          {data?.files.map((fileName) => {
            const active = fileName === selectedFile;
            return (
              <button
                key={fileName}
                onClick={() => setSelectedFile(fileName)}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                  active ? "border-violet-400/40 bg-violet-400/10 text-white" : "border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700 hover:text-white"
                }`}
              >
                {fileName}
              </button>
            );
          })}
        </div>
      </section>

      <section className="panel p-6">
        {selectedDocument.loading && <div className="text-sm text-slate-400">Loading selected file...</div>}
        {selectedDocument.error && <div className="text-sm text-rose-300">{selectedDocument.error}</div>}
        {selectedDocument.data && (
          <div className="space-y-5">
            <div className="border-b border-slate-800 pb-5">
              <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Workspace File</div>
              <h2 className="mt-2 text-2xl font-bold text-white">{selectedDocument.data.filename}</h2>
            </div>
            <MarkdownContent content={selectedDocument.data.content} />
          </div>
        )}
        {!selectedDocument.loading && !selectedDocument.error && !selectedDocument.data && (
          <div className="text-sm text-slate-400">Select a workspace file to inspect it.</div>
        )}
      </section>
    </div>
  );
}
