// Generates every app icon.
// Usage: node scripts/generate-icons.mjs [icon.svg] [outDir] [favicon.svg]
// Defaults: PNG icons from assets/l.svg, favicon.svg copied from assets/logo.svg,
// both into public/icons. Run via `npm run icons`.
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const icon = path.resolve(process.argv[2] ?? "assets/l.svg");
const out = path.resolve(process.argv[3] ?? "public/icons");
const favicon = path.resolve(process.argv[4] ?? "assets/logo.svg");
mkdirSync(out, { recursive: true });
const svg = readFileSync(icon);

const pngs = {
  "icon-192.png": 192,
  "icon-512.png": 512,
  "icon-maskable-512.png": 512, // art is full-bleed with a safe-zone glyph
  "apple-touch-icon.png": 180,
  "favicon-32.png": 32,
};
for (const [name, size] of Object.entries(pngs)) {
  await sharp(svg, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(path.join(out, name));
}
copyFileSync(favicon, path.join(out, "favicon.svg"));
console.log(`Generated ${Object.keys(pngs).length + 1} icons in ${out}`);
