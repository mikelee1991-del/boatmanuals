# Flyer 8 SPACEdeck — boat binder & Q&A

Documentation and problem-solving Q&A for a **2023 BENETEAU Flyer 8 SPACEdeck** with **Mercury Verado 300** (`13000069A` / ESN `3B371488`).

## Boat binder (source of truth)

- [`boat-dictionary/`](boat-dictionary/) — hardware catalog, fuse map, owner’s manual chapters, evidence notes, OEM PDF library + text extracts
- Entry: [`boat-dictionary/README.md`](boat-dictionary/README.md)

## Ask the boat (UI)

[`boat-assistant/`](boat-assistant/) — rebuilt mobile Q&A:

- **Bottom line** + **Do this** steps + safety + photo evidence cards + related manuals
- Free binder answers always
- Optional **free** OpenRouter `:free` model for clearer synthesis (one-time free key)

```bash
cd boat-assistant
npm start
```

Live: **https://mikelee1991-del.github.io/boatmanuals/**

### Help needed from you

1. **Free AI key (optional but recommended):** [openrouter.ai/keys](https://openrouter.ai/keys) → paste in **Setup** on the site. Use a model ending in `:free` ($0).
2. **Original photos:** evidence is transcribed, but image files aren’t in the repo. Drop photos into `boat-dictionary/photos/` and we can display them in answers.
