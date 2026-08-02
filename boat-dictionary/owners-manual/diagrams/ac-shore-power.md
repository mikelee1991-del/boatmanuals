# DIAG-AC — Shore power (115 V / 60 Hz)

**CONFIRMED** from locker photos of AC enclosure + CRISTEC faceplate.

```mermaid
flowchart TB
  PED[Marina pedestal] -->|shore cord| IN[Boat shore inlet]
  IN --> RCD["Schneider iDPN N Vigi<br/>C32 / 30 mA RCD"]
  RCD --> IND[Schneider iIL indicator]
  RCD --> C16A[ABB S202C C16]
  RCD --> C16B[ABB S202C C16]
  RCD --> CHR["CRISTEC YPOWER<br/>YPO12-25DE<br/>12V / 25A"]
  C16A --> OUT[115V outlet / loads<br/>label PRISE 115V]
  CHR -->|12 VDC| BANKS[ENGINE + HOUSE banks]
```

## Nameplate data

| Item | Value |
|------|--------|
| Charger | CRISTEC YPOWER **YPO12-25DE** |
| S/N | **2022061017878** |
| Rev | K60 |
| Input | 90–265 VAC, ≤3.66 A, 50/60 Hz |
| Output | 12 VDC, 25 A |
| Panel legend | **115 Volts / 60 Hz** |
| Profile sticker | OPENED TYPE / FREE ELECTROLYTE |

## Connect order
Boat inlet → pedestal → breakers → verify CRISTEC ON.

## Disconnect order
Pedestal first → boat inlet → cap.

## Keywords
shore power, 115V, RCD, CRISTEC, YPO12-25DE, DIAG-AC
