import QRCode from 'qrcode';
import type { Plugin } from 'vite';
import { QR_VERSION, qrText } from './qr-message.ts';

const VIRTUAL = 'virtual:qr';
const RESOLVED = '\0' + VIRTUAL;

// The QR code itself is drawn at runtime, because it carries the signed-in
// Member's Scan id (see src/qr-view.ts). This plugin only works out the filler
// token at build time and exposes it as `virtual:qr` ({ token }).
//
// The original is filled to capacity, so it reads as even noise; the short URL
// alone would leave most of the symbol as standard pad bytes, which render as
// diagonal stripes. So the URL is followed by a seeded (deterministic) demo
// token that fills the symbol. Its length is fitted to a worst-case Scan id
// (32 letters, which the encoder cannot pack tighter than bytes), so every real
// id fits too.
const TOKEN_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const WORST_CASE_ID = 'f'.repeat(32);

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
    QRCode.create(text, { errorCorrectionLevel: 'M', version: QR_VERSION });
    return true;
  } catch {
    return false;
  }
}

// The longest token that still fits the version next to a worst-case id.
function fillerToken(): string {
  let lo = 0;
  let hi = 4096;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (fits(qrText(WORST_CASE_ID, demoToken(mid)))) lo = mid;
    else hi = mid - 1;
  }
  return demoToken(lo);
}

export function qrPlugin(): Plugin {
  return {
    name: 'orbit-qr',
    resolveId: (id) => (id === VIRTUAL ? RESOLVED : undefined),
    load(id) {
      if (id !== RESOLVED) return;
      return `export default ${JSON.stringify({ token: fillerToken() })};`;
    },
  };
}
