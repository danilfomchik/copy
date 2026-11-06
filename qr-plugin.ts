import QRCode from 'qrcode';
import type { Plugin } from 'vite';
import { QR_DEMO_MESSAGE } from './qr-message.ts';

const VIRTUAL = 'virtual:qr';
const RESOLVED = '\0' + VIRTUAL;

// Generates the QR code at build time (the qrcode library is dev-only and
// never reaches the bundle). Exposes `virtual:qr` as { size, path }: the
// module count per side and an SVG path of the dark modules.
export function qrPlugin(): Plugin {
  return {
    name: 'orbit-qr',
    resolveId: (id) => (id === VIRTUAL ? RESOLVED : undefined),
    load(id) {
      if (id !== RESOLVED) return;
      const { modules } = QRCode.create(QR_DEMO_MESSAGE, { errorCorrectionLevel: 'M' });
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
