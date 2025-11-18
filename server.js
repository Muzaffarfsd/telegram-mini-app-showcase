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

app.use((req, res, next) => {
  const ext = path.extname(req.path);
  
  if (ext === '.js' || ext === '.mjs') {
    res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  } else if (ext === '.css') {
    res.setHeader("Content-Type", "text/css; charset=utf-8");
  } else if (ext === '.json') {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
  } else if (ext === '.svg') {
    res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
  } else if (ext === '.woff') {
    res.setHeader("Content-Type", "font/woff");
  } else if (ext === '.woff2') {
    res.setHeader("Content-Type", "font/woff2");
  }
  
  if (req.path.endsWith('index.html')) {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  } else if (ext.match(/\.(js|mjs|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)/)) {
    res.setHeader("Cache-Control", "public, max-age=31536000");
  }
  
  next();
});

app.use(express.static(CLIENT_DIST, {
  maxAge: '1y',
  etag: true,
  index: false
}));

app.get("*", (req, res) => {
  res.sendFile(path.join(CLIENT_DIST, "index.html"), {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server started on http://localhost:${PORT}`);
});
