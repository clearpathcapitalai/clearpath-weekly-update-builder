// Wires the frontend to the server-side Claude proxy at /api/claude.
// Loaded before app.jsx so window.cpBackend.complete is available on startup.
(function () {
  window.cpBackend = {
    async complete(prompt) {
      const r = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!r.ok) {
        let msg = "Claude proxy error " + r.status;
        try { const j = await r.json(); msg = j.error || msg; } catch {}
        throw new Error(msg);
      }
      const j = await r.json();
      return j.text;
    },
  };
})();
