/**
 * Ask orchestrator: free binder answers by default;
 * optional free OpenRouter model for synthesis when a free key is saved.
 */
import {
  answerStructured,
  retrievePassages,
  matchEvidence,
  buildLlmMessages,
} from "./answer-engine.js";

const SETTINGS_KEY = "flyer8-guide-settings-v2";

export const DEFAULT_SETTINGS = {
  // free = local synthesis; ai = OpenRouter :free model (needs free signup key)
  mode: "ai",
  provider: "openrouter",
  apiKey: "",
  model: "meta-llama/llama-3.3-70b-instruct:free",
};

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    // migrate old key once
    if (!raw) {
      const legacy = localStorage.getItem("flyer8-llm-settings");
      if (legacy) {
        const old = JSON.parse(legacy);
        const next = {
          ...DEFAULT_SETTINGS,
          apiKey: old.apiKey || "",
          model: old.model?.includes(":free") ? old.model : DEFAULT_SETTINGS.model,
          mode: old.apiKey ? "ai" : "free",
        };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
        return next;
      }
      return { ...DEFAULT_SETTINGS };
    }
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

function parseJsonAnswer(text) {
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("Model did not return JSON");
  return JSON.parse(cleaned.slice(start, end + 1));
}

async function callOpenRouter(settings, messages) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.apiKey}`,
      "HTTP-Referer": location.origin,
      "X-Title": "Flyer 8 Boat Guide",
    },
    body: JSON.stringify({
      model: settings.model || DEFAULT_SETTINGS.model,
      temperature: 0.15,
      messages,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || res.statusText || "OpenRouter request failed";
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty model response");
  return text;
}

async function tryServerLlm(question) {
  try {
    const res = await fetch(new URL("./api/ask", location.href), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, mode: "llm" }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.mode === "llm" && data?.answer) return data;
  } catch {
    /* Pages has no API */
  }
  return null;
}

export function needsFreeKey(settings = loadSettings()) {
  return settings.mode === "ai" && !settings.apiKey;
}

/**
 * Main entry used by the UI.
 */
export async function askQuestion(bundle, mediaIndex, question, settings = loadSettings()) {
  const passages = retrievePassages(bundle, question, { limit: 12 });
  const evidence = matchEvidence(mediaIndex, question, passages);
  const local = answerStructured(bundle, question, mediaIndex);

  // Prefer server LLM if configured (OPENROUTER_API_KEY / GEMINI etc.)
  const server = await tryServerLlm(question);
  if (server?.structured) {
    return {
      ...local,
      ...server.structured,
      mode: "ai",
      provider: server.provider || "server",
      evidence: evidence.length ? evidence : local.evidence,
      sources: local.sources,
      manuals: local.manuals,
      confidence: "high",
    };
  }

  if (settings.mode === "ai" && settings.apiKey) {
    const messages = buildLlmMessages(bundle, question, passages, evidence);
    const raw = await callOpenRouter(settings, messages);
    const parsed = parseJsonAnswer(raw);
    const evidenceIds = new Set(parsed.evidenceIds || []);
    const ev = evidence.filter((e) => evidenceIds.has(e.id));
    return {
      mode: "ai",
      provider: "openrouter",
      model: settings.model,
      summary: parsed.summary || local.summary,
      steps: Array.isArray(parsed.steps) && parsed.steps.length ? parsed.steps : local.steps,
      details: parsed.details || "",
      warnings: parsed.warnings || local.warnings,
      unknowns: parsed.unknowns || local.unknowns,
      evidence: ev.length ? ev : evidence,
      sources: local.sources,
      manuals: local.manuals,
      confidence: "high",
      vessel: bundle.vessel,
    };
  }

  return local;
}
