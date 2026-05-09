// Generates a .eml file Blob from email HTML + metadata.
(function () {
  function pad(n) { return String(n).padStart(2, "0"); }
  function rfc2822Date(d) {
    const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const tz = -d.getTimezoneOffset();
    const sign = tz >= 0 ? "+" : "-";
    const abs = Math.abs(tz);
    return `${days[d.getDay()]}, ${pad(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${sign}${pad(Math.floor(abs/60))}${pad(abs%60)}`;
  }

  // RFC 2047 "Q" encoding for non-ASCII subject characters.
  function encodeSubject(s) {
    if (/^[\x20-\x7e]*$/.test(s)) return s;
    const encoded = s.replace(/[^\x20-\x7e]/g, (c) => {
      const bytes = new TextEncoder().encode(c);
      let out = "";
      for (const b of bytes) out += "=" + b.toString(16).toUpperCase().padStart(2, "0");
      return out;
    }).replace(/ /g, "_").replace(/\?/g, "=3F").replace(/=/g, (m, i, str) => str[i] === "=" && /[0-9A-F]/.test(str[i+1]) ? "=" : "=3D");
    return `=?UTF-8?Q?${encoded}?=`;
  }

  function utf8Base64(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = "";
    for (const b of bytes) bin += String.fromCharCode(b);
    const b64 = btoa(bin);
    // wrap at 76 chars per RFC 2045
    return b64.match(/.{1,76}/g).join("\r\n");
  }

  function buildEml({ subject, from, to, html, date }) {
    const d = date || new Date();
    const headers = [
      "MIME-Version: 1.0",
      `Date: ${rfc2822Date(d)}`,
      `From: ${from || "ClearPath Capital <weekly@clearpathcapital.com>"}`,
      `To: ${to || ""}`,
      `Subject: ${encodeSubject(subject || "Weekly Market Update")}`,
      "X-Unsent: 1",
      'Content-Type: text/html; charset="UTF-8"',
      "Content-Transfer-Encoding: base64",
    ].join("\r\n");
    const body = utf8Base64(html);
    return headers + "\r\n\r\n" + body + "\r\n";
  }

  function downloadEml(filename, content) {
    const blob = new Blob([content], { type: "message/rfc822" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.endsWith(".eml") ? filename : filename + ".eml";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 100);
  }

  window.buildEml = buildEml;
  window.downloadEml = downloadEml;
})();
