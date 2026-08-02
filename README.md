# Flyer 8 SPACEdeck — boat binder & Q&A

Documentation and offline Q&A for a **2023 BENETEAU Flyer 8 SPACEdeck** with **Mercury Verado 300** (`13000069A` / ESN `3B371488`).

## Boat binder (source of truth)

Everything the guide knows lives here:

- [`boat-dictionary/`](boat-dictionary/) — hardware catalog, fuse map, owner’s manual chapters, evidence notes, OEM PDF library  
- Entry point: [`boat-dictionary/README.md`](boat-dictionary/README.md)  
- Consolidated manual: [`boat-dictionary/owners-manual/README.md`](boat-dictionary/owners-manual/README.md)

## Q&A UI (reads the binder)

[`boat-assistant/`](boat-assistant/) is a **repo-local** mobile page that answers questions from the binder.

```bash
cd boat-assistant
npm start          # builds from boat-dictionary/, serves http://localhost:8787
```

No API keys. After merge to `main`, GitHub Pages can host the same UI (see `boat-assistant/README.md`).

## Layout

```text
boat-dictionary/     boat binder (edit this to teach the boat)
boat-assistant/      Q&A UI that packs + searches the binder
.github/workflows/   builds binder → GitHub Pages
```
