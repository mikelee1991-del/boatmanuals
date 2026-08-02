/**
 * Offline answer engine — no API keys, no cloud LLM.
 * Topic-first retrieval from the boat binder bundle.
 */

const STOP = new Set(
  `
  a an the and or of to for in on at is are was were be been being
  do does did doing done how what where when why which who whom whose
  my me i i'm im you your we our they them their it its this that these those
  with from as if then than so too also just into onto over under about
  need needs needed replace replaced replacing know find locate use using used
  get got getting make made tell show help please can could would should
  a lot lots something anything everything nothing whether while also only
  `.trim().split(/\s+/)
);

/** Synonyms / expansions so casual words hit binder terms */
const EXPAND = {
  stereo: ["stereo", "fusion", "ra210", "ms-ra210", "audio", "bluetooth", "an4"],
  fusion: ["fusion", "stereo", "ra210", "ms-ra210", "audio", "bluetooth"],
  bluetooth: ["bluetooth", "fusion", "stereo", "pairing", "discoverable"],
  radio: ["stereo", "fusion", "source", "am", "fm"],
  music: ["stereo", "fusion", "audio", "bluetooth", "source"],
  volume: ["volume", "dial", "fusion", "stereo", "mute"],
  garmin: ["garmin", "echomap", "mfd", "hds", "chartplotter"],
  chartplotter: ["garmin", "echomap", "mfd", "hds"],
  mfd: ["garmin", "echomap", "mfd", "hds"],
  zapwake: ["zipwake"],
  tabs: ["zipwake", "interceptor", "trim"],
  thruster: ["thruster", "sleipner", "side-power", "bow"],
  windlass: ["windlass", "anchor", "rode"],
  charger: ["cristec", "ypower", "charger", "shore"],
  shore: ["shore", "cristec", "115v", "rcd"],
  fuse: ["fuse", "blue sea", "an4", "hds"],
  steering: ["ephs", "steering", "8m6005909"],
  ephs: ["ephs", "steering", "8m6005909"],
  separator: ["separator", "fuel filter", "water-separat", "water-in-fuel", "low-pressure"],
  filter: ["filter", "fuel filter", "separator", "water-separat"],
  fuel: ["fuel", "fuel filter", "separator", "water-in-fuel"],
};

function tokenize(q) {
  // Split slash compounds so "fuel/water" → fuel, water
  const normalized = q.toLowerCase().replace(/[/_,]+/g, " ");
  return (normalized.match(/[a-z0-9][a-z0-9+.-]*/g) || []).filter(
    (t) => !STOP.has(t) && t.length > 1
  );
}

function expandTokens(toks) {
  const out = new Set(toks);
  for (const t of toks) {
    for (const e of EXPAND[t] || []) out.add(e);
  }
  return [...out];
}

/** Distinctive topic tokens — prefer longer / expanded nouns */
function topicTokens(rawToks, expanded) {
  const primary = rawToks.filter((t) => t.length >= 4 || EXPAND[t]);
  if (primary.length) return primary;
  return expanded.filter((t) => t.length >= 3);
}

function haystack(chunk) {
  return `${chunk.title || ""} ${chunk.section || ""} ${(chunk.keywords || []).join(" ")} ${
    chunk.file || ""
  } ${chunk.text || ""}`.toLowerCase();
}

function matchedTopics(topics, hay) {
  return topics.filter((t) => hay.includes(t));
}

function scoreChunk(rawToks, expanded, topics, chunk) {
  const file = (chunk.file || "").toLowerCase();
  const title = (chunk.title || "").toLowerCase();
  const hay = haystack(chunk);
  const hits = matchedTopics(topics, hay);
  const hitRatio = topics.length ? hits.length / topics.length : 0;

  // Hard gate: must match at least one topic token, else near-zero
  if (!hits.length) {
    // allow tiny score only for exact raw token leftovers (length>=5) in title
    let tiny = 0;
    for (const t of rawToks) if (t.length >= 5 && title.includes(t)) tiny += 1;
    return tiny ? tiny : 0;
  }

  let s = 0;
  // Prefer matches on the user's original words (not only expansions)
  const rawHits = matchedTopics(rawToks.filter((t) => t.length >= 3 || EXPAND[t]), hay);
  for (const t of hits) {
    s += t.length >= 6 ? 12 : t.length >= 4 ? 9 : 5;
    if (title.includes(t)) s += 10;
    if (file.includes(t.replace(/\s+/g, "-")) || file.includes(t)) s += 8;
  }
  for (const t of rawHits) {
    s += 8;
    if (title.includes(t) || file.includes(t)) s += 12;
  }
  s += Math.round(hitRatio * 16);

  // Domain bonuses
  if (rawToks.includes("stereo") || rawToks.includes("fusion") || rawToks.includes("bluetooth")) {
    if (/fusion|stereo|ra210|bluetooth/.test(file + " " + title)) s += 20;
  }
  if (rawToks.includes("garmin") || rawToks.includes("chartplotter") || rawToks.includes("mfd")) {
    if (/garmin|echomap|mfd|hds/.test(file + " " + title + " " + hay.slice(0, 200))) s += 18;
    // Fusion note mentions Garmin only as a neighbor — do not win Garmin questions
    if (/fusion-stereo|fusion\/|ms-ra210/.test(file) && !rawToks.includes("stereo") && !rawToks.includes("fusion")) {
      s -= 40;
    }
  }
  if (rawToks.includes("separator") || (rawToks.includes("fuel") && rawToks.includes("filter"))) {
    if (/fuel-filter|water-separator|fuel filter/.test(file + " " + title)) s += 20;
  }
  if (rawToks.includes("fuse") && (rawToks.includes("garmin") || rawToks.includes("stereo") || rawToks.includes("fusion"))) {
    if (/fuse-map|electrical-and-wiring|blue sea|troubleshooting/.test(file + " " + title)) s += 16;
  }

  // Mild structural tie-breakers
  if (file.endsWith(".md")) s += 4;
  if (file.includes("notes/")) s += 6;
  if (file.includes("owners-manual/chapters/")) s += 3;
  if (file.endsWith(".yaml") || file.endsWith(".yml") || file.endsWith(".json")) s -= 10;
  if (title.includes("short answer") && rawHits.length >= Math.min(1, rawToks.length)) s += 14;

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

function bestPlaybook(query, playbooks) {
  const q = query.toLowerCase();
  let best = null;
  let bestScore = 0;
  for (const p of playbooks) {
    let s = 0;
    for (const a of p.aliases || []) {
      const al = a.toLowerCase();
      if (q.includes(al)) s += 12 + al.length;
    }
    // specific playbook id hints
    if (/stereo|fusion|bluetooth|music|audio/.test(q) && /STEREO|AUDIO|FUSION/i.test(p.id)) s += 20;
    if (s > bestScore) {
      bestScore = s;
      best = p;
    }
  }
  return bestScore >= 10 ? best : null;
}

function excerpt(text, topics, max = 520) {
  const low = text.toLowerCase();
  let at = 0;
  for (const t of topics) {
    const i = low.indexOf(t);
    if (i >= 0) {
      at = Math.max(0, i - 60);
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
  if (!q) return { answer: "Ask a question about this Flyer 8.", hits: [], confidence: "low" };

  const rawToks = tokenize(q);
  const expanded = expandTokens(rawToks);
  const topics = topicTokens(rawToks, expanded);

  const scored = (bundle.chunks || [])
    .map((c) => ({
      c,
      s: scoreChunk(rawToks, expanded, topics, c),
      topicsHit: matchedTopics(topics, haystack(c)),
    }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || b.topicsHit.length - a.topicsHit.length);

  // Keep only results that actually share topic tokens with the question
  const topical = scored.filter((x) => x.topicsHit.length > 0);
  const top = (topical.length ? topical : scored).slice(0, 8);

  const playbooks = parsePlaybooks(bundle.playbooksRaw);
  const pb = bestPlaybook(q, playbooks);

  const lines = [];
  lines.push(`**${bundle.vessel.name}** · HIN \`${bundle.vessel.hin}\``);
  lines.push(`Engine: ${bundle.vessel.engine}`);
  lines.push("");

  if (!top.length && !pb) {
    lines.push("I don’t have a confident match in the boat binder for that yet.");
    lines.push("");
    lines.push(
      "Try a part name (Fusion, Garmin, Zipwake, CRISTEC, windlass…), a fuse ID (AN4, HDS), or a symptom (no start, hard steering)."
    );
    return { answer: lines.join("\n"), hits: [], confidence: "low" };
  }

  let lead = top[0]?.c;
  const leadScore = top[0]?.s || 0;
  const leadHits = top[0]?.topicsHit || [];

  // Prefer Short answer in same file only for general "how do I use X" style questions,
  // not when the user already asked a specific subtopic (bluetooth, pairing, fuse…).
  const specificAsk = /\b(bluetooth|pairing|fuse|volume|source|mute|alarm|pair)\b/i.test(q);
  if (!specificAsk) {
    const shortHit = top.find(
      (x) =>
        x.c.file === lead?.file &&
        /short answer/i.test(x.c.title || "") &&
        x.topicsHit.length &&
        x.s >= leadScore * 0.85
    );
    if (shortHit) lead = shortHit.c;
  }

  // Reject misleading lead if topic coverage is weak
  const confidentLead = lead && leadScore >= 16 && leadHits.length > 0;

  if (confidentLead) {
    lines.push(`### Answer (from \`${lead.file}\`)`);
    lines.push("");
    if (
      lead.text.length <= 1200 ||
      /short answer|where is it|status:|daily controls|bluetooth pairing/i.test(
        `${lead.title} ${lead.text.slice(0, 160)}`
      )
    ) {
      lines.push(lead.text.replace(/^#{1,3}\s+.*$/m, "").trim());
    } else {
      lines.push(excerpt(lead.text, topics, 750));
    }
    lines.push("");
  } else if (top[0]) {
    lines.push("### Best binder matches");
    lines.push("");
    lines.push(
      "I couldn’t form a single strong answer, but these binder sections look closest:"
    );
    lines.push("");
  }

  if (pb && pb.steps?.length) {
    lines.push(`### Checklist · ${pb.id}${pb.om_section ? ` (\`${pb.om_section}\`)` : ""}`);
    pb.steps.slice(0, 10).forEach((step, i) => lines.push(`${i + 1}. ${step}`));
    lines.push("");
  }

  const related = top
    .filter((x) => x.c !== lead)
    .filter((x) => x.topicsHit.length > 0)
    .filter((x) => x.s >= Math.max(12, leadScore * 0.4))
    .slice(0, 4);

  if (!confidentLead) {
    for (const { c } of top.slice(0, 4)) {
      lines.push(`- **${c.title}** (\`${c.file}\`)`);
      lines.push(`  ${excerpt(c.text, topics, 240)}`);
    }
    lines.push("");
  } else if (related.length) {
    lines.push("### Related sources");
    for (const { c } of related) {
      lines.push(`- **${c.title}** (\`${c.file}\`${c.section ? `, ${c.section}` : ""})`);
      lines.push(`  ${excerpt(c.text, topics, 220)}`);
    }
    lines.push("");
  }

  lines.push("_Answer pulled from the boat binder in this repo (offline — no API key)._");

  const confidence =
    confidentLead && leadScore >= 28 ? "high" : confidentLead ? "medium" : "low";

  return {
    answer: lines.join("\n"),
    hits: top.map(({ c, s, topicsHit }) => ({
      id: c.id,
      file: c.file,
      title: c.title,
      section: c.section,
      score: s,
      topicsHit,
    })),
    playbook: pb?.id || null,
    confidence,
    topics,
  };
}
