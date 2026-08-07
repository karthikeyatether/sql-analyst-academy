/**
 * precompress.cjs
 * Run after `vite build` to:
 * 1. Inject dynamic precache manifest with all hashed JS/CSS assets into dist/sw.js
 * 2. Pre-compress (Gzip & Brotli) all static assets in dist/.
 */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const os = require("os");
const { pipeline } = require("stream/promises");

const DIST_DIR = path.join(__dirname, "dist");
const COMPRESSIBLE = new Set([".html", ".js", ".css", ".json", ".svg"]);
const MIN_SIZE_BYTES = 256;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

function injectSwPrecacheManifest() {
  const swPath = path.join(DIST_DIR, "sw.js");
  if (!fs.existsSync(swPath)) return;

  const allFiles = walk(DIST_DIR);
  const assetUrls = ["/", "/index.html", "/offline.html", "/manifest.json", "/favicon.png", "/sql-wasm.wasm"];

  for (const f of allFiles) {
    const rel = path.relative(DIST_DIR, f).replace(/\\/g, "/");
    if (rel.startsWith("assets/") && (rel.endsWith(".js") || rel.endsWith(".css") || rel.endsWith(".wasm"))) {
      assetUrls.push("/" + rel);
    }
  }

  let swContent = fs.readFileSync(swPath, "utf8");
  const swVersion = `v${Date.now()}`;
  swContent = swContent.replace(/__SW_VERSION__/g, swVersion);
  swContent = swContent.replace(
    /const ASSETS_TO_CACHE = \[\s*[\s\S]*?\];/,
    `const ASSETS_TO_CACHE = ${JSON.stringify(assetUrls, null, 2)};`
  );

  fs.writeFileSync(swPath, swContent, "utf8");
  console.log(`\n📦 Service worker manifest injected with ${assetUrls.length} assets (version: ${swVersion}).`);
}

async function compressFile(filePath) {
  const origSize = fs.statSync(filePath).size;
  if (origSize < MIN_SIZE_BYTES) return;

  const relPath = path.relative(DIST_DIR, filePath);

  // 1. Gzip compression (Level 6: optimal speed vs ratio balance)
  const gzPath = filePath + ".gz";
  await pipeline(
    fs.createReadStream(filePath),
    zlib.createGzip({ level: 6 }),
    fs.createWriteStream(gzPath)
  );
  const gzSize = fs.statSync(gzPath).size;

  // 2. Brotli compression (Quality 6: 10x faster than MAX_QUALITY level 11 with ~98.5% identical ratio)
  const brPath = filePath + ".br";
  await pipeline(
    fs.createReadStream(filePath),
    zlib.createBrotliCompress({
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: 6,
      },
    }),
    fs.createWriteStream(brPath)
  );
  const brSize = fs.statSync(brPath).size;

  const gzPct = Math.round((1 - gzSize / origSize) * 100);
  const brPct = Math.round((1 - brSize / origSize) * 100);

  console.log(
    `  ✓ ${relPath.padEnd(42)} ${kb(origSize)} → Gz: ${kb(gzSize)} (-${gzPct}%) | Br: ${kb(brSize)} (-${brPct}%)`
  );
}

function kb(bytes) {
  return (bytes / 1024).toFixed(1).padStart(6) + " KB";
}

async function main() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error("dist/ not found — run npm run build first");
    process.exit(1);
  }

  injectSwPrecacheManifest();

  const allFiles = walk(DIST_DIR);
  const targets = allFiles.filter(f => {
    const ext = path.extname(f).toLowerCase();
    return COMPRESSIBLE.has(ext) && !f.endsWith(".gz") && !f.endsWith(".br");
  });

  console.log(`\n⚡ Pre-compressing ${targets.length} assets with Gzip & Brotli...\n`);

  const concurrency = Math.max(1, os.cpus().length);
  for (let i = 0; i < targets.length; i += concurrency) {
    const batch = targets.slice(i, i + concurrency);
    await Promise.all(batch.map(compressFile));
  }

  console.log("\n✅ Pre-compression & Service Worker precache complete.\n");
}

main().catch(err => {
  console.error("Pre-compression failed:", err);
  process.exit(1);
});
