/**
 * Flyer 8 Boat Guide server.
 * - Static UI + offline engine always available
 * - Optional LLM via OPENROUTER_API_KEY / OPENAI_API_KEY (never commit keys)
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
  const openrouter = process.env.OPENROUTER_API_KEY;
  const openai = process.env.OPENAI_API_KEY;
  if (openrouter) {
    return {
      provider: "openrouter",
      apiKey: openrouter,
      model: process.env.LLM_MODEL || "openai/gpt-4o-mini",
      url: "https://openrouter.ai/api/v1/chat/completions",
    };
  }
  if (openai) {
    return {
      provider: "openai",
      apiKey: openai,
      model: process.env.LLM_MODEL || "gpt-4o-mini",
      url: "https://api.openai.com/v1/chat/completions",
    };
  }
  return null;
}

async function callLlm(cfg, messages) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${cfg.apiKey}`,
  };
  if (cfg.provider === "openrouter") {
    headers["HTTP-Referer"] = "https://mikelee1991-del.github.io/boatmanuals/";
    headers["X-Title"] = "Flyer 8 Boat Guide";
  }
  const res = await fetch(cfg.url, {
    method: "POST",
    headers,
    body: JSON.stringify({ model: cfg.model, temperature: 0.2, messages }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || data?.error || res.statusText;
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty model response");
  return text;
}

const bundlePath = path.join(PUBLIC, "knowledge-bundle.json");
if (!fs.existsSync(bundlePath)) {
  console.error("Missing public/knowledge-bundle.json — run: npm run build");
  process.exit(1);
}

const bundle = JSON.parse(fs.readFileSync(bundlePath, "utf8"));
const engine = await import(pathToFileURL(path.join(PUBLIC, "answer-engine.js")).href);
const { answerQuestion, retrievePassages, buildLlmMessages } = engine;

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://local");
    const cfg = llmConfig();

    if (url.pathname === "/api/status") {
      return send(res, 200, {
        ok: true,
        llm: Boolean(cfg),
        provider: cfg?.provider || null,
        vessel: bundle.vessel,
        stats: bundle.stats,
        builtAt: bundle.builtAt,
      });
    }

    if (url.pathname === "/api/ask" && req.method === "POST") {
      const body = JSON.parse((await readBody(req)) || "{}");
      const question = body.question || body.message || "";
      const wantLlm = body.mode === "llm" || body.llm === true;

      if (wantLlm) {
        if (!cfg) {
          return send(res, 503, {
            error: "LLM_NOT_CONFIGURED",
            message:
              "Set OPENROUTER_API_KEY or OPENAI_API_KEY on the server, or paste an OpenRouter key in the app Settings.",
          });
        }
        const passages = retrievePassages(bundle, question, { limit: 10 });
        const messages = buildLlmMessages(bundle, question, passages);
        const answer = await callLlm(cfg, messages);
        return send(res, 200, {
          mode: "llm",
          provider: cfg.provider,
          model: cfg.model,
          answer,
          hits: passages.map((p) => ({
            id: p.id,
            file: p.file,
            title: p.title,
            score: p.score,
          })),
          confidence: "high",
        });
      }

      const result = answerQuestion(bundle, question);
      return send(res, 200, { ...result, mode: "offline" });
    }

    let pathname = decodeURIComponent(url.pathname);
    if (pathname === "/") pathname = "/index.html";
    const abs = path.normalize(path.join(PUBLIC, pathname));
    if (!abs.startsWith(PUBLIC) || !fs.existsSync(abs) || fs.statSync(abs).isDirectory()) {
      return send(res, 404, "Not found", "text/plain; charset=utf-8");
    }
    const ext = path.extname(abs);
    return send(res, 200, fs.readFileSync(abs), MIME[ext] || "application/octet-stream");
  } catch (err) {
    console.error(err);
    send(res, 500, { error: String(err.message || err) });
  }
});

server.listen(PORT, HOST, () => {
  const cfg = llmConfig();
  console.log(`[boat-guide] http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}`);
  console.log(
    `[boat-guide] binder ${bundle.stats.files} files / ${bundle.stats.chunks} passages — LLM ${
      cfg ? `ON (${cfg.provider} / ${cfg.model})` : "off (set OPENROUTER_API_KEY or OPENAI_API_KEY)"
    }`
  );
});
