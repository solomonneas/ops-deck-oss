import { useState, type FormEvent } from "react";
import { SectionHeader } from "../components/SectionHeader";
import { api, type PromptRecord } from "../lib/api";
import { formatDate, useAsyncData } from "../lib/hooks";

const emptyForm = { title: "", category: "operations", content: "", notes: "", tags: "" };

export function PromptsPage() {
  const { data, loading, error, setData } = useAsyncData(() => api.getPrompts(), []);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  function fillForm(prompt: PromptRecord) {
    setEditingId(prompt.id);
    setForm({
      title: prompt.title,
      category: prompt.category,
      content: prompt.content,
      notes: prompt.notes,
      tags: prompt.tags.join(", ")
    });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const payload = {
      ...form,
      tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
    };
    const next = editingId ? await api.updatePrompt(editingId, payload) : await api.createPrompt(payload);
    setData((current) => {
      if (!current) {
        return [next];
      }
      if (editingId) {
        return current.map((prompt) => (prompt.id === editingId ? next : prompt));
      }
      return [next, ...current];
    });
    setForm(emptyForm);
    setEditingId(null);
  }

  async function remove(id: string) {
    await api.deletePrompt(id);
    setData((current) => current ? current.filter((prompt) => prompt.id !== id) : current);
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Prompt Ops"
        title="Prompts"
        description="Persistent CRUD prompt library with seeded examples, editable directly from the dashboard."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="panel p-5">
          <p className="panel-title">{editingId ? "Edit Prompt" : "New Prompt"}</p>
          <form onSubmit={submit} className="mt-5 space-y-4">
            <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="w-full rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-white" placeholder="Prompt title" />
            <input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="w-full rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-white" placeholder="Category" />
            <textarea value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} rows={5} className="w-full rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-white" placeholder="Prompt content" />
            <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} rows={3} className="w-full rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-white" placeholder="Notes" />
            <input value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} className="w-full rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-white" placeholder="tag-one, tag-two" />
            <div className="flex gap-3">
              <button className="rounded-2xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950">{editingId ? "Save Changes" : "Create Prompt"}</button>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="rounded-2xl border border-slate-700 px-4 py-3 text-sm text-slate-200">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="grid gap-4">
          {loading && <div className="panel p-5 text-sm text-slate-400">Loading prompts...</div>}
          {error && <div className="panel p-5 text-sm text-rose-300">{error}</div>}
          {data?.map((prompt) => (
            <article key={prompt.id} className="panel p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{prompt.category}</div>
                  <h3 className="mt-2 text-xl font-semibold text-white">{prompt.title}</h3>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">{prompt.content}</p>
                  <p className="mt-3 text-sm text-slate-500">{prompt.notes}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {prompt.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">#{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 md:flex-col">
                  <button onClick={() => fillForm(prompt)} className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200">Edit</button>
                  <button onClick={() => remove(prompt.id)} className="rounded-xl border border-rose-900 bg-rose-500/10 px-4 py-2 text-sm text-rose-200">Delete</button>
                  <span className="mt-2 text-xs text-slate-500">{formatDate(prompt.updatedAt)}</span>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
