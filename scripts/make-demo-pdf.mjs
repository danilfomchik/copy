// Dev-only: regenerates public/orbit-pass-card-DEMO.pdf (committed; the app
// just serves it as a static file). Run: node scripts/make-demo-pdf.mjs
// ASCII only: the stamp and card data are plain Latin text in a base-14 font.
import { mkdirSync, writeFileSync } from 'node:fs';

const lines = [
  ['F1', 28, 'ORBIT PASS - MEMBER CARD', 72, 760],
  ['F1', 64, 'DEMO', 72, 600],
  ['F1', 14, 'Member: Orest Lisovyi', 72, 700],
  ['F1', 14, 'Number: OP-4821-7390', 72, 678],
  ['F1', 12, 'Fictional sample document. All data is invented.', 72, 80],
];
const stream = lines
  .map(([f, size, text, x, y]) => `BT /${f} ${size} Tf ${x} ${y} Td (${text}) Tj ET`)
  .join('\n');

const objs = [
  '<< /Type /Catalog /Pages 2 0 R >>',
  '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
  '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
  `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
];

let pdf = '%PDF-1.4\n';
const offsets = [];
objs.forEach((o, i) => {
  offsets.push(pdf.length);
  pdf += `${i + 1} 0 obj\n${o}\nendobj\n`;
});
const xref = pdf.length;
pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
for (const off of offsets) pdf += `${String(off).padStart(10, '0')} 00000 n \n`;
pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;

mkdirSync('public', { recursive: true });
writeFileSync('public/orbit-pass-card-DEMO.pdf', pdf, 'latin1');
