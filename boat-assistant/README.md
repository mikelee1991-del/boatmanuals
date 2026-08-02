# Flyer 8 Boat Guide (offline Q&A)

A **mobile interface** where you ask a question about *this* boat and get an answer from the vessel dataset.

**No API keys. No cloud LLM required. Tiny footprint** (~knowledge bundle only — no PDF binaries in the app).

## Why this approach

| Approach | Keys | Weight | Fits “where is my fuel filter?” |
|----------|------|--------|----------------------------------|
| Cloud Grok / ChatGPT API | Yes — can be lost/rotated/billed | Low code, ongoing dependency | Good prose, fragile ops |
| On-device LLM | No | Heavy (GBs) | Overkill on a phone |
| **This app: retrieve + compose from your boat binder** | **No** | **~150–200 KB JSON** | **Best default** |

The “model of the boat” is the structured binder in `boat-dictionary/` (identity, wiring, power sequences, playbooks, evidence, OEM excerpts). The UI searches that and writes a readable answer. When something isn’t in the dataset yet, it says so instead of inventing.

Optional cloud LLM can still be added later — it’s not required for the product to work.

## Run

```bash
cd boat-assistant
npm start
```

Open `http://localhost:8787` on your phone (same Wi‑Fi → use your computer’s LAN IP).  
Share → **Add to Home Screen** for an app-like icon.

### Example

> Where is my fuel/water separator and how do I know whether it needs to be replaced?

Answer comes from Mercury Verado O&M excerpts + vessel notes (engine-mounted low‑pressure filter, starboard aft under cowl, water‑in‑fuel alarm, etc.).

## How it works

1. `npm run build` packs text from `boat-dictionary/` into `public/knowledge-bundle.json`
2. Phone loads the PWA (cached by service worker after first visit)
3. Your question is matched against passages + symptom playbooks **in the browser**
4. A short answer is composed with source file citations

## API (optional)

| Route | Purpose |
|-------|---------|
| `GET /api/status` | Bundle stats |
| `POST /api/ask` | `{ "question": "..." }` → same offline engine |

## Deploy without a server

After `npm run build`, the `public/` folder is a static site (GitHub Pages, any static host). No Node needed at runtime — open `index.html` via HTTPS host and it works offline after install.

## Growing the brain

Add facts under `boat-dictionary/` (notes, chapters, YAML), then `npm run build`.  
No model fine-tuning, no keys to rotate.
