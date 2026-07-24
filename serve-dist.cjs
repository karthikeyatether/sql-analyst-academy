const http = require("http");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const PORT = 4173;
const DIST_DIR = path.join(__dirname, "dist");

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".wasm": "application/wasm",
  ".svg": "image/svg+xml"
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split("?")[0];
  if (reqPath === "/") reqPath = "/index.html";

  let filePath = path.join(DIST_DIR, reqPath);

  // Security check
  if (!filePath.startsWith(DIST_DIR)) {
    res.statusCode = 403;
    return res.end("Forbidden");
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(DIST_DIR, "index.html");
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": ext === ".wasm" ? "public, max-age=31536000" : "no-cache"
    });

    fs.createReadStream(filePath).pipe(res);
  });
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.log(`SQL Analyst Academy is already running at http://127.0.0.1:${PORT}`);
    const startCmd = process.platform === "win32" ? `start http://127.0.0.1:${PORT}` : `open http://127.0.0.1:${PORT}`;
    exec(startCmd);
  } else {
    console.error("Server error:", err);
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`SQL Analyst Academy running at http://127.0.0.1:${PORT}`);
  const startCmd = process.platform === "win32" ? `start http://127.0.0.1:${PORT}` : `open http://127.0.0.1:${PORT}`;
  exec(startCmd);
});
