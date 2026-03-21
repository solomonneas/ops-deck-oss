import express from "express";
import cors from "cors";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "../data");
const port = Number(process.env.PORT || 8005);

const app = express();
app.use(cors());
app.use(express.json());

async function readJson(fileName) {
  const filePath = path.join(dataDir, fileName);
  const contents = await fs.readFile(filePath, "utf8");
  return JSON.parse(contents);
}

app.get("/api/cron-jobs", async (_req, res, next) => {
  try {
    res.json(await readJson("cron-jobs.json"));
  } catch (error) {
    next(error);
  }
});

app.get("/api/agent-intel", async (req, res, next) => {
  try {
    const intel = await readJson("agent-intel.json");
    const category = req.query.category?.toString().toLowerCase();
    const items = category
      ? intel.items.filter((item) => item.category.toLowerCase() === category)
      : intel.items;
    res.json({ ...intel, items });
  } catch (error) {
    next(error);
  }
});

app.post("/api/agents/intel", async (req, res, next) => {
  try {
    const intel = await readJson("agent-intel.json");
    const newEntry = {
      id: `intel-${Date.now()}`,
      title: req.body.title ?? "Untitled Intel",
      category: req.body.category ?? "general",
      severity: req.body.severity ?? "medium",
      source: req.body.source ?? "manual",
      summary: req.body.summary ?? "No summary provided.",
      createdAt: new Date().toISOString(),
      tags: Array.isArray(req.body.tags) ? req.body.tags : []
    };
    intel.items.unshift(newEntry);
    await fs.writeFile(path.join(dataDir, "agent-intel.json"), JSON.stringify(intel, null, 2));
    res.status(201).json(newEntry);
  } catch (error) {
    next(error);
  }
});

app.get("/api/security-audit", async (_req, res, next) => {
  try {
    res.json(await readJson("security-audit.json"));
  } catch (error) {
    next(error);
  }
});

app.get("/api/architecture", async (_req, res, next) => {
  try {
    res.json(await readJson("architecture.json"));
  } catch (error) {
    next(error);
  }
});

app.get("/api/backlog", async (_req, res, next) => {
  try {
    res.json(await readJson("backlog.json"));
  } catch (error) {
    next(error);
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "ops-deck-api", port });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`ops-deck-api listening on ${port}`);
});

