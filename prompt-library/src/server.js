import express from "express";
import cors from "cors";
import fs from "node:fs/promises";
import path from "node:path";

const port = Number(process.env.PORT || 5202);
const dataDir = process.env.DATA_DIR || path.resolve(process.cwd(), "data");
const storePath = path.join(dataDir, "prompts.json");
const seedPath = path.resolve(process.cwd(), "data/prompts.seed.json");

const app = express();
app.use(cors());
app.use(express.json());

async function ensureStore() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(storePath);
  } catch {
    const seed = await fs.readFile(seedPath, "utf8");
    await fs.writeFile(storePath, seed);
  }
}

async function readStore() {
  await ensureStore();
  return JSON.parse(await fs.readFile(storePath, "utf8"));
}

async function writeStore(payload) {
  await fs.writeFile(storePath, JSON.stringify(payload, null, 2));
}

app.get("/api/prompts", async (_req, res, next) => {
  try {
    const data = await readStore();
    res.json(data.prompts);
  } catch (error) {
    next(error);
  }
});

app.get("/api/prompts/:id", async (req, res, next) => {
  try {
    const data = await readStore();
    const prompt = data.prompts.find((entry) => entry.id === req.params.id);
    if (!prompt) {
      res.status(404).json({ error: "Prompt not found" });
      return;
    }
    res.json(prompt);
  } catch (error) {
    next(error);
  }
});

app.post("/api/prompts", async (req, res, next) => {
  try {
    const data = await readStore();
    const prompt = {
      id: `prompt-${Date.now()}`,
      title: req.body.title ?? "Untitled Prompt",
      category: req.body.category ?? "general",
      content: req.body.content ?? "",
      notes: req.body.notes ?? "",
      tags: Array.isArray(req.body.tags) ? req.body.tags : [],
      updatedAt: new Date().toISOString()
    };
    data.prompts.unshift(prompt);
    await writeStore(data);
    res.status(201).json(prompt);
  } catch (error) {
    next(error);
  }
});

app.put("/api/prompts/:id", async (req, res, next) => {
  try {
    const data = await readStore();
    const index = data.prompts.findIndex((entry) => entry.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ error: "Prompt not found" });
      return;
    }
    const updated = {
      ...data.prompts[index],
      ...req.body,
      id: data.prompts[index].id,
      updatedAt: new Date().toISOString()
    };
    data.prompts[index] = updated;
    await writeStore(data);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/prompts/:id", async (req, res, next) => {
  try {
    const data = await readStore();
    const remaining = data.prompts.filter((entry) => entry.id !== req.params.id);
    if (remaining.length === data.prompts.length) {
      res.status(404).json({ error: "Prompt not found" });
      return;
    }
    data.prompts = remaining;
    await writeStore(data);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "prompt-library", port });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "Internal server error" });
});

ensureStore().then(() => {
  app.listen(port, "0.0.0.0", () => {
    console.log(`prompt-library listening on ${port}`);
  });
});

