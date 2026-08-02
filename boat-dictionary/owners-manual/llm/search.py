#!/usr/bin/env python3
"""Simple keyword search over the consolidated owner's manual LLM indexes.

Usage:
  python3 search.py "no start"
  python3 search.py zipwake --playbooks
  python3 search.py HDS --json
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
MANUAL = ROOT.parent


def load_json(path: Path):
    return json.loads(path.read_text())


def load_yaml_playbooks(path: Path):
    # Minimal YAML subset reader avoided — playbooks file is simple enough to parse via regex blocks
    # Prefer PyYAML if present.
    try:
        import yaml  # type: ignore
        return yaml.safe_load(path.read_text())
    except Exception:
        text = path.read_text()
        ids = re.findall(r"^\s+-\s+id:\s+(\S+)", text, re.M)
        aliases = re.findall(r"aliases:\s*\[([^\]]*)\]", text)
        out = []
        for i, pid in enumerate(ids):
            al = []
            if i < len(aliases):
                al = [a.strip().strip("'\"") for a in aliases[i].split(",") if a.strip()]
            out.append({"id": pid, "aliases": al})
        return {"playbooks": out}


def score(query: str, hay: str) -> int:
    q = query.lower().strip()
    h = hay.lower()
    if not q:
        return 0
    s = 0
    if q in h:
        s += 10
    for tok in re.split(r"\W+", q):
        if tok and tok in h:
            s += 2
    return s


def main() -> int:
    ap = argparse.ArgumentParser(description="Search Flyer 8 consolidated manual indexes")
    ap.add_argument("query", help="symptom or keyword")
    ap.add_argument("--playbooks", action="store_true", help="search symptom playbooks")
    ap.add_argument("--json", action="store_true", help="JSON output")
    ap.add_argument("-n", type=int, default=8, help="max results")
    args = ap.parse_args()

    results = []

    idx = load_json(ROOT / "retrieval-index.json")
    for ch in idx.get("chunks", []):
        hay = " ".join(
            [
                ch.get("id", ""),
                ch.get("title", ""),
                ch.get("section", ""),
                " ".join(ch.get("keywords", [])),
                ch.get("text", ""),
            ]
        )
        sc = score(args.query, hay)
        if sc:
            results.append(
                {
                    "score": sc,
                    "type": "chunk",
                    "id": ch["id"],
                    "section": ch.get("section"),
                    "title": ch.get("title"),
                    "text": ch.get("text"),
                }
            )

    if args.playbooks or True:
        pb = load_yaml_playbooks(ROOT / "symptom-playbooks.yaml")
        for p in pb.get("playbooks", []):
            hay = " ".join([p.get("id", ""), " ".join(p.get("aliases", [])), p.get("om_section", "")])
            sc = score(args.query, hay)
            if sc:
                results.append(
                    {
                        "score": sc + 3,
                        "type": "playbook",
                        "id": p.get("id"),
                        "section": p.get("om_section"),
                        "title": p.get("id"),
                        "aliases": p.get("aliases", []),
                    }
                )

    # index.yaml aliases (light parse)
    index_text = (MANUAL / "index.yaml").read_text()
    for m in re.finditer(r'"([^"]+)":\s*\[([^\]]+)\]', index_text):
        alias = m.group(1)
        targets = m.group(2)
        sc = score(args.query, alias)
        if sc:
            results.append(
                {
                    "score": sc + 5,
                    "type": "alias",
                    "id": alias,
                    "section": targets.replace('"', "").strip(),
                    "title": f"alias:{alias}",
                }
            )

    results.sort(key=lambda r: (-r["score"], r.get("id") or ""))
    # de-dupe by type+id
    seen = set()
    uniq = []
    for r in results:
        key = (r["type"], r.get("id"))
        if key in seen:
            continue
        seen.add(key)
        uniq.append(r)
    uniq = uniq[: args.n]

    if args.json:
        json.dump(uniq, sys.stdout, indent=2)
        print()
    else:
        if not uniq:
            print("No matches.")
            return 1
        for r in uniq:
            print(f"[{r['score']:2d}] {r['type']:8s} {r.get('id')} → {r.get('section')}")
            if r.get("text"):
                print(f"     {r['text'][:160]}...")
            if r.get("aliases"):
                print(f"     aliases: {', '.join(r['aliases'][:6])}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
