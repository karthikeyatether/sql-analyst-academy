const http = require("http");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const { exec } = require("child_process");

const PORT = 4173;
const DIST_DIR = path.resolve(__dirname, "dist");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js":   "text/javascript; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png":  "image/png",
  ".ico":  "image/x-icon",
  ".wasm": "application/wasm",
  ".svg":  "image/svg+xml",
  ".webp": "image/webp",
};

// Text types that benefit from compression
const COMPRESSIBLE = new Set([".html", ".js", ".css", ".json", ".svg"]);

const server = http.createServer((req, res) => {
  let reqPath = req.url.split("?")[0];
  if (reqPath === "/") reqPath = "/index.html";

  let filePath = path.join(DIST_DIR, reqPath);
  let normalizedPath = path.normalize(filePath);

  // Security check: path traversal prevention with exact boundary check
  if (!normalizedPath.startsWith(DIST_DIR + path.sep) && normalizedPath !== DIST_DIR) {
    res.statusCode = 403;
    return res.end("Forbidden");
  }

  fs.stat(normalizedPath, (err, stats) => {
    if (err || !stats.isFile()) {
      if (path.extname(reqPath)) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        return res.end("404 Not Found");
      }
      normalizedPath = path.join(DIST_DIR, "index.html");
      try {
        stats = fs.statSync(normalizedPath);
      } catch (_) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        return res.end("404 Not Found");
      }
    }

    const ext = path.extname(normalizedPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const isHashedAsset = reqPath.startsWith("/assets/");
    const cacheControl = isHashedAsset
      ? "public, max-age=31536000, immutable"
      : "public, max-age=0, must-revalidate";

    const etag = `W/"${stats.size.toString(16)}-${Math.floor(stats.mtimeMs).toString(16)}"`;

    // Base headers with security hardening
    const baseHeaders = {
      "Content-Type": contentType,
      "Cache-Control": cacheControl,
      "ETag": etag,
      "Vary": "Accept-Encoding",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "SAMEORIGIN",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob:; worker-src 'self' blob:; connect-src 'self';",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    };

    // Conditional GET (HTTP 304 Not Modified)
    if (req.headers["if-none-match"] === etag) {
      res.writeHead(304, baseHeaders);
      return res.end();
    }

    const acceptEncoding = req.headers["accept-encoding"] || "";
    const acceptsBrotli = acceptEncoding.includes("br");
    const acceptsGzip = acceptEncoding.includes("gzip");
    const canCompress = COMPRESSIBLE.has(ext);

    // 1. Serve pre-compressed Brotli (.br) asset if supported
    if (acceptsBrotli && canCompress) {
      const brPath = normalizedPath + ".br";
      if (fs.existsSync(brPath)) {
        res.writeHead(200, {
          ...baseHeaders,
          "Content-Encoding": "br",
        });
        return fs.createReadStream(brPath).pipe(res);
      }
    }

    // 2. Serve pre-compressed Gzip (.gz) asset if supported
    if (acceptsGzip && canCompress) {
      const gzPath = normalizedPath + ".gz";
      if (fs.existsSync(gzPath)) {
        res.writeHead(200, {
          ...baseHeaders,
          "Content-Encoding": "gzip",
        });
        return fs.createReadStream(gzPath).pipe(res);
      }

      // Fall back to on-the-fly Gzip streaming
      res.writeHead(200, {
        ...baseHeaders,
        "Content-Encoding": "gzip",
      });
      return fs.createReadStream(normalizedPath).pipe(zlib.createGzip()).pipe(res);
    }

    // 3. Uncompressed delivery
    res.writeHead(200, baseHeaders);
    fs.createReadStream(normalizedPath).pipe(res);
  });
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.log(`SQL Analyst Academy already running → http://127.0.0.1:${PORT}`);
    exec(process.platform === "win32"
      ? `start http://127.0.0.1:${PORT}`
      : `open http://127.0.0.1:${PORT}`);
  } else {
    console.error("Server error:", err);
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`\n✅  SQL Analyst Academy → http://127.0.0.1:${PORT}\n`);
  exec(process.platform === "win32"
    ? `start http://127.0.0.1:${PORT}`
    : `open http://127.0.0.1:${PORT}`);
});
