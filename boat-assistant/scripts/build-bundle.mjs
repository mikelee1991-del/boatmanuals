#!/usr/bin/env node
/**
 * Build a compact offline knowledge bundle for the mobile Q&A UI.
 * No API keys. Bundle is small enough to ship with the PWA (~150–200 KB).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const DICT = path.join(ROOT, "boat-dictionary");
const OUT = path.join(__dirname, "../public/knowledge-bundle.json");

const INCLUDE = [
  "owners-manual/llm/system-prompt.md",
  "owners-manual/00-quickstart.md",
  "owners-manual/README.md",
  "owners-manual/index.yaml",
  "owners-manual/llm/symptom-playbooks.yaml",
  "owners-manual/llm/retrieval-index.json",
  "owners-manual/chapters",
  "owners-manual/diagrams",
  "catalog/boat-dictionary.yaml",
  "catalog/fuse-map-12v.md",
  "catalog/equipment-provenance.md",
  "notes/evidence",
  "notes/mercury-fuel-filter-water-separator-excerpts.md",
];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (/\.(md|yaml|yml|json|txt)$/i.test(ent.name)) out.push(p);
  }
  return out;
}

function collect() {
  const files = new Set();
  for (const rel of INCLUDE) {
    const abs = path.join(DICT, rel);
    if (!fs.existsSync(abs)) continue;
    if (fs.statSync(abs).isDirectory()) walk(abs).forEach((f) => files.add(f));
    else files.add(abs);
  }
  return [...files].sort();
}

function chunkDoc(rel, content) {
  const isMd = /\.md$/i.test(rel);
  const isYaml = /\.ya?ml$/i.test(rel);
  const chunks = [];

  // YAML: keep as sliding windows — do NOT split on '#' comments
  if (isYaml || /\.json$/i.test(rel)) {
    const size = 1200;
    for (let i = 0; i < content.length; i += size) {
      const slice = content.slice(i, i + size).trim();
      if (slice.length < 40) continue;
      const idMatch = slice.match(/\bid:\s*([a-z0-9-]+)/i);
      chunks.push({
        id: `${rel}#w${Math.floor(i / size)}`,
        file: rel,
        title: idMatch ? `${rel} · ${idMatch[1]}` : rel,
        text: slice,
        priority: isYaml ? 0 : 1,
      });
    }
    return chunks;
  }

  // Markdown: split on ATX headings
  const parts = isMd ? content.split(/(?=^#{1,3}\s+)/m).filter((p) => p.trim()) : [content];
  parts.forEach((part, idx) => {
    const title = (part.match(/^#{1,3}\s+(.+)$/m) || [, path.basename(rel)])[1].trim();
    const text = part.trim();
    if (text.length < 40) return;
    const boost =
      /short answer|where is|how do i|replace|checklist|power-up|fuse map/i.test(title + text.slice(0, 200))
        ? 4
        : /notes\//.test(rel)
          ? 2
          : 1;
    const size = 1600;
    for (let i = 0; i < text.length; i += size) {
      chunks.push({
        id: `${rel}#${idx}-${Math.floor(i / size)}`,
        file: rel,
        title,
        text: text.slice(i, i + size),
        priority: boost,
      });
    }
  });
  if (!chunks.length && content.trim()) {
    chunks.push({ id: `${rel}#0`, file: rel, title: path.basename(rel), text: content.slice(0, 2000), priority: 1 });
  }
  return chunks;
}

const files = collect();
const docs = [];
const chunks = [];

for (const abs of files) {
  const rel = path.relative(DICT, abs);
  const content = fs.readFileSync(abs, "utf8");
  docs.push({ file: rel, bytes: Buffer.byteLength(content) });
  for (const c of chunkDoc(rel, content)) chunks.push(c);
}

// Merge curated retrieval index chunks (high-signal)
const riPath = path.join(DICT, "owners-manual/llm/retrieval-index.json");
if (fs.existsSync(riPath)) {
  const ri = JSON.parse(fs.readFileSync(riPath, "utf8"));
  for (const ch of ri.chunks || []) {
    chunks.push({
      id: `ri:${ch.id}`,
      file: "owners-manual/llm/retrieval-index.json",
      title: ch.title || ch.id,
      section: ch.section,
      keywords: ch.keywords || [],
      text: ch.text,
      priority: 2,
    });
  }
}

const playbooksPath = path.join(DICT, "owners-manual/llm/symptom-playbooks.yaml");
let playbooksRaw = "";
if (fs.existsSync(playbooksPath)) playbooksRaw = fs.readFileSync(playbooksPath, "utf8");

const bundle = {
  version: "2.0.0",
  builtAt: new Date().toISOString(),
  vessel: {
    name: "2023 BENETEAU Flyer 8 SPACEdeck",
    hin: "BEYFT208F223",
    engine: "Mercury Verado 300 V8 AMS — 13000069A / ESN 3B371488",
  },
  stats: {
    files: docs.length,
    chunks: chunks.length,
    bytes: docs.reduce((n, d) => n + d.bytes, 0),
  },
  docs,
  chunks,
  playbooksRaw,
  quickPrompts: [
    "Where is my fuel/water separator and how do I know if it needs replacing?",
    "Power-up sequence leaving the dock",
    "No start — what should I check?",
    "Which fuse feeds the Garmin?",
    "Shore power connect order",
    "Hard steering / EPHS fluid",
    "Zipwake vs LENCO on this boat",
  ],
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(bundle));
// Provenance stamp so the UI can show "built from boat-dictionary"
bundle.source = {
  binder: "boat-dictionary/",
  note: "Generated from the repo boat binder. Re-run npm run build after binder edits.",
};

console.log(
  `Wrote ${OUT} — ${bundle.stats.files} files, ${bundle.stats.chunks} chunks, ${Math.round(bundle.stats.bytes / 1024)} KB source (from boat-dictionary/)`
);
