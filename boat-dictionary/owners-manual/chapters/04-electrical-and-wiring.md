# OM-WIRE — Electrical system & as-installed wiring

**Source of truth for fuse IDs:** owner photo of printed diagram labeled **FLYER 8 SPACE DECK / 12V**, transcribed in [`../../catalog/fuse-map-12v.md`](../../catalog/fuse-map-12v.md).  
**Warning on diagram:** TURN OFF POWER BEFORE SERVICING.

Wire notation on the diagram: `ID r <mm²>` — `r` ≈ red positive; number is conductor cross-section in mm².

> As-installed schematics below reconstruct **distribution topology from the onboard fuse diagram + locker photos**. They are **not** a full Beneteau factory wiring harness print. Battery-switch exact make/model and ACR/combiner topology remain **UNVERIFIED** until photographed.

Also see: [`../diagrams/12v-as-installed.md`](../diagrams/12v-as-installed.md), [`../diagrams/ac-shore-power.md`](../diagrams/ac-shore-power.md).

---

## System overview

| Domain | Voltage | Notes |
|--------|---------|--------|
| Propulsion / start | 12 V DC | ENGINE BATTERY; Mercury AGM start battery typically required |
| House / accessories | 12 V DC | HOUSE BATTERY; Blue Sea + main fuse box loads |
| Shore / charger | 115 V / 60 Hz AC → 12 V | CRISTEC **YPO12-25DE** 25 A |

**CONFIRMED batteries:** two yellow **IMNASA** boxes labeled **ENGINE BATTERY** and **HOUSE BATTERY**.  
**UNVERIFIED:** chemistry (AGM vs flooded), CCA/Ah, and whether CRISTEC charges both banks simultaneously / via combiner.

---

## Blue Sea auxiliary fuse box

Labeled on diagram: **NEW BLUE SEA BOX**.

| Slot | Fuse | Wire ID | Gauge | As-installed load |
|------|------|---------|-------|-------------------|
| 1 | **10 A** | **AN4** | 2.5 mm² | **Fusion stereo / audio** (**CONFIRMED** music circuit) |
| 2 | **3 A** | **JF**, **JF2** | 1.5 mm² | Helm instruments / NMEA / clock + steering-related feed (**LIKELY**) |
| 3 | **10 A** | **VHF** | 2.5 mm² | **Spare / pre-wire** — **no fixed VHF** (handheld only) |
| 4 | **5 A** | **HDS** | 2.5 mm² | **Garmin MFD** feed (factory code HDS; not a Lowrance unit) |

### Service notes — Blue Sea
- Stereo dead → check **AN4 / 10 A** before replacing head unit.
- Garmin dead → check **HDS / 5 A** and main battery switch.
- Do not land a new fixed VHF on an unknown harness without verifying wire path; the fuse slot is available but destination may be capped.

---

## Other labeled peripheral circuits (diagram center)

These appear as dedicated positive feeds on the Flyer 8 12V diagram:

| Wire ID | Gauge | Icon / function | Hardware on this boat |
|---------|-------|-----------------|------------------------|
| **1P1A** | 2.5 mm² | Windshield wipers | **LIKELY** if switch present |
| **1P2B** | 2.5 mm² | Fresh water / tap | **Jabsco PAR-MAX 2.9** `31395-7008` (**CONFIRMED**) |
| **2P1A** | 2.5 mm² | Shower sump | Expected with cockpit shower |
| **3P1A** | 2.5 mm² | **MACER** | Macerator / waste discharge (**CONFIRMED** circuit label) |
| **4P1A** | 2.5 mm² | Bilge pump | Electric bilge (**CONFIRMED** as standard equipment class) |
| **1A1A** | 1.5 mm² | Nav / anchor lights | Standard lighting |

Pump OEM fuse guidance (device labels):
- Flojet washdown: **15 A** device fuse rating
- Jabsco PAR-MAX 2.9: **10 A** device fuse rating  
Match against the actual fuse in the boat’s panel when servicing — panel ampacity and device rating must both be respected.

---

## Main fuse box

Slots **I–XII** on the diagram:

| Slot | Fuse on diagram |
|------|-----------------|
| I | 5 A |
| II | 3 A |
| III | 10 A |
| IV | 15 A |
| V | 15 A |
| VI | 5 A |
| VII | 20 A |
| VIII | 15 A |
| IX | 5 A |
| X | 3 A |
| XI | empty |
| XII | empty |

### Associated main-box circuit labels (right side of diagram)

| Wire ID | Gauge | Likely load |
|---------|-------|-------------|
| **1L1A** | 1.0 mm² | Cabin / interior light |
| **1C1A** | **4.0 mm²** | Fridge / high-draw cabin circuit (fan icon) — **LIKELY** 42 L cabin fridge |
| **1S1A** | 1.5 mm² | Courtesy / deck lighting |
| **1F1A** | 2.5 mm² | 12 V accessory outlet |

> Slot-to-wire-ID cross-mapping on the printed diagram is not fully transcribed for every Roman numeral. When replacing a fuse, use the **physical legend on the boat** as final authority and photograph any clearer label plate for this manual.

---

## AC shore power (as-installed)

**CONFIRMED** adjacent to CRISTEC in locker:

| Item | Detail |
|------|--------|
| Shore label | **115 Volts / 60 Hz** |
| RCD/MCB | Schneider **iDPN N Vigi C32 / 30 mA** (factory label CHAUFFE-EAU; handwritten **PRISE 115V**) |
| Other breakers | ABB **S202C C16** (×2 visible) |
| Indicator | Schneider **iIL** green when live |
| Charger | **CRISTEC YPOWER YPO12-25DE**, S/N **2022061017878**, 12 V / 25 A |
| Charger input | 90–265 VAC, 3.66 A max, 50/60 Hz |
| Profile sticker | **OPENED TYPE / FREE ELECTROLYTE** — verify vs actual batteries |

See charging chapter: [`13-charging-and-batteries.md`](13-charging-and-batteries.md).

---

## Propulsion electrical (SmartCraft)

Not on the Blue Sea sticker, but part of as-installed DC:

| Load | Notes |
|------|--------|
| Engine starter / PCM / injectors | From ENGINE bank via Mercury harness |
| DTS control head | SmartCraft / CAN |
| EPHS MPU `8M6005909` | Electro-hydraulic pump — significant intermittent draw |
| VesselView display | SmartCraft network |
| Active Trim (if enabled) | Via Mercury controls |

Treat engine-cranking issues as **ENGINE bank / connections / Mercury security lanyard / neutral** first (see troubleshooting).

---

## High-current accessories (expect dedicated feeds)

These often have breakers/fuses near the battery or under console (**locations UNVERIFIED** — find and label):

| Load | Why |
|------|-----|
| Bow thruster (Sleipner) | Very high surge — main panel 3–20 A fuses are not the thruster main |
| Windlass | High surge — usually dedicated breaker + contactor |
| Engine main / house main | ANL/MIDI/MRBF class near batteries |

**Action item for owner:** photograph thruster and windlass breakers; they will be added to this chapter as **CONFIRMED**.

---

## Wiring workmanship rules (this boat)

1. Kill battery switches + shore power before opening fuse boxes.
2. Replace fuses with **same ampacity**; never “up-fuse” a wire.
3. After any pump work, verify strainers and polarity (brown/black conventions per OEM pump manuals).
4. CRISTEC profile must match battery chemistry before long-term shore charging.
5. Keep a laminated copy of [`../../catalog/fuse-map-12v.md`](../../catalog/fuse-map-12v.md) in the helm.
