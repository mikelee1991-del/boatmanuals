# OM-BATT — Batteries & charging

## Banks (**CONFIRMED**)

| Bank | Container | Role |
|------|-----------|------|
| **ENGINE BATTERY** | Yellow IMNASA box | Start / Mercury critical |
| **HOUSE BATTERY** | Yellow IMNASA box | House, thruster, windlass, electronics |

Location: battery locker under teak hatch — [`../diagrams/battery-locker.md`](../diagrams/battery-locker.md)

## Chemistry — critical open item

| Source | Says |
|--------|------|
| CRISTEC face sticker | **OPENED TYPE / FREE ELECTROLYTE** (flooded) |
| Mercury Verado practice | Typically requires **AGM** starting battery with high MCA/CCA |
| Photos | Chemistry labels not yet read inside boxes |

**Action:** open boxes, photograph battery labels, then set CRISTEC DIP/profile per YPOWER manual to match. Wrong profile shortens battery life and can under/overcharge.

## Charger (**CONFIRMED**)

| Field | Value |
|-------|--------|
| Brand / model | CRISTEC **YPOWER YPO12-25DE** |
| S/N | **2022061017878** |
| Output | 12 V / **25 A** |
| Input | 90–265 VAC |
| Manuals | `CRISTEC-YPOWER-User-Manual-EN.pdf`, datasheet |

LEDs: ON, Boost, Absorption, Floating, Refresh.

**NOT INSTALLED:** Mastervolt ChargeMaster (manual kept only as discarded candidate).

## Shore AC path
See [`04-electrical-and-wiring.md`](04-electrical-and-wiring.md#ac-shore-power-as-installed) and [`../diagrams/ac-shore-power.md`](../diagrams/ac-shore-power.md).

## Healthy voltage guide (12 V lead chemistry — approximate)

| State | Resting V (approx) |
|-------|---------------------|
| Full | ~12.7+ (flooded) / AGM similar-ish |
| 50% | ~12.2 |
| Service now | ≤12.0 |

Running with alternator: owner photo ~**14.2–14.4 V** — healthy charging band.

## Usage tips
1. Thruster + windlass + stereo + MFD can stack house loads — watch voltage.
2. If ENGINE is weak but HOUSE is good, use OEM parallel/combine procedure only if switch exists and is understood.
3. After adding loads, recheck CRISTEC can replenish overnight (25 A is modest for two depleted banks).
4. Keep terminals tight/clean; IMNASA boxes help contain acid but inspect straps.

Faults → `shore_power_issues` / no-start battery steps in troubleshooting.
