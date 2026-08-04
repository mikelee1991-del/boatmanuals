# OM-THR — Bow thruster (Sleipner / Side-Power)

## Confirmed
- **Sleipner** helm control panel (**CONFIRMED**)
- Thruster **joystick** with ON/OFF (**CONFIRMED**)
- Factory bow-thruster option class

## Unverified
- Exact motor model (SE40 / SE60 / etc.) — need tunnel/motor plate photo
- Main fuse/breaker **ampacity** (thruster label present near windlass **80 A** panel — clear breaker face still needed)
- Joystick vs panel software version

## Manual
`manuals/peripherals/Side-Power-SE-SE-IP-DC-User-Manual-EN.pdf`

## Operation
1. House/engine batteries healthy (≥12.2 V recommended before heavy thruster use).
2. Arm thruster per Sleipner panel (typically ON then joystick).
3. Use **short bursts**; continuous run triggers thermal/runtime cutouts.
4. In debris-prone water, listen for grinding; inspect tunnel grate when hauled.
5. Disarm when underway at speed.

## Electrical reality
Thruster current is far above Blue Sea aux fuses. Troubleshooting “dead thruster” starts at the **dedicated thruster breaker** (label is on the same high-current panel as the windlass **80 A** Blue Sea 187-Series), main battery connections, and voltage under load — not the 3 A JF fuse.

Faults → `OM-TS-THRUSTER`.
