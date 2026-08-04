# OM-HELM — Helm electronics

Layout: [`../diagrams/helm-layout.md`](../diagrams/helm-layout.md)

---

## Garmin MFD

**Status:** **CONFIRMED** present · exact model **UNVERIFIED**

Likely factory Electronic Pack candidates:
- ECHOMAP UHD 92sv (common 2023)
- ECHOMAP UHD2 92sv (current list)
- ECHOMAP Ultra 2 122sv (upgraded pack)

**Power:** Blue Sea **HDS 5 A** (factory wire code — not Lowrance).

**Manuals in library:**
- `manuals/electronics/Garmin-ECHOMAP-UHD-Owners-Manual-EN.pdf`
- `manuals/electronics/Garmin-ECHOMAP-UHD2-62-72-92sv-Owners-Manual-EN.pdf`
- `manuals/electronics/Garmin-Transom-Mount-Transducer-Install-EN.pdf`

### Owner tasks
1. Settings → System → **About** → record model + software; update this manual.
2. Confirm transducer (likely **GT23M-TM** class).
3. Keep chart cards / Freezepoint backups as you prefer.

### Common ops
- Chart + sonar split (seen in owner photos)
- Engine data overlay possible via NMEA/SmartCraft gateway
- Man overboard / track / routes per Garmin manual

Faults → `OM-TS-MFD`.

---

## Mercury VesselView / SmartCraft display

**Status:** **CONFIRMED** · **VesselView 403** (install sheet onboard — AUGUST 2017)

**Evidence:** [`../../notes/evidence/vesselview-403.md`](../../notes/evidence/vesselview-403.md)

**Manuals (prefer these):**
- `Mercury-VesselView-403-Operation-8m0124182.pdf`
- `Mercury-VesselView-403-Quick-Guide.pdf`
- `Mercury-VesselView-403-Installation-8m0124488.pdf`

**Not this HIN (kept for reference only):** VesselView 502/702/704 PDFs.

403 is a **5-button, non-touch** SmartCraft engine display (Menu / arrows / Enter / Speed Control) — not a chartplotter. Use for RPM, trim %, temps, fuel, faults, Active Trim / Smart Tow / troll settings. Prefer VesselView fault text when diagnosing engine alarms.

---

## Fusion stereo

**Status:** **CONFIRMED** · **MS-RA70N** (faceplate; NMEA 2000 / **N2K**)

**Power:** Blue Sea **AN4 10 A**, wire 2.5 mm²  
**Manual:** `Fusion-MS-RA70-RA70N-Owners-Manual-EN.pdf`  
**Evidence:** [`../../notes/evidence/fusion-faceplate.md`](../../notes/evidence/fusion-faceplate.md)

**NOT INSTALLED on this HIN:** MS-RA210 (equipment-list Sound Pack guess — superseded).

N2K control from Garmin is possible if the network drop is connected (**wiring UNVERIFIED**). Faults → `OM-TS-AUDIO`.

---

## Offshore compass

**CONFIRMED** magnetic compass on dash (US Trim Package). Compensate if electronics/speakers were changed; keep ferrous tools away.

---

## VHF

| Type | Status |
|------|--------|
| Fixed VHF | **NOT INSTALLED** |
| Handheld | Owner-carried |
| Blue Sea VHF 10 A | Spare / pre-wire only |

Optional future: install DSC fixed VHF on the pre-wire after verifying harness destination and grounding.

---

## Switch bank

Helm toggles for lights, bilge, accessories (**individual legends UNVERIFIED** — photograph switch panel labels to expand this section).
