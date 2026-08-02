# Flyer 8 Boat Guide (offline Q&A)

Part of **this repo**. Ask a question → answer is pulled from the **boat binder** (`../boat-dictionary/`).

**No API keys. No localtunnel. No cloud LLM required.**

## What “localtunnel” was (ignore it)

Localtunnel was only a **temporary demo URL** from a cloud agent machine so a phone could reach that machine once. It is **not** how this app works, not stored in the repo, and not required.

## What actually ships in the repo

| Path | Role |
|------|------|
| [`../boat-dictionary/`](../boat-dictionary/) | **Boat binder** — manuals index, wiring, power sequences, evidence, notes |
| [`scripts/build-bundle.mjs`](scripts/build-bundle.mjs) | Packs binder text → `public/knowledge-bundle.json` |
| [`public/`](public/) | Mobile Q&A UI (static files) |
| [`public/answer-engine.js`](public/answer-engine.js) | Offline retrieve-and-compose (runs in the browser) |

```text
boat-dictionary/   ← source of truth (the binder)
       ↓  npm run build
boat-assistant/public/knowledge-bundle.json
       ↓
phone / browser Q&A UI
```

## Run from the repo (laptop → phone on same Wi‑Fi)

```bash
cd boat-assistant
npm start
# open http://localhost:8787
# or http://<your-laptop-lan-ip>:8787 on your phone
```

`npm start` rebuilds the bundle from `boat-dictionary/` every time, so answers track the binder.

## Host from GitHub (no laptop server)

After this is merged to `main`, GitHub Actions workflow [`.github/workflows/deploy-boat-guide.yml`](../.github/workflows/deploy-boat-guide.yml) builds from the binder and publishes `boat-assistant/public` to **GitHub Pages**.

One-time setup in the GitHub UI:

1. Repo **Settings → Pages**
2. **Source** = **GitHub Actions**

Site URL will be:

`https://mikelee1991-del.github.io/boatmanuals/`

(Add to Home Screen on your phone.)

## Example

> Where is my fuel/water separator and how do I know whether it needs to be replaced?

Answer comes from binder notes + Mercury Verado O&M excerpts under `boat-dictionary/`.

## Growing the brain

1. Edit/add files under `boat-dictionary/`
2. Run `npm run build` (or `npm start`, or push to `main` for Pages)
3. Ask again — no keys, no model training
