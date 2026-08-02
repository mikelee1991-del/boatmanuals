import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const DICT = path.join(REPO_ROOT, "boat-dictionary");

const TEXT_GLOBS = [
  "owners-manual/llm/system-prompt.md",
  "owners-manual/README.md",
  "owners-manual/00-quickstart.md",
  "owners-manual/index.yaml",
  "owners-manual/llm/symptom-playbooks.yaml",
  "owners-manual/llm/retrieval-index.json",
  "owners-manual/chapters",
  "owners-manual/diagrams",
  "catalog/boat-dictionary.yaml",
  "catalog/fuse-map-12v.md",
  "catalog/equipment-provenance.md",
  "notes/evidence",
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

function collectFiles() {
  const files = new Set();
  for (const rel of TEXT_GLOBS) {
    const abs = path.join(DICT, rel);
    if (!fs.existsSync(abs)) continue;
    const st = fs.statSync(abs);
    if (st.isDirectory()) walk(abs).forEach((f) => files.add(f));
    else files.add(abs);
  }
  return [...files].sort();
}

function scoreQuery(query, text) {
  const q = query.toLowerCase();
  const h = text.toLowerCase();
  let s = 0;
  if (h.includes(q)) s += 12;
  for (const tok of q.split(/[^a-z0-9+/.-]+/i).filter((t) => t.length > 1)) {
    if (h.includes(tok)) s += 2;
  }
  return s;
}

export function loadKnowledge() {
  const files = collectFiles();
  const docs = files.map((abs) => {
    const rel = path.relative(DICT, abs);
    const content = fs.readFileSync(abs, "utf8");
    return { rel, content, bytes: Buffer.byteLength(content) };
  });

  const systemPromptPath = path.join(DICT, "owners-manual/llm/system-prompt.md");
  const systemPrompt = fs.existsSync(systemPromptPath)
    ? fs.readFileSync(systemPromptPath, "utf8")
    : "You are the Flyer 8 SPACEdeck vessel assistant.";

  const corpus = docs
    .map((d) => `\n\n===== FILE: boat-dictionary/${d.rel} =====\n${d.content}`)
    .join("");

  let retrieval = { chunks: [] };
  const ri = path.join(DICT, "owners-manual/llm/retrieval-index.json");
  if (fs.existsSync(ri)) retrieval = JSON.parse(fs.readFileSync(ri, "utf8"));

  let playbooks = { playbooks: [] };
  const pb = path.join(DICT, "owners-manual/llm/symptom-playbooks.yaml");
  if (fs.existsSync(pb)) {
    // lightweight alias extract without full YAML dep
    const text = fs.readFileSync(pb, "utf8");
    playbooks.raw = text;
    playbooks.playbooks = [...text.matchAll(/-\s+id:\s+(\S+)[\s\S]*?aliases:\s*\[([^\]]*)\]/g)].map(
      (m) => ({
        id: m[1],
        aliases: m[2].split(",").map((a) => a.trim().replace(/^['"]|['"]$/g, "")),
      })
    );
  }

  const totalBytes = docs.reduce((n, d) => n + d.bytes, 0);

  return {
    loadedAt: new Date().toISOString(),
    fileCount: docs.length,
    totalBytes,
    systemPrompt,
    corpus,
    docs,
    retrieval,
    playbooks,
  };
}

export function retrieve(knowledge, query, { limit = 8 } = {}) {
  const hits = [];

  for (const ch of knowledge.retrieval.chunks || []) {
    const hay = [ch.id, ch.title, ch.section, ...(ch.keywords || []), ch.text].join(" ");
    const score = scoreQuery(query, hay);
    if (score > 0) {
      hits.push({
        score,
        type: "chunk",
        id: ch.id,
        section: ch.section,
        title: ch.title,
        text: ch.text,
      });
    }
  }

  for (const p of knowledge.playbooks.playbooks || []) {
    const hay = [p.id, ...(p.aliases || [])].join(" ");
    const score = scoreQuery(query, hay);
    if (score > 0) {
      hits.push({
        score: score + 3,
        type: "playbook",
        id: p.id,
        title: p.id,
        aliases: p.aliases,
      });
    }
  }

  for (const d of knowledge.docs) {
    // score filenames + first 4k for topical docs
    const hay = d.rel + "\n" + d.content.slice(0, 4000);
    const score = scoreQuery(query, hay);
    if (score >= 6) {
      hits.push({
        score,
        type: "doc",
        id: d.rel,
        title: d.rel,
        text: d.content.slice(0, 1800),
      });
    }
  }

  hits.sort((a, b) => b.score - a.score);
  const seen = new Set();
  const out = [];
  for (const h of hits) {
    const key = `${h.type}:${h.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(h);
    if (out.length >= limit) break;
  }
  return out;
}

export function buildSystemMessage(knowledge, query) {
  const hits = retrieve(knowledge, query, { limit: 10 });
  const hitBlock = hits
    .map((h, i) => {
      if (h.type === "playbook") {
        return `${i + 1}. PLAYBOOK ${h.id} aliases=${(h.aliases || []).join(", ")}`;
      }
      if (h.type === "chunk") {
        return `${i + 1}. [${h.section}] ${h.title}\n${h.text}`;
      }
      return `${i + 1}. DOC ${h.id}\n${h.text}`;
    })
    .join("\n\n");

  return `${knowledge.systemPrompt}

---
VESSEL DATASET (full text corpus from this repository — authoritative for this boat)
The following files are the complete searchable owner dataset (manuals PDFs are referenced by path; use their guidance when cited). Prefer CONFIRMED facts. Mark UNVERIFIED clearly.
${knowledge.corpus}

---
RETRIEVAL HITS for the current user question (start here, then use full corpus above):
${hitBlock || "(no keyword hits — use full corpus)"}
`;
}
