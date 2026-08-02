import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadKnowledge, buildSystemMessage, retrieve } from "./lib/knowledge.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, "public");

function loadEnvFile() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvFile();

const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || "0.0.0.0";
const XAI_BASE_URL = (process.env.XAI_BASE_URL || "https://api.x.ai/v1").replace(/\/$/, "");
const DEFAULT_MODEL = process.env.XAI_MODEL || "grok-4.5";

const knowledge = loadKnowledge();
console.log(
  `[boat-assistant] loaded ${knowledge.fileCount} files (${Math.round(knowledge.totalBytes / 1024)} KB corpus)`
);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

function send(res, status, body, headers = {}) {
  const payload = typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  res.writeHead(status, {
    "Cache-Control": "no-store",
    ...headers,
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

function serveStatic(req, res) {
  let urlPath = decodeURIComponent(new URL(req.url, "http://local").pathname);
  if (urlPath === "/") urlPath = "/index.html";
  const abs = path.normalize(path.join(PUBLIC, urlPath));
  if (!abs.startsWith(PUBLIC)) return send(res, 403, "Forbidden");
  if (!fs.existsSync(abs) || fs.statSync(abs).isDirectory()) return send(res, 404, "Not found");
  const ext = path.extname(abs);
  send(res, 200, fs.readFileSync(abs), { "Content-Type": MIME[ext] || "application/octet-stream" });
}

async function handleStatus(_req, res) {
  send(res, 200, {
    ok: true,
    vessel: {
      hin: "BEYFT208F223",
      model: "Flyer 8 SPACEdeck",
      engine: "Mercury Verado 300 / 13000069A / ESN 3B371488",
    },
    knowledge: {
      fileCount: knowledge.fileCount,
      totalBytes: knowledge.totalBytes,
      loadedAt: knowledge.loadedAt,
      chunkCount: knowledge.retrieval.chunks?.length || 0,
      playbookCount: knowledge.playbooks.playbooks?.length || 0,
    },
    llm: {
      provider: "xAI Grok",
      baseUrl: XAI_BASE_URL,
      defaultModel: DEFAULT_MODEL,
      serverKeyConfigured: Boolean(process.env.XAI_API_KEY),
    },
  });
}

async function handleSearch(req, res) {
  const u = new URL(req.url, "http://local");
  const q = u.searchParams.get("q") || "";
  if (!q.trim()) return send(res, 400, { error: "Missing q" });
  send(res, 200, { query: q, hits: retrieve(knowledge, q, { limit: 12 }) });
}

async function handleChat(req, res) {
  if (req.method !== "POST") return send(res, 405, { error: "POST only" });
  let body;
  try {
    body = JSON.parse(await readBody(req));
  } catch {
    return send(res, 400, { error: "Invalid JSON" });
  }

  const message = (body.message || "").trim();
  if (!message) return send(res, 400, { error: "message required" });

  const apiKey = (body.apiKey || process.env.XAI_API_KEY || "").trim();
  if (!apiKey) {
    return send(res, 401, {
      error: "No XAI_API_KEY. Add it to boat-assistant/.env or enter it in Settings.",
    });
  }

  const model = (body.model || DEFAULT_MODEL).trim();
  const history = Array.isArray(body.history) ? body.history.slice(-12) : [];
  const stream = body.stream !== false;

  const system = buildSystemMessage(knowledge, message);
  const messages = [
    { role: "system", content: system },
    ...history
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .map((m) => ({ role: m.role, content: m.content.slice(0, 8000) })),
    { role: "user", content: message },
  ];

  const payload = {
    model,
    messages,
    temperature: typeof body.temperature === "number" ? body.temperature : 0.2,
    stream,
  };

  const upstream = await fetch(`${XAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!upstream.ok) {
    const errText = await upstream.text();
    return send(res, upstream.status, {
      error: "Grok API error",
      status: upstream.status,
      detail: errText.slice(0, 2000),
    });
  }

  if (!stream) {
    const data = await upstream.json();
    const text = data.choices?.[0]?.message?.content || "";
    return send(res, 200, {
      reply: text,
      model,
      retrieval: retrieve(knowledge, message, { limit: 6 }),
      usage: data.usage || null,
    });
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  });

  res.write(
    `event: meta\ndata: ${JSON.stringify({
      model,
      retrieval: retrieve(knowledge, message, { limit: 6 }),
    })}\n\n`
  );

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n");
      buffer = parts.pop() || "";
      for (const line of parts) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (data === "[DONE]") {
          res.write(`event: done\ndata: {}\n\n`);
          continue;
        }
        try {
          const json = JSON.parse(data);
          const delta = json.choices?.[0]?.delta?.content || "";
          if (delta) res.write(`event: token\ndata: ${JSON.stringify({ text: delta })}\n\n`);
        } catch {
          // ignore partial JSON
        }
      }
    }
  } catch (err) {
    res.write(`event: error\ndata: ${JSON.stringify({ error: String(err) })}\n\n`);
  }

  res.write(`event: done\ndata: {}\n\n`);
  res.end();
}

const server = http.createServer(async (req, res) => {
  try {
    const { pathname } = new URL(req.url, "http://local");
    if (pathname === "/api/status") return handleStatus(req, res);
    if (pathname === "/api/search") return handleSearch(req, res);
    if (pathname === "/api/chat") return handleChat(req, res);
    if (pathname.startsWith("/api/")) return send(res, 404, { error: "Unknown API route" });
    return serveStatic(req, res);
  } catch (err) {
    console.error(err);
    send(res, 500, { error: "Server error", detail: String(err) });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[boat-assistant] http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}`);
  console.log(`[boat-assistant] Grok model=${DEFAULT_MODEL} serverKey=${Boolean(process.env.XAI_API_KEY)}`);
});
