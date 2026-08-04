#!/usr/bin/env python3
"""
Extract useful figures from OEM PDFs into boat-assistant/public/media/figures/
and write figures-index.json for the Q&A UI.
"""
from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

import fitz
from PIL import Image
import io

ROOT = Path(__file__).resolve().parents[2]
MANUALS = ROOT / "boat-dictionary" / "manuals"
OUT_DIR = ROOT / "boat-assistant" / "public" / "media" / "figures"
INDEX_OUT = ROOT / "boat-assistant" / "public" / "figures-index.json"

# High-value manuals for problem-solving (skip LENCO / Mastervolt / German Active Trim)
TARGETS = [
    "engine/Mercury-Verado-V8-SeaPro-V8-Operation-Maintenance-8m0145543.pdf",
    "engine/Mercury-Electric-Steering-V8-V10-AMS-8m0221736.pdf",
    "engine/Mercury-SmartCraft-Operation-Overview-8m0071455r.pdf",
    "electronics/Fusion-MS-RA70-RA70N-Owners-Manual-EN.pdf",
    "electronics/Fusion-MS-RA210-Owners-Manual-EN.pdf",
    "electronics/Garmin-ECHOMAP-UHD-Owners-Manual-EN.pdf",
    "electronics/Garmin-ECHOMAP-UHD2-62-72-92sv-Owners-Manual-EN.pdf",
    "electronics/Mercury-VesselView-502-702-8m0109374r.pdf",
    "peripherals/CRISTEC-YPOWER-User-Manual-EN.pdf",
    "peripherals/Flojet-Washdown-Pump-Manual-EN.pdf",
    "peripherals/Jabsco-PAR-MAX-2.9-Manual-EN.pdf",
    "peripherals/Jabsco-37010-Electric-Toilet-Manual-EN.pdf",
    "peripherals/Side-Power-SE-SE-IP-DC-User-Manual-EN.pdf",
    "peripherals/Lewmar-Pro-Series-Pro-Fish-Windlass-Manual.pdf",
    "systems/Zipwake-Series-S-Operators-Manual-EN-R5A.pdf",
    "systems/Zipwake-Series-S-Installation-Guide-EN.pdf",
]

TOPIC_KEYWORDS = {
    "fuel": ["fuel", "filter", "separator", "water", "guardian", "cowl"],
    "steering": ["steering", "ephs", "helm", "ram", "pump", "fluid"],
    "stereo": ["fusion", "stereo", "bluetooth", "audio", "ra210", "source"],
    "garmin": ["garmin", "echomap", "chart", "sonar", "transducer", "mfd"],
    "shore": ["shore", "charger", "cristec", "ac", "rcd", "ypower", "battery"],
    "windlass": ["windlass", "anchor", "gypsy", "rode", "lewmar"],
    "thruster": ["thruster", "bow", "sleipner", "side-power", "joystick"],
    "zipwake": ["zipwake", "interceptor", "trim", "pitch", "roll"],
    "pump": ["pump", "flojet", "jabsco", "washdown", "fresh", "par-max"],
    "toilet": ["toilet", "macerator", "head", "holding"],
    "start": ["start", "ignition", "lanyard", "dts", "throttle"],
    "electrical": ["fuse", "battery", "wiring", "breaker", "panel"],
    "engine": ["engine", "verado", "cowling", "flush", "cooling", "overheat", "impeller"],
    "vesselview": ["vesselview", "smartcraft", "gauge", "display"],
}

MIN_W, MIN_H = 120, 120
MIN_BYTES = 8_000
MAX_EDGE = 1100
JPEG_QUALITY = 72
MAX_PER_MANUAL = 28
MAX_TOTAL = 220


def slug(s: str) -> str:
    s = re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()
    return s[:60] or "fig"


def page_topics(text: str) -> list[str]:
    low = text.lower()
    hits = []
    for topic, kws in TOPIC_KEYWORDS.items():
        if sum(1 for k in kws if k in low) >= 1:
            hits.append(topic)
    return hits


def caption_from_page(text: str, img_i: int) -> str:
    text = re.sub(r"\s+", " ", text or "").strip()
    # Prefer figure/table captions
    m = re.search(r"(Figure\s+\d+[^\.]{0,120}|Fig\.\s*\d+[^\.]{0,120})", text, re.I)
    if m:
        return m.group(1).strip()[:180]
    # Otherwise first substantive sentence
    for part in re.split(r"(?<=[\.\!\?])\s+", text):
        if len(part) > 40 and not part.lower().startswith("copyright"):
            return part[:180]
    return f"Manual figure (image {img_i + 1})"


def save_image(pix_bytes: bytes, dest: Path) -> bool:
    try:
        im = Image.open(io.BytesIO(pix_bytes)).convert("RGB")
    except Exception:
        return False
    w, h = im.size
    if w < MIN_W or h < MIN_H:
        return False
    # Skip near-solid / tiny-detail icons by entropy proxy: unique colors
    colors = im.copy()
    colors.thumbnail((64, 64))
    if len(set(colors.getdata())) < 12:
        return False
    if max(w, h) > MAX_EDGE:
        im.thumbnail((MAX_EDGE, MAX_EDGE), Image.Resampling.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, format="JPEG", quality=JPEG_QUALITY, optimize=True)
    return dest.stat().st_size >= MIN_BYTES // 2


def extract_one(rel: str, seen_hashes: set[str], items: list, budget: list[int]):
    path = MANUALS / rel
    if not path.exists():
        print("MISSING", rel)
        return
    doc = fitz.open(path)
    manual_name = path.name
    category = rel.split("/")[0]
    kept = 0
    print(f"Scanning {rel} ({len(doc)} pages)…")

    for page_i, page in enumerate(doc):
        if kept >= MAX_PER_MANUAL or budget[0] >= MAX_TOTAL:
            break
        text = page.get_text("text") or ""
        topics = page_topics(text)
        images = page.get_images(full=True)
        for img_i, img in enumerate(images):
            if kept >= MAX_PER_MANUAL or budget[0] >= MAX_TOTAL:
                break
            xref = img[0]
            try:
                pix = fitz.Pixmap(doc, xref)
                if pix.n > 4:  # CMYK etc
                    pix = fitz.Pixmap(fitz.csRGB, pix)
                if pix.width < MIN_W or pix.height < MIN_H:
                    continue
                raw = pix.tobytes("png")
            except Exception:
                continue

            digest = hashlib.sha1(raw).hexdigest()[:16]
            if digest in seen_hashes:
                continue
            seen_hashes.add(digest)

            fname = f"{slug(path.stem)}-p{page_i+1}-{img_i+1}-{digest[:8]}.jpg"
            dest = OUT_DIR / fname
            if not save_image(raw, dest):
                if dest.exists():
                    dest.unlink(missing_ok=True)
                continue

            rel_url = f"./media/figures/{fname}"
            cap = caption_from_page(text, img_i)
            items.append(
                {
                    "id": f"fig-{digest[:10]}",
                    "src": rel_url,
                    "file": f"media/figures/{fname}",
                    "manual": f"manuals/{rel}",
                    "manualName": manual_name,
                    "category": category,
                    "page": page_i + 1,
                    "caption": cap,
                    "topics": topics,
                    "tags": list(
                        {
                            *topics,
                            *(
                                t
                                for t in re.findall(r"[a-z]{4,}", (cap + " " + text[:400]).lower())
                                if t
                                in {
                                    "filter",
                                    "fuse",
                                    "battery",
                                    "charger",
                                    "helm",
                                    "anchor",
                                    "windlass",
                                    "bluetooth",
                                    "sonar",
                                    "flush",
                                    "cooling",
                                    "steering",
                                    "reservoir",
                                    "pump",
                                    "breaker",
                                    "panel",
                                    "joystick",
                                    "interceptor",
                                    "transducer",
                                }
                            ),
                        }
                    ),
                    "bytes": dest.stat().st_size,
                }
            )
            kept += 1
            budget[0] += 1

    print(f"  kept {kept} figures from {manual_name}")


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    # Clear old generated figures
    for old in OUT_DIR.glob("*.jpg"):
        old.unlink()

    seen: set[str] = set()
    items: list = []
    budget = [0]
    for rel in TARGETS:
        extract_one(rel, seen, items, budget)

    index = {
        "builtAt": __import__("datetime").datetime.utcnow().isoformat() + "Z",
        "count": len(items),
        "bytes": sum(i["bytes"] for i in items),
        "items": items,
    }
    INDEX_OUT.write_text(json.dumps(index, indent=2), encoding="utf-8")
    mb = index["bytes"] / (1024 * 1024)
    print(f"Wrote {INDEX_OUT} — {len(items)} figures, {mb:.1f} MB")


if __name__ == "__main__":
    main()
