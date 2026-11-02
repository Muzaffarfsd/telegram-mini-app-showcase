import assert from "node:assert/strict";
import express from "express";
import type { AddressInfo } from "node:net";

// This process deliberately has no provider credential and never contacts an external model.
delete process.env.GEMINI_API_KEY;
delete process.env.WEB4TG_AI_PROVIDER_ENABLED;
const { default: router } = await import("../server/routes/ai");
const app = express();
app.use(express.json());
app.use(router);
const server = app.listen(0, "127.0.0.1");
await new Promise<void>(resolve => server.once("listening", resolve));
const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
const payload = { messages: [{ role: "user", parts: [{ text: "Какая стоимость?" }] }], persona: "alex" };

try {
  for (const path of ["chat", "tts", "followup", "followup/cancel"]) {
    const response = await fetch(`${base}/api/ai/${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    assert.equal(response.status, 503, `${path} must be disabled by default`);
    assert.equal((await response.json()).code, "AI_DISABLED");
  }
  const voices = await fetch(`${base}/api/ai/voices`);
  assert.equal(voices.status, 503);
  process.env.WEB4TG_AI_PROVIDER_ENABLED = "true";
  const response = await fetch(`${base}/api/ai/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const body = await response.text();
  assert.equal(response.status, 200);
  assert.match(body, /"type":"error"/);
  assert.match(body, /"code":"AI_UNAVAILABLE"/);
  assert.doesNotMatch(body, /"type":"chunk"|150\s?000|окупился/);
  console.log("AI endpoints are disabled by default; an unavailable provider returns an error rather than a fabricated answer.");
} finally {
  await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
}
