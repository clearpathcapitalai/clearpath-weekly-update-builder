// Research/regeneration helpers — calls window.cpBackend.complete (live server)
// or window.claude.complete (design preview fallback).
//
// Modes per paragraph:
//   "auto"        — generate body for this subject, current week, with optional source
//   "regenerate"  — keep current subject, refresh body from current week info
//   "manual"      — user is writing it; never call Claude
//   "newSubject"  — let Claude pick a fresh subject + body for this slot
//
// Metric refresh: given a label + optional source URL/notes, return {value, sub, tone}.

(function () {
  function complete(prompt) {
    if (window.cpBackend && typeof window.cpBackend.complete === "function") {
      return window.cpBackend.complete(prompt);
    }
    if (window.claude && typeof window.claude.complete === "function") {
      return window.claude.complete(prompt);
    }
    return Promise.reject(new Error("Claude is not available. Make sure ANTHROPIC_API_KEY is set on the server."));
  }

  function extractJson(text) {
    let t = String(text || "").trim();
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "");
    const i1 = t.indexOf("{"), i2 = t.indexOf("[");
    const start = (i1 === -1) ? i2 : (i2 === -1 ? i1 : Math.min(i1, i2));
    if (start === -1) throw new Error("No JSON in response: " + t.slice(0, 200));
    const open = t[start], close = open === "{" ? "}" : "]";
    const end = t.lastIndexOf(close);
    if (end === -1) throw new Error("Unterminated JSON in response.");
    return JSON.parse(t.slice(start, end + 1));
  }

  function srcLine(source) {
    const s = (source || "").trim();
    if (!s) return "Source: any reputable source (your judgment).";
    if (/^https?:\/\//i.test(s)) return `Source URL hint: ${s}`;
    return `Source notes (ground the copy in this):\n${s}`;
  }

  // ─────────────────── Paragraphs ───────────────────
  async function regenParagraph({ mode, subject, currentBody, source, weekEnding, focus, slotHint }) {
    if (mode === "manual") throw new Error("Slot is in manual mode — no AI call.");

    let instruction = "";
    if (mode === "regenerate") {
      instruction = `Keep the SAME subject ("${subject}") and rewrite the body using current-week (${weekEnding}) information. Maintain the existing analytical angle.`;
    } else if (mode === "newSubject") {
      instruction = `Pick a NEW, timely subject for this slot${slotHint ? ` (${slotHint})` : ""} and write the body. Subject should be specific (e.g. "Equities — Headline Records, Cautionary Internals").`;
    } else { // auto
      instruction = subject
        ? `Use the subject "${subject}" and write the body for the week ending ${weekEnding}.`
        : `Write a subject and body for this slot${slotHint ? ` (${slotHint})` : ""} for the week ending ${weekEnding}.`;
    }

    const prompt = `You are drafting one card of ClearPath Capital's weekly market update email.

${instruction}
${focus ? `Week focus: ${focus}` : ""}
${srcLine(source)}

Voice: tight, professional, fiduciary advisor. Use [b]...[/b] inline to bold key figures (e.g. [b]4.43%[/b]). Concrete numbers, named officials, calendar references. Do not invent quotes.

Current body for context (may be empty):
${currentBody ? `"${currentBody}"` : "(none)"}

Return ONLY JSON:
{
  "subject": "card subject (string)",
  "body": "card body text, may include [b]...[/b]",
  "tag": "optional short chip text e.g. '↑ Beat expectations' (omit or empty if not applicable)",
  "tagTone": "up|down|neutral|warn"
}`;
    const raw = await complete(prompt);
    return extractJson(raw);
  }

  // ─────────────────── Metrics ───────────────────
  async function refreshMetric({ label, currentValue, currentSub, source, weekEnding }) {
    const prompt = `You are filling one market-data tile for ClearPath's weekly update (week ending ${weekEnding}).

Tile label: ${label}
Current value: ${currentValue || "(none)"}
Current sub-line: ${currentSub || "(none)"}
${srcLine(source)}

Return ONE JSON object:
{
  "value": "concise headline value (e.g. '+2.33%', '~4.38%', '$100.54')",
  "sub": "one-line context (e.g. '7,398.93 · record', '▼ Off 4.46% peak')",
  "tone": "up|down|neutral|gold"
}
No commentary, no code fences.`;
    const raw = await complete(prompt);
    return extractJson(raw);
  }

  // ─────────────────── Whole-week regen ───────────────────
  async function generateWeek({ weekEnding, focus, repeatPrev, prevData }) {
    if (repeatPrev && prevData) {
      return { ...prevData, weekEnding };
    }
    const schema = `{
  "weekEnding": "string",
  "metrics": {
    "sp500":{"label":"S&P 500","value":"+x.xx%","sub":"...","tone":"up|down|neutral"},
    "dow":{...}, "nasdaq":{...}, "eafe":{...}, "em":{...}, "agg":{...},
    "treasury10y":{"label":"10-Yr Treasury","value":"~x.xx%","sub":"...","tone":"neutral","subTone":"up|down"},
    "brent":{"label":"Brent Crude","value":"$xx","sub":"...","tone":"neutral","subTone":"up|down"},
    "gold":{"label":"Gold","value":"$x,xxx","sub":"...","tone":"gold","subTone":"up|down"},
    "bitcoin":{"label":"Bitcoin","value":"$xx,xxx","sub":"...","tone":"neutral"}
  },
  "spotlightLabel":"Spotlight — ...",
  "paragraphs": {
    "brief":{"subject":"This Week in Brief","body":"...","source":"","mode":"auto"},
    "spotlight1":{"tag":"★ ...","tagTone":"warn","subject":"...","body":"...","source":"","mode":"auto"},
    "spotlight2":{"tag":"...","tagTone":"down","subject":"...","body":"...","source":"","mode":"auto"},
    "econ1":{"tag":"↑ ...","tagTone":"up","subject":"...","body":"...","source":"","mode":"auto"},
    "econ2":{"tag":"...","tagTone":"neutral","subject":"...","body":"...","source":"","mode":"auto"},
    "econ3":{"tag":"...","tagTone":"neutral","subject":"...","body":"...","source":"","mode":"auto"}
  },
  "intlRows":[{"name":"...","value":"...","tone":"up|down|neutral"}],
  "detailCards":[{"title":"...","lines":["..."],"note":"..."},{"title":"...","lines":["..."],"note":"..."}]
}`;
    const prompt = `Draft ClearPath Capital's weekly market update for the week ending ${weekEnding}.
${focus ? `FOCUS:\n${focus}` : "No specific focus — cover the most market-relevant developments."}

Use [b]...[/b] inline for emphasis. Voice: fiduciary advisor; concrete numbers; no invented quotes.

Return ONLY a JSON object matching this schema, no commentary:
${schema}`;
    const raw = await complete(prompt);
    const j = extractJson(raw);
    j.spotlightOrder = ["spotlight1", "spotlight2"];
    j.economicOrder  = ["econ1", "econ2", "econ3"];
    return j;
  }

  window.cpResearch = { regenParagraph, refreshMetric, generateWeek };
})();
