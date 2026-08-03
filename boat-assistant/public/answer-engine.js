/**
 * Retrieval + free compose for Flyer 8 Boat Guide.
 * LLM synthesis (optional free OpenRouter) lives in ask.js.
 */

const STOP = new Set(
  `a an the and or of to for in on at is are was were be been being do does did how what where when why which who my me i you your we our they them their it its this that with from as if then than so too also just into about need get make tell show help please can could would should use using used`.split(
    /\s+/
  )
);

const WEAK = new Set(["hard", "soft", "blank", "weak", "dead", "heavy", "stiff"]);

const EXPAND = {
  stereo: ["stereo", "fusion", "ra210", "audio", "bluetooth", "an4", "sound"],
  fusion: ["fusion", "stereo", "ra210", "bluetooth", "an4"],
  bluetooth: ["bluetooth", "fusion", "pairing"],
  sound: ["stereo", "fusion", "audio", "sound"],
  garmin: ["garmin", "echomap", "mfd", "hds", "chartplotter", "sonar"],
  thruster: ["thruster", "sleipner", "side-power"],
  windlass: ["windlass", "anchor", "rode"],
  anchor: ["anchor", "rode", "scope", "windlass", "delta"],
  rode: ["rode", "anchor", "scope", "chain"],
  scope: ["scope", "rode", "anchor", "depth"],
  deep: ["deep", "depth", "anchor", "rode", "scope", "draft"],
  depth: ["depth", "deep", "draft", "anchor", "rode"],
  charger: ["cristec", "ypower", "charger", "shore"],
  shore: ["shore", "cristec", "rcd", "115v"],
  steering: ["ephs", "steering", "8m6005909"],
  ephs: ["ephs", "steering"],
  fuel: ["fuel", "filter", "separator", "water-in-fuel"],
  filter: ["filter", "fuel", "separator"],
  separator: ["separator", "fuel", "filter"],
  start: ["start", "crank", "lanyard", "dts"],
  pump: ["pump", "flojet", "jabsco", "washdown"],
  zipwake: ["zipwake", "interceptor", "trim"],
  fuse: ["fuse", "blue sea", "an4", "hds"],
  battery: ["battery", "engine", "house", "locker"],
  locker: ["battery", "locker", "cristec", "pump"],
};

function tokenize(q) {
  return (
    q
      .toLowerCase()
      .replace(/[/_,]+/g, " ")
      .match(/[a-z0-9][a-z0-9+.-]*/g)
      ?.filter((t) => !STOP.has(t) && t.length > 1) || []
  );
}

function expand(toks) {
  const out = new Set(toks);
  for (const t of toks) for (const e of EXPAND[t] || []) out.add(e);
  return [...out];
}

function topics(raw, expanded) {
  const strong = raw.filter((t) => (t.length >= 4 || EXPAND[t]) && !WEAK.has(t));
  return strong.length ? strong : expanded.filter((t) => t.length >= 3 && !WEAK.has(t));
}

function hay(c) {
  return `${c.title || ""} ${c.file || ""} ${(c.keywords || []).join(" ")} ${c.text || ""}`.toLowerCase();
}

function hits(topicsList, h) {
  return topicsList.filter((t) => h.includes(t));
}

export function classifyIntent(q) {
  const s = q.toLowerCase();
  if (/\b(photo|picture|look like|show me|what does .+ look)\b/.test(s)) return "visual";
  if (
    /\b(fix|repair|troubleshoot|dead|not working|not charging|won't|wont|no sound|no power|blank|alarm|error|fault|trip|leak|overheat|fail|broken|hard steering|no start|water in fuel|water-in-fuel)\b/.test(
      s
    )
  )
    return "troubleshoot";
  if (/\b(how do i|how to|pair|operate|replace|service|change|drain|flush|prime)\b/.test(s)) return "howto";
  if (/\b(where is|where does|location|find the)\b/.test(s)) return "where";
  if (/\b(what is|which|do i have|model|fuse for)\b/.test(s)) return "what";
  if (/\b(how deep|how much|how far)\b/.test(s)) return "planning";
  return "general";
}

function failSignal(q) {
  return /\b(no sound|no power|dead|won't|wont|not working|not charging|blank|alarm|error|fault|fail|broken|hard steering|no start|trip|leak|overheat|water in fuel|water-in-fuel)\b/i.test(
    q
  );
}

function familyOf(q, raw) {
  const s = q.toLowerCase();
  const has = (...xs) => xs.some((x) => raw.includes(x) || s.includes(x));
  if (has("stereo", "fusion", "bluetooth", "sound", "audio")) return "audio";
  if (has("steering", "ephs") || /\bsteer/.test(s)) return "steer";
  if (has("separator") || /\bwater[- ]?in[- ]?fuel\b/.test(s) || (has("fuel") && has("filter"))) return "fuel";
  if ((has("start", "crank") || /\bno start\b/.test(s)) && !has("steering")) return "start";
  if (has("garmin", "mfd", "chartplotter", "sonar", "echomap")) return "garmin";
  if (has("shore", "charger", "cristec")) return "shore";
  if (has("thruster", "sleipner")) return "thruster";
  if (has("windlass") || (has("anchor", "rode", "scope") && !has("garmin"))) return "anchor";
  if (has("zipwake", "interceptor")) return "zipwake";
  if (has("battery", "locker")) return "electrical";
  if (has("pump", "flojet", "jabsco", "washdown")) return "pump";
  return null;
}

function scoreChunk(q, raw, topicList, intent, family, c) {
  const h = hay(c);
  const th = hits(topicList, h);
  if (!th.length) return 0;
  let s = 0;
  const title = (c.title || "").toLowerCase();
  const file = (c.file || "").toLowerCase();

  for (const t of th) {
    s += t.length >= 6 ? 10 : 6;
    if (title.includes(t)) s += 12;
    if (file.includes(t)) s += 8;
  }

  if (c.kind === "manual") s += 8;
  if (c.kind === "evidence") s += intent === "visual" || /\bphoto|look like|locker|helm\b/i.test(q) ? 28 : 6;
  if (c.kind === "note") s += 6;
  if (/symptom-playbooks|retrieval-index|boat-dictionary\.yaml/.test(file)) s -= 20;
  if (/^keywords$/i.test(c.title || "")) s -= 40;

  if (intent === "troubleshoot" || failSignal(q)) {
    if (/troubleshoot|if it won't|no sound|warning|alarm|fault|replace|check this/.test(title + h.slice(0, 200)))
      s += 18;
  }
  if (intent === "planning" && /how deep|scope|rode/.test(title + file)) s += 40;
  if (intent === "visual" && /evidence\//.test(file)) s += 35;
  if (intent === "visual" && /extracts\//.test(file)) s -= 15;

  if (family === "audio" && /fusion|stereo|ra210|audio/.test(file + title)) s += 22;
  if (family === "fuel" && /fuel|separator|water-in-fuel/.test(file + title)) s += 22;
  if (family === "steer" && /steer|ephs/.test(file + title)) s += 22;
  if (family === "anchor" && /ground-tackle|anchor|rode|windlass|lewmar/.test(file + title)) s += 22;
  if (family === "garmin" && /garmin|echomap|mfd/.test(file + title)) s += 20;
  if (family === "shore" && /cristec|shore|ypower/.test(file + title)) s += 20;

  // Cross-topic blockers
  if (family === "steer" && /fuel-filter|water-separator|when to service/.test(file + title)) s -= 50;
  if (family === "anchor" && !failSignal(q) && /pb-windlass|om-ts-windlass/.test(file + title)) s -= 30;
  if (family === "audio" && /fuel-filter/.test(file)) s -= 40;

  return s;
}

function parsePlaybooks(raw) {
  if (!raw) return [];
  return raw
    .split(/\n\s*-\s+id:\s+/)
    .slice(1)
    .map((b) => {
      const id = (b.match(/^(\S+)/) || [])[1];
      const aliases = ((b.match(/aliases:\s*\[([^\]]*)\]/) || [])[1] || "")
        .split(",")
        .map((a) => a.trim().replace(/^['"]|['"]$/g, ""))
        .filter(Boolean);
      const om = (b.match(/om_section:\s*(\S+)/) || [])[1];
      const steps = [];
      const safety = [];
      let mode = null;
      for (const line of b.split("\n")) {
        if (/^\s*steps:\s*$/.test(line)) mode = "steps";
        else if (/^\s*safety:\s*$/.test(line)) mode = "safety";
        else if (mode && /^\s+-\s+"(.*)"\s*$/.test(line)) {
          (mode === "steps" ? steps : safety).push(line.match(/^\s+-\s+"(.*)"\s*$/)[1]);
        } else if (mode && (/^\s+\w[\w_]*:/.test(line) || /^\S/.test(line))) mode = null;
      }
      return { id, aliases, om_section: om, steps, safety };
    });
}

function bestPlaybook(q, playbooks, topicList, family) {
  if (!failSignal(q) && classifyIntent(q) !== "troubleshoot") return null;
  const ql = q.toLowerCase();
  let best = null;
  let bestScore = 0;
  for (const p of playbooks) {
    let s = 0;
    for (const a of p.aliases || []) {
      if (ql.includes(a.toLowerCase())) s += 14 + a.length;
    }
    if (family === "audio" && /STEREO/i.test(p.id)) s += 24;
    if (family === "steer" && /STEER/i.test(p.id)) s += 24;
    if (family === "fuel" && /FUEL|FILTER/i.test(p.id)) s += 24;
    if (family === "start" && /NOSTART/i.test(p.id)) s += 24;
    if (family === "garmin" && /GARMIN/i.test(p.id)) s += 20;
    if (family === "shore" && /SHORE/i.test(p.id)) s += 20;
    if (family === "anchor" && /WINDLASS/i.test(p.id) && failSignal(q)) s += 20;
    if (family === "thruster" && /THRUSTER/i.test(p.id)) s += 20;
    if (s > bestScore) {
      bestScore = s;
      best = p;
    }
  }
  return bestScore >= 10 ? best : null;
}

export function retrievePassages(bundle, question, { limit = 12 } = {}) {
  const q = (question || "").trim();
  const raw = tokenize(q);
  const expanded = expand(raw);
  const topicList = topics(raw, expanded);
  const intent = classifyIntent(q);
  const family = familyOf(q, raw);

  return (bundle.chunks || [])
    .map((c) => ({
      c,
      s: scoreChunk(q, raw, topicList, intent, family, c),
      topicsHit: hits(topicList, hay(c)),
    }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map(({ c, s, topicsHit }) => ({
      id: c.id,
      file: c.file,
      title: c.title,
      text: c.text,
      kind: c.kind,
      score: s,
      topicsHit,
    }));
}

export function matchEvidence(mediaIndex, question, passages) {
  const items = mediaIndex?.items || [];
  if (!items.length) return [];
  const q = question.toLowerCase();
  const blob = passages.map((p) => `${p.file} ${p.title}`).join(" ").toLowerCase();
  return items
    .map((item) => {
      let s = 0;
      for (const t of item.tags || []) {
        if (q.includes(t)) s += 8;
        if (blob.includes(t)) s += 3;
      }
      if (passages.some((p) => (p.file || "").includes(item.file))) s += 20;
      if (/\bphoto|picture|look like|show me|locker|helm\b/.test(q) && s > 0) s += 10;
      return { ...item, score: s };
    })
    .filter((x) => x.score >= 8)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

function stripHeading(text) {
  return (text || "").replace(/^#{1,3}\s+.*$/m, "").trim();
}

function extractShort(text) {
  const m = text.match(/\*\*Short answer:\*\*\s*([\s\S]*?)(?:\n\n|\n(?=\d+\.|What you|\*\*))/i);
  return m ? m[1].trim() : null;
}

function extractSteps(text, limit = 8) {
  const steps = [];
  for (const m of text.matchAll(/^\s*\d+\.\s+(.+)$/gm)) {
    steps.push(m[1].trim());
    if (steps.length >= limit) break;
  }
  return steps;
}

/**
 * Structured free answer (no LLM).
 */
export function answerStructured(bundle, question, mediaIndex = null) {
  const q = (question || "").trim();
  if (!q) {
    return {
      mode: "free",
      summary: "Ask a question about this Flyer 8.",
      steps: [],
      details: "",
      warnings: [],
      unknowns: [],
      evidence: [],
      sources: [],
      manuals: [],
      confidence: "low",
    };
  }

  const intent = classifyIntent(q);
  const raw = tokenize(q);
  const family = familyOf(q, raw);
  const passages = retrievePassages(bundle, q, { limit: 12 });
  const playbooks = parsePlaybooks(bundle.playbooksRaw);
  const pb = bestPlaybook(q, playbooks, topics(raw, expand(raw)), family);
  const evidence = matchEvidence(mediaIndex, q, passages);

  const steps = [];
  if (pb?.safety?.length) steps.push(...pb.safety.map((s) => `Safety: ${s}`));
  if (pb?.steps?.length) steps.push(...pb.steps);

  const primary =
    passages.find((p) => p.kind === "evidence" && intent === "visual") ||
    passages.find((p) => /how deep|scope vs rode/i.test(p.title || "")) ||
    passages.find((p) => p.kind === "note") ||
    passages.find((p) => p.kind === "manual") ||
    passages[0];

  let summary = "";
  let details = "";
  if (pb?.steps?.length) {
    summary = `On this Flyer 8, work through these checks for that symptom${pb.om_section ? ` (${pb.om_section})` : ""}.`;
  }
  if (primary) {
    const body = stripHeading(primary.text);
    const short = extractShort(body);
    if (!summary) summary = short || body.split(/\n\n/)[0].replace(/\s+/g, " ").slice(0, 420);
    // Don't use a bare numbered list as the summary
    if (/^\s*\d+\.\s+/.test(summary) && short) summary = short;
    if (/^\s*\d+\.\s+/.test(summary) && pb?.steps?.length) {
      summary = `On this Flyer 8, work through these checks for that symptom${pb.om_section ? ` (${pb.om_section})` : ""}.`;
    }
    details = body;
    if (!steps.length) {
      const fromNote = extractSteps(body);
      if (fromNote.length) steps.push(...fromNote);
    }
  } else if (pb && !summary) {
    summary = `Follow the ${pb.id} checks for this symptom on your Flyer 8.`;
  } else if (!summary) {
    summary = "I couldn’t find a strong match in the binder yet. Try naming the system (Fusion, Garmin, Zipwake, fuel filter, windlass).";
  }

  // Fuse shortcuts
  if (/\bfuse\b/i.test(q) && /garmin|mfd/i.test(q)) {
    summary = "Garmin MFD fuse: Blue Sea **HDS · 5 A** (label says HDS; the display is Garmin).";
  }
  if (/\bfuse\b/i.test(q) && /stereo|fusion|audio/i.test(q)) {
    summary = "Stereo fuse: Blue Sea **AN4 · 10 A**.";
  }

  const warnings = [];
  if (/fuel|separator|battery|shore|rcd/i.test(q)) {
    warnings.push("Key off / isolate power before opening fuel or AC panels when the binder says to.");
  }

  const unknowns = [];
  if (/anchor|rode|scope|deep/i.test(q) && /UNVERIFIED|not yet have a measured rode/i.test(details + summary)) {
    unknowns.push("Measure total chain + rope length on board to get a boat-specific max anchoring depth.");
  }

  const manuals = (bundle.manuals || [])
    .filter((m) => {
      const n = (m.name + m.file).toLowerCase();
      if (family === "audio") return /fusion|ra210/.test(n);
      if (family === "garmin") return /garmin/.test(n);
      if (family === "fuel" || family === "start") return /verado|mercury.*operation/.test(n);
      if (family === "steer") return /steering|ephs|electric-steering/.test(n);
      if (family === "shore") return /cristec/.test(n);
      if (family === "anchor") return /lewmar|windlass/.test(n);
      if (family === "zipwake") return /zipwake/.test(n);
      if (family === "thruster") return /side-power|sleipner/.test(n);
      if (family === "pump") return /flojet|jabsco|par-max/.test(n);
      return false;
    })
    .slice(0, 4);

  const sources = [];
  if (pb) sources.push({ title: `Playbook ${pb.id}`, file: "owners-manual/llm/symptom-playbooks.yaml" });
  for (const p of passages.slice(0, 5)) {
    sources.push({ title: p.title, file: p.file, kind: p.kind });
  }

  return {
    mode: "free",
    summary,
    steps: steps.slice(0, 10),
    details: details.length > 1200 && steps.length >= 4 ? details.slice(0, 900) + "…" : details,
    warnings,
    unknowns,
    evidence,
    sources,
    manuals,
    confidence: steps.length >= 3 || summary.length > 80 ? "high" : "medium",
    intent,
    family,
    vessel: bundle.vessel,
  };
}

export function buildLlmMessages(bundle, question, passages, evidence) {
  const system =
    (bundle.systemPrompt || "").trim() +
    `

Return ONLY valid JSON with this shape:
{
  "summary": "2-5 sentence plain-language answer",
  "steps": ["numbered troubleshooting or how-to steps, empty if not needed"],
  "details": "optional deeper explanation in markdown paragraphs",
  "warnings": ["safety notes"],
  "unknowns": ["what is UNVERIFIED and what to photograph/measure"],
  "evidenceIds": ["ids of evidence cards that help"],
  "manualRefs": ["OEM manual filenames to open if needed"]
}
No prose outside JSON.`;

  const ctx = passages
    .map((p, i) => `[${i + 1}] (${p.kind || "note"}) ${p.file} · ${p.title}\n${String(p.text || "").slice(0, 1600)}`)
    .join("\n\n");

  const ev = (evidence || [])
    .map((e) => `- id:${e.id} · ${e.title}: ${e.summary}`)
    .join("\n");

  const user = `Vessel: ${bundle.vessel?.name} · HIN ${bundle.vessel?.hin} · ${bundle.vessel?.engine}

Question: ${question}

Evidence cards available:
${ev || "(none matched)"}

Binder excerpts:
${ctx || "(none)"}`;

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}
