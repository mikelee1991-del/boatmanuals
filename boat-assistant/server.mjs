/**
 * Tiny static server for the offline Flyer 8 Boat Guide.
 * No API keys required. Optional /api/ask for the same local engine.
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

const bundlePath = path.join(PUBLIC, "knowledge-bundle.json");
if (!fs.existsSync(bundlePath)) {
  console.error("Missing public/knowledge-bundle.json — run: npm run build");
  process.exit(1);
}

const bundle = JSON.parse(fs.readFileSync(bundlePath, "utf8"));
const { answerQuestion } = await import(pathToFileURL(path.join(PUBLIC, "answer-engine.js")).href);

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://local");

    if (url.pathname === "/api/status") {
      return send(res, 200, {
        ok: true,
        mode: "offline-local",
        vessel: bundle.vessel,
        stats: bundle.stats,
        builtAt: bundle.builtAt,
      });
    }

    if (url.pathname === "/api/ask" && req.method === "POST") {
      const body = JSON.parse(await readBody(req) || "{}");
      const result = answerQuestion(bundle, body.question || body.message || "");
      return send(res, 200, result);
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
    send(res, 500, { error: String(err) });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[boat-guide] offline Q&A at http://localhost:${PORT}`);
  console.log(
    `[boat-guide] ${bundle.stats.files} files / ${bundle.stats.chunks} passages / ${Math.round(bundle.stats.bytes / 1024)} KB — no API key`
  );
});
