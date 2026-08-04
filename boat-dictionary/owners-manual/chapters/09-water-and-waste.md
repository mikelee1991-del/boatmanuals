# OM-WATER — Water & waste systems

## Fresh water system

| Item | Detail |
|------|--------|
| Tank | **80 L** (equipment list) |
| Pump | **Jabsco PAR-MAX 2.9** model **31395-7008** S/N **22A45914** (**CONFIRMED**) |
| Rating | 12 V, 2.9 GPM / 11 LPM, max 5.2 A, shutoff 40 PSI |
| Device fuse | **10 A** (label) |
| Diagram feed | **1P2B** 2.5 mm² fresh water / tap |
| Manual | `Jabsco-PAR-MAX-2.9-Manual-EN.pdf` |

### Operation
1. Ensure tank has water (dry running damages pump).
2. Power circuit ON; open faucet — pump should pressurize and stop at shutoff.
3. Short cycling → check for leaks/air; continuous run → open fixture or failed pressure switch.
4. Service strainer on pump inlet regularly (salt/sand).

Cockpit shower expected with US package; shower sump circuit **2P1A**.

Faults → `OM-TS-PUMP`.

---

## Deck wash / washdown

| Item | Detail |
|------|--------|
| Pump | **Flojet R4325143F** S/N **22C53625** (**CONFIRMED**) |
| Rating | 12 V, 4.5 GPM / 17 LPM, max 12 A, shutoff 40 PSI |
| Device fuse | **15 A** (label) |
| Features | Thermally protected; ignition protected ISO 8846 |
| Manual | `Flojet-Washdown-Pump-Manual-EN.pdf` |

Typically raw-water washdown with strainer — keep strainer clean; winterize if freezing climate.

---

## Head & holding tank

**Short answer:** Cabin head has a **Jabsco** Quiet Flush-style panel (**CONFIRMED**): top button = flush, lower left = **fill**, lower right = **empty**. Holding tank has an EMPTY↔FULL gauge at the panel (near empty in the evidence photo). Exact bowl SKU still **UNVERIFIED**; use the Quiet Flush 37055-family manual for panel operation.

| Item | Detail |
|------|--------|
| Toilet | **Jabsco** (**CONFIRMED** control panel) — Quiet Flush-style **flush + fill/empty** pad |
| Exact SKU | Bowl/base plate still **UNVERIFIED** (Quiet Flush / 37055-family **LIKELY**) |
| Holding tank | **CONFIRMED** polyethylene **HOLDING** tank in battery locker |
| Tank level gauge | **CONFIRMED** EMPTY↔FULL meter at the head panel |
| Capacity | List **88 L** blackwater; handwritten **80 L EF** — treat capacity as **UNVERIFIED** |
| Macerator circuit | Diagram **3P1A MACER** 2.5 mm² |

### How to use (Quiet Flush-style panel)
1. Top **toilet** button: one-touch flush (rinse + discharge together).
2. Lower **fill**: add rinse water only.
3. Lower **empty**: run discharge/macerator only (useful underway to leave the bowl dry).
4. Do not flush rags, wipes, or hard objects.

### Legal / ops
- Know Y-valve / discharge configuration before pumping overboard (**UNVERIFIED** exact plumbing — photograph valves).
- In US waters, observe No-Discharge Zones; use pump-out.
- Odor issues: tank vent, hose permeation, treatment products — do not dump chemicals incompatible with treatment systems.

**Primary manual:** `Jabsco-Quiet-Flush-Conversion-37055-EN.pdf`  
**Related:** `Jabsco-37010-Electric-Toilet-Manual-EN.pdf` (simpler push-button family — panel on this boat is Quiet Flush-style).

Faults → toilet section in `OM-TS` / `toilet_fail`.

---

## Bilge

- Standard: electric bilge + manual bilge.
- Diagram feed **4P1A**.
- Test float switch periodically; keep bilge clean of oil before pumping overboard.

---

## Cabin fridge (**LIKELY**)

- Heavy feed **1C1A** 4.0 mm² on main fuse diagram.
- Factory option 42 L cabin fridge (Isotherm manuals in library).
- Confirm presence/label in cabin; faults → `OM-TS-FRIDGE`.
