import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import { createHmac } from "crypto";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(join(__dirname, "public")));

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.post("/api/claude", async (req, res) => {
  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "prompt is required" });
  }
  try {
    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });
    const text = msg.content.map(b => b.text || "").join("");
    res.json({ text });
  } catch (e) {
    console.error("Claude API error:", e);
    res.status(500).json({ error: String(e.message || e) });
  }
});

// ─── WhatsApp inbound messages (in-memory; resets on restart) ─────────────────
const waMessages = [];
let waNextId = 1;

function validateTwilioSignature(req) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) return true; // dev: skip when token not set
  const sig = req.headers["x-twilio-signature"];
  if (!sig) return false;
  const proto = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.headers["x-forwarded-host"] || req.get("host");
  const url = `${proto}://${host}${req.originalUrl}`;
  const params = req.body || {};
  const paramStr = Object.keys(params).sort().reduce((s, k) => s + k + params[k], "");
  const expected = createHmac("sha1", authToken).update(url + paramStr, "utf8").digest("base64");
  return expected === sig;
}

app.post("/webhook/whatsapp", (req, res) => {
  if (!validateTwilioSignature(req)) {
    console.warn("WhatsApp webhook: invalid Twilio signature — rejected");
    return res.status(403).send("Forbidden");
  }
  const { From, Body, MessageSid, NumMedia } = req.body || {};
  const msg = {
    id: waNextId++,
    sid: MessageSid || null,
    from: (From || "unknown").replace(/^whatsapp:/, ""),
    body: Body || "",
    numMedia: parseInt(NumMedia || "0", 10),
    receivedAt: new Date().toISOString(),
  };
  waMessages.unshift(msg);
  if (waMessages.length > 200) waMessages.length = 200;
  console.log(`WhatsApp from ${msg.from}: ${msg.body}`);
  res.set("Content-Type", "text/xml");
  res.send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
});

app.get("/api/whatsapp/messages", (_req, res) => {
  res.json({ messages: waMessages });
});

app.delete("/api/whatsapp/messages/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = waMessages.findIndex((m) => m.id === id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  waMessages.splice(idx, 1);
  res.json({ ok: true });
});
// ──────────────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Weekly Update Builder running at http://localhost:${PORT}`);
  console.log(`ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? "set ✓" : "NOT SET — AI features will fail"}`);
});
