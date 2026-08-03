import { askWithLlm, askFree, loadSettings, saveSettings, DEFAULT_SETTINGS } from "./llm-ask.js";

const statusEl = document.getElementById("status");
const form = document.getElementById("form");
const qEl = document.getElementById("q");
const askBtn = document.getElementById("askBtn");
const chipsEl = document.getElementById("chips");
const answerEl = document.getElementById("answer");
const answerBody = document.getElementById("answerBody");
const confidenceEl = document.getElementById("confidence");
const sourcesEl = document.getElementById("sources");
const settingsDlg = document.getElementById("settings");
const openSettingsBtn = document.getElementById("openSettings");
const settingsForm = document.getElementById("settingsForm");
const modeHint = document.getElementById("modeHint");

let bundle = null;

function formatAnswer(text) {
  const blocks = [];
  let html = text.replace(/```[\w]*\n([\s\S]*?)```/g, (_, code) => {
    const i = blocks.length;
    blocks.push(
      `<pre><code>${code.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").trim()}</code></pre>`
    );
    return `\u0000BLOCK${i}\u0000`;
  });
  html = html.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/^_(.+)_$/gm, "<em>$1</em>");
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(?:<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`);
  html = html.replace(/\n{2,}/g, "</p><p>");
  html = `<p>${html}</p>`;
  html = html.replace(/<p><h3>/g, "<h3>").replace(/<\/h3><\/p>/g, "</h3>");
  html = html.replace(/<p><ul>/g, "<ul>").replace(/<\/ul><\/p>/g, "</ul>");
  html = html.replace(/<p><\/p>/g, "");
  html = html.replace(/\u0000BLOCK(\d+)\u0000/g, (_, i) => blocks[Number(i)]);
  return html;
}

function showAnswer(result) {
  answerEl.hidden = false;
  const badge =
    result.mode === "llm"
      ? `ai · ${result.confidence || "high"}`
      : `free · ${result.confidence || "—"}`;
  confidenceEl.textContent = badge;
  confidenceEl.className = `badge ${result.confidence || ""} ${result.mode || "free"}`;
  answerBody.innerHTML = formatAnswer(result.answer);
  sourcesEl.innerHTML = (result.hits || [])
    .slice(0, 6)
    .map((h) => `<div><code>${h.file}</code> · ${h.title}</div>`)
    .join("");
  answerEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

function refreshModeHint() {
  const s = loadSettings();
  if (s.mode === "ai" && s.apiKey) {
    modeHint.textContent = `Optional AI · ${s.provider} · ${s.model}`;
  } else {
    modeHint.textContent = "Free mode — answers from your boat binder, no API key";
  }
}

function fillSettingsForm() {
  const s = loadSettings();
  settingsForm.mode.value = s.mode === "ai" ? "ai" : "free";
  settingsForm.provider.value = s.provider;
  settingsForm.model.value = s.model;
  settingsForm.apiKey.value = s.apiKey;
  settingsForm.baseUrl.value = s.baseUrl || "";
}

async function loadBundle() {
  const res = await fetch(new URL("./knowledge-bundle.json", import.meta.url), { cache: "no-store" });
  if (!res.ok) throw new Error("Could not load knowledge bundle");
  bundle = await res.json();
  const kb = Math.round((bundle.stats?.bytes || 0) / 1024);
  statusEl.textContent = `Boat binder · ${bundle.stats?.files || "?"} files · ${bundle.stats?.chunks || "?"} passages · ${kb} KB · free`;
  statusEl.className = "status ok";

  chipsEl.innerHTML = "";
  for (const prompt of bundle.quickPrompts || []) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.textContent = prompt;
    b.title = prompt;
    b.addEventListener("click", () => {
      qEl.value = prompt;
      ask(prompt);
    });
    chipsEl.appendChild(b);
  }
  refreshModeHint();
}

async function ask(question) {
  if (!bundle) return;
  const settings = loadSettings();
  const useAi = settings.mode === "ai" && Boolean(settings.apiKey);
  askBtn.disabled = true;
  askBtn.textContent = useAi ? "Thinking…" : "Searching binder…";
  try {
    if (!useAi) {
      showAnswer(askFree(bundle, question));
      return;
    }
    try {
      showAnswer(await askWithLlm(bundle, question, settings));
    } catch (err) {
      const free = askFree(bundle, question);
      free.answer = `_(Optional AI failed: ${err.message || err}. Showing free binder answer.)_\n\n` + free.answer;
      free.confidence = "medium";
      showAnswer(free);
    }
  } finally {
    askBtn.disabled = false;
    askBtn.textContent = "Get answer";
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  ask(qEl.value);
});

openSettingsBtn.addEventListener("click", () => {
  fillSettingsForm();
  settingsDlg.showModal();
});

settingsForm.addEventListener("submit", (e) => {
  e.preventDefault();
  saveSettings({
    mode: settingsForm.mode.value || DEFAULT_SETTINGS.mode,
    provider: settingsForm.provider.value || DEFAULT_SETTINGS.provider,
    model: settingsForm.model.value.trim() || DEFAULT_SETTINGS.model,
    apiKey: settingsForm.apiKey.value.trim(),
    baseUrl: settingsForm.baseUrl.value.trim(),
  });
  refreshModeHint();
  settingsDlg.close();
});

document.getElementById("closeSettings").addEventListener("click", () => settingsDlg.close());

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register(new URL("./sw.js", import.meta.url)).catch(() => {});
}

askBtn.disabled = true;
loadBundle()
  .then(() => {
    askBtn.disabled = false;
    const params = new URLSearchParams(location.search);
    const q = params.get("q");
    if (q) {
      qEl.value = q;
      ask(q);
    }
  })
  .catch((err) => {
    statusEl.textContent = String(err.message || err);
    statusEl.className = "status bad";
  });
