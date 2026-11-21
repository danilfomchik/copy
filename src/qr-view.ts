import qr from 'virtual:qr';
import type { Content } from '../content/schema';
import { el } from './dom';
import { icon } from './icons';

const SVG_NS = 'http://www.w3.org/2000/svg';

// The QR document (home screen): validity caption, the build-time generated QR code, usage notice.
export function qrView(content: Content): HTMLElement {
  const pad = 0; // the design's 428.5u box is the modules only; the card's own padding is the quiet zone
  const total = qr.size + pad * 2;
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'qr');
  svg.setAttribute('viewBox', `${-pad} ${-pad} ${total} ${total}`);
  svg.setAttribute('shape-rendering', 'crispEdges');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', qr.path);
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
