import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Smart dist path detection: works whether executed from root (server.js) or inside dist (dist/server.js)
const distPath = fs.existsSync(path.join(__dirname, 'dist', 'index.html'))
  ? path.join(__dirname, 'dist')
  : __dirname;

const BACKEND_URL = (
  process.env.BACKEND_URL ||
  process.env.VITE_API_URL ||
  'http://localhost:8000'
).replace(/\/+$/, '');

console.log(`Backend API target configured: ${BACKEND_URL}`);

// Reverse proxy all /api requests to backend API server
app.use('/api', async (req, res) => {
  try {
    const targetUrl = `${BACKEND_URL}/api${req.url}`;
    const headers = {};
    for (const [key, val] of Object.entries(req.headers)) {
      if (key.toLowerCase() !== 'host') {
        headers[key] = val;
      }
    }

    const options = {
      method: req.method,
      headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      options.body = req;
      options.duplex = 'half';
    }

    const backendRes = await fetch(targetUrl, options);
    res.status(backendRes.status);

    backendRes.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'content-encoding') {
        res.setHeader(key, value);
      }
    });

    const arrayBuffer = await backendRes.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error(`Proxy error forwarding ${req.method} ${req.originalUrl}:`, error.message);
    res.status(502).json({
      error: 'Backend API unreachable from Admin Server',
      message: error.message,
    });
  }
});

// Serve static assets with CDN-optimized Cache-Control headers
app.use(
  express.static(distPath, {
    maxAge: '1y',
    immutable: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      } else if (filePath.match(/\.(js|css|woff2?|ttf|png|jpe?g|webp|svg|ico)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    },
  })
);

// Fallback to index.html for client-side routing
app.get('*', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`MedVexa Admin Portal running on port ${PORT}`);
});
