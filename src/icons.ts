// Custom SVG icon set, geometry copied from the Figma design. Built with DOM calls,
// no innerHTML and no network. Icons are decorative: the parent carries the name.
const SVG_NS = 'http://www.w3.org/2000/svg';

// Each icon has its own box (viewBox). `fill` parts are solid shapes in the current colour,
// `cutout` parts are solid shapes painted in the tab bar colour (the lines on the ID document),
// `stroke` parts are 3-unit outlines.
type Part = { d: string; kind: 'fill' | 'cutout' | 'stroke'; evenodd?: boolean };
type Def = { viewBox: string; parts: readonly Part[] };

const rect = (x: number, y: number, w: number, h: number) => `M${x} ${y}h${w}v${h}h${-w}z`;

// Rounded rectangle, drawn clockwise from the top-left corner.
const rrect = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}` +
  `h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}z`;

// Diamond |x - cx| + |y - cy| <= R with its four tips rounded to radius r.
const roundDiamond = (cx: number, cy: number, R: number, r: number) => {
  const t = r / Math.SQRT2;
  const arc = (x: number, y: number) => `A${r} ${r} 0 0 1 ${x} ${y}`;
  return (
    `M${cx + t} ${cy - R + t}L${cx + R - t} ${cy - t}${arc(cx + R - t, cy + t)}` +
    `L${cx + t} ${cy + R - t}${arc(cx - t, cy + R - t)}` +
    `L${cx - R + t} ${cy + t}${arc(cx - R + t, cy - t)}` +
    `L${cx - t} ${cy - R + t}${arc(cx + t, cy - R + t)}z`
  );
};

// Tab bar geometry, traced from 3x reference screenshots of the original bar (1 unit = 1/591 of
// a 428pt screen). Document icons are 27.62 x 33.15 with 2.77-unit outlines; the solid forms sit
// 0.46 units left of the outlines (the menu is the other way round), as in the original.
const DOC_W = 27.62;
const DOC_H = 33.15;
const LINE = 2.77;
const docOutline = (x: number) =>
  rrect(x, 0, DOC_W, DOC_H, 2.6) + rect(x + LINE, LINE, DOC_W - 2 * LINE, DOC_H - 2 * LINE);
const docSolid = (x: number) => rrect(x, 0, DOC_W, DOC_H, 2.4);
const idBars = (x: number, w: number) => rect(x, 16.57, w, 3.46) + rect(x, 23.47, w, 3.46);
const SQUARES = [
  [1.41, 0],
  [17.98, 0],
  [1.41, 17.95],
  [17.98, 17.95],
] as const;
const DIAMOND_R = 7.82;
const DIAMOND_TIP = 1.6;

const ICONS = {
  // Tab bar icons: 34 x 35. Each tab has an inactive form and a solid `-active` form.
  card: {
    viewBox: '0 0 34 35',
    parts: [
      { d: docOutline(3.25), kind: 'fill', evenodd: true },
      { d: idBars(3.25 + LINE, DOC_W - 2 * LINE), kind: 'fill' },
    ],
  },
  'card-active': {
    viewBox: '0 0 34 35',
    parts: [
      { d: docSolid(2.79), kind: 'fill' },
      { d: idBars(2.79 + LINE, DOC_W - 2 * LINE), kind: 'cutout' },
    ],
  },
  services: {
    viewBox: '0 0 34 35',
    parts: [
      {
        d: SQUARES.map(([x, y]) => rrect(x, y, 13.81, 15.2, 2.6) + rect(x + LINE, y + LINE, 13.81 - 2 * LINE, 15.2 - 2 * LINE)).join(''),
        kind: 'fill',
        evenodd: true,
      },
    ],
  },
  'services-active': {
    viewBox: '0 0 34 35',
    parts: [{ d: SQUARES.map(([x, y]) => rrect(x, y, 13.81, 15.2, 2.6)).join(''), kind: 'fill' }],
  },
  listings: {
    viewBox: '0 0 34 35',
    parts: [
      { d: docOutline(3.25), kind: 'fill', evenodd: true },
      { d: roundDiamond(3.25 + DOC_W / 2, DOC_H / 2, DIAMOND_R, DIAMOND_TIP), kind: 'fill' },
    ],
  },
  'listings-active': {
    viewBox: '0 0 34 35',
    parts: [
      { d: docSolid(2.79), kind: 'fill' },
      { d: roundDiamond(2.79 + DOC_W / 2, DOC_H / 2, DIAMOND_R, DIAMOND_TIP), kind: 'cutout' },
    ],
  },
  menu: {
    viewBox: '0 0 34 35',
    parts: [{ d: rect(2.79, 5.14, DOC_W, 3.54) + rect(2.79, 14.81, DOC_W, 3.53) + rect(2.79, 24.47, DOC_W, 3.54), kind: 'fill' }],
  },
  'menu-active': {
    viewBox: '0 0 34 35',
    parts: [{ d: rect(3.25, 5.52, DOC_W, 4.15) + rect(3.25, 14.81, DOC_W, 4.15) + rect(3.25, 24.16, DOC_W, 4.16), kind: 'fill' }],
  },
  // Notification pill bell: 23 x 24.
  bell: {
    viewBox: '0 0 23 24',
    parts: [
      {
        d: 'M0.575 18.2857C-0.191667 18.2857 -0.191667 17.1429 0.575 14.8571L2.875 5.71429C3.64167 1.90476 6.51667 0 11.5 0C16.4833 0 19.3583 1.90476 20.125 5.71429L22.425 14.8571C23.1917 17.1429 23.1917 18.2857 22.425 18.2857H0.575ZM7.475 21.7143C10.1583 24.7619 12.8417 24.7619 15.525 21.7143H7.475Z',
        kind: 'fill',
      },
    ],
  },
  // Actions button plus: 56 x 56 (the orange disc is the button's own background).
  plus: {
    viewBox: '0 0 56 56',
    parts: [{ d: rect(15.5, 25.25, 25, 5.5) + rect(25.25, 15.5, 5.5, 25), kind: 'fill' }],
  },
  // QR notice "i": a rounded frame and a hand-drawn italic i, traced from the original at 3x
  // (1 unit = 2 screenshot pixels, so the 3-unit outlines are the original's 6px strokes).
  'notice-info': {
    viewBox: '2.5 2 35.5 36',
    parts: [
      { d: rrect(3.65, 3.5, 32.85, 33, 3.5), kind: 'stroke' },
      { d: 'M20.85 16.75L17.8 27.4C17.15 30.05 18.4 31.3 20.25 30.4L24.1 27.2', kind: 'stroke' },
      { d: 'M19.35 10a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0zM15.05 15.15H22.7L21.9 18.1H14.55Z', kind: 'fill' },
    ],
  },
  // Action sheet row icons: 29 x 29, 2.7-unit outlines.
  info: {
    viewBox: '0 0 29 29',
    parts: [
      {
        d: 'M14.5 19.3337V14.5M14.5 9.66628H14.5121M26.5843 14.5C26.5843 21.174 21.174 26.5843 14.5 26.5843C7.82603 26.5843 2.4157 21.174 2.4157 14.5C2.4157 7.82603 7.82603 2.4157 14.5 2.4157C21.174 2.4157 26.5843 7.82603 26.5843 14.5Z',
        kind: 'stroke',
      },
    ],
  },
  file: {
    viewBox: '0 0 29 29',
    parts: [
      {
        d: 'M16.9164 2.4157H7.25072C6.60985 2.4157 5.99522 2.67034 5.54205 3.12359C5.08889 3.57683 4.8343 4.19157 4.8343 4.83256V24.1674C4.8343 24.8084 5.08889 25.4232 5.54205 25.8764C5.99522 26.3297 6.60985 26.5843 7.25072 26.5843H21.7493C22.3901 26.5843 23.0048 26.3297 23.4579 25.8764C23.9111 25.4232 24.1657 24.8084 24.1657 24.1674V9.66628M16.9164 2.4157C17.2989 2.41508 17.6777 2.49015 18.031 2.63657C18.3844 2.78299 18.7053 2.99788 18.9752 3.26886L23.3103 7.6047C23.5819 7.87479 23.7974 8.19604 23.9442 8.54989C24.091 8.90374 24.1663 9.28317 24.1657 9.66628M16.9164 2.4157V8.45785C16.9164 8.77834 17.0437 9.08571 17.2703 9.31234C17.4969 9.53896 17.8042 9.66628 18.1246 9.66628L24.1657 9.66628',
        kind: 'stroke',
      },
    ],
  },
  'refresh-cw': {
    viewBox: '0 0 29 29',
    parts: [
      {
        d: 'M3.625 14.5C3.625 11.6158 4.77076 8.84967 6.81021 6.81021C8.84967 4.77076 11.6158 3.625 14.5 3.625C17.5402 3.63644 20.4583 4.82273 22.6442 6.93583L25.375 9.66667M19.3333 9.66667H25.375V3.625M25.375 14.5C25.375 17.3842 24.2292 20.1503 22.1898 22.1898C20.1503 24.2292 17.3842 25.375 14.5 25.375C11.4598 25.3636 8.54167 24.1773 6.35583 22.0642L3.625 19.3333M3.625 25.375V19.3333H9.66667',
        kind: 'stroke',
      },
    ],
  },
} as const satisfies Record<string, Def>;

export type IconName = keyof typeof ICONS;

export function icon(name: IconName, extraClass?: string): SVGElement {
  const def: Def = ICONS[name];
  const svg = document.createElementNS(SVG_NS, 'svg');
  for (const [k, v] of Object.entries({
    viewBox: def.viewBox,
    class: extraClass ? `icon ${extraClass}` : 'icon',
    fill: 'none',
    'aria-hidden': 'true',
    focusable: 'false',
  })) svg.setAttribute(k, v);
  for (const part of def.parts) {
    const p = document.createElementNS(SVG_NS, 'path');
    p.setAttribute('d', part.d);
    p.setAttribute('class', `icon-${part.kind}`);
    if (part.evenodd) p.setAttribute('fill-rule', 'evenodd');
    svg.append(p);
  }
  return svg;
}
