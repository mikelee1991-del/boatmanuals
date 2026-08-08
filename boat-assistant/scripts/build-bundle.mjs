#!/usr/bin/env node
/**
 * Build offline knowledge + media indexes for the Boat Guide.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const DICT = path.join(ROOT, "boat-dictionary");
const PUBLIC = path.join(__dirname, "../public");
const OUT = path.join(PUBLIC, "knowledge-bundle.json");
const MEDIA_OUT = path.join(PUBLIC, "media-index.json");

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
  "notes/extracts",
  "notes/mercury-fuel-filter-water-separator-excerpts.md",
  "notes/fusion-stereo-ms-ra70n.md",
  "notes/fusion-stereo-ms-ra210.md",
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

  if (isYaml || /\.json$/i.test(rel)) {
    const size = 1200;
    for (let i = 0; i < content.length; i += size) {
      const slice = content.slice(i, i + size).trim();
      if (slice.length < 40) continue;
      const idMatch = slice.match(/\bid:\s*([a-z0-9-]+)/i);
      chunks.push({
        id: `${rel}#w${Math.floor(i / size)}`,
        file: rel,
        title: idMatch ? `${path.basename(rel)} · ${idMatch[1]}` : path.basename(rel),
        text: slice,
        kind: "data",
      });
    }
    return chunks;
  }

  const parts = isMd ? content.split(/(?=^#{1,3}\s+)/m).filter((p) => p.trim()) : [content];
  parts.forEach((part, idx) => {
    const title = (part.match(/^#{1,3}\s+(.+)$/m) || [, path.basename(rel)])[1].trim();
    let text = part.trim();
    // Cap huge extract pages
    if (text.length > 3500) text = text.slice(0, 3500) + "\n…";
    if (text.length < 40) return;
    chunks.push({
      id: `${rel}#${idx}`,
      file: rel,
      title,
      text,
      kind: rel.includes("extracts/")
        ? "manual"
        : rel.includes("evidence/")
          ? "evidence"
          : rel.includes("playbook")
            ? "playbook"
            : "note",
    });
  });
  return chunks;
}

function buildMediaIndex() {
  const evidenceDir = path.join(DICT, "notes/evidence");
  const items = [];
  if (!fs.existsSync(evidenceDir)) return items;
  for (const name of fs.readdirSync(evidenceDir).filter((n) => n.endsWith(".md"))) {
    const rel = `notes/evidence/${name}`;
    const text = fs.readFileSync(path.join(evidenceDir, name), "utf8");
    const title = (text.match(/^#\s+(.+)$/m) || [, name])[1].trim();
    const tags = [];
    const low = (title + " " + text).toLowerCase();
    for (const t of [
      "helm",
      "garmin",
      "fusion",
      "zipwake",
      "thruster",
      "sleipner",
      "windlass",
      "anchor",
      "battery",
      "charger",
      "cristec",
      "pump",
      "flojet",
      "jabsco",
      "teak",
      "cockpit",
      "engine",
      "hin",
      "ephs",
      "steering",
      "hull",
    ]) {
      if (low.includes(t)) tags.push(t);
    }
    // Pull a short caption from first non-heading paragraph / table summary
    const paras = text
      .replace(/^#.+$/gm, "")
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter((p) => p && !p.startsWith("|") && p.length > 40);
    const summary = (paras[0] || text.slice(0, 280)).replace(/\s+/g, " ").slice(0, 320);
    items.push({
      id: name.replace(/\.md$/, ""),
      file: rel,
      title,
      tags,
      summary,
      // Real image files not in repo yet — UI shows evidence card until photos are added
      image: null,
      photoStatus: "transcript-only",
      hint: "Photo transcribed in binder; add the original under boat-dictionary/photos/ to display it here.",
    });
  }
  return items;
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
      kind: "index",
    });
  }
}

const playbooksPath = path.join(DICT, "owners-manual/llm/symptom-playbooks.yaml");
const playbooksRaw = fs.existsSync(playbooksPath) ? fs.readFileSync(playbooksPath, "utf8") : "";

const systemPromptPath = path.join(DICT, "owners-manual/llm/system-prompt.md");
let systemPrompt = fs.existsSync(systemPromptPath)
  ? fs.readFileSync(systemPromptPath, "utf8")
  : "You are the Flyer 8 SPACEdeck vessel assistant.";

systemPrompt += `

## Extra rules for this UI
- Many asks are informational (how a system works on this hull). Lead with accurate synthesis — not a fault tree — unless they describe a problem.
- Prefer CONFIRMED boat facts from evidence notes and catalog; cite binder paths in backticks for hyperlinks.
- When OEM extract text conflicts with vessel evidence, prefer vessel evidence and say so.
- If a photo/evidence card exists for the topic, mention what it shows.
- Never invent part numbers, fuse ratings, or torque values.
- If rode length / exact Garmin model / etc. is unknown, say UNVERIFIED and what to photograph.
- Put real depth in \`details\`; keep \`summary\` human but substantive.
`;

const media = buildMediaIndex();

const manualsList = [];
const manualsRoot = path.join(DICT, "manuals");
function walkPdfs(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkPdfs(p, out);
    else if (/\.pdf$/i.test(ent.name)) out.push(p);
  }
  return out;
}
for (const abs of walkPdfs(manualsRoot)) {
  manualsList.push({
    file: path.relative(DICT, abs).split(path.sep).join("/"),
    name: path.basename(abs),
    category: path.relative(manualsRoot, abs).split(path.sep)[0],
  });
}

const bundle = {
  version: "4.0.0",
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
    manuals: manualsList.length,
    evidenceCards: media.length,
  },
  docs,
  chunks,
  playbooksRaw,
  systemPrompt,
  manuals: manualsList,
  quickPrompts: [
    "How does charging work on this boat?",
    "Explain the HOUSE vs ENGINE battery setup",
    "How deep can I anchor?",
    "How does Zipwake work vs engine trim?",
    "Stereo has no sound — what should I check?",
    "Where is the fuel filter and how do I service it?",
    "Hard steering — walk me through it",
    "How do I read the fish finder?",
    "What does the battery locker look like?",
  ],
};

fs.mkdirSync(PUBLIC, { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(bundle));
fs.writeFileSync(MEDIA_OUT, JSON.stringify({ builtAt: bundle.builtAt, items: media }, null, 2));

console.log(
  `Wrote ${OUT} — ${bundle.stats.files} files, ${bundle.stats.chunks} chunks, ${Math.round(bundle.stats.bytes / 1024)} KB, ${media.length} evidence cards, ${manualsList.length} manuals indexed`
);
console.log(`Wrote ${MEDIA_OUT}`);
