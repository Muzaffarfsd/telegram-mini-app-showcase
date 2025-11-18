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

// Serve static files with proper MIME types
app.use(express.static(CLIENT_DIST, {
  maxAge: '1h',
  etag: true,
  lastModified: true,
  setHeaders: (res, filepath) => {
    // HTML files - no cache
    if (filepath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
    }
    // JavaScript files - correct MIME type
    else if (filepath.endsWith('.js') || filepath.endsWith('.mjs')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    }
    // CSS files
    else if (filepath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    }
    // JSON files
    else if (filepath.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
  }
}));

// Fallback to index.html for client-side routing
app.get("*", (_req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.sendFile(path.resolve(CLIENT_DIST, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server started on http://localhost:${PORT}`);
});
