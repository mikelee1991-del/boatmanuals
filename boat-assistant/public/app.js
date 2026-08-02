import { answerQuestion } from "./answer-engine.js";

const statusEl = document.getElementById("status");
const form = document.getElementById("form");
const qEl = document.getElementById("q");
const askBtn = document.getElementById("askBtn");
const chipsEl = document.getElementById("chips");
const answerEl = document.getElementById("answer");
const answerBody = document.getElementById("answerBody");
const confidenceEl = document.getElementById("confidence");
const sourcesEl = document.getElementById("sources");

let bundle = null;

function formatAnswer(text) {
  let html = text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/^_([^_]+)_$/gm, "<em>$1</em>");
  return html;
}

function showAnswer(result) {
  answerEl.hidden = false;
  confidenceEl.textContent = result.confidence || "—";
  confidenceEl.className = `badge ${result.confidence || ""}`;
  answerBody.innerHTML = formatAnswer(result.answer);
  sourcesEl.innerHTML = (result.hits || [])
    .slice(0, 6)
    .map((h) => `<div><code>${h.file}</code> · ${h.title}</div>`)
    .join("");
  answerEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function loadBundle() {
  const res = await fetch(new URL("./knowledge-bundle.json", import.meta.url), { cache: "no-store" });
  if (!res.ok) throw new Error("Could not load knowledge bundle");
  bundle = await res.json();
  const kb = Math.round((bundle.stats?.bytes || 0) / 1024);
  statusEl.textContent = `From boat binder · ${bundle.stats?.files || "?"} files · ${bundle.stats?.chunks || "?"} passages · ${kb} KB · offline`;
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
}

function ask(question) {
  if (!bundle) return;
  const result = answerQuestion(bundle, question);
  showAnswer(result);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  ask(qEl.value);
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register(new URL("./sw.js", import.meta.url)).catch(() => {});
}

askBtn.disabled = true;
loadBundle()
  .then(() => {
    askBtn.disabled = false;
    // Deep link ?q=
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
