// Builder UI — left controls, right preview iframe.
// Mounts to #root.

const { useState, useEffect, useMemo, useCallback, useRef } = React;

// ───────────────────────────────────────────────────────── Layout config

const METRIC_KEYS = ["sp500", "dow", "nasdaq", "eafe", "em", "agg", "treasury10y", "brent", "gold", "bitcoin"];
const PARA_KEYS_ORDERED = [
  { key: "brief",      hint: "Lead paragraph (blue accent box)" },
  { key: "spotlight1", hint: "Spotlight card 1" },
  { key: "spotlight2", hint: "Spotlight card 2" },
  { key: "econ1",      hint: "Economic Data — card 1" },
  { key: "econ2",      hint: "Economic Data — card 2" },
  { key: "econ3",      hint: "Economic Data — card 3" },
];

// ───────────────────────────────────────────────────────── Tiny primitives

function Spinner() { return <span className="spinner" />; }
function Section({ title, sub, children }) {
  return (
    <section className="section">
      <header className="section-head">
        <h3>{title}</h3>
        {sub ? <p>{sub}</p> : null}
      </header>
      <div className="section-body">{children}</div>
    </section>
  );
}

// ───────────────────────────────────────────────────────── Metric card

function MetricCard({ k, m, weekEnding, onChange, onRefreshed, busy }) {
  const [open, setOpen] = useState(false);
  const [localBusy, setLocalBusy] = useState(false);
  const [err, setErr] = useState(null);

  const set = (patch) => onChange(k, { ...m, ...patch });

  const onRefresh = async () => {
    setErr(null); setLocalBusy(true);
    try {
      const out = await window.cpResearch.refreshMetric({
        label: m.label, currentValue: m.value, currentSub: m.sub,
        source: m.source, weekEnding,
      });
      onRefreshed(k, out);
    } catch (e) { setErr(e.message || String(e)); }
    finally { setLocalBusy(false); }
  };

  return (
    <div className={`metric ${m.locked ? "locked" : ""}`}>
      <div className="metric-head" onClick={() => setOpen(o => !o)}>
        <div className="metric-id">
          <div className="metric-label">{m.label}</div>
          <div className={`metric-val tone-${m.tone || "neutral"}`}>{m.value || "—"}</div>
          <div className="metric-sub">{m.sub || ""}</div>
        </div>
        <div className="metric-state">
          {m.locked ? <span className="badge badge-lock">🔒 locked</span>
                    : (m.source ? <span className="badge badge-src">source set</span>
                                : <span className="badge">any source</span>)}
          <span className="caret">{open ? "▾" : "▸"}</span>
        </div>
      </div>
      {open ? (
        <div className="metric-body">
          <div className="row-2">
            <label>
              <span className="lab">Value</span>
              <input className="input sm" value={m.value || ""} onChange={e => set({ value: e.target.value })} />
            </label>
            <label>
              <span className="lab">Sub-line</span>
              <input className="input sm" value={m.sub || ""} onChange={e => set({ sub: e.target.value })} />
            </label>
          </div>
          <div className="row-2">
            <label>
              <span className="lab">Tone (number color)</span>
              <select className="input sm" value={m.tone || "neutral"} onChange={e => set({ tone: e.target.value })}>
                <option value="up">up · green</option>
                <option value="down">down · red</option>
                <option value="neutral">neutral · ink</option>
                <option value="gold">gold</option>
              </select>
            </label>
            <label>
              <span className="lab">Sub-tone</span>
              <select className="input sm" value={m.subTone || ""} onChange={e => set({ subTone: e.target.value })}>
                <option value="">— default gray</option>
                <option value="up">up · green</option>
                <option value="down">down · red</option>
              </select>
            </label>
          </div>
          <label>
            <span className="lab">Source URL or notes (used when auto-fetching)</span>
            <textarea className="input sm" rows={2} placeholder="Paste a URL or quick notes (blank = any source)"
              value={m.source || ""} onChange={e => set({ source: e.target.value })} disabled={m.locked} />
          </label>
          <div className="row-actions">
            <label className="lock-toggle">
              <input type="checkbox" checked={!!m.locked} onChange={e => set({ locked: e.target.checked })} />
              <span>Lock — never auto-fetch</span>
            </label>
            <button type="button" className="btn-ghost btn-sm" disabled={localBusy || busy || m.locked} onClick={onRefresh}>
              {localBusy ? <Spinner /> : null} Auto-fetch
            </button>
          </div>
          {err ? <div className="status status-error">{err}</div> : null}
        </div>
      ) : null}
    </div>
  );
}

// ───────────────────────────────────────────────────────── Paragraph slot

function ParaCard({ k, p, weekEnding, focus, hint, onChange, onRegened, busy }) {
  const [open, setOpen] = useState(k === "brief");
  const [localBusy, setLocalBusy] = useState(false);
  const [err, setErr] = useState(null);

  const set = (patch) => onChange(k, { ...p, ...patch });

  const onRun = async () => {
    setErr(null); setLocalBusy(true);
    try {
      const out = await window.cpResearch.regenParagraph({
        mode: p.mode || "auto", subject: p.subject, currentBody: p.body,
        source: p.source, weekEnding, focus, slotHint: hint,
      });
      onRegened(k, {
        subject: out.subject || p.subject,
        body: out.body || p.body,
        tag: (out.tag !== undefined) ? out.tag : p.tag,
        tagTone: out.tagTone || p.tagTone,
      });
    } catch (e) { setErr(e.message || String(e)); }
    finally { setLocalBusy(false); }
  };

  const mode = p.mode || "auto";

  return (
    <div className={`para mode-${mode}`}>
      <div className="para-head" onClick={() => setOpen(o => !o)}>
        <div className="para-id">
          <div className="para-label">{p.subject || <em className="muted">(no subject)</em>}</div>
          <div className="para-hint">{hint}</div>
        </div>
        <div className="para-state">
          <span className={`badge mode-${mode}`}>{mode}</span>
          <span className="caret">{open ? "▾" : "▸"}</span>
        </div>
      </div>
      {open ? (
        <div className="para-body">
          {k !== "brief" ? (
            <div className="row-2">
              <label>
                <span className="lab">Tag (chip above subject)</span>
                <input className="input sm" value={p.tag || ""} onChange={e => set({ tag: e.target.value })}
                  placeholder="↑ Beat expectations" />
              </label>
              <label>
                <span className="lab">Tag tone</span>
                <select className="input sm" value={p.tagTone || "neutral"} onChange={e => set({ tagTone: e.target.value })}>
                  <option value="up">up · green</option>
                  <option value="down">down · red</option>
                  <option value="warn">warn · orange</option>
                  <option value="neutral">neutral · gray</option>
                  <option value="info">info · blue</option>
                </select>
              </label>
            </div>
          ) : null}

          <label>
            <span className="lab">Subject</span>
            <input className="input sm" value={p.subject || ""} onChange={e => set({ subject: e.target.value })}
              disabled={mode === "newSubject"}
              placeholder={mode === "newSubject" ? "(Claude will write a fresh subject)" : ""} />
          </label>

          <label>
            <span className="lab">Mode</span>
            <select className="input sm" value={mode} onChange={e => set({ mode: e.target.value })}>
              <option value="auto">Auto-generate (with subject + source)</option>
              <option value="regenerate">Regenerate same subject, current-week info</option>
              <option value="manual">Write it manually</option>
              <option value="newSubject">Auto: pick a fresh subject + body</option>
            </select>
          </label>

          {mode !== "manual" ? (
            <label>
              <span className="lab">Source URL or notes (blank = any source)</span>
              <textarea className="input sm" rows={2}
                placeholder="Paste a URL, headline, or pasted notes…"
                value={p.source || ""} onChange={e => set({ source: e.target.value })} />
            </label>
          ) : null}

          <label>
            <span className="lab">Body {mode !== "manual" ? <em className="muted">(editable; use [b]...[/b] for bold)</em> : null}</span>
            <textarea className="input" rows={5} value={p.body || ""} onChange={e => set({ body: e.target.value })} />
          </label>

          <div className="row-actions">
            <button type="button" className="btn-ghost btn-sm" disabled={localBusy || busy || mode === "manual"} onClick={onRun}>
              {localBusy ? <Spinner /> : null}
              {mode === "regenerate" ? "Regenerate body" : mode === "newSubject" ? "Generate fresh card" : "Generate body"}
            </button>
          </div>
          {err ? <div className="status status-error">{err}</div> : null}
        </div>
      ) : null}
    </div>
  );
}

// ───────────────────────────────────────────────────────── App

function App() {
  const last = window.cpHistory.getLast();
  const seed = window.cpSeed();
  const bootData = (() => {
    const d = last?.data;
    if (!d || !d.metrics || !d.paragraphs) return seed;
    return {
      ...seed,
      ...d,
      metrics: { ...seed.metrics, ...(d.metrics || {}) },
      paragraphs: { ...seed.paragraphs, ...(d.paragraphs || {}) },
      signature: { ...seed.signature, ...(d.signature || {}) },
      client: { ...seed.client, ...(d.client || {}) },
    };
  })();
  const [data, setData] = useState(bootData);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState(window.cpHistory.read());
  const [repeatPrev, setRepeatPrev] = useState(false);
  const [focus, setFocus] = useState(last?.focus || "");

  const html = useMemo(() => window.renderWeeklyEmail(data), [data]);

  useEffect(() => {
    window.cpHistory.setLast({ data, focus });
  }, [data, focus]);

  const setField = (path, value) => setData(d => {
    const next = JSON.parse(JSON.stringify(d));
    let cur = next;
    for (let i = 0; i < path.length - 1; i++) cur = cur[path[i]];
    cur[path[path.length - 1]] = value;
    return next;
  });

  const onMetricChange = (k, m) => setData(d => ({ ...d, metrics: { ...d.metrics, [k]: m } }));
  const onMetricRefreshed = (k, out) => setData(d => ({ ...d, metrics: { ...d.metrics, [k]: { ...d.metrics[k], ...out } } }));
  const onParaChange = (k, p) => setData(d => ({ ...d, paragraphs: { ...d.paragraphs, [k]: p } }));
  const onParaRegened = (k, out) => setData(d => ({ ...d, paragraphs: { ...d.paragraphs, [k]: { ...d.paragraphs[k], ...out } } }));

  const onGenerate = useCallback(async () => {
    setBusy(true);
    setStatus({ type: "info", msg: repeatPrev ? "Reusing last week's content…" : "Researching this week…" });
    try {
      if (repeatPrev) {
        const prev = history[0];
        if (!prev) throw new Error("No previous week in history yet.");
        setData({ ...prev.data, weekEnding: data.weekEnding, client: data.client });
        setStatus({ type: "ok", msg: `Restored from ${prev.data.weekEnding}.` });
      } else {
        const out = await window.cpResearch.generateWeek({
          weekEnding: data.weekEnding, focus, repeatPrev: false,
        });
        const merged = { ...out, client: data.client, signature: data.signature, weekEnding: data.weekEnding };
        const lockedMetrics = {};
        for (const k of METRIC_KEYS) {
          if (data.metrics[k]?.locked) lockedMetrics[k] = data.metrics[k];
        }
        merged.metrics = { ...out.metrics, ...lockedMetrics };
        for (const k of METRIC_KEYS) {
          if (!merged.metrics[k]) merged.metrics[k] = data.metrics[k];
          else merged.metrics[k] = { ...data.metrics[k], ...merged.metrics[k] };
        }
        setData(merged);
        setStatus({ type: "ok", msg: "Draft ready. Edit any field, then export." });
      }
    } catch (e) { setStatus({ type: "error", msg: e.message || String(e) }); }
    finally { setBusy(false); }
  }, [repeatPrev, history, focus, data]);

  const onExport = useCallback(() => {
    const subject = `ClearPath Weekly Market Update — Week ending ${data.weekEnding}`;
    const finalHtml = window.renderWeeklyEmail(data);
    const eml = window.buildEml({ subject, html: finalHtml });
    const safeName = `ClearPath_Weekly_${data.weekEnding.replace(/[^A-Za-z0-9]+/g, "_")}.eml`;
    const updated = window.cpHistory.saveEntry({
      createdAt: new Date().toISOString(),
      data, focus, subject, filename: safeName,
    });
    setHistory(updated);
    window.downloadEml(safeName, eml);
    setStatus({ type: "ok", msg: `Exported ${safeName} and saved to history.` });
  }, [data, focus]);

  const onLoadHist = (id) => {
    const item = history.find(h => h.id === id);
    if (!item) return;
    setData(item.data); setFocus(item.focus || "");
    setHistoryOpen(false);
    setStatus({ type: "ok", msg: `Loaded ${item.data.weekEnding}.` });
  };
  const onDelHist = (id) => setHistory(window.cpHistory.deleteEntry(id));
  const onReExport = (id) => {
    const item = history.find(h => h.id === id);
    if (!item) return;
    const html2 = window.renderWeeklyEmail(item.data);
    const eml = window.buildEml({ subject: item.subject, html: html2 });
    window.downloadEml(item.filename, eml);
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" />
          <div>
            <div className="brand-title">Weekly Update Builder</div>
            <div className="brand-sub">ClearPath Capital Partners</div>
          </div>
        </div>
        <div className="top-actions">
          <button type="button" className="btn-ghost" onClick={() => setHistoryOpen(true)}>
            History <span className="count-pill">{history.length}</span>
          </button>
          <button type="button" className="btn-primary" disabled={busy} onClick={onGenerate}>
            {busy ? <Spinner /> : null} {repeatPrev ? "Repeat last week" : "Research & generate all"}
          </button>
          <button type="button" className="btn-accent" onClick={onExport}>Export .eml</button>
        </div>
      </header>

      <div className="layout">
        <aside className="controls">

          <Section title="Greeting & week">
            <div className="row-2">
              <label>
                <span className="lab">Client name (after "Dear")</span>
                <input className="input sm" placeholder="(blank = leave Dear ,)"
                  value={data.client?.name || ""} onChange={e => setField(["client", "name"], e.target.value)} />
              </label>
              <label>
                <span className="lab">Week ending</span>
                <input className="input sm" value={data.weekEnding}
                  onChange={e => setField(["weekEnding"], e.target.value)} />
              </label>
            </div>
            <label>
              <span className="lab">Focus of the week (optional)</span>
              <textarea className="input sm" rows={2} value={focus} onChange={e => setFocus(e.target.value)}
                placeholder="What should the narrative center on?" disabled={repeatPrev} />
            </label>
            <label className="toggle-row">
              <input type="checkbox" checked={repeatPrev} onChange={e => setRepeatPrev(e.target.checked)} />
              <span>Repeat previous week instead of generating new</span>
            </label>
          </Section>

          <Section title="Markets at a Glance" sub="Each metric: type a value, lock it, or auto-fetch from a source.">
            {METRIC_KEYS.map(k => (
              <MetricCard key={k} k={k} m={data.metrics[k]} weekEnding={data.weekEnding}
                onChange={onMetricChange} onRefreshed={onMetricRefreshed} busy={busy} />
            ))}
          </Section>

          <Section title="Paragraphs" sub="For each card: edit subject, choose mode, set source, generate.">
            {PARA_KEYS_ORDERED.map(({ key, hint }) => (
              <ParaCard key={key} k={key} p={data.paragraphs[key] || {}} hint={hint}
                weekEnding={data.weekEnding} focus={focus}
                onChange={onParaChange} onRegened={onParaRegened} busy={busy} />
            ))}
          </Section>

          <Section title="International table" sub="Index name + week descriptor.">
            {(data.intlRows || []).map((r, i) => (
              <div className="row-3" key={i}>
                <input className="input sm" value={r.name}
                  onChange={e => setField(["intlRows", i, "name"], e.target.value)} />
                <input className="input sm" value={r.value}
                  onChange={e => setField(["intlRows", i, "value"], e.target.value)} />
                <select className="input sm" value={r.tone}
                  onChange={e => setField(["intlRows", i, "tone"], e.target.value)}>
                  <option value="up">up</option><option value="down">down</option><option value="neutral">neutral</option>
                </select>
              </div>
            ))}
          </Section>

          <Section title="Detail cards (BoJ / Iran)">
            {(data.detailCards || []).map((c, i) => (
              <div className="detail-edit" key={i}>
                <label><span className="lab">Title</span>
                  <input className="input sm" value={c.title}
                    onChange={e => setField(["detailCards", i, "title"], e.target.value)} /></label>
                <label><span className="lab">Lines (one per line, [b]...[/b] OK)</span>
                  <textarea className="input sm" rows={2} value={(c.lines || []).join("\n")}
                    onChange={e => setField(["detailCards", i, "lines"], e.target.value.split("\n"))} /></label>
                <label><span className="lab">Footnote</span>
                  <textarea className="input sm" rows={2} value={c.note || ""}
                    onChange={e => setField(["detailCards", i, "note"], e.target.value)} /></label>
              </div>
            ))}
          </Section>

          <Section title="Signature">
            <div className="row-2">
              <label><span className="lab">First name (closing)</span>
                <input className="input sm" value={data.signature?.name || ""}
                  onChange={e => setField(["signature", "name"], e.target.value)} /></label>
              <label><span className="lab">Full name</span>
                <input className="input sm" value={data.signature?.fullName || ""}
                  onChange={e => setField(["signature", "fullName"], e.target.value)} /></label>
            </div>
            <div className="row-2">
              <label><span className="lab">Title</span>
                <input className="input sm" value={data.signature?.title || ""}
                  onChange={e => setField(["signature", "title"], e.target.value)} /></label>
              <label><span className="lab">Phone</span>
                <input className="input sm" value={data.signature?.phone || ""}
                  onChange={e => setField(["signature", "phone"], e.target.value)} /></label>
            </div>
          </Section>

          {status ? <div className={`status status-${status.type}`}>{status.msg}</div> : null}
        </aside>

        <main className="preview-wrap">
          <div className="preview-toolbar">
            <span className="preview-label">Preview</span>
            <span className="preview-sub">{data.weekEnding}</span>
          </div>
          <div className="preview-frame-shell">
            <iframe className="preview-iframe" title="Email preview" srcDoc={html} />
          </div>
        </main>
      </div>

      {historyOpen ? (
        <div className="history-overlay" onClick={() => setHistoryOpen(false)}>
          <div className="history-drawer" onClick={e => e.stopPropagation()}>
            <div className="history-head">
              <div>
                <div className="history-title">History</div>
                <div className="history-sub">{history.length} saved · stored locally in this browser</div>
              </div>
              <button type="button" className="btn-ghost btn-sm" onClick={() => setHistoryOpen(false)}>Close</button>
            </div>
            <div className="history-list">
              {history.length === 0 ? (
                <div className="history-empty">No exports yet.</div>
              ) : history.map(item => (
                <div className="history-item" key={item.id}>
                  <div className="history-item-main">
                    <div className="history-item-week">{item.data?.weekEnding}</div>
                    <div className="history-item-meta">
                      Saved {new Date(item.createdAt).toLocaleString()}
                      {item.data?.client?.name ? <> · for <b>{item.data.client.name}</b></> : null}
                    </div>
                  </div>
                  <div className="history-item-actions">
                    <button type="button" className="btn-ghost btn-sm" onClick={() => onLoadHist(item.id)}>Load</button>
                    <button type="button" className="btn-ghost btn-sm" onClick={() => onReExport(item.id)}>Re-export</button>
                    <button type="button" className="btn-ghost btn-sm danger" onClick={() => onDelHist(item.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
