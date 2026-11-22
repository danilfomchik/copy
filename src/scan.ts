// The Scan page (scan.html): opened by scanning a Member's QR code. Reads the
// Member's public Scan record scans/{id} from Firestore (no sign-in; the id in
// the link is the only key) and shows it as the document sheet from the design.
import { initializeApp } from 'firebase/app';
import { doc, getDoc, getFirestore } from 'firebase/firestore/lite';
import content from 'virtual:content';
import { SCAN_ID } from '../qr-message';
import { el } from './dom';
import { firebaseConfig } from './firebase-config';
import { parseScanRecord, type ScanRecord } from './member';
import './scan.css';

const t = content.scan;
const root = document.getElementById('scan')!;
const LOGO = `${import.meta.env.BASE_URL}icons/favicon.svg`;
const SVG_NS = 'http://www.w3.org/2000/svg';

document.title = t.pageTitle;

// Label on the left, value on the right (fixed column, as in the design).
const row = (label: string, value: string) =>
  el('div', { class: 'scan-row' }, [
    el('span', { class: 'scan-row-label' }, [label]),
    el('span', { class: 'scan-row-value' }, [value]),
  ]);

// Label above value.
const stack = (label: string, value: string) =>
  el('div', { class: 'scan-stack' }, [el('span', {}, [label]), el('span', {}, [value])]);

const divider = () => el('div', { class: 'scan-divider', role: 'presentation' });

function check(): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'scan-check');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('aria-hidden', 'true');
  const circle = document.createElementNS(SVG_NS, 'circle');
  circle.setAttribute('cx', '8');
  circle.setAttribute('cy', '8');
  circle.setAttribute('r', '8');
  circle.setAttribute('fill', 'currentColor');
  const tick = document.createElementNS(SVG_NS, 'path');
  tick.setAttribute('d', 'M4.6 8.3l2.2 2.2 4.6-4.8');
  tick.setAttribute('fill', 'none');
  tick.setAttribute('stroke', '#fff');
  tick.setAttribute('stroke-width', '1.8');
  tick.setAttribute('stroke-linecap', 'round');
  tick.setAttribute('stroke-linejoin', 'round');
  svg.append(circle, tick);
  return svg;
}

function header(): HTMLElement {
  return el('header', { class: 'scan-header' }, [
    el('div', { class: 'scan-handle', role: 'presentation' }),
    el('div', { class: 'scan-title-row' }, [
      el('h1', { class: 'scan-title' }, [t.title]),
      el('div', { class: 'scan-logo-box' }, [
        el('img', { class: 'scan-logo', src: LOGO, alt: t.logoAlt, width: '40', height: '40' }),
        el('span', { class: 'scan-demo' }, [t.demo]),
      ]),
    ]),
  ]);
}

function sheet(r: ScanRecord): HTMLElement[] {
  return [
    header(),
    el('section', { class: 'scan-card scan-card-dates' }, [
      row(t.issuedAt, r.issuedAt),
      row(t.validUntil, r.validUntil),
    ]),
    el('section', { class: 'scan-card' }, [
      el('div', { class: 'scan-group scan-group-name' }, [
        el('p', { class: 'scan-name' }, [r.fullName]),
        el('p', {}, [r.label]),
      ]),
      divider(),
      el('div', { class: 'scan-group scan-group-rows' }, [
        row(t.birthDate, r.birthDate),
        row(t.memberNumber, r.memberNumber),
      ]),
    ]),
    el('section', { class: 'scan-card' }, [
      el('div', { class: 'scan-group' }, [stack(t.homeStation, r.homeStation)]),
      divider(),
      el('div', { class: 'scan-group' }, [stack(t.tier, r.tier)]),
    ]),
    el('section', { class: 'scan-card scan-card-confirm' }, [
      el('div', { class: 'scan-confirmed' }, [check(), el('span', {}, [t.confirmed])]),
      row(t.confirmedAt, r.confirmedAt),
    ]),
  ];
}

function message(title: string, body: string, retry?: string): HTMLElement[] {
  const card = el('section', { class: 'scan-card scan-message' }, [
    el('h2', { class: 'scan-message-title' }, [title]),
    el('p', {}, [body]),
  ]);
  if (retry) {
    const button = el('button', { class: 'scan-retry', type: 'button' }, [retry]);
    button.addEventListener('click', () => void load());
    card.append(button);
  }
  return [header(), card];
}

const db = getFirestore(initializeApp(firebaseConfig));

async function load(): Promise<void> {
  const id = new URLSearchParams(location.search).get('id') ?? '';
  if (!SCAN_ID.test(id)) {
    root.replaceChildren(...message(t.notFound.title, t.notFound.body));
    return;
  }
  root.setAttribute('aria-busy', 'true');
  root.replaceChildren(header(), el('p', { class: 'scan-loading' }, [t.loading]));
  try {
    const snap = await getDoc(doc(db, 'scans', id));
    let record: ScanRecord | undefined;
    try {
      record = snap.exists() ? parseScanRecord(snap.data()) : undefined;
    } catch {
      // a malformed record is shown like a missing one
    }
    root.replaceChildren(...(record ? sheet(record) : message(t.notFound.title, t.notFound.body)));
  } catch {
    root.replaceChildren(...message(t.offline.title, t.offline.body, t.offline.retry));
  } finally {
    root.removeAttribute('aria-busy');
  }
}

void load();
