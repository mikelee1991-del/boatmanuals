# Consolidated Owner’s Manual

**Vessel:** 2023 BENETEAU Flyer 8 SPACEdeck (HIN `BEYFT208F223`)  
**Engine:** Mercury Verado 300 V8 AMS — model `13000069A` / ESN `3B371488`  
**Purpose:** Single searchable owner/operations/troubleshooting book that consolidates **as-installed** hardware, wiring, power sequences, and OEM manual pointers.

> This is **not** a substitute for the Beneteau CE Owner’s Handbook or Mercury ESN-specific manuals. It is the vessel-specific consolidation built from confirmed plates, photos, fuse diagrams, and OEM PDFs in this repo. Items marked **UNVERIFIED** need a label photo or build sheet.

---

## How to use (human)

1. Start at [`00-quickstart.md`](00-quickstart.md) for power-up / power-down and daily checks.
2. Use the chapter list below, or search this folder for a keyword (`Zipwake`, `MACER`, `EPHS`, `no start`…).
3. For fuse/wiring detail → [`chapters/04-electrical-and-wiring.md`](chapters/04-electrical-and-wiring.md) + [`diagrams/`](diagrams/).
4. For fault trees → [`chapters/14-troubleshooting.md`](chapters/14-troubleshooting.md).
5. Jump to OEM PDFs via [`chapters/16-manuals-map.md`](chapters/16-manuals-map.md) or [`../catalog/boat-dictionary.yaml`](../catalog/boat-dictionary.yaml).

## How to use (LLM / AI assistant)

1. Load [`llm/system-prompt.md`](llm/system-prompt.md) as the assistant system instructions.
2. Prefer retrieval from:
   - [`llm/retrieval-index.json`](llm/retrieval-index.json) — chunked facts with IDs
   - [`llm/symptom-playbooks.yaml`](llm/symptom-playbooks.yaml) — symptom → steps
   - [`index.yaml`](index.yaml) — section / keyword map
   - [`../catalog/boat-dictionary.yaml`](../catalog/boat-dictionary.yaml) — hardware registry
3. Always cite section IDs (e.g. `OM-PWR-01`, `OM-WIRE-BLUESEA`) and distinguish **confirmed** vs **UNVERIFIED**.
4. Never invent part numbers, fuse ratings, or fluid specs not present in these files or the linked OEM PDFs.

---

## Chapter map

| ID prefix | File | Contents |
|-----------|------|----------|
| `OM-QS` | [`00-quickstart.md`](00-quickstart.md) | Daily use, laminated checklist |
| `OM-ID` | [`chapters/01-vessel-identity.md`](chapters/01-vessel-identity.md) | Plates, HIN, specs, provenance |
| `OM-SAFE` | [`chapters/02-safety-and-limits.md`](chapters/02-safety-and-limits.md) | CE limits, kill switch, CO, fuel |
| `OM-SYS` | [`chapters/03-systems-overview.md`](chapters/03-systems-overview.md) | What is installed where |
| `OM-WIRE` | [`chapters/04-electrical-and-wiring.md`](chapters/04-electrical-and-wiring.md) | As-installed 12 V / AC wiring |
| `OM-PWR` | [`chapters/05-power-sequences.md`](chapters/05-power-sequences.md) | Power-up, power-down, shore power |
| `OM-ENG` | [`chapters/06-propulsion-and-controls.md`](chapters/06-propulsion-and-controls.md) | Verado, DTS, EPHS, Active Trim |
| `OM-HELM` | [`chapters/07-helm-electronics.md`](chapters/07-helm-electronics.md) | Garmin, VesselView, Fusion, compass |
| `OM-TRIM` | [`chapters/08-trim-and-stability.md`](chapters/08-trim-and-stability.md) | Zipwake Series S |
| `OM-WATER` | [`chapters/09-water-and-waste.md`](chapters/09-water-and-waste.md) | Fresh water, washdown, head, holding |
| `OM-ANCH` | [`chapters/10-ground-tackle.md`](chapters/10-ground-tackle.md) | Windlass & anchor |
| `OM-THR` | [`chapters/11-thruster.md`](chapters/11-thruster.md) | Sleipner bow thruster |
| `OM-DECK` | [`chapters/12-deck-and-exterior.md`](chapters/12-deck-and-exterior.md) | Teak, T-Top, ski pylon |
| `OM-BATT` | [`chapters/13-charging-and-batteries.md`](chapters/13-charging-and-batteries.md) | ENGINE/HOUSE banks, CRISTEC |
| `OM-TS` | [`chapters/14-troubleshooting.md`](chapters/14-troubleshooting.md) | Master fault trees |
| `OM-MAINT` | [`chapters/15-maintenance.md`](chapters/15-maintenance.md) | Checks & service intervals |
| `OM-MAP` | [`chapters/16-manuals-map.md`](chapters/16-manuals-map.md) | PDF library map |

## Diagrams

| File | What |
|------|------|
| [`diagrams/12v-as-installed.md`](diagrams/12v-as-installed.md) | As-installed 12 V power distribution |
| [`diagrams/ac-shore-power.md`](diagrams/ac-shore-power.md) | 115 V shore → CRISTEC + outlets |
| [`diagrams/helm-layout.md`](diagrams/helm-layout.md) | Helm equipment map |
| [`diagrams/battery-locker.md`](diagrams/battery-locker.md) | Battery / pump / tank locker layout |

## Related repo files

- Fuse transcription: [`../catalog/fuse-map-12v.md`](../catalog/fuse-map-12v.md)
- Hardware YAML: [`../catalog/boat-dictionary.yaml`](../catalog/boat-dictionary.yaml)
- Stock vs options: [`../catalog/equipment-provenance.md`](../catalog/equipment-provenance.md)
- Photo evidence: [`../notes/evidence/`](../notes/evidence/)
- OEM PDFs: [`../manuals/`](../manuals/)

## Confidence legend

| Tag | Meaning |
|-----|---------|
| **CONFIRMED** | Seen on vessel (plate/photo/owner) |
| **LIKELY** | Strong factory/fuse evidence; model not locked |
| **UNVERIFIED** | Assumed from typical OEM practice — confirm before relying |
| **NOT INSTALLED** | Ruled out (e.g. LENCO, fixed VHF, Mastervolt) |
