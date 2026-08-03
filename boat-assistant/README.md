# Flyer 8 Boat Guide

Ask your boat a question. Answers come from the **boat binder** + OEM manual extracts.

Live: **https://mikelee1991-del.github.io/boatmanuals/**

## Free setup (recommended for readable AI answers)

1. Create a **free** key at [openrouter.ai/keys](https://openrouter.ai/keys).
2. Open the guide → **Setup** → paste the key.
3. Set model to **`openrouter/free`** (recommended). It auto-picks a live free model — individual `:free` slugs (like Llama 3.3) get retired often.

Without a key, the app still answers from the binder (checklists + excerpts). With a free key, it synthesizes a clear bottom-line + steps.

## What’s in the brain

- Owner’s manual chapters, fuse map, playbooks
- Photo **evidence cards** (transcribed from your boat photos)
- Text extracts from Mercury, Garmin, Fusion, Zipwake, CRISTEC, pumps, windlass, thruster manuals

## Photos

Original image files are **not in the repo yet**. Evidence notes under `boat-dictionary/notes/evidence/` power the “Photo evidence” cards.

To show real pictures in answers, add files under `boat-dictionary/photos/` and tell the agent — we can wire them into `media-index.json`.

## Local

```bash
cd boat-assistant
npm start
# optional free AI on the server:
# export OPENROUTER_API_KEY=sk-or-...
# npm start
```

## Rebuild binder

```bash
npm run build
```
