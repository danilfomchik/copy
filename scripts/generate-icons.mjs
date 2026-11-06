// Generates every app icon from the one SVG logo.
// Usage: node scripts/generate-icons.mjs [logo.svg] [outDir]
// Defaults: assets/logo.svg -> public/icons. Run via `npm run icons`.
import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const logo = path.resolve(process.argv[2] ?? 'assets/logo.svg');
const out = path.resolve(process.argv[3] ?? 'public/icons');
mkdirSync(out, { recursive: true });
const svg = readFileSync(logo);

const pngs = {
  'icon-192.png': 192,
  'icon-512.png': 512,
  'icon-maskable-512.png': 512, // art is full-bleed with a safe-zone glyph
  'apple-touch-icon.png': 180,
  'favicon-32.png': 32,
};
for (const [name, size] of Object.entries(pngs)) {
  await sharp(svg, { density: 384 }).resize(size, size).png().toFile(path.join(out, name));
}
copyFileSync(logo, path.join(out, 'favicon.svg'));
console.log(`Generated ${Object.keys(pngs).length + 1} icons in ${out}`);
