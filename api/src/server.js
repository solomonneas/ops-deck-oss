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

function parseSimpleValue(value) {
  const trimmed = value.trim();
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed
      .slice(1, -1)
      .split(",")
      .map((item) => item.trim().replace(/^['\"]|['\"]$/g, ""))
      .filter(Boolean);
  }
  return trimmed.replace(/^['\"]|['\"]$/g, "");
}

function parseMarkdownWithFrontmatter(contents) {
  const match = contents.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: contents.trim() };
  }

  const [, rawFrontmatter, body] = match;
  const frontmatter = {};

  for (const line of rawFrontmatter.split("\n")) {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) {
      continue;
    }
    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1);
    frontmatter[key] = parseSimpleValue(value);
  }

  return { frontmatter, body: body.trim() };
}

async function readMarkdownFile(directory, fileName) {
  const filePath = path.join(directory, fileName);
  const contents = await fs.readFile(filePath, "utf8");
  return parseMarkdownWithFrontmatter(contents);
}

async function listMarkdownFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

const memoryCardsDir = path.join(dataDir, "memory", "cards");
const journalDir = path.join(dataDir, "journal");
const workspaceDir = path.join(dataDir, "workspace");
const workspaceAllowedFiles = new Set(["AGENTS.md", "TOOLS.md", "SOUL.md", "MEMORY.md", "USER.md", "IDENTITY.md"]);

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

app.get("/api/memory/cards", async (_req, res, next) => {
  try {
    const files = await listMarkdownFiles(memoryCardsDir);
    const cards = await Promise.all(
      files.map(async (fileName) => {
        const { frontmatter, body } = await readMarkdownFile(memoryCardsDir, fileName);
        return {
          filename: fileName,
          title: frontmatter.topic || fileName.replace(/\.md$/, ""),
          category: frontmatter.category || "general",
          tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
          created: frontmatter.created || null,
          updated: frontmatter.updated || null,
          excerpt: body.split("\n").find((line) => line.trim()) || ""
        };
      })
    );
    res.json({ cards });
  } catch (error) {
    next(error);
  }
});

app.get("/api/memory/cards/:filename", async (req, res, next) => {
  try {
    const fileName = path.basename(req.params.filename);
    if (!fileName.endsWith(".md")) {
      res.status(400).json({ error: "Memory card filename must end with .md" });
      return;
    }
    const { frontmatter, body } = await readMarkdownFile(memoryCardsDir, fileName);
    res.json({
      filename: fileName,
      title: frontmatter.topic || fileName.replace(/\.md$/, ""),
      category: frontmatter.category || "general",
      tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
      created: frontmatter.created || null,
      updated: frontmatter.updated || null,
      content: body
    });
  } catch (error) {
    if (error?.code === "ENOENT") {
      res.status(404).json({ error: "Memory card not found" });
      return;
    }
    next(error);
  }
});

app.get("/api/journal", async (_req, res, next) => {
  try {
    const files = await listMarkdownFiles(journalDir);
    const dates = files
      .map((fileName) => fileName.replace(/\.md$/, ""))
      .filter((value) => /^\d{4}-\d{2}-\d{2}$/.test(value))
      .sort((a, b) => b.localeCompare(a));
    res.json({ dates });
  } catch (error) {
    next(error);
  }
});

app.get("/api/journal/:date", async (req, res, next) => {
  try {
    const date = req.params.date;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({ error: "Journal date must use YYYY-MM-DD" });
      return;
    }
    const { body } = await readMarkdownFile(journalDir, `${date}.md`);
    res.json({ date, content: body });
  } catch (error) {
    if (error?.code === "ENOENT") {
      res.status(404).json({ error: "Journal entry not found" });
      return;
    }
    next(error);
  }
});

app.get("/api/workspace/files", async (_req, res, next) => {
  try {
    const files = (await listMarkdownFiles(workspaceDir)).filter((fileName) => workspaceAllowedFiles.has(fileName));
    res.json({ files });
  } catch (error) {
    next(error);
  }
});

app.get("/api/workspace/files/:filename", async (req, res, next) => {
  try {
    const fileName = path.basename(req.params.filename);
    if (!workspaceAllowedFiles.has(fileName)) {
      res.status(404).json({ error: "Workspace file not found" });
      return;
    }
    const { body } = await readMarkdownFile(workspaceDir, fileName);
    res.json({ filename: fileName, content: body });
  } catch (error) {
    if (error?.code === "ENOENT") {
      res.status(404).json({ error: "Workspace file not found" });
      return;
    }
    next(error);
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "ops-deck-api", port, uptime: process.uptime() });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`ops-deck-api listening on ${port}`);
});
