// ===============================
// Telegram Mini App Universal Server
// Works on Railway, Render, Vercel Server, VPS, Heroku
// ===============================

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000; // Default 5000 for Replit, use PORT env for other platforms

// Path to frontend build folder
const CLIENT_DIST = path.join(__dirname, "client", "dist");

// Serve static files with FIXED MIME types
app.use(express.static(CLIENT_DIST, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith(".js")) {
      res.setHeader("Content-Type", "application/javascript; charset=utf-8");
    }
    if (filePath.endsWith(".css")) {
      res.setHeader("Content-Type", "text/css; charset=utf-8");
    }
  }
}));

// SPA fallback routing (important!)
app.get("*", (req, res) => {
  res.sendFile(path.join(CLIENT_DIST, "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server started on http://localhost:${PORT}`);
});
