# OM-ENG — Propulsion & controls

## Mercury Verado 300 V8 AMS

| Item | Value |
|------|--------|
| Model | **13000069A** / **300XXL** |
| ESN | **3B371488** |
| Power | 300 HP / 221 kW |
| Displacement | 4.6 L V8 32-valve DOHC |
| Shaft | 30″ XXL |
| Gear ratio | 1.85:1 (family data) |
| WOT RPM | 5200–6000 |
| Ignition | SmartCraft PCM 112 |
| Midsection | AMS |
| Color | Cold Fusion White |

**Primary OEM PDF:** `manuals/engine/Mercury-Verado-V8-SeaPro-V8-Operation-Maintenance-8m0145543.pdf`  
Also retrieve ESN-specific manual from Mercury portal using `3B371488`.

### Owner operations (high level)
- Monitor VesselView for RPM, trim, temperature, water pressure/tell-tale, voltage, fault text.
- Flush with fresh water after salt use.
- Use Mercury-specified oil, gear lube, filters, spark plugs (see O&M service charts).
- Propeller: record brand/pitch/diameter when known (**UNVERIFIED**).

### Break-in / warranty
Follow Mercury O&M for any remaining warranty constraints; keep service records against ESN.

---

## DTS (Digital Throttle & Shift)

**CONFIRMED** helm: single-lever Mercury ERC with **TRANSFER**, **THROTTLE ONLY**, red lanyard, START/STOP.  
**CONFIRMED** onboard docs: physical **SmartCraft DTS Quick Reference Guide** cover — binder card `Mercury-DTS-Single-Handle-ERC-Quick-Reference-8m0208789.pdf` (**90-8M0208789**).

| Mode / control | Function |
|------|----------|
| Normal | Electronic throttle & shift |
| THROTTLE ONLY | Throttle without engaging gear (warm-up / wash) |
| TRANSFER | Helm / station transfer — usually unused on single-helm boats |
| ACTIVE TRIM | On/off + profiles 1–5 on Next Gen Single Handle pads (see QRG) |
| QUICK STEER | If equipped — fewer lock-to-lock turns + speed limit for tight quarters |
| DOCK | Reduced throttle on some older DTS pads — **confirm** vs ACTIVE TRIM / QUICK STEER with a pad close-up |

**OEM PDFs:** `Mercury-DTS-Single-Handle-ERC-Quick-Reference-8m0208789.pdf` (short how-to), `Mercury-Electric-Steering-V8-V10-AMS-8m0221736.pdf`, `Mercury-SmartCraft-Operation-Overview-8m0071455r.pdf`

### Start interlocks (typical Mercury DTS)
- Lanyard attached
- Lever in neutral
- System powered / no critical fault blocking start

If no crank: see `OM-TS-NOSTART`.

---

## EPHS power steering

**CONFIRMED** pump label:

| Field | Value |
|-------|--------|
| P/N | **8M6005909** |
| Type | EPHS MPU |
| Series | TRW10 |
| Extra ID | A0071925 |
| Built | 2021-08-30 |
| Facility | SCHALKE |

Architecture: **electro-hydraulic** assist (not pure electric SBW).

### Maintenance
1. Check reservoir **MIN–MAX** before outings.
2. Top up **only** with Mercury-specified synthetic power steering fluid (label fragment referenced Mercury synthetic 0W-30 class — confirm exact P/N in O&M).
3. Owner photo showed level **at/near MIN** — prioritize inspection.
4. Investigate leaks if level drops repeatedly; check hoses/ram/pump.

Symptoms: heavy steering, uneven assist, steering alarm → `OM-TS-STEER`.

---

## Active Trim

Covered in Mercury electric-steering / O&M PDFs. If enabled, manages engine trim automatically. Verify on/off and profile on VesselView / control pad. German standalone Active Trim PDF is also in the library.

---

## Cooling & overheat awareness

- Always verify **tell-tale** stream after start.
- Overheat / steam / horn → idle, investigate intake/impeller/blockage (`OM-TS-OVERHEAT`).
- Do not continue WOT with temperature alarms.

---

## SmartCraft network

Engine PCM, DTS, VesselView, and often Garmin engine data overlays share SmartCraft/NMEA gateways. Blank engine data on one display but not the other helps isolate display vs network vs engine ECU — see troubleshooting.
