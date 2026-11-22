import QRCode from 'qrcode';
import qr from 'virtual:qr';
import type { Content } from '../content/schema';
import { QR_URL, QR_VERSION, qrText } from '../qr-message';
import { el } from './dom';
import { icon } from './icons';
import type { Member } from './member';

const SVG_NS = 'http://www.w3.org/2000/svg';

// Where the QR code points. In dev it is this dev server's own Scan page
// (run `npm run dev -- --host` and open the app on the LAN address so a phone
// can reach it); in builds it is the deployed page.
const SCAN_BASE = import.meta.env.DEV
  ? new URL(`${import.meta.env.BASE_URL}scan.html`, location.origin).href
  : QR_URL;

// SVG path of the dark modules of the Member's QR code, which links to their
// Scan page. A Member without a Scan id (not re-seeded yet) gets the bare link.
function qrPath(member: Member): { size: number; path: string } {
  // The filler token is fitted to the deployed URL; a longer dev URL trims it.
  let token = qr.token;
  let modules: QRCode.BitMatrix | undefined;
  while (!modules) {
    try {
      ({ modules } = QRCode.create(qrText(member.scanId, token, SCAN_BASE), {
        errorCorrectionLevel: 'M',
        version: QR_VERSION,
      }));
    } catch (e) {
      if (!token) throw e;
      token = token.slice(0, -8);
    }
  }
  const size = modules.size;
  let path = '';
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (modules.get(x, y)) path += `M${x} ${y}h1v1h-1z`;
    }
  }
  return { size, path };
}

// The QR document (home screen): validity caption, the Member's QR code, usage notice.
export function qrView(content: Content, member: Member): HTMLElement {
  const code = qrPath(member);
  // The design's 428.5u box is the modules only; the card's own padding is the quiet zone.
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'qr');
  svg.setAttribute('viewBox', `0 0 ${code.size} ${code.size}`);
  svg.setAttribute('shape-rendering', 'crispEdges');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', code.path);
  path.setAttribute('fill', '#000');
  svg.append(path);

  return el('div', { class: 'card qr-view', role: 'region', 'aria-label': content.qr.label }, [
    el('p', { class: 'qr-caption' }, [content.qr.caption]),
    svg,
    el('div', { class: 'qr-notice' }, [
      icon('notice-info', 'qr-notice-icon'),
      el('p', {}, [content.qr.notice]),
    ]),
  ]);
}
