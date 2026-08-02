/**
 * Offline answer engine — no API keys, no cloud LLM.
 * Retrieves from the bundled boat dataset and composes a readable answer.
 */

const STOP = new Set(
  "a an the and or of to for in on at is are was were be been being do does did how what where when why which who my me i it its this that with from as if then than need needs needed replace replaced replacing know find locate".split(
    " "
  )
);

function tokens(q) {
  return (q.toLowerCase().match(/[a-z0-9][a-z0-9+./-]*/g) || []).filter((t) => !STOP.has(t) && t.length > 1);
}

function scoreChunk(toks, chunk) {
  const file = (chunk.file || "").toLowerCase();
  const title = (chunk.title || "").toLowerCase();
  const hay = `${title} ${chunk.section || ""} ${(chunk.keywords || []).join(" ")} ${file} ${chunk.text || ""}`.toLowerCase();
  let s = (chunk.priority || 0) * 4;

  // Prefer human notes / chapters over raw YAML dumps for lead answers
  if (file.endsWith(".md")) s += 3;
  if (file.includes("notes/")) s += 3;
  if (file.includes("owners-manual/chapters/")) s += 2;
  if (file.endsWith(".yaml") || file.endsWith(".yml")) s -= 2;
  if (/^-+$/.test((chunk.title || "").trim()) || title.includes("----")) s -= 8;
  if (title.includes("short answer")) s += 10;

  for (const t of toks) {
    if (hay.includes(t)) s += t.length > 4 ? 3 : 2;
    if (file.includes(t)) s += 4;
    if (title.includes(t)) s += 3;
  }

  if (hay.includes("fuel filter") && toks.includes("fuel")) s += 8;
  if (
    (hay.includes("water-separat") || hay.includes("water separator") || hay.includes("water‑separat")) &&
    (toks.includes("separator") || toks.includes("water") || toks.includes("fuel"))
  ) {
    s += 12;
  }
  if (hay.includes("fuse") && toks.includes("fuse")) s += 4;
  if ((hay.includes("power-up") || hay.includes("power up")) && (toks.includes("power") || toks.includes("dock"))) {
    s += 4;
  }
  return s;
}

function parsePlaybooks(raw) {
  if (!raw) return [];
  const blocks = raw.split(/\n\s*-\s+id:\s+/).slice(1);
  return blocks.map((b) => {
    const id = (b.match(/^(\S+)/) || [])[1];
    const aliases = ((b.match(/aliases:\s*\[([^\]]*)\]/) || [])[1] || "")
      .split(",")
      .map((a) => a.trim().replace(/^['"]|['"]$/g, ""))
      .filter(Boolean);
    const steps = [...b.matchAll(/-\s+"([^"]+)"/g)].map((m) => m[1]);
    const om = (b.match(/om_section:\s*(\S+)/) || [])[1];
    return { id, aliases, steps, om_section: om };
  });
}

function bestPlaybook(toks, query, playbooks) {
  const q = query.toLowerCase();
  let best = null;
  let bestScore = 0;
  for (const p of playbooks) {
    let s = 0;
    for (const a of p.aliases || []) {
      if (q.includes(a.toLowerCase())) s += 10 + a.length;
      for (const t of toks) if (a.toLowerCase().includes(t)) s += 2;
    }
    if (s > bestScore) {
      bestScore = s;
      best = p;
    }
  }
  return bestScore >= 8 ? best : null;
}

function excerpt(text, toks, max = 520) {
  const low = text.toLowerCase();
  let at = 0;
  for (const t of toks) {
    const i = low.indexOf(t);
    if (i >= 0) {
      at = Math.max(0, i - 80);
      break;
    }
  }
  let slice = text.slice(at, at + max).trim();
  if (at > 0) slice = "…" + slice;
  if (at + max < text.length) slice += "…";
  return slice;
}

/**
 * @param {object} bundle knowledge-bundle.json
 * @param {string} question
 */
export function answerQuestion(bundle, question) {
  const q = (question || "").trim();
  if (!q) return { answer: "Ask a question about this Flyer 8.", hits: [] };

  const toks = tokens(q);
  const scored = (bundle.chunks || [])
    .map((c) => ({ c, s: scoreChunk(toks, c) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s);

  const top = scored.slice(0, 6);
  const playbooks = parsePlaybooks(bundle.playbooksRaw);
  const pb = bestPlaybook(toks, q, playbooks);

  const lines = [];
  lines.push(`**${bundle.vessel.name}** · HIN \`${bundle.vessel.hin}\``);
  lines.push(`Engine: ${bundle.vessel.engine}`);
  lines.push("");

  if (!top.length && !pb) {
    lines.push("I don’t have a confident match in the onboard dataset for that yet.");
    lines.push("");
    lines.push("Try different words (part name, symptom, fuse ID), or add a label photo to the boat dictionary so this answer can be filled in.");
    return { answer: lines.join("\n"), hits: [], confidence: "low" };
  }

  // Prefer a "Short answer" sibling from the same note file when available
  let lead = top[0]?.c;
  const shortHit = scored.find(
    (x) =>
      x.c.file === lead?.file &&
      /short answer/i.test(x.c.title || "") &&
      x.s >= 8
  );
  if (shortHit) lead = shortHit.c;

  if (lead && (top[0]?.s || 0) >= 8) {
    lines.push(`### Answer (from \`${lead.file}\`)`);
    lines.push("");
    if (lead.text.length <= 1100 || /short answer|where is it|status:/i.test(lead.title + lead.text.slice(0, 120))) {
      lines.push(lead.text.replace(/^#{1,3}\s+.*$/m, "").trim());
    } else {
      lines.push(excerpt(lead.text, toks, 700));
    }
    lines.push("");
  }

  if (pb && pb.steps?.length) {
    lines.push(`### Checklist · ${pb.id}${pb.om_section ? ` (\`${pb.om_section}\`)` : ""}`);
    pb.steps.slice(0, 10).forEach((step, i) => lines.push(`${i + 1}. ${step}`));
    lines.push("");
  }

  const related = top
    .filter((x) => x.c !== lead)
    .filter((x) => !top[0] || x.s >= Math.max(8, (top[0].s || 0) * 0.35))
    .slice(0, 4);
  if (related.length) {
    lines.push("### Related sources");
    for (const { c, s } of related) {
      lines.push(`- **${c.title}** (\`${c.file}\`${c.section ? `, ${c.section}` : ""})`);
      lines.push(`  ${excerpt(c.text, toks, 220)}`);
    }
    lines.push("");
  }

  lines.push("_Offline answer from your boat dataset — no cloud API key used._");
  if (/separator|fuel filter|water.?separat/i.test(q)) {
    lines.push(
      "_Tip: Confirm whether a second boat-mounted separator is on the fuel line between tank and engine; only the engine-mounted Verado filter location is confirmed from the Mercury O&M._"
    );
  }

  return {
    answer: lines.join("\n"),
    hits: top.map(({ c, s }) => ({
      id: c.id,
      file: c.file,
      title: c.title,
      section: c.section,
      score: s,
    })),
    playbook: pb?.id || null,
    confidence: top[0]?.s >= 12 || pb ? "high" : top[0]?.s >= 7 ? "medium" : "low",
  };
}
