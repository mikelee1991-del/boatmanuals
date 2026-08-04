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
  stereo: ["stereo", "fusion", "ra70n", "ra70", "ra210", "audio", "bluetooth", "an4", "sound"],
  fusion: ["fusion", "stereo", "ra70n", "ra70", "ra210", "bluetooth", "an4"],
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
  charging: ["cristec", "ypower", "charger", "shore", "battery", "house", "engine"],
  steering: ["ephs", "steering", "8m6005909"],
  ephs: ["ephs", "steering"],
  fuel: ["fuel", "filter", "separator", "water-in-fuel"],
  filter: ["filter", "fuel", "separator"],
  separator: ["separator", "fuel", "filter"],
  start: ["start", "crank", "lanyard", "dts"],
  pump: ["pump", "flojet", "jabsco", "washdown"],
  toilet: ["toilet", "jabsco", "flush", "holding", "macer", "macerator", "head", "quiet"],
  head: ["toilet", "jabsco", "flush", "holding", "macer", "head"],
  fridge: ["fridge", "refrigerator", "isotherm", "cooler", "1c1a"],
  refrigerator: ["fridge", "refrigerator", "isotherm", "cooler"],
  isotherm: ["fridge", "isotherm", "cooler"],

  trim: ["zipwake", "interceptor", "trim"],
  fuse: ["fuse", "blue sea", "an4", "hds"],
  battery: ["battery", "engine", "house", "locker"],
  batteries: ["battery", "engine", "house", "locker", "cristec"],
  locker: ["battery", "locker", "cristec", "pump"],
  electrical: ["battery", "house", "engine", "blue", "sea", "fuse", "cristec"],
  house: ["house", "battery", "engine", "cristec"],
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
  if (/\b(what is|which|do i have|model|fuse for|how does|explain|tell me about|overview|describe)\b/.test(s))
    return "what";
  if (/\b(how deep|how much|how far)\b/.test(s)) return "planning";
  return "general";
}

function failSignal(q) {
  return /\b(no sound|no power|dead|won't|wont|not working|not charging|blank|alarm|error|fault|fail|broken|hard steering|no start|trip|leak|overheat|water in fuel|water-in-fuel)\b/i.test(
    q
  );
}

function isInformational(intent, q) {
  if (failSignal(q) || intent === "troubleshoot") return false;
  return ["what", "howto", "where", "planning", "general", "visual"].includes(intent);
}

function familyOf(q, raw) {
  const s = q.toLowerCase();
  const has = (...xs) => xs.some((x) => raw.includes(x) || s.includes(x));
  if (has("stereo", "fusion", "bluetooth", "sound", "audio")) return "audio";
  if (has("steering", "ephs") || /\bsteer/.test(s)) return "steer";
  if (has("separator") || /\bwater[- ]?in[- ]?fuel\b/.test(s) || (has("fuel") && has("filter"))) return "fuel";
  if ((has("start", "crank") || /\bno start\b/.test(s)) && !has("steering")) return "start";
  if (has("garmin", "mfd", "chartplotter", "sonar", "echomap")) return "garmin";
  if (has("shore", "charger", "cristec", "charging", "ypower")) return "shore";
  if (has("thruster", "sleipner")) return "thruster";
  if (has("windlass") || (has("anchor", "rode", "scope") && !has("garmin"))) return "anchor";
  if (has("zipwake", "interceptor", "trim")) return "zipwake";
  if (has("battery", "batteries", "locker", "electrical", "house") && !has("shore", "charger", "cristec"))
    return "electrical";
  if (has("pump", "flojet", "jabsco", "washdown") && !has("toilet", "flush", "holding", "macer", "head")) return "pump";
  if (has("toilet", "flush", "holding", "macer", "macerator", "head") || /\bquiet.?flush\b/.test(s)) return "toilet";
  if (has("fridge", "refrigerator", "isotherm", "cooler")) return "fridge";
  return null;
}

function scoreChunk(q, raw, topicList, intent, family, c) {
  const h = hay(c);
  const th = hits(topicList, h);
  if (!th.length) return 0;
  let s = 0;
  const title = (c.title || "").toLowerCase();
  const file = (c.file || "").toLowerCase();
  const info = isInformational(intent, q);

  for (const t of th) {
    s += t.length >= 6 ? 10 : 6;
    if (title.includes(t)) s += 12;
    if (file.includes(t)) s += 8;
  }

  if (c.kind === "manual") s += info ? 12 : 8;
  if (c.kind === "evidence") s += intent === "visual" || /\bphoto|look like|locker|helm\b/i.test(q) ? 28 : 6;
  if (c.kind === "note") s += info ? 10 : 6;
  if (/symptom-playbooks|retrieval-index|boat-dictionary\.yaml/.test(file)) s -= 20;
  if (/^keywords$/i.test(c.title || "")) s -= 40;
  // Informational asks: prefer vessel chapters/evidence over raw OEM page dumps
  if (info && /extracts\//.test(file)) s -= 18;
  if (info && /chapters\//.test(file)) s += 14;
  if (info && /evidence\//.test(file) && family) s += 8;
  if (/breaker|80\s*a|187/.test(q) && /187|80\s*a|high-current|windlass-breaker|04-electrical/.test(file + title + h.slice(0, 200)))
    s += 40;
  if (/breaker|80\s*a|187/.test(q) && /how deep|scope vs rode/.test(title + file)) s -= 35;

  if (intent === "troubleshoot" || failSignal(q)) {
    if (/troubleshoot|if it won't|no sound|warning|alarm|fault|replace|check this/.test(title + h.slice(0, 200)))
      s += 18;
  }
  if (info) {
    // Prefer overview / as-installed / OEM extracts over fault trees
    if (/troubleshoot|if it won't|pb-|om-ts-|symptom|fault tree|no sound|won't start/.test(title + file)) s -= 16;
    if (/overview|as-installed|how deep|scope|diagram|charging|batter|electrical|trim|ground-tackle|operation/.test(
      title + file
    ))
      s += 16;
    if (c.kind === "manual" && /extracts\//.test(file)) s += 10;
  }
  if (intent === "planning" && /how deep|scope|rode/.test(title + file)) s += 40;
  if (intent === "visual" && /evidence\//.test(file)) s += 35;
  if (intent === "visual" && /extracts\//.test(file)) s -= 15;

  if (family === "audio" && /fusion|stereo|ra70|ra210|audio/.test(file + title)) s += 22;
  if (family === "fuel" && /fuel|separator|water-in-fuel/.test(file + title)) s += 22;
  if (family === "steer" && /steer|ephs/.test(file + title)) s += 22;
  if (family === "anchor" && /ground-tackle|anchor|rode|windlass|lewmar/.test(file + title)) s += 22;
  if (family === "garmin" && /garmin|echomap|mfd/.test(file + title)) s += 20;
  if (family === "shore" && /cristec|shore|ypower|charg/.test(file + title)) s += 20;
  if (family === "electrical" && /electrical|battery|wiring|blue.?sea|charg/.test(file + title)) s += 20;
  if (family === "zipwake" && /zipwake|trim/.test(file + title)) s += 20;
  if (family === "pump" && /flojet|par-max|washdown|fresh/.test(file + title) && !/toilet|quiet.?flush|37010|37055/.test(file + title))
    s += 22;
  if (family === "toilet" && /toilet|holding|quiet.?flush|37010|37055|macer|head|waste/.test(file + title)) s += 22;
  if (family === "fridge" && /fridge|isotherm|cooler|1c1a|cabin-fridge/.test(file + title)) s += 22;

  // Cross-topic blockers
  if (family === "steer" && /fuel-filter|water-separator|when to service/.test(file + title)) s -= 50;
  if (family === "anchor" && !failSignal(q) && /pb-windlass|om-ts-windlass/.test(file + title)) s -= 30;
  if (family === "audio" && /fuel-filter/.test(file)) s -= 40;
  if (family === "toilet" && /par-max|flojet|washdown/.test(file + title)) s -= 30;
  if (family === "pump" && /toilet|quiet.?flush|37010|37055/.test(file + title)) s -= 30;

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

/**
 * Match OEM manual figures to the question / retrieved passages.
 */
export function matchFigures(figuresIndex, question, passages, { limit = 6 } = {}) {
  const items = figuresIndex?.items || [];
  if (!items.length) return [];
  const q = question.toLowerCase();
  const raw = tokenize(q);
  const fam = familyOf(q, raw);
  const passageManuals = new Set(
    passages
      .map((p) => (p.file || "").toLowerCase())
      .filter((f) => f.includes("extracts/") || f.includes("manual"))
      .map((f) => f.replace(/^.*extracts\//, "").replace(/\.md$/, "").toLowerCase())
  );
  const passageBlob = passages.map((p) => `${p.title} ${p.text || ""}`.slice(0, 500)).join(" ").toLowerCase();

  const familyManualHints = {
    audio: [/fusion|ra70|ra210/],
    garmin: [/garmin|echomap/],
    fuel: [/verado|operation-maintenance|fuel/],
    steer: [/steering|ephs|electric-steering/],
    shore: [/cristec|ypower/],
    anchor: [/lewmar|windlass/],
    thruster: [/side-power|sleipner/],
    zipwake: [/zipwake/],
    pump: [/flojet|par-max|washdown/],
    toilet: [/toilet|quiet-flush|37010|37055/],
    fridge: [/isotherm|fridge|cruise|coolmatic|vitrifrigo/],
    start: [/verado|smartcraft|dts/],
    vesselview: [/vesselview|smartcraft/],
    electrical: [/cristec|verado|fusion|ypower/],
  };

  return items
    .map((item) => {
      let s = 0;
      const hay = `${item.caption} ${item.manualName} ${(item.topics || []).join(" ")} ${(item.tags || []).join(" ")}`.toLowerCase();
      for (const t of raw) {
        if (t.length < 3) continue;
        if (hay.includes(t)) s += 6;
      }
      for (const t of item.topics || []) {
        if (q.includes(t) || fam === t || (fam === "audio" && t === "stereo")) s += 10;
        if (passageBlob.includes(t)) s += 3;
      }
      for (const t of item.tags || []) if (q.includes(t)) s += 5;
      const man = (item.manualName || "").toLowerCase();
      for (const hint of passageManuals) {
        if (man.includes(hint.slice(0, 18)) || hint.includes(man.replace(/\.pdf$/, "").slice(0, 18))) s += 12;
      }
      const hints = familyManualHints[fam] || [];
      if (hints.length) {
        if (hints.some((re) => re.test(man) || re.test((item.manual || "").toLowerCase()))) s += 22;
        else s -= 18; // keep figures on-topic for the equipment family
      }
      if (fam && (item.topics || []).includes(fam)) s += 8;
      if (fam === "fuel" && /garmin|echomap|fusion/.test(man)) s -= 30;
      if (fam === "audio" && /verado|garmin|cristec/.test(man)) s -= 20;
      // Prefer real embedded figures slightly over full-page renders when scores tie-ish
      if (item.kind === "page-render") s -= 1;
      return { ...item, score: s };
    })
    .filter((x) => {
      if (x.score < 14) return false;
      const hints = familyManualHints[fam];
      if (!hints?.length) return true;
      const man = `${x.manualName || ""} ${x.manual || ""}`.toLowerCase();
      return hints.some((re) => re.test(man));
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function stripHeading(text) {
  return (text || "").replace(/^#{1,3}\s+.*$/m, "").trim();
}

function extractShort(text) {
  const m = (text || "").match(
    /\*\*Short answer:\*\*\s*([\s\S]*?)(?:\n\n|\n(?=\d+\.|What you|#{1,3}\s)|\n(?=\*\*[A-Z])|$)/i
  );
  if (!m) return null;
  return m[1].replace(/\s+/g, " ").trim();
}

function extractSteps(text, limit = 8) {
  const steps = [];
  for (const m of text.matchAll(/^\s*\d+\.\s+(.+)$/gm)) {
    steps.push(m[1].trim());
    if (steps.length >= limit) break;
  }
  return steps;
}

function extractBullets(text, limit = 8) {
  const out = [];
  for (const m of text.matchAll(/^\s*[-*]\s+(.+)$/gm)) {
    const line = m[1].trim().replace(/\*\*/g, "");
    if (line.length < 12 || line.length > 220) continue;
    if (/^keywords?:/i.test(line)) continue;
    out.push(line);
    if (out.length >= limit) break;
  }
  return out;
}

function isJunkSummaryText(t) {
  if (!t) return true;
  const s = t.trim();
  if (s.length < 40) return true;
  if (/^keywords?:/i.test(s)) return true;
  if (/^\|/.test(s)) return true;
  if (/^```/.test(s)) return true;
  if (/^[┌│└├─┐┘┤┬┴┼]+/m.test(s)) return true; // ascii diagrams
  if (/^\d+\.\s+Kill battery|^1\.\s+Key off/i.test(s)) return true;
  // Pure numbered procedure dump without prose context — weak as a bottom line
  if (/^\d+\.\s+/.test(s) && (s.match(/^\d+\.\s+/gm) || []).length >= 3) return true;
  return false;
}

function firstUsefulParagraph(text) {
  const body = stripHeading(text);
  const short = extractShort(body);
  if (short && !isJunkSummaryText(short)) return short.replace(/\s+/g, " ").trim();
  for (const block of body.split(/\n{2,}/)) {
    let t = block.trim();
    if (/^```/.test(t)) continue;
    t = t.replace(/\s+/g, " ").replace(/^[-*]\s+/, "").trim();
    if (isJunkSummaryText(t)) continue;
    return t.slice(0, 520);
  }
  const fallback = body.replace(/\s+/g, " ").slice(0, 420);
  return isJunkSummaryText(fallback) ? "" : fallback;
}

function pickPrimaryPassage(passages, intent, family, q = "") {
  const ql = (q || "").toLowerCase();
  const breakerAsk = /breaker|80\s*a|187|fuse for windlass|windlass fuse/.test(ql);
  const ranked = [...passages].sort((a, b) => {
    const score = (p) => {
      let s = p.score || 0;
      const file = (p.file || "").toLowerCase();
      const title = (p.title || "").toLowerCase();
      const body = stripHeading(p.text || "");
      if (extractShort(body)) s += 80;
      if (/chapters\//.test(file)) s += 20;
      if (/diagrams\//.test(file)) s -= 40;
      if (/evidence\//.test(file) && intent !== "visual") s -= 20;
      if (/retrieval-index|symptom-playbooks|keywords/.test(file + title)) s -= 40;
      if (/^PDF page\b/i.test(title) || /extracts\//.test(file)) s -= 25;
      if (/^banks\b|^chemistry\b|^charger\b|^shore ac\b|^usage tips\b/i.test(title)) s -= 10;
      if (family === "toilet" && /09-water|toilet|holding|quiet.?flush/.test(file + title)) s += 40;
      if (family === "toilet" && /37010/.test(file + title) && !/quiet/.test(file + title)) s -= 20;
      if (family === "shore" && /13-charging|charg|battery|cristec|electrical|shore/.test(file + title)) s += 30;
      if (family === "electrical" && /04-electrical|13-charging|battery|electrical|charg|wiring/.test(file + title))
        s += 30;
      if (family === "zipwake" && /trim|zipwake/.test(file + title)) s += 25;
      if (family === "anchor" && /ground-tackle|anchor|rode/.test(file + title)) s += 25;
      if (breakerAsk && /high-current|187|80\s*a|windlass-breaker|04-electrical/.test(file + title + body.slice(0, 240)))
        s += 70;
      if (breakerAsk && /how deep|scope vs rode/.test(title + body.slice(0, 120))) s -= 80;
      if (isJunkSummaryText(firstUsefulParagraph(body) || body.slice(0, 80))) s -= 30;
      return s;
    };
    return score(b) - score(a);
  });
  return (
    (intent === "visual" && passages.find((p) => p.kind === "evidence")) ||
    ranked[0] ||
    passages[0]
  );
}

function stepsTitleFor(intent, isFault) {
  if (isFault) return "Do this";
  if (intent === "howto") return "How to";
  if (intent === "where") return "Where to look";
  return "Key points";
}

function relatedManuals(bundle, family, passages, q) {
  const manuals = bundle.manuals || [];
  const ql = (q || "").toLowerCase();
  const passageBlob = passages.map((p) => `${p.file} ${p.title}`).join(" ").toLowerCase();

  const familyMatch = (n) => {
    if (family === "audio") return /fusion|ra70|ra210/.test(n);
    if (family === "garmin") return /garmin/.test(n);
    if (family === "fuel" || family === "start") return /verado|mercury.*operation/.test(n);
    if (family === "steer") return /steering|ephs|electric-steering/.test(n);
    if (family === "shore" || family === "electrical") return /cristec|ypower/.test(n);
    if (family === "anchor") return /lewmar|windlass/.test(n);
    if (family === "zipwake") return /zipwake/.test(n);
    if (family === "thruster") return /side-power|sleipner/.test(n);
    if (family === "pump") return /flojet|jabsco|par-max/.test(n) && !/toilet|quiet-flush|37010|37055/.test(n);
    if (family === "toilet") return /toilet|quiet-flush|37010|37055|jabsco.*flush/.test(n) || (/jabsco/.test(n) && /toilet|quiet|37010|37055/.test(n));
    if (family === "fridge") return /isotherm|fridge|cruise|coolmatic|vitrifrigo/.test(n);
    return false;
  };

  const scored = manuals
    .map((m) => {
      const n = (m.name + m.file).toLowerCase();
      let s = 0;
      const famHit = family && familyMatch(n);
      if (famHit) s += 50;
      const base = (m.name || "").replace(/\.pdf$/i, "").toLowerCase();
      if (passageBlob.includes(base.slice(0, 18))) s += 20;
      for (const tok of tokenize(q)) {
        if (tok.length < 5) continue;
        if (n.includes(tok)) s += 6;
      }
      if (/mastervolt|lenco/.test(n) && !/mastervolt|lenco/.test(ql + passageBlob)) s -= 50;
      if (family === "toilet" && /37010/.test(n) && !/quiet-flush|37055/.test(n)) s -= 15;
      if (family === "toilet" && /quiet-flush|37055/.test(n)) s += 20;
      // When we know the equipment family, stay on that OEM set
      if (family && !famHit) s = 0;
      return { ...m, score: s };
    })
    .filter((m) => m.score >= 20)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 5);
}

function composeInfoSummary(primary, passages, family) {
  const clean = (s) =>
    String(s || "")
      .replace(/^\*\*Short answer:\*\*\s*/i, "")
      .replace(/^Short answer:\s*/i, "")
      .replace(/\s+/g, " ")
      .trim();
  const bits = [];
  if (primary) {
    const short = extractShort(stripHeading(primary.text));
    if (short && !isJunkSummaryText(short)) bits.push(clean(short));
    else {
      const para = firstUsefulParagraph(primary.text);
      if (para) bits.push(clean(para));
    }
  }
  // Prefer a second *Short answer* from another chapter when available
  for (const p of passages) {
    if (primary && p.file === primary.file && p.title === primary.title) continue;
    if (p.kind === "evidence") continue;
    if (/diagrams\//.test(p.file || "")) continue;
    const short = extractShort(stripHeading(p.text));
    if (!short || isJunkSummaryText(short)) continue;
    const nugget = clean(short);
    if (!nugget || nugget.length < 50) continue;
    if (bits[0] && nugget.slice(0, 60) === bits[0].slice(0, 60)) continue;
    // Skip near-duplicate system blurbs
    if (bits[0] && bits[0].length > 100) {
      const a = bits[0].toLowerCase();
      const b = nugget.toLowerCase();
      if (/cristec/.test(a) && /cristec/.test(b) && /house/.test(a) && /house/.test(b)) continue;
    }
    bits.push(nugget);
    break;
  }
  let summary = bits.filter(Boolean).join(" ");
  if (summary.length > 750) summary = summary.slice(0, 747) + "…";
  if (!summary) {
    const label = family || "system";
    summary = `Here’s how the ${label} side of this Flyer 8 is set up on HIN BEYFT208F223, drawn from the binder and matching OEM extracts — see Details and linked sources for the full picture.`;
  }
  return summary;
}

function composeDetails(passages, intent, info) {
  const limit = info ? 6 : 4;
  const sliceLen = info ? 2200 : 1400;
  const parts = [];
  for (const p of passages.slice(0, limit)) {
    if (p.kind === "evidence" && intent !== "visual") continue;
    const body = stripHeading(p.text);
    if (body.length < 60) continue;
    const kindLabel = p.kind === "manual" ? "OEM extract" : p.kind === "note" ? "Binder note" : p.kind || "Source";
    parts.push(`**${p.title}** — ${kindLabel} · \`${p.file}\`\n\n${body.slice(0, sliceLen)}`);
  }
  return parts.join("\n\n---\n\n");
}

function keyPointsFromPassages(passages, limit = 8) {
  const points = [];
  const seen = new Set();
  const add = (line) => {
    const norm = String(line || "")
      .replace(/^\*\*Short answer:\*\*\s*/i, "")
      .replace(/^Short answer:\s*/i, "")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\*\*/g, "");
    if (norm.length < 20 || norm.length > 240) return;
    if (isJunkSummaryText(norm)) return;
    if (/^[┌│└]/.test(norm) || /^```/.test(norm)) return;
    if (/^see\s+\[/i.test(norm)) return;
    if (/^location:/i.test(norm)) return;
    if (/^`?manuals\//i.test(norm)) return;
    if (/walk-around clear|bilge ok|no fuel odor/i.test(norm)) return;
    if (/^these often have breakers/i.test(norm)) return;
    if (/^leds:/i.test(norm)) return;
    if (/^confirmed adjacent/i.test(norm)) return;
    if (/^\d+\.\s+\d+\s+[A-Z]/.test(norm)) return; // OEM page dumps like "24 1 PRECAUTIONS"
    const key = norm.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    points.push(norm);
  };
  // Prefer chapter notes with short answers / bullets first
  const ordered = [...passages].sort((a, b) => {
    const af = /chapters\//.test(a.file || "") ? 1 : 0;
    const bf = /chapters\//.test(b.file || "") ? 1 : 0;
    return bf - af;
  });
  for (const p of ordered) {
    if (p.kind === "evidence") continue;
    if (p.kind === "manual") continue; // OEM page dumps are for Details, not key bullets
    if (/diagrams\/|retrieval-index|extracts\//.test(p.file || "")) continue;
    const body = stripHeading(p.text);
    const short = extractShort(body);
    if (short) add(short);
    for (const b of extractBullets(body, 4)) {
      if (/^location:/i.test(b) || /^see\s+\[/i.test(b)) continue;
      add(b);
    }
    if (points.length >= limit) break;
  }
  if (points.length < 3) {
    for (const p of ordered) {
      if (p.kind === "evidence" || p.kind === "manual") continue;
      if (/diagrams\/|extracts\//.test(p.file || "")) continue;
      const para = firstUsefulParagraph(p.text);
      if (para) add(para.length > 180 ? para.slice(0, 177) + "…" : para);
      if (points.length >= limit) break;
    }
  }
  return points.slice(0, limit);
}

/**
 * Structured free answer (no LLM).
 * @param {object} bundle
 * @param {string} question
 * @param {object|null} mediaIndex
 * @param {object|null} figuresIndex
 */
export function answerStructured(bundle, question, mediaIndex = null, figuresIndex = null) {
  const q = (question || "").trim();
  if (!q) {
    return {
      mode: "free",
      summary: "Ask a question about this Flyer 8 — systems, how they work, faults, how-tos, or what something looks like.",
      steps: [],
      stepsTitle: "Key points",
      details: "",
      warnings: [],
      unknowns: [],
      evidence: [],
      figures: [],
      sources: [],
      manuals: [],
      confidence: "low",
    };
  }

  const intent = classifyIntent(q);
  const raw = tokenize(q);
  const family = familyOf(q, raw);
  const info = isInformational(intent, q);
  const passages = retrievePassages(bundle, q, { limit: info ? 16 : 14 });
  const playbooks = parsePlaybooks(bundle.playbooksRaw);
  const pb = bestPlaybook(q, playbooks, topics(raw, expand(raw)), family);
  const isFault = Boolean(pb) || intent === "troubleshoot" || failSignal(q);
  const evidence = matchEvidence(mediaIndex, q, passages);
  const figures = matchFigures(figuresIndex, q, passages, { limit: 6 });

  const steps = [];
  if (pb?.safety?.length) steps.push(...pb.safety.map((s) => `Safety: ${s}`));
  if (pb?.steps?.length) steps.push(...pb.steps);

  let details = composeDetails(passages, intent, info);

  const primary = pickPrimaryPassage(passages, intent, family, q);

  let summary = "";
  if (isFault && pb?.steps?.length) {
    summary = `You’re looking at a ${family || "system"} issue on this Flyer 8${
      pb.om_section ? ` (${pb.om_section})` : ""
    }. I’d run the checks below in order — they combine the vessel playbook with what we know is actually installed on HIN BEYFT208F223.`;
  }

  if (info) {
    summary = composeInfoSummary(primary, passages, family);
    if (!steps.length) steps.push(...keyPointsFromPassages(passages, intent === "howto" ? 8 : 7));
  } else if (primary) {
    const body = stripHeading(primary.text);
    const short = extractShort(body);
    if (!summary) {
      summary = short
        ? short
        : `Here’s the best read from the binder on that: ${body.split(/\n\n/)[0].replace(/\s+/g, " ").slice(0, 380)}`;
    }
    if (/^\s*\d+\.\s+/.test(summary) && pb?.steps?.length) {
      summary = `You’re looking at a ${family || "system"} issue on this Flyer 8${
        pb.om_section ? ` (${pb.om_section})` : ""
      }. I’d run the checks below in order — vessel-specific first, then OEM procedure detail.`;
    }
    if (!details) details = body;
    if (!steps.length) {
      const fromNote = extractSteps(body);
      if (fromNote.length) steps.push(...fromNote);
    }
  } else if (pb && !summary) {
    summary = `Follow the ${pb.id} tree for this symptom — it’s written against the gear confirmed on this hull.`;
  } else if (!summary) {
    summary =
      "I don’t have a strong binder match yet. Name the system (Fusion, Garmin, Zipwake, fuel filter, windlass, CRISTEC, HOUSE/ENGINE banks) or paste any alarm text / fuse ID you see.";
  }

  // Fuse shortcuts
  if (/\bfuse\b/i.test(q) && /garmin|mfd/i.test(q)) {
    summary = "Garmin MFD fuse: Blue Sea **HDS · 5 A** (label says HDS; the display is Garmin).";
  }
  if (/\bfuse\b/i.test(q) && /stereo|fusion|audio/i.test(q)) {
    summary = "Stereo fuse: Blue Sea **AN4 · 10 A**.";
  }

  const warnings = [];
  if (/fuel|separator|battery|shore|rcd|ac\b|115/i.test(q)) {
    warnings.push("Key off / isolate power before opening fuel or AC panels when the binder says to.");
  }

  const unknowns = [];
  if (/anchor|rode|scope|deep/i.test(q) && /UNVERIFIED|not yet have a measured rode/i.test(details + summary)) {
    unknowns.push("Measure total chain + rope length on board to get a boat-specific max anchoring depth.");
  }

  const manuals = relatedManuals(bundle, family, passages, q);

  const sources = [];
  if (pb) sources.push({ title: `Playbook ${pb.id}`, file: "owners-manual/llm/symptom-playbooks.yaml" });
  for (const p of passages.slice(0, info ? 7 : 5)) {
    sources.push({ title: p.title, file: p.file, kind: p.kind });
  }

  const detailCap = info ? 7500 : 4500;
  return {
    mode: "free",
    summary,
    steps: steps.slice(0, 12),
    stepsTitle: stepsTitleFor(intent, isFault),
    details: details.length > detailCap ? details.slice(0, detailCap) + "\n\n…" : details,
    warnings,
    unknowns,
    evidence,
    figures,
    sources,
    manuals,
    confidence: steps.length >= 3 || summary.length > 80 ? "high" : "medium",
    intent,
    family,
    vessel: bundle.vessel,
  };
}

export function buildLlmMessages(bundle, question, passages, evidence, figures) {
  const intent = classifyIntent(question);
  const info = isInformational(intent, question);
  const system =
    (bundle.systemPrompt || "").trim() +
    `

Return ONLY valid JSON with this shape:
{
  "summary": "conversational paragraph — answer like talking to a fellow engineer",
  "steps": ["ordered how-to, key facts, or diagnostic steps — match the question type"],
  "stepsTitle": "Do this | How to | Key points | Where to look",
  "details": "deep multi-source synthesis in markdown: how the system works on THIS boat, cross-system interactions, OEM context, what good looks like",
  "warnings": ["safety / energy isolation notes — omit if not relevant"],
  "unknowns": ["UNVERIFIED on this HIN + what to measure/photograph"],
  "evidenceIds": ["boat photo evidence card ids that help"],
  "figureIds": ["OEM manual figure ids that help"],
  "manualRefs": ["OEM PDF filenames to open"]
}
No prose outside JSON.

Intent for this question: ${intent}${info ? " (informational — teach/explain the system; do NOT force a fault tree)" : " (problem-solving — diagnose and check)"}.
Be detailed in details (several short sections is fine). Keep summary human and accurate. Cite binder paths in backticks so the UI can link them.`;

  const ctx = passages
    .map((p, i) => `[${i + 1}] (${p.kind || "note"}) ${p.file} · ${p.title}\n${String(p.text || "").slice(0, info ? 2600 : 2000)}`)
    .join("\n\n");

  const ev = (evidence || [])
    .map((e) => `- id:${e.id} · ${e.title}: ${e.summary}`)
    .join("\n");

  const figs = (figures || [])
    .map(
      (f) =>
        `- id:${f.id} · p.${f.page} · ${f.manualName}: ${f.caption} [topics: ${(f.topics || []).join(", ")}]`
    )
    .join("\n");

  const user = info
    ? `Vessel: ${bundle.vessel?.name} · HIN ${bundle.vessel?.hin} · ${bundle.vessel?.engine}

The owner is an engineer asking for accurate system knowledge — not necessarily a repair. Synthesize a clear, detailed picture of how this works on THIS hull. Use multiple binder/OEM sources. Do not invent a troubleshooting checklist unless the question is about a fault.

Question: ${question}

Boat photo evidence cards:
${ev || "(none matched)"}

OEM manual figures available (pick relevant figureIds):
${figs || "(none matched)"}

Binder / extract excerpts:
${ctx || "(none)"}`
    : `Vessel: ${bundle.vessel?.name} · HIN ${bundle.vessel?.hin} · ${bundle.vessel?.engine}

The owner is an engineer. Give the full picture — not a single-manual paraphrase. Tie vessel-confirmed facts to OEM procedure.

Question: ${question}

Boat photo evidence cards:
${ev || "(none matched)"}

OEM manual figures available (pick relevant figureIds):
${figs || "(none matched)"}

Binder / extract excerpts:
${ctx || "(none)"}`;

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}
