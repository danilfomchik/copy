import qr from 'virtual:qr';
import type { Content } from '../content/schema';
import { el } from './dom';

const SVG_NS = 'http://www.w3.org/2000/svg';

// The QR view: validity caption, the build-time generated QR code, usage notice.
export function qrView(content: Content): HTMLElement {
  const pad = 2; // quiet zone, in modules
  const total = qr.size + pad * 2;
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'qr');
  svg.setAttribute('viewBox', `${-pad} ${-pad} ${total} ${total}`);
  svg.setAttribute('shape-rendering', 'crispEdges');
  svg.setAttribute('aria-hidden', 'true');
  const bg = document.createElementNS(SVG_NS, 'rect');
  bg.setAttribute('x', String(-pad));
  bg.setAttribute('y', String(-pad));
  bg.setAttribute('width', String(total));
  bg.setAttribute('height', String(total));
  bg.setAttribute('fill', '#fff');
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', qr.path);
  path.setAttribute('fill', '#000');
  svg.append(bg, path);

  return el('div', { class: 'card qr-view', role: 'region', 'aria-label': content.qr.label }, [
    el('p', { class: 'qr-caption' }, [content.qr.caption]),
    svg,
    el('p', { class: 'qr-notice' }, [content.qr.notice]),
  ]);
}
