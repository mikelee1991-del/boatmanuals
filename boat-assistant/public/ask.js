/**
 * Ask orchestrator: free binder answers always;
 * optional OpenRouter free synthesis when a free key is saved.
 *
 * Free model slugs rotate often — default is openrouter/free (auto-picks a live free model).
 */
import {
  answerStructured,
  retrievePassages,
  matchEvidence,
  matchFigures,
  buildLlmMessages,
} from "./answer-engine.js";

export const SETTINGS_KEY = "flyer8-guide-settings-v2";
const LEGACY_SETTINGS_KEY = "flyer8-llm-settings";

/** Durable free entrypoint — OpenRouter picks whatever :free models are live today. */
export const FREE_ROUTER = "openrouter/free";

/** Specific free fallbacks if the router or a saved slug is down. */
export const FREE_MODEL_FALLBACKS = [
  FREE_ROUTER,
  "inclusionai/ling-3.0-flash:free",
  "openai/gpt-oss-20b:free",
  "nvidia/nemotron-3-nano-30b-a3b:free",
  "google/gemma-4-31b-it:free",
];

const RETIRED_FREE = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "meta-llama/llama-3.1-8b-instruct:free",
];

export const DEFAULT_SETTINGS = {
  mode: "ai",
  provider: "openrouter",
  apiKey: "",
  model: FREE_ROUTER,
};

function normalizeModel(model) {
  const m = (model || "").trim();
  if (!m || RETIRED_FREE.includes(m)) return FREE_ROUTER;
  return m;
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      const legacy = localStorage.getItem(LEGACY_SETTINGS_KEY);
      if (legacy) {
        const old = JSON.parse(legacy);
        const next = {
          ...DEFAULT_SETTINGS,
          apiKey: old.apiKey || "",
          model: normalizeModel(old.model),
          mode: old.apiKey ? "ai" : "free",
        };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
        return next;
      }
      return { ...DEFAULT_SETTINGS };
    }
    const parsed = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    const fixed = normalizeModel(parsed.model);
    if (fixed !== parsed.model) {
      parsed.model = fixed;
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(partial) {
  const next = { ...loadSettings(), ...partial };
  if (next.model) next.model = normalizeModel(next.model);
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  return next;
}

/** Wipe saved Setup keys from this browser (used by Hard reset). */
export function clearSettings() {
  try {
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(LEGACY_SETTINGS_KEY);
  } catch {
    /* ignore quota / private-mode errors */
  }
}

function parseJsonAnswer(text) {
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("Model did not return JSON");
  return JSON.parse(cleaned.slice(start, end + 1));
}

function isModelUnavailableError(err) {
  const msg = String(err?.message || err || "").toLowerCase();
  return (
    msg.includes("unavailable for free") ||
    msg.includes("no endpoints found") ||
    msg.includes("not available") ||
    msg.includes("is not a valid model") ||
    msg.includes("404") ||
    msg.includes("model not found")
  );
}

async function callOpenRouter(apiKey, model, messages) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": location.origin,
      "X-Title": "Flyer 8 Boat Guide",
    },
    body: JSON.stringify({
      model,
      temperature: 0.15,
      messages,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || data?.error || res.statusText || "OpenRouter request failed";
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty model response");
  return text;
}

/** Try preferred model, then free fallbacks. Persist working model when we auto-heal. */
async function callOpenRouterWithFallback(settings, messages) {
  const preferred = normalizeModel(settings.model);
  const queue = [preferred, ...FREE_MODEL_FALLBACKS.filter((m) => m !== preferred)];
  let lastErr;
  for (const model of queue) {
    try {
      const text = await callOpenRouter(settings.apiKey, model, messages);
      if (model !== settings.model) {
        // Auto-migrate saved settings off a dead free slug
        saveSettings({ model });
      }
      return { text, model };
    } catch (err) {
      lastErr = err;
      if (!isModelUnavailableError(err)) throw err;
    }
  }
  throw lastErr || new Error("No free OpenRouter models available right now");
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
export async function askQuestion(bundle, mediaIndex, question, settings = loadSettings(), figuresIndex = null) {
  const passages = retrievePassages(bundle, question, { limit: 14 });
  const evidence = matchEvidence(mediaIndex, question, passages);
  const figures = matchFigures(figuresIndex, question, passages, { limit: 6 });
  const local = answerStructured(bundle, question, mediaIndex, figuresIndex);

  const server = await tryServerLlm(question);
  if (server?.structured) {
    return {
      ...local,
      ...server.structured,
      mode: "ai",
      provider: server.provider || "server",
      model: server.model,
      stepsTitle: server.structured.stepsTitle || local.stepsTitle,
      evidence: evidence.length ? evidence : local.evidence,
      figures: figures.length ? figures : local.figures,
      sources: local.sources,
      manuals: local.manuals,
      confidence: "high",
    };
  }

  if (settings.mode === "ai" && settings.apiKey) {
    const messages = buildLlmMessages(bundle, question, passages, evidence, figures);
    const { text: raw, model } = await callOpenRouterWithFallback(settings, messages);
    const parsed = parseJsonAnswer(raw);
    const evidenceIds = new Set(parsed.evidenceIds || []);
    const figureIds = new Set(parsed.figureIds || []);
    const ev = evidence.filter((e) => evidenceIds.has(e.id));
    const figs = figures.filter((f) => figureIds.has(f.id));
    return {
      mode: "ai",
      provider: "openrouter",
      model,
      summary: parsed.summary || local.summary,
      steps: Array.isArray(parsed.steps) && parsed.steps.length ? parsed.steps : local.steps,
      stepsTitle: parsed.stepsTitle || local.stepsTitle || "Key points",
      details: parsed.details || local.details,
      warnings: parsed.warnings || local.warnings,
      unknowns: parsed.unknowns || local.unknowns,
      evidence: ev.length ? ev : evidence,
      figures: figs.length ? figs : figures,
      sources: local.sources,
      manuals: local.manuals,
      confidence: "high",
      vessel: bundle.vessel,
    };
  }

  return local;
}
