# Flyer 8 Boat Guide

Part of **this repo**. Ask a question → answer from the **boat binder** (`../boat-dictionary/`).

**Free by default. No API key required.**

Live site: **https://mikelee1991-del.github.io/boatmanuals/**

## How it works

```text
boat-dictionary/   ← source of truth
       ↓  npm run build
knowledge-bundle.json
       ↓
phone / browser retrieves the right passages and composes an answer
```

Optional AI (Settings → Optional AI) is off unless you paste your own key. OpenRouter has `$0` `:free` models if you want that later — not required.

## Run locally

```bash
cd boat-assistant
npm start
# http://localhost:8787
```

## Hosted

After merge to `main`, GitHub Actions publishes `public/` to Pages.

Hard-refresh the phone after deploys (service worker cache).

## Growing the brain

1. Edit/add files under `boat-dictionary/`
2. `npm run build` (or push to `main`)
3. Ask again
