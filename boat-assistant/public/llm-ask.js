/**
 * Ask path: free binder answers by default.
 * Optional paid/free-tier LLM only when the user opts in with a key.
 */
import { retrievePassages, buildLlmMessages, answerQuestion } from "./answer-engine.js";

const SETTINGS_KEY = "flyer8-llm-settings";

export const DEFAULT_SETTINGS = {
  mode: "free", // free | ai
  provider: "openrouter",
  apiKey: "",
  // OpenRouter hosts several $0 models — only used if mode=ai and a free key is pasted
  model: "meta-llama/llama-3.3-70b-instruct:free",
  baseUrl: "",
};

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    // Migrate older defaults that forced paid AI
    if (parsed.mode === "offline") parsed.mode = "free";
    if (parsed.mode === "ai" && !parsed.apiKey) parsed.mode = "free";
    if (parsed.model === "openai/gpt-4o-mini" && !parsed.apiKey) {
      parsed.model = DEFAULT_SETTINGS.model;
    }
    return parsed;
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
  if (settings.provider === "groq") return "https://api.groq.com/openai/v1/chat/completions";
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
    // Pages has no /api
  }

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

/** Free binder-grounded answer — no network model, no API key. */
export function askFree(bundle, question) {
  const result = answerQuestion(bundle, question);
  return { ...result, mode: "free" };
}

/** @deprecated use askFree */
export function askOffline(bundle, question) {
  return askFree(bundle, question);
}
