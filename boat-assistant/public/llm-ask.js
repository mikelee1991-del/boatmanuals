/**
 * LLM answer path — retrieve binder passages, then call an OpenAI-compatible API.
 * Keys stay in the browser (localStorage) or on the optional Node proxy — never in the repo.
 */
import { retrievePassages, buildLlmMessages, answerQuestion } from "./answer-engine.js";

const SETTINGS_KEY = "flyer8-llm-settings";

export const DEFAULT_SETTINGS = {
  mode: "ai", // ai | offline
  provider: "openrouter", // openrouter | openai | custom
  apiKey: "",
  model: "openai/gpt-4o-mini",
  baseUrl: "", // optional override
};

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(partial) {
  const next = { ...loadSettings(), ...partial };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  return next;
}

function endpointFor(settings) {
  if (settings.baseUrl) return settings.baseUrl.replace(/\/$/, "") + "/chat/completions";
  if (settings.provider === "openai") return "https://api.openai.com/v1/chat/completions";
  // OpenRouter allows browser CORS with a personal key — best fit for GitHub Pages
  return "https://openrouter.ai/api/v1/chat/completions";
}

async function callChatCompletions(settings, messages) {
  const url = endpointFor(settings);
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${settings.apiKey}`,
  };
  if (settings.provider === "openrouter" || /openrouter\.ai/.test(url)) {
    headers["HTTP-Referer"] = location.origin;
    headers["X-Title"] = "Flyer 8 Boat Guide";
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: settings.model || DEFAULT_SETTINGS.model,
      temperature: 0.2,
      messages,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || data?.error || res.statusText || "LLM request failed";
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty model response");
  return text;
}

/**
 * Try local/proxied server first (OPENAI_API_KEY / OPENROUTER_API_KEY on the host),
 * then browser-side OpenRouter/OpenAI with the user's saved key.
 */
export async function askWithLlm(bundle, question, settings = loadSettings()) {
  const passages = retrievePassages(bundle, question, { limit: 10 });
  const messages = buildLlmMessages(bundle, question, passages);
  const hits = passages.map((p) => ({
    id: p.id,
    file: p.file,
    title: p.title,
    score: p.score,
    topicsHit: p.topicsHit,
  }));

  // 1) Same-origin proxy (npm start / custom backend) — key never touches the browser
  try {
    const proxy = await fetch(new URL("./api/ask", location.href), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, mode: "llm" }),
    });
    if (proxy.ok) {
      const data = await proxy.json();
      if (data?.answer && data?.mode === "llm") {
        return {
          answer: data.answer,
          hits: data.hits || hits,
          confidence: "high",
          mode: "llm",
          provider: data.provider || "server",
        };
      }
    }
  } catch {
    // Pages has no /api — fall through
  }

  // 2) Browser → OpenRouter / OpenAI with user key
  if (!settings.apiKey) {
    const err = new Error("API_KEY_REQUIRED");
    err.code = "API_KEY_REQUIRED";
    throw err;
  }

  const answer = await callChatCompletions(settings, messages);
  return {
    answer,
    hits,
    confidence: "high",
    mode: "llm",
    provider: settings.provider,
    model: settings.model,
  };
}

export function askOffline(bundle, question) {
  const result = answerQuestion(bundle, question);
  return { ...result, mode: "offline" };
}
