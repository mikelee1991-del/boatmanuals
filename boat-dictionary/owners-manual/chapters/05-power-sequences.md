# OM-PWR — Power sequences

These sequences are written for **this** Flyer 8 SPACEdeck: dual IMNASA banks, Mercury DTS Verado 300, Zipwake, Sleipner, Garmin/Fusion, CRISTEC shore charging, handheld VHF only.

Where battery-switch labeling is not yet photographed, steps say “battery switch(es)” — confirm the physical panel legend on your boat and annotate this file.

---

## Cold-start / power-up (underway)

**ID:** `OM-PWR-01`

### A. Electrical wake-up
1. Walk-around clear; bilge OK; no fuel odor.
2. **Shore power disconnected** if leaving the slip (pedestal → then inlet).
3. Turn **ENGINE** battery circuit **ON**.
4. Turn **HOUSE** battery circuit **ON** (needed for thruster, windlass, house loads, electronics).
5. If a combine/parallel switch exists (**UNVERIFIED**), leave in normal/isolate cruise position unless starting with a weak engine battery per OEM procedure.
6. Energize helm breakers / Blue Sea loads as needed:
   - **HDS 5 A** — Garmin
   - **AN4 10 A** — Fusion (optional at start)
   - **JF 3 A** — helm feeds

### B. Helm & networks
7. Clip **kill lanyard** to DTS and operator.
8. Place DTS lever in **NEUTRAL** (required for start).
9. Ignition **ON** (do not crank yet).
10. Wait for:
    - VesselView / SmartCraft self-test complete
    - No persistent critical alarms
    - Garmin boot + GPS acquiring
    - Zipwake panel powered
11. Optional: Fusion on; thruster panel armed only when ready to maneuver.

### C. Engine start
12. Press **START** (or key start per helm).
13. Release at first fire; do not continuous-crank beyond Mercury limits — wait ≥30–60 s between long attempts.
14. Verify:
    - Tell-tale cooling water stream
    - Oil pressure / no overheat icons
    - Voltage climbing toward ~13.8–14.6 V when charging (underway photo previously ~14.2–14.4 V)
    - Steering assist present (wheel effort normal)
15. Idle warm-up as required by Mercury O&M / water temperature.
16. Check trim: engine trim switch + Zipwake status (AUTO PITCH / AUTO ROLL as desired).

### D. Get-away checks
17. Nav / anchor lights as required.
18. Brief thruster bump clear of dock lines.
19. Windlass: confirm anchor stowed/latched before planning sea way.
20. Handheld VHF on and on the working channel.

---

## Normal power-down / shutdown

**ID:** `OM-PWR-02`

1. Approach in **DOCK** mode if desired; thruster as needed.
2. DTS → **NEUTRAL**; idle.
3. After high-speed run, allow a short cool-down idle if Mercury guidance for that session applies.
4. **STOP** engine.
5. Ignition **OFF**; remove lanyard (store where it will be found next trip).
6. Zipwake OFF / sleep per its UI if required.
7. Garmin → home/shutdown; Fusion OFF.
8. Thruster panel OFF / disarmed.
9. Switch off unused house loads (fridge may stay on if provisioned and batteries healthy).
10. Bilge check; pump as needed.
11. Saltwater: **flush engine** with flush port / earmuffs per Verado O&M.
12. Battery switches:
    - Leaving boat hours/days: typically **OFF** main banks.
    - If automatic bilge must remain live, leave only the dedicated bilge feed powered (**confirm** your switch design — **UNVERIFIED**).
13. Lockers closed; shore power optional (next section).

---

## Overnight on the hard / trailer / dry storage

1. Complete `OM-PWR-02`.
2. Shore power optional for CRISTEC maintenance charge — only if:
   - Cord and inlet dry/acceptable
   - RCD functional
   - Battery chemistry matches charger profile
3. Prefer float/maintenance once batteries full; do not ignore CRISTEC fault LEDs.
4. For long storage: follow Mercury fogging/fuel/storage sections; consider battery maintainer strategy.

---

## Shore power connect / disconnect

**ID:** `OM-PWR-SHORE`

### Connect
1. Engine **OFF**.
2. Inspect cord (no cracked insulation); use **15/30 A marine** cord appropriate to inlet (**UNVERIFIED** inlet amperage stamp — read the inlet plate).
3. Connect cord to **boat inlet** first.
4. Connect to **pedestal** last; turn pedestal breaker ON.
5. At AC panel: confirm Schneider **iIL** indicator; close RCD/MCBs if open.
6. Confirm CRISTEC **ON** LED; note Boost / Absorption / Floating stage.
7. DC: battery switches ON if you want banks to accept charge (normal).

### Disconnect
1. Turn off pedestal breaker / unplug **pedestal end first**.
2. Then remove from boat inlet; cap inlet.
3. Coil cord out of walkways.

### If RCD trips
1. Do not repeatedly reset.
2. Disconnect shore.
3. Dry/inspect inlet and charger area.
4. Try with charger/outlet breakers isolated to localize (ABB C16 circuits vs charger path).
5. See troubleshooting `shore_power_issues`.

---

## Emergency electrical shutdown

**Order when safe:**
1. Engine **STOP** / lanyard.
2. Shore pedestal OFF / unplug if connected.
3. Battery switches **OFF**.
4. Fight fire with appropriate extinguisher; abandon if needed.

---

## Mode cheat-sheet

| Goal | ENGINE bank | HOUSE bank | Shore | Engine |
|------|-------------|------------|-------|--------|
| Day cruise | ON | ON | OUT | Running |
| Dock maneuver | ON | ON | OUT | Idle / DOCK |
| Marina charge | ON (typical) | ON (typical) | IN | OFF |
| Trailer tow day | OFF | OFF | OUT | OFF |
| Service DC | OFF | OFF | OUT | OFF |

---

## DTS feature notes during power sequences

| Button / mode | When to use |
|---------------|-------------|
| **DOCK** | Close-quarters slow response |
| **THROTTLE ONLY** | Rev without gear (warm-up, clear flooding per OEM — use carefully) |
| **TRANSFER** | Intended for multi-engine control transfer — single-engine boat: ignore unless display instructs |
| Active Trim | May auto-manage engine trim once enabled/configured — confirm behavior on VesselView |

Never shift to forward/reverse with people near the prop. Never start in gear.
