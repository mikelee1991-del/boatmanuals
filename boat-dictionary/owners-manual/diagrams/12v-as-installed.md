# DIAG-12V — As-installed 12 V distribution

Reconstructed from the onboard **FLYER 8 SPACE DECK 12V** fuse diagram + locker photos.  
**Not** a complete OEM harness drawing. High-current thruster/windlass breakers not yet photographed.

```mermaid
flowchart LR
  subgraph Banks
    EB[(ENGINE BATTERY<br/>IMNASA box)]
    HB[(HOUSE BATTERY<br/>IMNASA box)]
  end

  SW[Battery switch panel<br/>UNVERIFIED topology]
  EB --> SW
  HB --> SW

  SW --> ENG[Mercury Verado 300<br/>PCM / Starter / SmartCraft]
  SW --> EPHS[EPHS MPU 8M6005909]
  SW --> MAIN[Main fuse box I–X]
  SW --> BS[Blue Sea aux box]
  SW --> HC[High-current feeds<br/>thruster / windlass<br/>UNVERIFIED locations]

  subgraph BlueSea["Blue Sea aux"]
    BS --> AN4["10A AN4 — Fusion"]
    BS --> JF["3A JF/JF2 — helm"]
    BS --> VHF["10A VHF — SPARE<br/>no fixed radio"]
    BS --> HDS["5A HDS — Garmin MFD"]
  end

  subgraph MainFeeds["Labeled peripheral feeds"]
    MAIN --> Wiper[1P1A wipers]
    MAIN --> Fresh[1P2B fresh water<br/>Jabsco PAR-MAX]
    MAIN --> Shower[2P1A shower sump]
    MAIN --> Macer[3P1A MACER]
    MAIN --> Bilge[4P1A bilge]
    MAIN --> Nav[1A1A lights]
    MAIN --> CabL[1L1A cabin light]
    MAIN --> Fridge[1C1A fridge 4mm²]
    MAIN --> Court[1S1A courtesy]
    MAIN --> Outlet[1F1A 12V outlet]
  end

  CHR[CRISTEC YPO12-25DE<br/>from 115VAC] -.-> EB
  CHR -.-> HB
```

## Blue Sea detail

```
NEW BLUE SEA BOX
┌────────┬────────┬────────┬────────┐
│ 10 A   │  3 A   │ 10 A   │  5 A   │
│ AN4    │ JF/JF2 │ VHF*   │ HDS    │
│ stereo │ helm   │ spare  │ Garmin │
│ 2.5mm² │ 1.5mm² │ 2.5mm² │ 2.5mm² │
└────────┴────────┴────────┴────────┘
* VHF fuse present — fixed radio NOT installed
```

## Main fuse box detail

```
MAIN FUSE BOX
 I  5A   │ II  3A   │ III 10A  │ IV 15A
 V 15A   │ VI  5A   │ VII 20A  │ VIII 15A
 IX 5A   │ X   3A   │ XI  —    │ XII —
```

Associated labels: `1L1A` cabin light · `1C1A` fridge 4.0 mm² · `1S1A` courtesy · `1F1A` 12 V outlet.

## Search keywords
12V, Blue Sea, AN4, HDS, VHF, MACER, 1C1A, fuse, DIAG-12V
