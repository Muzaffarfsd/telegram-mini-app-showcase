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
const PORT = process.env.PORT || 5000;

const CLIENT_DIST = path.join(__dirname, "dist", "public");

app.use(express.static(CLIENT_DIST, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith(".js")) {
      res.setHeader("Content-Type", "application/javascript; charset=utf-8");
    }
    if (filePath.endsWith(".css")) {
      res.setHeader("Content-Type", "text/css; charset=utf-8");
    }
    if (filePath.endsWith("index.html")) {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    }
    if (filePath.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/)) {
      res.setHeader("Cache-Control", "public, max-age=31536000");
    }
  }
}));

app.get("*", (req, res) => {
  res.sendFile(path.join(CLIENT_DIST, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server started on http://localhost:${PORT}`);
});
