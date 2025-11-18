// ===============================
// Telegram Mini App Universal Server
// Works on Railway, Render, Vercel Server, VPS, Heroku
// ===============================

import express from "express";
import compression from "compression";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Compression middleware (Brotli/Gzip)
app.use(compression({
  level: 6,
  threshold: 1024
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Path to frontend build folder
const CLIENT_DIST = path.join(__dirname, "dist");

// Production caching strategy
if (IS_PRODUCTION) {
  // Static assets (hashed files): cache for 1 year
  app.use('/assets', express.static(path.join(CLIENT_DIST, 'assets'), {
    maxAge: '1y',
    immutable: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript; charset=utf-8");
      } else if (filePath.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css; charset=utf-8");
      }
    }
  }));

  // Other static files: cache for 1 hour
  app.use(express.static(CLIENT_DIST, {
    maxAge: '1h',
    setHeaders: (res, filePath) => {
      // HTML files: no cache
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      }
      // Fix MIME types
      if (filePath.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript; charset=utf-8");
      } else if (filePath.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css; charset=utf-8");
      }
    }
  }));
} else {
  // Development: no caching
  app.use(express.static(CLIENT_DIST, {
    setHeaders: (res, filePath) => {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      // Fix MIME types
      if (filePath.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript; charset=utf-8");
      } else if (filePath.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css; charset=utf-8");
      }
    }
  }));
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' });
});

// SPA fallback routing
app.get("*", (req, res) => {
  const indexPath = path.join(CLIENT_DIST, "index.html");
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send(`
      <html>
        <body>
          <h1>Build Not Found</h1>
          <p>Please run <code>npm run build</code> first.</p>
          <p>Current directory: ${__dirname}</p>
          <p>Looking for: ${indexPath}</p>
        </body>
      </html>
    `);
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: IS_PRODUCTION ? 'Something went wrong' : err.message
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
  console.log(`   Environment: ${IS_PRODUCTION ? 'production' : 'development'}`);
  console.log(`   Serving from: ${CLIENT_DIST}`);
  console.log(`   Ready for Railway, Render, Vercel, VPS, Heroku`);
});
