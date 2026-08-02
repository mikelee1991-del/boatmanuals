# Flyer 8 SPACEdeck — 12 V fuse map (from onboard diagram)

Source: owner photo of printed diagram labeled **FLYER 8 SPACE DECK** / **12V**.  
Warning on diagram: **TURN OFF POWER BEFORE SERVICING.**

Wire codes appear as `ID r <mm²>` where `r` ≈ red (positive) and the number is conductor cross-section.

---

## NEW BLUE SEA BOX

| Slot | Fuse | Wire ID | Gauge | Likely load (icon / code) |
|------|------|---------|-------|---------------------------|
| 1 | **10 A** | AN4 | 2.5 mm² | Stereo / audio (music note) |
| 2 | **3 A** | JF, JF2 | 1.5 mm² | Helm instruments / NMEA / clock + steering-related feed |
| 3 | **10 A** | VHF | 2.5 mm² | **VHF radio** |
| 4 | **5 A** | HDS | 2.5 mm² | Multifunction display feed (diagram code **HDS**; on this boat the installed MFD is **Garmin**, not Lowrance) |

---

## Other labeled peripheral circuits (center of diagram)

| Wire ID | Gauge | Icon / note |
|---------|-------|-------------|
| 1P1A | 2.5 mm² | Windshield wipers |
| 1P2B | 2.5 mm² | Fresh water / tap (Jabsco PAR-MAX) |
| 2P1A | 2.5 mm² | Shower sump |
| 3P1A | 2.5 mm² | **MACER** — macerator / waste pump |
| 4P1A | 2.5 mm² | Bilge pump |
| 1A1A | 1.5 mm² | Lights (nav/anchor class) |

---

## MAIN FUSE BOX (slots I–XII)

| Slot | Fuse |
|------|------|
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
| XI | empty / unlabeled |
| XII | empty / unlabeled |

### Associated main-box circuit labels (right side of diagram)
| Wire ID | Gauge | Likely load |
|---------|-------|-------------|
| 1L1A | 1.0 mm² | Cabin / interior light |
| 1C1A | 4.0 mm² | Fridge / high-draw cabin circuit (fan icon) |
| 1S1A | 1.5 mm² | Courtesy / deck lighting |
| 1F1A | 2.5 mm² | 12 V accessory outlet |

---

## Hardware implications for this boat
- **Blue Sea Systems** fuse block is fitted (“NEW BLUE SEA BOX”).
- Diagram includes **VHF**, **stereo**, **macerator**, **fresh water**, **shower**, **bilge**, and a **fridge-class** heavy feed — treat those systems as expected/present unless proven absent.
- Code **HDS** on the Blue Sea box is the factory wire ID for the display circuit; do **not** assume a Lowrance HDS unit is installed (helm photos show **Garmin**).
