import { askQuestion, loadSettings, saveSettings, needsFreeKey, DEFAULT_SETTINGS } from "./ask.js";

const statusEl = document.getElementById("status");
const form = document.getElementById("form");
const qEl = document.getElementById("q");
const askBtn = document.getElementById("askBtn");
const chipsEl = document.getElementById("chips");
const resultEl = document.getElementById("result");
const pillEl = document.getElementById("pill");
const summaryEl = document.getElementById("summary");
const stepsBlock = document.getElementById("stepsBlock");
const stepsEl = document.getElementById("steps");
const warnBlock = document.getElementById("warnBlock");
const warningsEl = document.getElementById("warnings");
const detailBlock = document.getElementById("detailBlock");
const detailsEl = document.getElementById("details");
const unknownBlock = document.getElementById("unknownBlock");
const unknownsEl = document.getElementById("unknowns");
const evidenceBlock = document.getElementById("evidenceBlock");
const evidenceEl = document.getElementById("evidence");
const figuresBlock = document.getElementById("figuresBlock");
const figuresEl = document.getElementById("figures");
const manualBlock = document.getElementById("manualBlock");
const manualsEl = document.getElementById("manuals");
const sourcesEl = document.getElementById("sources");
const keyBanner = document.getElementById("keyBanner");
const setup = document.getElementById("setup");
const setupForm = document.getElementById("setupForm");

let bundle = null;
let mediaIndex = null;
let figuresIndex = null;

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderMarkdown(text) {
  if (!text) return "";
  let html = escapeHtml(text);
  // tables
  html = html.replace(/(?:^\|.+\|\n?)+/gm, (block) => {
    const rows = block.trim().split("\n").filter(Boolean);
    if (rows.length < 2) return block;
    const parse = (row) =>
      row
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim());
    const head = parse(rows[0]);
    const bodyRows = rows.slice(2).map(parse);
    return `<table><thead><tr>${head.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>${bodyRows
      .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`)
      .join("")}</tbody></table>`;
  });
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(?:<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`);
  html = html.replace(/\n{2,}/g, "</p><p>");
  html = `<p>${html}</p>`;
  html = html.replace(/<p><table>/g, "<table>").replace(/<\/table><\/p>/g, "</table>");
  html = html.replace(/<p><ul>/g, "<ul>").replace(/<\/ul><\/p>/g, "</ul>");
  html = html.replace(/<p><\/p>/g, "");
  return html;
}

function showList(block, el, items) {
  if (!items?.length) {
    block.hidden = true;
    el.innerHTML = "";
    return;
  }
  block.hidden = false;
  el.innerHTML = items.map((i) => `<li>${escapeHtml(i)}</li>`).join("");
}

function renderResult(a) {
  resultEl.hidden = false;
  pillEl.textContent = a.mode === "ai" ? `AI · ${a.model || a.provider || "free model"}` : "Binder · free";
  pillEl.className = `pill ${a.mode === "ai" ? "ai" : "free"}`;

  summaryEl.innerHTML = renderMarkdown(a.summary || "");

  if (a.steps?.length) {
    stepsBlock.hidden = false;
    stepsEl.innerHTML = a.steps.map((s) => `<li>${escapeHtml(s)}</li>`).join("");
  } else {
    stepsBlock.hidden = true;
    stepsEl.innerHTML = "";
  }

  showList(warnBlock, warningsEl, a.warnings);
  showList(unknownBlock, unknownsEl, a.unknowns);

  if (a.details && a.details.trim() && a.details.trim() !== (a.summary || "").trim()) {
    detailBlock.hidden = false;
    detailsEl.innerHTML = renderMarkdown(a.details);
  } else {
    detailBlock.hidden = true;
    detailsEl.innerHTML = "";
  }

  if (a.evidence?.length) {
    evidenceBlock.hidden = false;
    evidenceEl.innerHTML = a.evidence
      .map(
        (e) => `<article class="evidence-card">
          <h4>${escapeHtml(e.title)}</h4>
          <p>${escapeHtml(e.summary)}</p>
          <div class="tags">${(e.tags || [])
            .slice(0, 6)
            .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
            .join("")}</div>
        </article>`
      )
      .join("");
  } else {
    evidenceBlock.hidden = true;
    evidenceEl.innerHTML = "";
  }

  if (a.figures?.length) {
    figuresBlock.hidden = false;
    figuresEl.innerHTML = a.figures
      .map(
        (f) => `<figure class="manual-fig">
          <a href="${escapeHtml(f.src)}" target="_blank" rel="noopener">
            <img src="${escapeHtml(f.src)}" alt="${escapeHtml(f.caption || f.manualName)}" loading="lazy" />
          </a>
          <figcaption>
            <strong>${escapeHtml(f.manualName)}</strong> · p.${f.page}<br />
            ${escapeHtml(f.caption || "")}
          </figcaption>
        </figure>`
      )
      .join("");
  } else {
    figuresBlock.hidden = true;
    figuresEl.innerHTML = "";
  }

  if (a.manuals?.length) {
    manualBlock.hidden = false;
    manualsEl.innerHTML = a.manuals
      .map((m) => `<li><code>${escapeHtml(m.file)}</code> · ${escapeHtml(m.name)}</li>`)
      .join("");
  } else {
    manualBlock.hidden = true;
    manualsEl.innerHTML = "";
  }

  sourcesEl.innerHTML = (a.sources || [])
    .slice(0, 6)
    .map((s) => `<li><code>${escapeHtml(s.file)}</code> · ${escapeHtml(s.title)}</li>`)
    .join("");

  resultEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

function refreshBanner() {
  keyBanner.hidden = !needsFreeKey();
}

function fillSetup() {
  const s = loadSettings();
  setupForm.mode.value = s.mode;
  setupForm.apiKey.value = s.apiKey || "";
  setupForm.model.value = s.model || DEFAULT_SETTINGS.model;
}

async function load() {
  const [bundleRes, mediaRes, figuresRes] = await Promise.all([
    fetch(new URL("./knowledge-bundle.json", import.meta.url), { cache: "no-store" }),
    fetch(new URL("./media-index.json", import.meta.url), { cache: "no-store" }),
    fetch(new URL("./figures-index.json", import.meta.url), { cache: "no-store" }),
  ]);
  if (!bundleRes.ok) throw new Error("Could not load boat binder bundle");
  bundle = await bundleRes.json();
  mediaIndex = mediaRes.ok ? await mediaRes.json() : { items: [] };
  figuresIndex = figuresRes.ok ? await figuresRes.json() : { items: [] };

  const kb = Math.round((bundle.stats?.bytes || 0) / 1024);
  const figMb = Math.round(((figuresIndex.bytes || 0) / (1024 * 1024)) * 10) / 10;
  statusEl.textContent = `${bundle.stats?.chunks || "?"} passages · ${bundle.stats?.manuals || "?"} manuals · ${
    figuresIndex.count || 0
  } figures (${figMb} MB) · ${kb} KB text`;

  chipsEl.innerHTML = "";
  for (const prompt of bundle.quickPrompts || []) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.textContent = prompt;
    b.addEventListener("click", () => {
      qEl.value = prompt;
      ask(prompt);
    });
    chipsEl.appendChild(b);
  }
  refreshBanner();
}

async function ask(question) {
  if (!bundle) return;
  askBtn.disabled = true;
  askBtn.textContent = "Working…";
  statusEl.textContent = needsFreeKey() ? "Searching binder + manuals…" : "Synthesizing full-picture answer…";
  try {
    const answer = await askQuestion(bundle, mediaIndex, question, loadSettings(), figuresIndex);
    renderResult(answer);
    statusEl.textContent =
      answer.mode === "ai"
        ? `AI synthesis · ${answer.model || "free model"} · ${(answer.figures || []).length} figures`
        : `Binder answer · ${(answer.figures || []).length} figures (add free OpenRouter key for fuller synthesis)`;
  } catch (err) {
    const fallback = await askQuestion(bundle, mediaIndex, question, { ...loadSettings(), mode: "free", apiKey: "" }, figuresIndex);
    fallback.summary = `AI unavailable (${err.message || err}). Showing binder answer instead.\n\n` + (fallback.summary || "");
    renderResult(fallback);
    statusEl.textContent = "Binder fallback";
  } finally {
    askBtn.disabled = false;
    askBtn.textContent = "Ask";
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  ask(qEl.value);
});

document.getElementById("settingsBtn").addEventListener("click", () => {
  fillSetup();
  setup.showModal();
});
document.getElementById("openSetupFromBanner").addEventListener("click", () => {
  fillSetup();
  setup.showModal();
});
document.getElementById("closeSetup").addEventListener("click", () => setup.close());

setupForm.addEventListener("submit", (e) => {
  e.preventDefault();
  saveSettings({
    mode: setupForm.mode.value,
    apiKey: setupForm.apiKey.value.trim(),
    model: setupForm.model.value.trim() || DEFAULT_SETTINGS.model,
  });
  refreshBanner();
  setup.close();
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register(new URL("./sw.js", import.meta.url)).catch(() => {});
}

askBtn.disabled = true;
load()
  .then(() => {
    askBtn.disabled = false;
    const q = new URLSearchParams(location.search).get("q");
    if (q) {
      qEl.value = q;
      ask(q);
    }
  })
  .catch((err) => {
    statusEl.textContent = String(err.message || err);
  });
