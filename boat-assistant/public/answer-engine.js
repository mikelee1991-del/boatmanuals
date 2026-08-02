/**
 * Offline answer engine — troubleshooting-first.
 * Structure: Do this now → Fix/How-to detail → On this boat → Sources
 */

const STOP = new Set(
  `
  a an the and or of to for in on at is are was were be been being
  do does did doing done how what where when why which who whom whose
  my me i i'm im you your we our they them their it its this that these those
  with from as if then than so too also just into onto over under about
  need needs needed replace replaced replacing know find locate use using used
  get got getting make made tell show help please can could would should
  a lot lots something anything everything nothing whether while only
  `.trim().split(/\s+/)
);

/** Adjectives that match too many unrelated passages if used as topics alone. */
const WEAK_TOPIC = new Set(["hard", "soft", "blank", "weak", "dead", "heavy", "stiff"]);

const EXPAND = {
  stereo: ["stereo", "fusion", "ra210", "audio", "bluetooth", "an4", "sound"],
  fusion: ["fusion", "stereo", "ra210", "audio", "bluetooth", "an4"],
  bluetooth: ["bluetooth", "fusion", "stereo", "pairing", "discoverable"],
  music: ["stereo", "fusion", "audio", "bluetooth", "sound"],
  sound: ["stereo", "fusion", "audio", "sound", "speaker"],
  volume: ["volume", "dial", "fusion", "stereo", "mute"],
  garmin: ["garmin", "echomap", "mfd", "hds", "chartplotter", "sonar"],
  chartplotter: ["garmin", "echomap", "mfd", "hds"],
  mfd: ["garmin", "echomap", "mfd", "hds"],
  thruster: ["thruster", "sleipner", "side-power", "bow"],
  windlass: ["windlass", "anchor"],
  charger: ["cristec", "ypower", "charger", "shore"],
  shore: ["shore", "cristec", "115v", "rcd"],
  fuse: ["fuse", "blue sea", "an4", "hds"],
  steering: ["ephs", "steering", "8m6005909"],
  ephs: ["ephs", "steering", "8m6005909"],
  separator: ["separator", "fuel filter", "water-separat", "water-in-fuel"],
  filter: ["filter", "fuel filter", "separator", "water-separat"],
  fuel: ["fuel", "fuel filter", "separator", "water-in-fuel"],
  start: ["start", "crank", "lanyard", "dts", "battery"],
};

function tokenize(q) {
  return q
    .toLowerCase()
    .replace(/[/_,]+/g, " ")
    .match(/[a-z0-9][a-z0-9+.-]*/g)
    ?.filter((t) => !STOP.has(t) && t.length > 1) || [];
}

function expandTokens(toks) {
  const out = new Set(toks);
  for (const t of toks) for (const e of EXPAND[t] || []) out.add(e);
  return [...out];
}

function topicTokens(rawToks, expanded) {
  const strong = rawToks.filter((t) => (t.length >= 4 || EXPAND[t]) && !WEAK_TOPIC.has(t));
  if (strong.length) return strong;
  const primary = rawToks.filter((t) => t.length >= 4 || EXPAND[t]);
  return primary.length ? primary : expanded.filter((t) => t.length >= 3 && !WEAK_TOPIC.has(t));
}

function haystack(chunk) {
  return `${chunk.title || ""} ${chunk.section || ""} ${(chunk.keywords || []).join(" ")} ${
    chunk.file || ""
  } ${chunk.text || ""}`.toLowerCase();
}

function matchedTopics(topics, hay) {
  return topics.filter((t) => hay.includes(t));
}

function classifyIntent(q) {
  const s = q.toLowerCase();
  if (
    /\b(fix|repair|troubleshoot|dead|not working|won't|wont|isn't|isnt|no sound|no power|blank|alarm|error|fault|trip|tripped|leak|overheat|weak|fail|failed|broken|reset)\b/.test(
      s
    ) ||
    /\b(no start|won't start|hard start|hard steering|not charging|water-in-fuel|water in fuel)\b/.test(s)
  ) {
    return "troubleshoot";
  }
  if (/\b(how do i|how to|pair|pairing|connect|operate|turn on|turn off|flush|prime|service|replace|change|drain|top up|check)\b/.test(s)) {
    return "howto";
  }
  if (/\b(where is|where does|location|located|find the)\b/.test(s)) return "where";
  if (/\b(what is|which|do i have|installed|model)\b/.test(s)) return "what";
  return "howto";
}

function hasFailSignal(q) {
  return /\b(no sound|no power|dead|won't|wont|not working|blank|alarm|error|fault|fail|broken|trip|leak|overheat|hard steering|no start|won't start)\b/i.test(
    q
  );
}

function queryFamily(q, rawToks) {
  const s = q.toLowerCase();
  const has = (...xs) => xs.some((x) => rawToks.includes(x) || s.includes(x));
  if (has("stereo", "fusion", "bluetooth", "music", "sound", "volume", "audio", "ra210")) return "audio";
  if (has("steering", "ephs") || /\bsteer/.test(s)) return "steer";
  if (has("separator") || /\bwater[- ]?in[- ]?fuel\b|\bguardian\b/.test(s) || (has("fuel") && has("filter")))
    return "fuel";
  if (has("fuel") && /\b(alarm|warning|water|filter|separator)\b/.test(s)) return "fuel";
  if ((has("start", "crank", "lanyard") || /\bno start\b/.test(s)) && !has("steering")) return "start";
  if (has("garmin", "mfd", "chartplotter", "sonar", "echomap", "hds")) return "garmin";
  if (has("shore", "charger", "cristec", "rcd")) return "shore";
  if (has("thruster", "sleipner")) return "thruster";
  if (has("windlass", "anchor")) return "windlass";
  if (has("zipwake", "interceptor", "trim")) return "zipwake";
  return null;
}

function chunkFamily(chunk) {
  const f = `${chunk.file || ""} ${chunk.title || ""}`.toLowerCase();
  if (/fusion|stereo|ra210|audio|bluetooth/.test(f)) return "audio";
  if (/fuel-filter|water-separator|fuel filter|guardian|water-in-fuel/.test(f)) return "fuel";
  if (/ephs|steer|8m6005909/.test(f)) return "steer";
  if (/no start|hard start|power-sequences|lanyard|dts/.test(f) && !/steer/.test(f)) return "start";
  if (/garmin|echomap|mfd|hds|chartplotter|sonar/.test(f)) return "garmin";
  if (/cristec|shore|ypower|rcd/.test(f)) return "shore";
  if (/thruster|sleipner|side-power/.test(f)) return "thruster";
  if (/windlass|anchor|lewmar/.test(f)) return "windlass";
  if (/zipwake|interceptor/.test(f)) return "zipwake";
  return null;
}

function normTitle(t) {
  return (t || "")
    .toLowerCase()
    .replace(/[\u2018\u2019']/g, "'");
}

function procedureBoost(chunk, intent) {
  const title = normTitle(chunk.title);
  const file = (chunk.file || "").toLowerCase();
  const head = (chunk.text || "").toLowerCase().slice(0, 280);
  let b = 0;
  const procedural = /troubleshoot|if it won't|no sound|no start|replace|pairing|checklist|dead|fault|steps|procedure|power-up|power-down|warning|alarm|daily controls|water-in-fuel|guardian/.test(
    title + " " + head
  );
  const inventory = /equipped_confirmed|what stereo is it|provenance|stock vs|keywords for search|status:\s*\*\*confirmed/.test(
    title + " " + head
  );

  if (intent === "troubleshoot" || intent === "howto") {
    if (procedural) b += 24;
    if (/14-troubleshooting|power-sequences|fuse-map/.test(file)) b += 10;
    if (/notes\//.test(file) && procedural) b += 16;
    if (inventory) b -= 20;
  }
  if (intent === "where" && /where|location|starboard|under the/.test(title + " " + head)) b += 18;
  if (/symptom-playbooks\.yaml|boat-dictionary\.yaml|retrieval-index/.test(file)) b -= 25;
  return b;
}

function scoreChunk(rawToks, topics, intent, chunk, family) {
  const file = (chunk.file || "").toLowerCase();
  const title = normTitle(chunk.title);
  const hay = haystack(chunk);
  const hits = matchedTopics(topics, hay);
  if (!hits.length) return 0;

  const cf = chunkFamily(chunk);
  if (family && cf && family !== cf) return 0;

  let s = procedureBoost(chunk, intent);
  const hitRatio = hits.length / Math.max(topics.length, 1);
  const focusToks = rawToks.filter((t) => (t.length >= 3 || EXPAND[t]) && !WEAK_TOPIC.has(t));
  const rawHits = matchedTopics(focusToks, hay);

  for (const t of hits) {
    s += t.length >= 6 ? 12 : t.length >= 4 ? 9 : 5;
    if (title.includes(t)) s += 10;
    if (file.includes(t.replace(/\s+/g, "-")) || file.includes(t)) s += 8;
  }
  for (const t of rawHits) {
    s += 8;
    if (title.includes(t) || file.includes(t)) s += 12;
  }
  s += Math.round(hitRatio * 14);

  if (rawToks.some((t) => ["stereo", "fusion", "bluetooth", "music", "sound"].includes(t))) {
    if (/fusion|stereo|ra210|audio/.test(file + " " + title)) s += 20;
  }
  if (rawToks.some((t) => ["garmin", "mfd", "chartplotter", "sonar"].includes(t))) {
    if (/garmin|echomap|mfd|hds/.test(file + " " + title)) s += 18;
  }
  if (rawToks.some((t) => ["separator", "fuel", "filter"].includes(t))) {
    if (/fuel-filter|water-separator|fuel filter/.test(file + " " + title)) s += 20;
  }
  if (rawToks.includes("steering") || rawToks.includes("ephs")) {
    if (/steer|ephs|14-troubleshooting/.test(file + " " + title)) s += 16;
    if (/no start|hard start|fuel-filter|water-separator/.test(file + " " + title)) s -= 50;
  }
  if (family === "start" && /fuel-filter|water-separator|when to service/.test(file + " " + title)) s -= 40;
  if (family === "fuel" && /if you get a water-in-fuel|guardian|replace the engine/.test(title)) s += 18;

  if (file.endsWith(".md")) s += 3;
  if (file.includes("notes/")) s += 6;
  if (file.endsWith(".yaml") || file.endsWith(".yml") || file.endsWith(".json")) s -= 14;
  if (/^keywords$/i.test(chunk.title || "")) s -= 30;

  return s;
}

function parseQuotedList(block, key) {
  const out = [];
  let mode = false;
  for (const line of block.split("\n")) {
    if (new RegExp(`^\\s*${key}:\\s*$`).test(line)) {
      mode = true;
      continue;
    }
    if (!mode) continue;
    const m = line.match(/^\s+-\s+"(.*)"\s*$/);
    if (m) {
      out.push(m[1]);
      continue;
    }
    if (/^\s+\w[\w_]*:/.test(line) || /^\S/.test(line) || (/^\s+-\s+\S/.test(line) && !/^\s+-\s+"/.test(line))) break;
  }
  return out;
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
      return { id, aliases, om_section: om, safety: parseQuotedList(b, "safety"), steps: parseQuotedList(b, "steps") };
    });
}

function bestPlaybook(query, playbooks, topics, family) {
  const q = query.toLowerCase();
  let best = null;
  let bestScore = 0;
  for (const p of playbooks) {
    let s = 0;
    for (const a of p.aliases || []) {
      const al = a.toLowerCase();
      if (q.includes(al)) s += 14 + al.length;
      for (const t of topics) if (al.includes(t)) s += 3;
    }
    if (/stereo|fusion|bluetooth|music|audio|sound/.test(q) && /STEREO|AUDIO/i.test(p.id)) s += 24;
    if (/garmin|mfd|sonar|depth/.test(q) && /GARMIN|MFD/i.test(p.id)) s += 20;
    if (/steer|ephs/.test(q) && /STEER/i.test(p.id)) s += 22;
    if (/\bstart|crank/.test(q) && /NOSTART/i.test(p.id)) s += 22;
    if (/fuel|separator|filter|water-in-fuel|water in fuel/.test(q) && /FUEL|FILTER/i.test(p.id)) s += 22;
    if (/shore|charg|cristec/.test(q) && /SHORE/i.test(p.id)) s += 20;
    if (/thruster|sleipner/.test(q) && /THRUSTER/i.test(p.id)) s += 20;
    if (/windlass|anchor/.test(q) && /WINDLASS/i.test(p.id)) s += 20;

    // Keep playbook on the same equipment family
    if (family === "audio" && !/STEREO|AUDIO/i.test(p.id)) s -= 40;
    if (family === "steer" && !/STEER/i.test(p.id)) s -= 40;
    if (family === "fuel" && !/FUEL|FILTER/i.test(p.id)) s -= 40;
    if (family === "start" && !/NOSTART/i.test(p.id)) s -= 40;
    if (family === "garmin" && !/GARMIN|MFD/i.test(p.id)) s -= 40;

    if (s > bestScore) {
      bestScore = s;
      best = p;
    }
  }
  return bestScore >= 10 ? best : null;
}

function stripHeading(text) {
  return text.replace(/^#{1,3}\s+.*$/m, "").trim();
}

function extractNumberedSteps(text, limit = 8) {
  const steps = [];
  for (const m of text.matchAll(/^\s*(\d+)\.\s+(.+)$/gm)) {
    steps.push(m[2].trim());
    if (steps.length >= limit) break;
  }
  return steps;
}

function boatContextBits(rawToks, family) {
  const bits = [];
  const add = (s) => {
    if (s && !bits.includes(s)) bits.push(s);
  };
  if (family === "audio" || rawToks.some((t) => ["stereo", "fusion", "bluetooth", "music", "sound"].includes(t))) {
    add("Fuse: Blue Sea AN4 10A (stereo)");
  }
  if (family === "garmin" || rawToks.some((t) => ["garmin", "mfd", "chartplotter", "sonar", "hds"].includes(t))) {
    add("Fuse: Blue Sea HDS 5A (Garmin MFD)");
  }
  if (family === "steer" || rawToks.some((t) => ["steering", "ephs"].includes(t))) {
    add("Steering: Mercury EPHS pump 8M6005909 — check MIN/MAX fluid");
  }
  if (family === "fuel" || rawToks.some((t) => ["fuel", "separator", "filter"].includes(t))) {
    add("Fuel filter: under top cowl, starboard aft, near bottom spark plug");
  }
  if (family === "shore" || rawToks.some((t) => ["shore", "charger", "cristec"].includes(t))) {
    add("Charger: CRISTEC YPOWER YPO12-25DE (115V shore)");
  }
  if (family === "start") {
    add("ENGINE bank for cranking; confirm kill lanyard + DTS in NEUTRAL");
  }
  return bits.slice(0, 3);
}

function noteDetailScore(chunk, intent, q, family) {
  const t = normTitle(chunk.title);
  const f = (chunk.file || "").toLowerCase();
  if (!f.includes("notes/")) return -1;
  const cf = chunkFamily(chunk);
  if (family && cf && family !== cf) return -1;

  let s = 0;
  if (intent === "troubleshoot") {
    if (/if it won't|no sound|water-in-fuel|guardian fuel|if you get a/.test(t)) s += 45;
    if (/replace the|replace outline/.test(t)) s += 32;
    if (/when to service/.test(t)) s += /water|fuel|alarm|warning/.test(q) ? 2 : 10;
    if (/pairing/.test(t)) s += /bluetooth|pair/.test(q) ? 35 : 4;
    if (/daily controls/.test(t)) s += 6;
  } else if (intent === "howto") {
    if (/daily controls/.test(t) && !/bluetooth|pair/.test(q)) s += 40;
    if (/pairing|bluetooth/.test(t) && /bluetooth|pair/.test(q)) s += 40;
    if (/pairing/.test(t)) s += 18;
    if (/daily controls/.test(t)) s += 22;
    if (/replace the|if it won't|warning|water-in-fuel/.test(t)) s += 12;
  } else if (intent === "where") {
    if (/where|location/.test(t)) s += 40;
  } else if (intent === "what") {
    if (/where \/ what|quick/.test(t)) s += 30;
    if (/daily controls|pairing|if it won't/.test(t)) s += 8;
  }
  return s;
}

function sourceScore(chunk, topics, intent, family) {
  const f = (chunk.file || "").toLowerCase();
  const t = normTitle(chunk.title);
  if (/symptom-playbooks|retrieval-index|boat-dictionary\.yaml/.test(f)) return -100;
  if (/^keywords$/i.test(chunk.title || "")) return -100;
  const cf = chunkFamily(chunk);
  if (family && cf && family !== cf) return -50;
  let s = matchedTopics(topics, haystack(chunk)).length * 10;
  if (f.includes("notes/")) s += 12;
  if (/14-troubleshooting/.test(f) && /no start|hard start/.test(t) && family !== "start") s -= 40;
  if (procedureBoost(chunk, intent) > 0) s += 8;
  return s;
}

function fuseFact(q, family) {
  if (family === "garmin" || /\bgarmin|mfd|chartplotter|sonar\b/i.test(q)) {
    return "Garmin MFD fuse: **Blue Sea HDS · 5 A** (label says HDS; unit is Garmin).";
  }
  if (family === "audio" || /\bstereo|fusion|audio\b/i.test(q)) {
    return "Stereo fuse: **Blue Sea AN4 · 10 A**.";
  }
  return null;
}

/**
 * @param {object} bundle
 * @param {string} question
 */
export function answerQuestion(bundle, question) {
  const q = (question || "").trim();
  if (!q) return { answer: "Ask a question about this Flyer 8.", hits: [], confidence: "low" };

  const intent = classifyIntent(q);
  const rawToks = tokenize(q);
  const expanded = expandTokens(rawToks);
  const topics = topicTokens(rawToks, expanded);
  const family = queryFamily(q, rawToks);
  const fail = hasFailSignal(q);

  const scored = (bundle.chunks || [])
    .map((c) => ({
      c,
      s: scoreChunk(rawToks, topics, intent, c, family),
      topicsHit: matchedTopics(topics, haystack(c)),
    }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s);

  const top = scored.filter((x) => x.topicsHit.length > 0).slice(0, 12);
  const playbooks = parsePlaybooks(bundle.playbooksRaw);
  const pb = bestPlaybook(q, playbooks, topics, family);

  const lines = [];
  lines.push(`**${bundle.vessel.name}** · HIN \`${bundle.vessel.hin}\``);
  lines.push("");

  if (!top.length && !pb) {
    lines.push("No strong binder match yet. Try a symptom (“no sound”, “hard steering”) or a part name (Fusion, Garmin, Zipwake).");
    return { answer: lines.join("\n"), hits: [], confidence: "low", intent, topics, family };
  }

  // Short fact for fuse/identity questions
  if (intent === "what" && /\bfuse\b/i.test(q)) {
    const fact = fuseFact(q, family);
    if (fact) {
      lines.push("### Short answer");
      lines.push(fact);
      lines.push("");
    }
  }

  // 1) Checklist first
  const actionSteps = [];

  // Howto without a failure: prefer operate steps from notes over dead-unit playbook
  const preferOperate =
    intent === "howto" && !fail && (family === "audio" || /stereo|fusion|bluetooth/i.test(q));

  if (preferOperate) {
    const daily = top.find((x) => /daily controls/i.test(x.c.title || ""));
    const pairing = /bluetooth|pair/i.test(q) ? top.find((x) => /pairing|bluetooth/i.test(x.c.title || "")) : null;
    const note = pairing || daily;
    if (note) {
      actionSteps.push(...extractNumberedSteps(note.c.text, 8));
    }
  }

  if (!actionSteps.length && pb) {
    // For pure "what fuse" questions, keep checklist short
    if (intent === "what" && /\bfuse\b/i.test(q) && pb.steps?.length) {
      actionSteps.push(pb.steps[0]);
    } else {
      if (pb.safety?.length) actionSteps.push(...pb.safety.map((s) => `Safety: ${s}`));
      if (pb.steps?.length) actionSteps.push(...pb.steps);
    }
  }

  if (actionSteps.length < 3 && !(intent === "what" && /\bfuse\b/i.test(q))) {
    const noteProcs = top
      .filter((x) => /notes\//.test(x.c.file || ""))
      .filter((x) => !family || !chunkFamily(x.c) || chunkFamily(x.c) === family)
      .sort((a, b) => noteDetailScore(b.c, intent, q, family) - noteDetailScore(a.c, intent, q, family));
    for (const item of noteProcs) {
      const nums = extractNumberedSteps(item.c.text, 8);
      if (nums.length >= 3) {
        actionSteps.push(...nums);
        break;
      }
    }
  }

  if (actionSteps.length) {
    lines.push("### Do this now");
    actionSteps.slice(0, 10).forEach((step, i) => lines.push(`${i + 1}. ${step}`));
    lines.push("");
  }

  // 2) Detail from best matching note section (same family only)
  const detailCandidates = [...top]
    .filter((x) => noteDetailScore(x.c, intent, q, family) > 0)
    .sort((a, b) => noteDetailScore(b.c, intent, q, family) - noteDetailScore(a.c, intent, q, family));

  for (const detail of detailCandidates) {
    const body = stripHeading(detail.c.text);
    const detailSteps = extractNumberedSteps(body);
    const overlap =
      actionSteps.length && detailSteps.length
        ? detailSteps.filter((s) =>
            actionSteps.some((a) => {
              const as = a.toLowerCase().replace(/[^a-z0-9]+/g, " ");
              const ds = s.toLowerCase().replace(/[^a-z0-9]+/g, " ");
              return as.includes(ds.slice(0, 24)) || ds.includes(as.slice(0, 24));
            })
          ).length / detailSteps.length
        : 0;

    const detailTitle = normTitle(detail.c.title);
    // Operate howto: Do this now already has the controls — don't append extra sections
    if (preferOperate) continue;
    // Playbook checklist already answered the symptom — only keep distinct procedures
    if (intent === "troubleshoot" && pb && actionSteps.length >= 4) {
      const distinctProc =
        /replace the|replace outline/.test(detailTitle) ||
        (/pairing|bluetooth/.test(detailTitle) && /bluetooth|pair/i.test(q));
      if (!distinctProc || overlap > 0.55) continue;
    }
    if (overlap > 0.65) continue;

    const label = intent === "where" ? "### Location" : intent === "troubleshoot" ? "### Fix detail" : "### How to";
    lines.push(`${label} (\`${detail.c.file}\` · ${detail.c.title})`);
    lines.push("");
    lines.push(body);
    lines.push("");
    break;
  }

  // 3) Brief boat-specific facts
  const ctx = boatContextBits(rawToks, family);
  lines.push("### On this boat");
  if (ctx.length) ctx.forEach((b) => lines.push(`- ${b}`));
  else if (top[0]) lines.push(`- See \`${top[0].c.file}\` for vessel-specific notes`);
  if (pb?.om_section) lines.push(`- Binder section: \`${pb.om_section}\``);
  lines.push("");

  // 4) Sources (topic-filtered)
  lines.push("### Sources");
  if (pb) lines.push(`- Playbook ${pb.id}${pb.om_section ? ` · \`${pb.om_section}\`` : ""}`);
  const srcs = [...top]
    .map((x) => ({ ...x, ss: sourceScore(x.c, topics, intent, family) }))
    .filter((x) => x.ss > 0)
    .sort((a, b) => b.ss - a.ss);
  const seen = new Set();
  for (const x of srcs) {
    const key = x.c.file + x.c.title;
    if (seen.has(key)) continue;
    seen.add(key);
    lines.push(`- ${x.c.title} — \`${x.c.file}\``);
    if (seen.size >= 3) break;
  }
  lines.push("");
  lines.push("_Troubleshooting-first answer from the boat binder (offline)._");

  return {
    answer: lines.join("\n"),
    hits: top.slice(0, 8).map(({ c, s, topicsHit }) => ({
      id: c.id,
      file: c.file,
      title: c.title,
      score: s,
      topicsHit,
    })),
    playbook: pb?.id || null,
    confidence: actionSteps.length >= 3 || (intent === "what" && /\bfuse\b/i.test(q)) ? "high" : top[0]?.s >= 18 ? "medium" : "low",
    intent,
    topics,
    family,
  };
}
