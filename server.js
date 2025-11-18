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

const CLIENT_DIST = path.join(__dirname, "dist", "public");

if (!fs.existsSync(CLIENT_DIST)) {
  throw new Error(
    `Could not find the build directory: ${CLIENT_DIST}, make sure to build the client first`,
  );
}

app.use((req, res, next) => {
  const filePath = path.join(CLIENT_DIST, req.path);
  const ext = path.extname(filePath).toLowerCase();
  
  if (ext === '.js' || ext === '.mjs') {
    res.type('application/javascript');
  } else if (ext === '.css') {
    res.type('text/css');
  } else if (ext === '.json') {
    res.type('application/json');
  } else if (ext === '.svg') {
    res.type('image/svg+xml');
  } else if (ext === '.woff') {
    res.type('font/woff');
  } else if (ext === '.woff2') {
    res.type('font/woff2');
  } else if (ext === '.html') {
    res.type('text/html');
  }
  
  next();
});

app.use('/assets', express.static(path.join(CLIENT_DIST, 'assets'), {
  maxAge: '1y',
  immutable: true,
  etag: true,
  lastModified: true,
  setHeaders: (res, filepath) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
}));

app.use(express.static(CLIENT_DIST, {
  maxAge: '1h',
  etag: true,
  lastModified: true,
  setHeaders: (res, filepath) => {
    if (filepath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

app.use("*", (_req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Clear-Site-Data', '"cache", "storage"');
  res.sendFile(path.resolve(CLIENT_DIST, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server started on http://localhost:${PORT}`);
});
