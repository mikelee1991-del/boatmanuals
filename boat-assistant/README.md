# Flyer 8 Boat Guide

Part of **this repo**. Ask a question → retrieve from the **boat binder** (`../boat-dictionary/`) → optional **LLM** writes a clear answer.

Live site: **https://mikelee1991-del.github.io/boatmanuals/**

## Why an API key?

The binder alone is not enough for open questions like *“how deep can I anchor?”* — keyword matching often grabs the wrong playbook (e.g. windlass faults).

An LLM (with the binder excerpts as context) produces readable, honest answers and will say **UNVERIFIED** when a fact is missing (rode length is still missing on this HIN).

**GitHub Pages cannot hold a secret API key** (anything in the static site is public). So you either:

1. Paste **your own** OpenRouter/OpenAI key in the app **Settings** (stored only in that browser’s `localStorage`), or  
2. Run the local server with `OPENROUTER_API_KEY` / `OPENAI_API_KEY` so the key stays on the host.

### Option A — OpenRouter on the phone (recommended for Pages)

1. Create a key: https://openrouter.ai/keys  
2. Open the Boat Guide → **Settings**  
3. Mode **AI**, provider **OpenRouter**, paste key, model e.g. `openai/gpt-4o-mini`  
4. Save → ask again  

Cost is usually fractions of a cent per question.

### Option B — Local server (OpenAI or OpenRouter)

```bash
cd boat-assistant
export OPENROUTER_API_KEY=sk-or-...   # or OPENAI_API_KEY=sk-...
# optional: export LLM_MODEL=openai/gpt-4o-mini
npm start
# http://localhost:8787  (or your LAN IP on the phone)
```

Leave the in-app key blank; the UI posts to `/api/ask` and the server calls the model.

### Option C — Offline only

Settings → Mode **Offline**. No key. Useful dockside with no signal; weaker on open-ended questions.

## Pipeline

```text
boat-dictionary/   ← source of truth
       ↓  npm run build
knowledge-bundle.json  (+ system prompt)
       ↓
retrieve top passages → LLM (if configured) → markdown answer
       ↓ fallback
offline answer-engine.js
```

## Growing the brain

1. Edit/add files under `boat-dictionary/`  
2. `npm run build` (or push to `main` for Pages)  
3. Ask again  

To unlock a numeric anchoring-depth answer: measure **chain + rope length**, photograph it, and add the numbers under `owners-manual/chapters/10-ground-tackle.md`.
