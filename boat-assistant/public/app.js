const chatEl = document.getElementById("chat");
const inputEl = document.getElementById("input");
const formEl = document.getElementById("composer");
const sendBtn = document.getElementById("sendBtn");
const statusBar = document.getElementById("statusBar");
const chipsEl = document.getElementById("chips");
const settingsDlg = document.getElementById("settings");
const settingsBtn = document.getElementById("settingsBtn");
const apiKeyEl = document.getElementById("apiKey");
const modelEl = document.getElementById("model");
const settingsMeta = document.getElementById("settingsMeta");
const clearChatBtn = document.getElementById("clearChat");

const QUICK = [
  "Power-up sequence for leaving the dock",
  "No start — walk me through checks",
  "Hard steering / EPHS fluid",
  "Which fuse for the Garmin?",
  "Shore power connect order",
  "Zipwake vs LENCO on this boat",
  "Thruster dead — where to look",
  "CRISTEC charger settings vs batteries",
];

const state = {
  history: loadHistory(),
  busy: false,
  serverKey: false,
  model: localStorage.getItem("flyer8.model") || "grok-4.5",
};

function loadHistory() {
  try {
    return JSON.parse(sessionStorage.getItem("flyer8.history") || "[]");
  } catch {
    return [];
  }
}

function saveHistory() {
  sessionStorage.setItem("flyer8.history", JSON.stringify(state.history.slice(-20)));
}

function getApiKey() {
  return sessionStorage.getItem("flyer8.xaiKey") || "";
}

function setApiKey(v) {
  if (v) sessionStorage.setItem("flyer8.xaiKey", v);
  else sessionStorage.removeItem("flyer8.xaiKey");
}

function escapeHtml(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Lightweight markdown-ish formatting for assistant replies */
function formatBot(text) {
  let html = escapeHtml(text);
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/^[-•]\s+(.+)$/gm, "• $1");
  return html;
}

function addMessage(role, content, { sources } = {}) {
  const el = document.createElement("div");
  el.className = `msg ${role}`;
  if (role === "bot") el.innerHTML = formatBot(content);
  else el.textContent = content;
  if (sources?.length) {
    const src = document.createElement("div");
    src.className = "sources";
    src.innerHTML =
      "Sources: " +
      sources
        .slice(0, 5)
        .map((s) => `<code>${escapeHtml(s.section || s.id || "")}</code>`)
        .join(" · ");
    el.appendChild(src);
  }
  chatEl.appendChild(el);
  chatEl.scrollTop = chatEl.scrollHeight;
  return el;
}

function renderHistory() {
  chatEl.innerHTML = "";
  if (!state.history.length) {
    addMessage(
      "system",
      "Ask anything about this Flyer 8 — wiring, power-up/down, Zipwake, thruster, fuses, CRISTEC, Verado. Grok answers from the onboard dataset."
    );
  }
  for (const m of state.history) {
    addMessage(m.role === "user" ? "user" : "bot", m.content, { sources: m.sources });
  }
}

function autosize() {
  inputEl.style.height = "auto";
  inputEl.style.height = Math.min(inputEl.scrollHeight, 140) + "px";
}

async function refreshStatus() {
  try {
    const res = await fetch("/api/status");
    const data = await res.json();
    state.serverKey = Boolean(data.llm?.serverKeyConfigured);
    const kb = Math.round((data.knowledge?.totalBytes || 0) / 1024);
    const keyState = state.serverKey || getApiKey() ? "Grok ready" : "add API key in Settings";
    statusBar.textContent = `${data.knowledge?.fileCount || "?"} files · ${kb} KB · ${keyState}`;
    statusBar.className = "status " + (state.serverKey || getApiKey() ? "ok" : "bad");
    settingsMeta.textContent = `Dataset loaded ${data.knowledge?.loadedAt || "?"} · default model ${data.llm?.defaultModel}`;
    if (!modelEl.querySelector(`option[value="${state.model}"]`)) {
      const opt = document.createElement("option");
      opt.value = state.model;
      opt.textContent = state.model;
      modelEl.appendChild(opt);
    }
    modelEl.value = state.model;
  } catch {
    statusBar.textContent = "Cannot reach assistant server";
    statusBar.className = "status bad";
  }
}

async function sendMessage(text) {
  const message = text.trim();
  if (!message || state.busy) return;
  if (!state.serverKey && !getApiKey()) {
    settingsDlg.showModal();
    statusBar.textContent = "Add your xAI / Grok API key to chat";
    statusBar.className = "status bad";
    return;
  }

  state.busy = true;
  sendBtn.disabled = true;
  state.history.push({ role: "user", content: message });
  saveHistory();
  addMessage("user", message);
  inputEl.value = "";
  autosize();

  const botEl = addMessage("bot", "");
  botEl.classList.add("typing");

  let full = "";
  let sources = [];

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        apiKey: getApiKey() || undefined,
        model: state.model,
        stream: true,
        history: state.history.slice(0, -1).map(({ role, content }) => ({ role, content })),
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.detail || err.error || "Chat failed");
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const chunks = buffer.split("\n\n");
      buffer = chunks.pop() || "";
      for (const block of chunks) {
        const lines = block.split("\n");
        let event = "message";
        let data = "";
        for (const line of lines) {
          if (line.startsWith("event:")) event = line.slice(6).trim();
          if (line.startsWith("data:")) data += line.slice(5).trim();
        }
        if (!data) continue;
        let json = {};
        try {
          json = JSON.parse(data);
        } catch {
          continue;
        }
        if (event === "meta") sources = json.retrieval || [];
        if (event === "token" && json.text) {
          full += json.text;
          botEl.classList.remove("typing");
          botEl.innerHTML = formatBot(full);
          chatEl.scrollTop = chatEl.scrollHeight;
        }
        if (event === "error") throw new Error(json.error || "stream error");
      }
    }

    if (!full) full = "(No reply text — check model/API key.)";
    botEl.classList.remove("typing");
    botEl.innerHTML = formatBot(full);
    if (sources.length) {
      const src = document.createElement("div");
      src.className = "sources";
      src.innerHTML =
        "Sources: " +
        sources
          .slice(0, 5)
          .map((s) => `<code>${escapeHtml(s.section || s.id || "")}</code>`)
          .join(" · ");
      botEl.appendChild(src);
    }
    state.history.push({ role: "assistant", content: full, sources });
    saveHistory();
  } catch (err) {
    botEl.classList.remove("typing");
    botEl.textContent = `Error: ${err.message}`;
    // drop the empty assistant turn if failed hard after user msg kept
  } finally {
    state.busy = false;
    sendBtn.disabled = false;
    inputEl.focus();
  }
}

// chips
for (const q of QUICK) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "chip";
  b.textContent = q;
  b.addEventListener("click", () => sendMessage(q));
  chipsEl.appendChild(b);
}

formEl.addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage(inputEl.value);
});

inputEl.addEventListener("input", autosize);
inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage(inputEl.value);
  }
});

settingsBtn.addEventListener("click", () => {
  apiKeyEl.value = getApiKey();
  modelEl.value = state.model;
  settingsDlg.showModal();
});

document.getElementById("settingsForm").addEventListener("submit", () => {
  setApiKey(apiKeyEl.value.trim());
  state.model = modelEl.value;
  localStorage.setItem("flyer8.model", state.model);
  refreshStatus();
});

clearChatBtn.addEventListener("click", () => {
  state.history = [];
  saveHistory();
  renderHistory();
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").catch(() => {});
}

renderHistory();
refreshStatus();
autosize();
