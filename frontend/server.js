import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Smart dist path detection: works whether executed from root (server.js) or inside dist (dist/server.js)
const distPath = fs.existsSync(path.join(__dirname, 'dist', 'index.html'))
  ? path.join(__dirname, 'dist')
  : __dirname;

// Serve static assets with CDN-optimized Cache-Control headers
app.use(
  express.static(distPath, {
    maxAge: '1y',
    immutable: true,
    setHeaders: (res, filePath) => {
      // Never cache HTML so users receive fresh deploys instantly
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      } else if (filePath.match(/\.(js|css|woff2?|ttf|png|jpe?g|webp|svg|ico)$/)) {
        // Hashed JS, CSS, fonts, and images can be cached aggressively by CDN edge
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    },
  })
);

// Fallback to index.html for client-side routing (React Router SPA)
app.get('*', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend application is running on port ${PORT}`);
});
