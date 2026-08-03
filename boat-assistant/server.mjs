/**
 * Local Boat Guide server.
 * Free binder answers always. Optional LLM via OPENROUTER_API_KEY (free :free models).
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, "public");
const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || "0.0.0.0";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

function send(res, status, body, type = "application/json; charset=utf-8") {
  const payload = typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function llmConfig() {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return null;
  return {
    provider: "openrouter",
    apiKey: key,
    model: process.env.LLM_MODEL || "openrouter/free",
    url: "https://openrouter.ai/api/v1/chat/completions",
  };
}

async function callLlm(cfg, messages) {
  const res = await fetch(cfg.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cfg.apiKey}`,
      "HTTP-Referer": "https://mikelee1991-del.github.io/boatmanuals/",
      "X-Title": "Flyer 8 Boat Guide",
    },
    body: JSON.stringify({ model: cfg.model, temperature: 0.15, messages }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || res.statusText);
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty model response");
  return text;
}

function parseJsonAnswer(text) {
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  return JSON.parse(cleaned.slice(start, end + 1));
}

const bundle = JSON.parse(fs.readFileSync(path.join(PUBLIC, "knowledge-bundle.json"), "utf8"));
const mediaIndex = JSON.parse(fs.readFileSync(path.join(PUBLIC, "media-index.json"), "utf8"));
const figuresIndex = fs.existsSync(path.join(PUBLIC, "figures-index.json"))
  ? JSON.parse(fs.readFileSync(path.join(PUBLIC, "figures-index.json"), "utf8"))
  : { items: [] };
const engine = await import(pathToFileURL(path.join(PUBLIC, "answer-engine.js")).href);

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://local");
    const cfg = llmConfig();

    if (url.pathname === "/api/status") {
      return send(res, 200, {
        ok: true,
        llm: Boolean(cfg),
        provider: cfg?.provider || null,
        stats: bundle.stats,
        figures: figuresIndex.count || figuresIndex.items?.length || 0,
      });
    }

    if (url.pathname === "/api/ask" && req.method === "POST") {
      const body = JSON.parse((await readBody(req)) || "{}");
      const question = body.question || "";
      const local = engine.answerStructured(bundle, question, mediaIndex, figuresIndex);

      if (body.mode === "llm") {
        if (!cfg) return send(res, 503, { error: "LLM_NOT_CONFIGURED" });
        const passages = engine.retrievePassages(bundle, question, { limit: 14 });
        const evidence = engine.matchEvidence(mediaIndex, question, passages);
        const figures = engine.matchFigures(figuresIndex, question, passages, { limit: 6 });
        const messages = engine.buildLlmMessages(bundle, question, passages, evidence, figures);
        const raw = await callLlm(cfg, messages);
        const parsed = parseJsonAnswer(raw);
        const figureIds = new Set(parsed.figureIds || []);
        return send(res, 200, {
          mode: "llm",
          provider: cfg.provider,
          model: cfg.model,
          structured: {
            summary: parsed.summary || local.summary,
            steps: parsed.steps?.length ? parsed.steps : local.steps,
            details: parsed.details || local.details,
            warnings: parsed.warnings || local.warnings,
            unknowns: parsed.unknowns || local.unknowns,
            figures: figures.filter((f) => figureIds.has(f.id)).length
              ? figures.filter((f) => figureIds.has(f.id))
              : figures,
          },
          answer: parsed.summary,
        });
      }

      return send(res, 200, { mode: "free", ...local, answer: local.summary });
    }

    let pathname = decodeURIComponent(url.pathname);
    if (pathname === "/") pathname = "/index.html";
    const abs = path.normalize(path.join(PUBLIC, pathname));
    if (!abs.startsWith(PUBLIC) || !fs.existsSync(abs) || fs.statSync(abs).isDirectory()) {
      return send(res, 404, "Not found", "text/plain; charset=utf-8");
    }
    return send(res, 200, fs.readFileSync(abs), MIME[path.extname(abs)] || "application/octet-stream");
  } catch (err) {
    console.error(err);
    send(res, 500, { error: String(err.message || err) });
  }
});

server.listen(PORT, HOST, () => {
  const cfg = llmConfig();
  console.log(`[boat-guide] http://localhost:${PORT}`);
  console.log(
    `[boat-guide] ${bundle.stats.chunks} passages / ${bundle.stats.manuals} manuals — LLM ${
      cfg ? `ON (${cfg.model})` : "off (export OPENROUTER_API_KEY for free :free models)"
    }`
  );
});
