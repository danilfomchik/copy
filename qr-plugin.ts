import QRCode from 'qrcode';
import type { Plugin } from 'vite';
import { QR_URL } from './qr-message.ts';

const VIRTUAL = 'virtual:qr';
const RESOLVED = '\0' + VIRTUAL;

// Generates the QR code at build time (the qrcode library is dev-only and
// never reaches the bundle). Exposes `virtual:qr` as { size, path }: the
// module count per side and an SVG path of the dark modules. Version 18
// (89 x 89 modules) matches the original's density. The original is filled to
// capacity, so it reads as even noise; the short URL alone would leave most of
// the symbol as standard pad bytes, which render as diagonal stripes. So the URL
// is followed by a seeded (deterministic) demo token that fills the symbol
// exactly. The token sits in the URL fragment (after `#`), so scanners still
// open the page and the server never sees it.
const VERSION = 18;
const TOKEN_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

function demoToken(length: number): string {
  let seed = 0x4f524254; // fixed, so every build produces the same code
  let out = '';
  for (let i = 0; i < length; i++) {
    // mulberry32
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    out += TOKEN_CHARS[((t ^ (t >>> 14)) >>> 0) % TOKEN_CHARS.length];
  }
  return out;
}

function fits(text: string): boolean {
  try {
    QRCode.create(text, { errorCorrectionLevel: 'M', version: VERSION });
    return true;
  } catch {
    return false;
  }
}

// The longest URL + token that still fits the version.
function filledMessage(): string {
  const withToken = (n: number) => `${QR_URL}#${demoToken(n)}`;
  let lo = 0;
  let hi = 4096;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (fits(withToken(mid))) lo = mid;
    else hi = mid - 1;
  }
  return withToken(lo);
}

export function qrPlugin(): Plugin {
  return {
    name: 'orbit-qr',
    resolveId: (id) => (id === VIRTUAL ? RESOLVED : undefined),
    load(id) {
      if (id !== RESOLVED) return;
      const { modules } = QRCode.create(filledMessage(), { errorCorrectionLevel: 'M', version: VERSION });
      const size = modules.size;
      let path = '';
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          if (modules.get(x, y)) path += `M${x} ${y}h1v1h-1z`;
        }
      }
      return `export default ${JSON.stringify({ size, path })};`;
    },
  };
}
