# Flyer 8 mobile assistant (Grok)

Mobile-first chat UI that loads the **entire Flyer 8 owner dataset** (consolidated manual, fuse map, playbooks, evidence notes, hardware YAML) into a **Grok (xAI)** system context and answers troubleshooting / ops questions.

## Quick start

```bash
cd boat-assistant
cp .env.example .env
# edit .env and set XAI_API_KEY=...   (from https://console.x.ai/)
npm start
```

Open on your phone (same Wi‑Fi):

- `http://<your-computer-ip>:8787`
- Or locally: `http://localhost:8787`

You can also skip `.env` and paste the API key under **Settings** in the UI (stored in `sessionStorage` on that device only).

### Add to Home Screen

In mobile Safari/Chrome: Share → **Add to Home Screen**. The app installs as a standalone PWA.

## What the model “knows”

On each question the server:

1. Loads all text under `boat-dictionary/owners-manual/`, `catalog/`, and `notes/evidence/` (~full corpus in context).
2. Runs keyword retrieval for playbook/chunk hits.
3. Calls Grok Chat Completions (`grok-4.5` by default) with the vessel system prompt + corpus + hits.

PDF binaries are **not** embedded (too large); their paths and the consolidated manual content are. Prefer label photos for still-UNVERIFIED items.

## API

| Route | Purpose |
|-------|---------|
| `GET /api/status` | Dataset + LLM config |
| `GET /api/search?q=` | Keyword retrieval only |
| `POST /api/chat` | `{ message, apiKey?, model?, history?, stream? }` → SSE stream |

## Env

| Variable | Default | Meaning |
|----------|---------|---------|
| `XAI_API_KEY` | — | Server-side Grok key |
| `XAI_MODEL` | `grok-4.5` | Model id |
| `XAI_BASE_URL` | `https://api.x.ai/v1` | OpenAI-compatible base |
| `PORT` | `8787` | Listen port |
| `HOST` | `0.0.0.0` | Bind address (phones on LAN) |

## Security notes

- Do **not** commit `.env` or API keys.
- The browser never talks to xAI directly (avoids CORS + keeps the corpus server-side).
- For internet exposure, put this behind HTTPS + auth; the default is intended for **LAN / personal** use.
