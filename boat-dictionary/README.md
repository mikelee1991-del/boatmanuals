# Flyer 8 SPACEdeck Boat Dictionary

English manuals and a searchable hardware map for:

| Item | Value |
|------|--------|
| Boat | 2023 BENETEAU Flyer 8 SPACEdeck (V2 / Air Step 2) |
| HIN | **BEYFT208F223** |
| EU CIN | **FR-SPBFT208F223** |
| Market | US (Beneteau America — USCG + EPA EVAP) |
| Builder | SPBI, Dompierre sur Yon, France |
| CE | Cat **C/D**, **10** persons, max load **1285 kg**, CE **0607** |
| Engine | Mercury Marine Verado 300 V8 AMS — model **13000069A** / **300XXL** |
| ESN | **3B371488** (confirmed from data plate photo) |
| Controls | Digital Throttle & Shift (DTS) |
| Steering | **EPHS MPU** Mercury **8M6005909** (TRW10) — electro-hydraulic |
| Shaft | XXL 30 in |

**Consolidated owner’s manual (start here):** [`owners-manual/README.md`](owners-manual/README.md) — as-installed wiring, power-up/down, troubleshooting, LLM indexes  
Machine-readable catalog: [`catalog/boat-dictionary.yaml`](catalog/boat-dictionary.yaml)  
12 V fuse map: [`catalog/fuse-map-12v.md`](catalog/fuse-map-12v.md)  
Stock vs options vs later-added: [`catalog/equipment-provenance.md`](catalog/equipment-provenance.md)  
PDF library: [`manuals/`](manuals/) (~100 MB)

---

## Confirmed from your data

- **HIN `BEYFT208F223`** / EU CIN **`FR-SPBFT208F223`** — 2023 model year; HIN date code **F2** ≈ manufactured **June 2022**.
- Builder plate confirms **FLYER 8 SPACEdeck**, CE **C/D**, **10** persons, **1285 kg** max load; USCG + EPA EVAP plates = **US-market** boat (Beneteau America, Marion SC).
- **Engine model `13000069A`** / designation **300XXL** = Mercury **Verado 300 HP** (221 kW), plate weight 620 lb / 281 kg, **30" XXL**.
- **ESN `3B371488`** confirmed from the transom data plate photo — use this on the [Mercury Owners Manual portal](https://www.mercurymarine.com/us/en/service-and-support/owners-resources/owners-manual) and for parts.
- Prefer the **US equipment list** (`Flyer-8-SPACEdeck-Equipment-List-US.pdf`) and ask the dealer for the CE Owner’s Handbook against **HIN BEYFT208F223**.
- From helm photos: **Zipwake** Series S, **Sleipner** thruster + joystick, **Garmin GPSMAP 7x3/9x3/12x3** (exact size TBD), **Mercury VesselView 403**, **Fusion** stereo, **Mercury DTS** (DOCK/TRANSFER/THROTTLE ONLY), **electric windlass**, **black T-Top**, black pulpits. **LENCO not installed**.
- Garmin docs onboard: **GPSMAP® 7x3/9x3/12x3 Quick Start Manual** cover (ECHOMAP pack guesses discarded).
- Windlass control docs onboard: **Quick HRC** Multipurpose Control Panel manual **CE REV 005c** (exact HRC SKU + winch motor plate still open).
- **SmartCraft DTS Quick Reference Guide** cover onboard (Single Handle ERC card **90-8M0208789** in binder).

---

## Manuals collected (English unless noted)

### Boat
| File | What it is |
|------|------------|
| `manuals/boat/Flyer-8-SPACEdeck-Equipment-List-US.pdf` | Official NA **General Equipment List** (M12925) — standard + packs + options |
| `manuals/boat/Flyer-8-SPACEdeck-Equipment-List-EN.pdf` | International equipment / specs sheet (M12921) |
| `manuals/boat/Flyer-8-Press-Release-UK.pdf` | Product overview / provisional specs |

**Missing (dealer/registration only):** BENETEAU **CE Owner’s Manual / Owner’s Handbook** for your HIN — request via [Beneteau Helpdesk](https://help.beneteau.com/hc/en-us/sections/360005594658-Owner-s-manuals) or selling dealer.

### Engine & SmartCraft
| File | What it is |
|------|------------|
| `manuals/engine/Mercury-Verado-V8-SeaPro-V8-Operation-Maintenance-8m0145543.pdf` | Verado V8 O&M (8M0145543) |
| `manuals/engine/Mercury-DTS-Single-Handle-ERC-Quick-Reference-8m0208789.pdf` | **SmartCraft DTS** Single Handle ERC Quick Reference (**onboard**) |
| `manuals/engine/Mercury-Electric-Steering-V8-V10-AMS-8m0221736.pdf` | Electric steering + DTS features + **Active Trim** (EN) |
| `manuals/engine/Mercury-SmartCraft-Operation-Overview-8m0071455r.pdf` | SmartCraft / DTS overview |
| `manuals/engine/Mercury-Active-Trim-8m0125432e-German.pdf` | Standalone Active Trim PDF (**German** only found) |

**Missing / purchase:** Mercury Verado V8 AMS **Service Manual** (part **8M0182077**) and **Diagnostic Manual** (PCM 112 / CDS G3) — order via Mercury dealer / Brunswick publications. Also pull the ESN-specific O&M from [Mercury Owners Manuals](https://www.mercurymarine.com/us/en/service-and-support/owners-resources/owners-manual).

### Electronics
| File | What it is |
|------|------------|
| `manuals/electronics/Garmin-GPSMAP-7x3-9x3-12x3-16x3-Owners-Manual-EN.pdf` | **Installed** GPSMAP **x3** family ops |
| `manuals/electronics/Garmin-ECHOMAP-UHD-Owners-Manual-EN.pdf` | ECHOMAP UHD (**not this HIN**) |
| `manuals/electronics/Garmin-ECHOMAP-UHD2-62-72-92sv-Owners-Manual-EN.pdf` | ECHOMAP UHD2 (**not this HIN**) |
| `manuals/electronics/Garmin-Transom-Mount-Transducer-Install-EN.pdf` | Transom transducer install (GT23 class) |
| `manuals/electronics/Fusion-MS-RA70-RA70N-Owners-Manual-EN.pdf` | **Installed** stereo (MS-RA70N) |
| `manuals/electronics/Fusion-MS-RA210-Owners-Manual-EN.pdf` | Discarded Sound Pack candidate (not this HIN) |
| `manuals/electronics/Mercury-VesselView-403-Operation-8m0124182.pdf` | **Installed** VesselView **403** ops |
| `manuals/electronics/Mercury-VesselView-403-Quick-Guide.pdf` | VesselView 403 quick guide |
| `manuals/electronics/Mercury-VesselView-403-Installation-8m0124488.pdf` | VesselView 403 install (**sheet onboard**) |
| `manuals/electronics/Mercury-VesselView-704-8m0220645.pdf` | VesselView 704 (not this HIN) |
| `manuals/electronics/Mercury-VesselView-502-702-8m0109374r.pdf` | VesselView 502/702 (not this HIN) |

### Trim systems (mutually exclusive options)
| File | What it is |
|------|------------|
| `manuals/systems/Zipwake-Series-S-Operators-Manual-EN-R5A.pdf` | Zipwake Series S operator |
| `manuals/systems/Zipwake-Series-S-Installation-Guide-EN.pdf` | Zipwake Series S install |
| `manuals/systems/LENCO-Electric-Trim-Tab-Kit-Owners-Manual.pdf` | LENCO electric trim tabs |

### Peripherals (typical options — verify on your boat)
| File | What it is |
|------|------------|
| `manuals/peripherals/Quick-HRC-Multipurpose-Control-Panel-EN.pdf` | **Quick HRC** multipurpose handheld (manual onboard) |
| `manuals/peripherals/Lewmar-Pro-Series-Pro-Fish-Windlass-Manual.pdf` | Lewmar windlass (alternate winch candidate) |
| `manuals/peripherals/Side-Power-SE-SE-IP-DC-User-Manual-EN.pdf` | Side-Power SE thruster user |
| `manuals/peripherals/Isotherm-Cruise-42-130-Install-Operating-EN.pdf` | Isotherm Cruise 42 L fridge |
| `manuals/peripherals/Isotherm-Cruise-Refer-Manual-EN.pdf` | Isotherm Cruise reference |
| `manuals/peripherals/Jabsco-Quiet-Flush-Conversion-37055-EN.pdf` | **Jabsco Quiet Flush** control family (panel CONFIRMED) |
| `manuals/peripherals/Jabsco-37010-Electric-Toilet-Manual-EN.pdf` | Related Jabsco electric toilet family |
| `manuals/peripherals/Flojet-Washdown-Pump-Manual-EN.pdf` | **Flojet R4325** washdown pump (installed **R4325143F**) |
| `manuals/peripherals/Jabsco-PAR-MAX-2.9-Manual-EN.pdf` | **Jabsco PAR-MAX 2.9** freshwater pump (installed **31395-7008**) |
| `manuals/peripherals/CRISTEC-YPOWER-User-Manual-EN.pdf` | **CRISTEC YPOWER** charger manual (installed: **YPO12-25DE**) |
| `manuals/peripherals/CRISTEC-YPOWER-Datasheet-EN.pdf` | CRISTEC YPOWER datasheet |
| `manuals/peripherals/Mastervolt-ChargeMaster-12-25-3-Manual-EN.pdf` | Mastervolt (NOT installed — discarded candidate) |

---

## Factory option map (from Beneteau equipment lists)

Useful when debugging “is this even installed?”

**US Trim Package (very common on US boats):** polyester cockpit table, offshore compass, extended swim platforms, **electric windlass**, cockpit LED courtesy lights, **shore power 110 V + charger pre-fit**, **freshwater electric toilet + 88 L holding tank**, horn.

**Electronic Pack (list wording):** often cites Garmin ECHOMAP — **this HIN has GPSMAP 7x3/9x3/12x3** (QSM cover). Exact 7/9/12 SKU TBD. Transducer still likely **GT23-TM** class.  
**Upgraded Electronic Pack (list):** Garmin ECHOMAP Ultra 2 **122sv** — **not** confirmed on this HIN.  
**Sound Pack:** Fusion stereo + speakers — **this HIN has MS-RA70N** (faceplate), not the MS-RA210 often listed on Flyer 8 equipment sheets.

**Other options:** 42 L cabin fridge, bow thruster, **Zipwake** *or* **LENCO** tabs, deck-wash pump, T-Top / Pilot Edition, ski mast, fishing station, Seanapps unit.  
**This HIN:** underwater lights and fishing station are **NOT INSTALLED** (owner).

---

## How to search / debug

1. Open [`catalog/boat-dictionary.yaml`](catalog/boat-dictionary.yaml).
2. Search by **keyword** (`windlass`, `overheat`, `DTS`, `Zipwake`…) or use `symptom_index`.
3. Follow `manuals[].path` to the PDF.
4. Prefer **confirmed** hardware; treat **typical_option** / **unverified** as “maybe installed” until you confirm.

---

## Questions — please answer so we can lock the dictionary

Reply with whatever you know (photos of labels are ideal):

1. ~~**HIN**~~ — **done: `BEYFT208F223`** (US boat). Delivery **dealer** still useful.
2. ~~**Engine ESN**~~ — **done: `3B371488`**
3. ~~**Garmin**~~ — **GPSMAP 7x3/9x3/12x3** family confirmed (QSM cover); exact 7/9/12 SKU still open (About/bezel).
4. ~~**Trim**~~ — **Zipwake confirmed**. Optional: interceptor size on transom.
5. **Windlass** brand/model on the motor plate.
6. ~~**Bow thruster**~~ — **Sleipner confirmed**; still need motor-plate model (SE40/SE60/etc.).
7. ~~**Cabin fridge**~~ — **confirmed** in cabin/head; brand/model plate still open.
8. ~~**Electric toilet**~~ — **Jabsco** Quiet Flush-style panel confirmed; bowl SKU still open.
8b. **Battery chemistry** inside ENGINE / HOUSE IMNASA boxes (AGM vs flooded) — important for CRISTEC profile.
9. ~~**Shore power charger**~~ — **CRISTEC YPOWER YPO12-25DE** confirmed (S/N 2022061017878). Still verify battery chemistry vs “OPENED TYPE” setting.
10. ~~**VesselView**~~ — **VesselView 403** confirmed (install sheet onboard).
11. ~~**Fusion stereo**~~ — **MS-RA70N** confirmed (faceplate).
12. ~~**T-Top / ski pylon / teak**~~ — **confirmed** (T-Top + 4 rod holders + ski/tow arch + **real teak deck**). ~~Underwater lights / fishing station~~ — **NOT INSTALLED** (owner).
13. **Seanapps** unit present and activated?
14. Propeller brand/pitch/diameter if known?
15. ~~**VHF**~~ — **no fixed set**; handheld only (Blue Sea VHF fuse is spare/pre-wire).

Once those are answered, peripheral manuals can be narrowed to exact part numbers and any wrong-brand PDFs can be replaced.
