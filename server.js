// ===============================
// Telegram Mini App Universal Server
// Works on Railway, Render, Vercel Server, VPS, Heroku
// ===============================

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

const CLIENT_DIST = path.join(__dirname, "dist");

if (!fs.existsSync(CLIENT_DIST)) {
  throw new Error(
    `Could not find the build directory: ${CLIENT_DIST}, make sure to build the client first`,
  );
}

// Serve static files - let Express handle MIME types and compression automatically
app.use(express.static(CLIENT_DIST, {
  etag: true,
  lastModified: true,
  index: 'index.html'
}));

// Fallback to index.html for client-side routing (React Router)
app.get("*", (_req, res) => {
  res.sendFile(path.resolve(CLIENT_DIST, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server started on http://localhost:${PORT}`);
});
