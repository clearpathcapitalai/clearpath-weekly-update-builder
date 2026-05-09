// Renders the ClearPath Weekly Update email — matches the May 8, 2026 template
// exactly (Markets at a Glance, 4-column metrics, Spotlight 2-card, etc.).
//
// Public: window.renderWeeklyEmail(data) -> HTML string.

(function () {
  const ARIAL = "Arial,sans-serif,serif,EmojiFont";
  const GEORGIA = "Georgia,serif,serif,EmojiFont";

  // tones -> color for big numbers
  const TONE = {
    up:      "rgb(26,122,60)",
    down:    "rgb(192,57,43)",
    neutral: "rgb(34,34,34)",
    gold:    "rgb(184,156,87)",
  };

  // chip palettes (background + ink) for tag rows above paragraph cards
  const CHIP = {
    up:      { bg: "rgb(230,244,236)", color: "rgb(26,122,60)" },
    down:    { bg: "rgb(255,245,242)", color: "rgb(192,57,43)" },
    neutral: { bg: "whitesmoke",       color: "rgb(102,102,102)" },
    warn:    { bg: "rgb(255,238,225)", color: "rgb(178,93,30)" },
    info:    { bg: "rgb(247,250,255)", color: "rgb(26,95,168)" },
  };

  const esc = (s) => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // Allow [b]...[/b] inline bold inside body strings.
  const inline = (s) => esc(s).replace(/\[b\]([^\[]+)\[\/b\]/g, "<b>$1</b>");

  function metricCard(m, big = true) {
    const color = TONE[m.tone] || TONE.up;
    const size = big ? "18pt" : "13.5pt";
    const lh = big ? "27.6px" : "20.7px";
    return `
<p style="margin-top:1em;margin-bottom:1em;line-height:17.25px"><span style="font-family:${ARIAL};font-size:8.5pt;color:rgb(110,110,110);line-height:13.0333px">${esc(m.label)}</span></p>
<p style="margin-top:3pt;margin-bottom:1em;line-height:17.25px"><span style="font-family:${GEORGIA};font-size:${size};color:${color};line-height:${lh}"><b>${esc(m.value || "—")}</b></span></p>
<p style="margin-top:2.25pt;margin-bottom:1em;line-height:17.25px"><span style="font-family:${ARIAL};font-size:8.5pt;color:${m.subTone ? (TONE[m.subTone] || "rgb(110,110,110)") : "rgb(110,110,110)"};line-height:13.0333px">${esc(m.sub || "")}</span></p>`;
  }

  function chipTag(text, tone) {
    const c = CHIP[tone] || CHIP.neutral;
    return `
<table cellspacing="0" cellpadding="0" border="0"><tbody><tr>
  <td style="background-color:${c.bg};padding:2.25pt 6.75pt">
    <p style="margin:0;line-height:16.8667px;font-family:Calibri,sans-serif;font-size:11pt"><span style="font-family:${ARIAL};font-size:8.5pt;color:${c.color};line-height:13.0333px"><b>${esc(text)}</b></span></p>
  </td>
</tr></tbody></table>`;
  }

  function paraCard(p) {
    return `
<tr><td style="padding:0in 24pt 7.5pt">
  <table cellspacing="0" cellpadding="0" border="1" style="border:1pt solid rgb(232,232,232);width:556px"><tbody><tr><td style="padding:10.5pt 12pt">
    ${p.tag ? chipTag(p.tag, p.tagTone) : ""}
    <p style="margin:1em 0in 3pt;line-height:17.25px"><span style="font-family:${ARIAL};font-size:10.5pt;color:rgb(34,34,34);line-height:16.1px"><b>${esc(p.subject || "")}</b></span></p>
    <p style="margin-top:1em;margin-bottom:1em;line-height:17.25px"><span style="font-family:${ARIAL};font-size:10pt;color:rgb(85,85,85);line-height:15.3333px">${inline(p.body || "")}</span></p>
  </td></tr></tbody></table>
</td></tr>`;
  }

  function intlRow(r) {
    const color = TONE[r.tone] || TONE.up;
    return `
<tr>
  <td style="padding:8.25pt 12pt"><p style="margin:0;line-height:16.8667px;font-family:Calibri,sans-serif;font-size:11pt"><span style="font-family:${ARIAL};font-size:10pt;color:rgb(51,51,51);line-height:15.3333px">${esc(r.name)}</span></p></td>
  <td style="padding:8.25pt 12pt"><p style="text-align:right;margin:0;line-height:16.8667px;font-family:Calibri,sans-serif;font-size:11pt"><span style="font-family:${ARIAL};font-size:10.5pt;color:${color};line-height:16.1px"><b>${esc(r.value)}</b></span></p></td>
</tr>`;
  }

  function detailCard(c) {
    const lines = (c.lines || []).map(l =>
      `<p style="margin-top:1em;margin-bottom:2.25pt;line-height:17.25px"><span style="font-family:${ARIAL};font-size:10pt;color:rgb(85,85,85);line-height:15.3333px">${inline(l)}</span></p>`
    ).join("");
    return `
<td style="border:1pt solid rgb(232,232,232);padding:10.5pt 12pt;vertical-align:top;width:232.208px">
  <p style="margin-top:1em;margin-bottom:6pt;line-height:17.25px"><span style="font-family:${ARIAL};font-size:10.5pt;color:rgb(34,34,34);line-height:16.1px"><b>${esc(c.title || "")}</b></span></p>
  ${lines}
  ${c.note ? `<p style="margin-top:6pt;margin-bottom:1em;line-height:17.25px"><span style="font-family:${ARIAL};font-size:9pt;color:rgb(136,136,136);line-height:13.8px">${inline(c.note)}</span></p>` : ""}
</td>`;
  }

  function sectionLabel(text) {
    return `
<tr><td style="padding:0.25in 24pt 6pt">
  <p style="margin:1em 0;line-height:17.25px"><span style="letter-spacing:1.15pt;font-family:${ARIAL};font-size:8.5pt;color:rgb(136,136,136);line-height:13.0333px">${esc(text)}</span></p>
</td></tr>`;
  }

  function divider() {
    return `<tr><td style="padding:0in 24pt"><div style="margin:0"><hr align="center" size="2" style="line-height:16.8667px;width:100%"></div></td></tr>`;
  }

  function renderEmail(d) {
    d = d || {};
    const m = d.metrics || {};
    const para = d.paragraphs || {};
    const sig = d.signature || { name: "Nathaniel" };
    const clientLine = (d.client && d.client.name)
      ? `Dear ${esc(d.client.name)},`
      : `Dear ,`;

    const intlRows = (d.intlRows || []).map(intlRow).join("");
    const dCards = d.detailCards || [];

    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>ClearPath Weekly Market Update</title></head>
<body style="margin:0;padding:0;background:#fff">

<div style="font-family:Calibri,Helvetica,sans-serif;font-size:12pt;color:rgb(0,0,0);padding:12pt 0">
${clientLine}
</div>

<div align="center" style="background-color:#fff;margin:0">
<table cellspacing="0" cellpadding="0" border="0" style="background-color:white;width:465pt"><tbody>

<!-- HEADER -->
<tr><td style="background-color:rgb(10,37,64);padding:24pt 27pt 21pt">
  <p style="margin:1em 0;line-height:17.25px"><span style="letter-spacing:1.9pt;font-family:${ARIAL};font-size:8.5pt;color:rgb(184,156,87);line-height:13.0333px">ClearPath Capital Partners</span></p>
  <p style="margin-top:6pt;margin-bottom:1em;line-height:17.25px"><span style="font-family:${GEORGIA};font-size:22.5pt;color:white;line-height:34.5px">Weekly Market Update</span></p>
  <p style="margin-top:4.5pt;margin-bottom:1em;line-height:17.25px"><span style="font-family:${ARIAL};font-size:10pt;color:rgb(160,184,204);line-height:15.3333px">Week ending ${esc(d.weekEnding || "")}</span></p>
</td></tr>

<!-- MARKETS AT A GLANCE label -->
<tr><td style="padding:0.25in 27pt 4.5pt">
  <p style="margin:1em 0;line-height:17.25px"><span style="letter-spacing:0.9pt;font-family:${ARIAL};font-size:8.5pt;color:rgb(120,120,120);line-height:13.0333px">Markets at a Glance &nbsp;&middot;&nbsp; WTD</span></p>
</td></tr>

<!-- ROW 1: 3 columns (S&P, Dow, Nasdaq) -->
<tr><td style="padding:6pt 27pt 4.5pt">
  <table cellspacing="0" cellpadding="0" border="0" style="width:548px"><tbody><tr>
    <td style="padding:4.5pt 6pt 10.5pt 0in;vertical-align:top;width:174.667px">${metricCard(m.sp500 || {label:"S&P 500"})}</td>
    <td style="padding:4.5pt 6pt 10.5pt;vertical-align:top;width:166.667px">${metricCard(m.dow || {label:"Dow Jones"})}</td>
    <td style="padding:4.5pt 0in 10.5pt 6pt;vertical-align:top;width:174.667px">${metricCard(m.nasdaq || {label:"Nasdaq-100"})}</td>
  </tr></tbody></table>
</td></tr>

<!-- ROW 2: 3 columns (EAFE, EM, AGG) -->
<tr><td style="padding:0in 27pt 13.5pt">
  <table cellspacing="0" cellpadding="0" border="0" style="width:548px"><tbody><tr>
    <td style="padding:4.5pt 6pt 4.5pt 0in;vertical-align:top;width:174.667px">${metricCard(m.eafe || {label:"MSCI EAFE"})}</td>
    <td style="padding:4.5pt 6pt;vertical-align:top;width:166.667px">${metricCard(m.em || {label:"MSCI EM"})}</td>
    <td style="padding:4.5pt 0in 4.5pt 6pt;vertical-align:top;width:174.667px">${metricCard(m.agg || {label:"Bloomberg AGG"})}</td>
  </tr></tbody></table>
</td></tr>

<!-- ROW 3: 4-column gray box (10Y, Brent, Gold, BTC) -->
<tr><td style="padding:0in 27pt 16.5pt">
  <table cellspacing="0" cellpadding="0" border="0" style="background-color:rgb(248,248,248);width:548px"><tbody><tr>
    <td style="border-right:1pt solid rgb(232,232,232);padding:10.5pt;vertical-align:top;width:107.667px">${metricCard(m.treasury10y || {label:"10-Yr Treasury", tone:"neutral"}, false)}</td>
    <td style="border-right:1pt solid rgb(232,232,232);padding:10.5pt;vertical-align:top;width:107.667px">${metricCard(m.brent || {label:"Brent Crude", tone:"neutral"}, false)}</td>
    <td style="border-right:1pt solid rgb(232,232,232);padding:10.5pt;vertical-align:top;width:107.667px">${metricCard(m.gold || {label:"Gold", tone:"gold"}, false)}</td>
    <td style="padding:10.5pt;vertical-align:top;width:109px">${metricCard(m.bitcoin || {label:"Bitcoin", tone:"neutral"}, false)}</td>
  </tr></tbody></table>
</td></tr>

${divider()}
${sectionLabel("This Week in Brief")}

<!-- BRIEF -->
<tr><td style="padding:0in 24pt 0.25in">
  <table cellspacing="0" cellpadding="0" border="0" style="width:556px"><tbody><tr>
    <td style="border-left:2.25pt solid rgb(26,95,168);background-color:rgb(247,250,255);padding:9pt 12pt">
      <p style="margin:1em 0;line-height:17.25px"><span style="font-family:${ARIAL};font-size:10.5pt;color:rgb(51,51,51);line-height:16.1px">${inline((para.brief || {}).body || "")}</span></p>
    </td>
  </tr></tbody></table>
</td></tr>

${divider()}
${sectionLabel(d.spotlightLabel || "Spotlight — Beneath the Surface")}
${(d.spotlightOrder || ["spotlight1", "spotlight2"]).map(k => para[k] ? paraCard(para[k]) : "").join("")}

${divider()}
${sectionLabel("Economic Data")}
${(d.economicOrder || ["econ1", "econ2", "econ3"]).map(k => para[k] ? paraCard(para[k]) : "").join("")}

${divider()}
${sectionLabel("International Markets")}

<!-- INTL TABLE -->
<tr><td style="padding:0in 24pt 9pt">
  <table cellspacing="0" cellpadding="0" border="1" style="border:1pt solid rgb(232,232,232);width:556px"><tbody>
    <tr>
      <td style="background-color:rgb(249,249,249);padding:7.5pt 12pt"><p style="margin:0;line-height:16.8667px"><span style="letter-spacing:0.75pt;font-family:${ARIAL};font-size:9pt;color:rgb(136,136,136);line-height:13.8px"><b>Index</b></span></p></td>
      <td style="background-color:rgb(249,249,249);padding:7.5pt 12pt"><p style="text-align:right;margin:0;line-height:16.8667px"><span style="letter-spacing:0.75pt;font-family:${ARIAL};font-size:9pt;color:rgb(136,136,136);line-height:13.8px"><b>Week</b></span></p></td>
    </tr>
    ${intlRows}
  </tbody></table>
</td></tr>

<!-- DETAIL CARDS (2 side-by-side) -->
${dCards.length ? `
<tr><td style="padding:0in 24pt 0.25in">
  <table cellspacing="0" cellpadding="0" border="0" style="width:556px"><tbody><tr>
    ${detailCard(dCards[0] || {})}<td style="padding:0;width:22.2396px"></td>${detailCard(dCards[1] || {})}
  </tr></tbody></table>
</td></tr>` : ""}

</tbody></table>
</div>

<!-- CLOSING -->
<div style="margin:18pt 0 0;font-family:Calibri,Helvetica,sans-serif;font-size:12pt;color:rgb(0,0,0)">${esc(sig.name || "Nathaniel")}</div>

<div style="margin-top:18pt">
  <p style="margin:0"><span style="font-family:Arial,sans-serif;font-size:12pt;color:rgb(50,42,125)"><b>${esc(sig.fullName || "Nathaniel Lane")} </b></span><span style="font-family:Arial,sans-serif;font-size:10pt;color:rgb(50,42,125)"><b>| </b></span><span style="font-family:Arial,sans-serif;font-size:10pt;color:black"><i>${esc(sig.title || "Managing Partner")}</i></span></p>
  <p style="margin:0"><span style="font-family:Arial,sans-serif;font-size:10pt;color:black">${esc(sig.firm || "ClearPath Capital Partners")} &nbsp;|&nbsp; ${esc(sig.address || "80 Willow Road, Menlo Park, CA 94025")}</span></p>
  <p style="margin:0"><span style="font-family:Arial,sans-serif;font-size:10pt;color:black"><b>t</b>&nbsp; ${esc(sig.phone || "415.682.6891")} &nbsp;|&nbsp; <b>w</b>&nbsp; ${esc(sig.web || "www.clearpathcapital.com")}</span></p>
</div>

</body></html>`;
  }

  window.renderWeeklyEmail = renderEmail;
})();
