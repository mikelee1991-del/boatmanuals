# OM-TS — Troubleshooting master

**How to use:** find the symptom heading → follow steps in order → open linked OEM PDF only when needed.  
**LLM:** prefer matching `llm/symptom-playbooks.yaml` IDs; cite section IDs below.

Safety: kill power before probing fuses; keep clear of prop; treat fuel vapors seriously.

---

## No start / hard start

**ID:** `OM-TS-NOSTART` · Hardware: engine, DTS, batteries

1. **Lanyard** attached? Clip and retry.
2. DTS in **NEUTRAL**? Out-of-neutral blocks start.
3. Battery switches **ON** (ENGINE at minimum).
4. Measure ENGINE battery voltage:
   - <11.5 V while cranking attempt → charge/boost/replace; check terminals.
   - OK voltage but slow crank → connections / starter cable / corroded grounds.
5. Ignition ON: does VesselView power? Any **security / fault** text?
6. Listen: click only vs cranks vs no sound.
7. **THROTTLE ONLY** / flooded procedures only per Mercury O&M — do not invent.
8. If cranks but no fire: fuel level, primer/EFI faults, CDS dealer diagnostics (PCM 112).
9. After any work: confirm tell-tale on successful start.

Manuals: Verado O&M `8M0145543`; SmartCraft overview.

---

## Heavy or no power steering

**ID:** `OM-TS-STEER` · Hardware: EPHS `8M6005909`

1. Confirm engine running (assist may differ key-on vs running — note behavior).
2. Check EPHS reservoir **MIN–MAX**; top up with **Mercury-specified** fluid only.
3. Look for leaks at pump, hoses, steering ram.
4. JF/helm 3 A fuse intact? (may feed related electronics — not the pump main).
5. SmartCraft steering alarm on VesselView? Record exact text.
6. If fluid OK and alarm persists → Mercury dealer EPHS diagnosis.

Photo previously near MIN — check first.

---

## Overheat / cooling

**ID:** `OM-TS-OVERHEAT`

1. Idle immediately; verify **tell-tale**.
2. No tell-tale → intake blockage, impeller, flush port left open, exhaust issue.
3. Debris in intake screens / bag in prop hub area.
4. Temperature icon + horn → do not re-engage WOT.
5. After cooling: inspect; impeller service per hours/time in O&M.
6. Persistent → dealer pressure/temperature diagnostics.

---

## No shift / stuck neutral / DTS oddness

1. Lever calibration / neutral detent — don’t force.
2. Note beep codes / VesselView messages.
3. Battery voltage stable?
4. Check for **THROTTLE ONLY** accidentally engaged (neutral lights blink — see DTS QRG).
5. Cycle ignition; if still failed → SmartCraft/DTS dealer tools.
6. Never disconnect shift actuators randomly underway.
7. Short how-to: `manuals/engine/Mercury-DTS-Single-Handle-ERC-Quick-Reference-8m0208789.pdf` (onboard SmartCraft DTS QRG).

---

## Zipwake / handling

**ID:** `OM-TS-TRIM`

1. Confirm Zipwake panel power (house DC).
2. Errors on display — record code; see Zipwake operator manual.
3. GPS missing/slow → AUTO modes degraded; check Garmin GPS fix / NMEA.
4. One interceptor not moving → obstruction, wiring, actuator (haul inspection).
5. Boat still porpoises: engine trim + Zipwake interaction; load distribution; sea state.
6. Remember **LENCO is not installed**.

---

## Thruster dead or weak

**ID:** `OM-TS-THRUSTER`

1. Panel ON? Joystick enabled?
2. Voltage at rest and during command — sag to <10.5 V ≈ weak bank/cables.
3. Locate **dedicated thruster breaker** near the windlass **Blue Sea 187-Series 80 A** panel (not Blue Sea 3–10 A) — reset once.
4. Solenoid chatter → low voltage or failing contacts.
5. Runtime cutout — wait cool-down.
6. No prop spin but voltage OK → motor/tunnel inspection hauled.

---

## Windlass won’t haul

**ID:** `OM-TS-WINDLASS`

1. Battery T-handles ON; **Blue Sea 187-Series 80 A** windlass breaker ON (anchor label).
2. Control switches tested (helm + bow if both).
3. Voltage under load; listen for contactor click.
4. Contactor click but no motor → motor/brushes/connections.
5. Motor runs but gypsy slips → clutch adjustment / worn gypsy / wrong chain.
6. Anchor stuck → motor to rode, don’t stall windlass.
7. Identify brand plate / use Quick HRC remote manual for handheld; winch plate for mechanical procedure.

---

## Water pumps (no pressure / cycling)

**ID:** `OM-TS-PUMP`

### Fresh (Jabsco 31395-7008)
1. Water in tank?
2. Circuit **1P2B** / 10 A device fuse.
3. Strainer clogged?
4. Air leak on suction → priming issues.
5. Runs on forever → leak downstream or switch fault.
6. Thermal cutout — cool and find cause (dry run / blockage).

### Washdown (Flojet R4325143F)
1. Seacock/intake open if raw-water (**UNVERIFIED** seacock label — confirm).
2. 15 A fuse; strainer.
3. Same cycling logic as above.

---

## Fridge warm

**ID:** `OM-TS-FRIDGE`

1. Confirm fridge switch ON (rockers on the panel beside the toilet).
2. Check **1C1A** heavy feed / main fuse.
3. Voltage >12 V while running.
4. Compressor click/no-start → low V or fault.
5. Ventilation around compressor (cabinet left of toilet).
6. Photograph brand plate before model-specific service (Isotherm manuals are candidates only).

---

## Garmin blank or no sonar

**ID:** `OM-TS-MFD`

1. Blue Sea **HDS 5 A** fuse.
2. Battery switches / dimmer / power button hold.
3. GPS OK but sonar dead → transducer connector/power/temp.
4. Depth lost only at speed → transducer aeration/placement/damage.
5. Software: Garmin support + About screen model.

---

## Stereo dead

**ID:** `OM-TS-AUDIO`

1. Blue Sea **AN4 10 A**.
2. Fusion power button / voltage at unit.
3. Speaker cutouts only → speaker wiring / protection mode.
4. Bluetooth pairing per **MS-RA70N** manual.

---

## Shore power / no charge

1. Pedestal live? Another boat’s cord tested?
2. Connect order correct? RCD tripped?
3. Schneider indicator lit?
4. CRISTEC ON LED? Hot case / error blink — see YPOWER manual.
5. Profile vs battery chemistry mismatch.
6. DC fuses/links between charger and banks (**UNVERIFIED** locations — trace/photo).

---

## Blank engine data

1. VesselView blank but engine runs → display power/network.
2. VesselView OK, Garmin overlay missing → NMEA/gateway settings.
3. Both blank + no start → power/SmartCraft backbone.

---

## Quick fuse cheat-sheet

| Symptom | First fuse to check |
|---------|---------------------|
| Stereo dead | AN4 10 A |
| Garmin dead | HDS 5 A |
| Fresh pump dead | 1P2B / 10 A device |
| Washdown dead | Flojet 15 A |
| Macerator dead | 3P1A |
| Bilge electric dead | 4P1A |
| Fridge dead | 1C1A path |
| Fixed VHF | N/A — not installed |

---

## When to stop and call a dealer

- Persistent PCM faults / no-start after basic checks  
- Steering fluid loss / metal in fluid  
- Fuel leaks / EVAP damage  
- RCD trips with burning smell  
- Thruster/windlass cable heat  
- Hull/air-step damage after grounding  
