# OM-SONAR — How to read the fish finder

On-boat guide page: `boat-assistant/public/how-to-read-fish-finder.html` (Ask UI: **Fish finder**).

Helm unit: Garmin **GPSMAP** 7x3 / 9x3 / 12x3 family (see `OM-HELM-GARMIN`). Exact size / xsv still **UNVERIFIED**.

---

## Screen layout (traditional / CHIRP)

- Newest sonar column is on the **right**; history scrolls left.
- **Top** — surface clutter (waves, bubbles, prop wash). Reduce gain if it dominates.
- **Middle** — water column: bait clouds, fish arches, thermoclines.
- **Bottom line** — strongest continuous return; thickness + intensity = hardness / cover.

---

## Multi-spectrum bands — blue and black

Colors map **return strength**, not species.

| Band | Meaning | Fishing / bottom |
|------|---------|------------------|
| **Blue** (cool / weak) | Soft or sparse echo | Open water, soft mud/silt, light weed, small bait, fish on cone edge |
| Mid tones | Moderate density | Soft structure, scattered bait, mixed sand |
| **Black** / hot bright (strongest) | Dense, hard echo | Rock, gravel, hard sand, wrecks, solid centered fish marks |

On Garmin-style palettes, blue is typically the **weak** end of the spectrum; black (or yellow/red/white depending on the selected palette) is the **strong** end. Palette names change the paint; the weak→strong logic does not.

**Fishing tip:** hard (black/hot) edges next to soft (blue) ground with bait above the transition are high-percentage spots.

---

## Bottom type

- Thin, faint, soft-edged line → mud / silt / soft sand
- Thick, sharp, intense line → rock / gravel / hard sand / shell
- Fuzzy “hair” off bottom → weed / grass
- Contour spike or step → ledge, reef, wreck, rock pile — mark a waypoint
- Second (ghost) bottom echo → very hard bottom (double bounce)
- **Whiteline / bottom fill** (if available) — thick highlight = harder; thin = softer

---

## Fish and bait

- **Arches** — fish passing through the cone (traditional view). Full thick arches = under the boat; hooks/dashes = edge of cone or higher speed.
- Arch **color intensity** ≈ density / beam center, not guaranteed size or species. Cool/blue arches often = small bait or edge-of-cone fish.
- **Bait** — clouds or speckled mid-column patches.
- **Thermocline** — faint horizontal band; bait and predators often relate to it.
- **Fish symbols** — optional icons; prefer learning arches/clouds.
- **ClearVü** — fish as dots/dashes (not arches); better structure detail. Idle slowly for clarity. Pair with traditional in a split.

---

## Practical settings

1. Auto Gain, then raise until light speckles appear in open water; back off one step.
2. Adjust Color Gain / Contrast after gain.
3. Stick to one readable palette so the blue↔black spectrum stays consistent in your head.
4. No depth / flashing depth → speed, transducer angle, or sonar source — see `OM-TS-MFD`.

**Manuals:** GPSMAP x3 Owner’s Manual (Sonar Fishfinder); transducer install PDF.
