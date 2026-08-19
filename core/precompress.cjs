/**
 * precompress.cjs
 * Blazing-fast multi-threaded asset pre-compression and Service Worker precache injection.
 */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const util = require("util");

const gzipAsync = util.promisify(zlib.gzip);
const brotliAsync = util.promisify(zlib.brotliCompress);

const DIST_DIR = path.join(__dirname, "dist");
const COMPRESSIBLE = new Set([".html", ".js", ".css", ".json", ".svg", ".wasm"]);
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
  const assetUrls = ["/", "/index.html", "/manifest.json", "/favicon.png", "/logo.jpg"];

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
  const content = fs.readFileSync(filePath);
  if (content.length < MIN_SIZE_BYTES) return;

  const relPath = path.relative(DIST_DIR, filePath);

  const [gzBuf, brBuf] = await Promise.all([
    gzipAsync(content, { level: 6 }),
    brotliAsync(content, {
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: 5,
      },
    }),
  ]);

  fs.writeFileSync(filePath + ".gz", gzBuf);
  fs.writeFileSync(filePath + ".br", brBuf);

  const gzPct = Math.round((1 - gzBuf.length / content.length) * 100);
  const brPct = Math.round((1 - brBuf.length / content.length) * 100);

  console.log(
    `  ✓ ${relPath.padEnd(42)} ${kb(content.length)} → Gz: ${kb(gzBuf.length)} (-${gzPct}%) | Br: ${kb(brBuf.length)} (-${brPct}%)`
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
  const targets = allFiles.filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return COMPRESSIBLE.has(ext) && !f.endsWith(".gz") && !f.endsWith(".br");
  });

  console.log(`\n⚡ Pre-compressing ${targets.length} assets with Gzip & Brotli in parallel...\n`);

  await Promise.all(targets.map(compressFile));

  console.log("\n✅ Lightning pre-compression & Service Worker precache complete.\n");
}

main().catch((err) => {
  console.error("Pre-compression failed:", err);
  process.exit(1);
});
