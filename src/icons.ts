// Custom SVG icon set, geometry copied from the Figma design. Built with DOM calls,
// no innerHTML and no network. Icons are decorative: the parent carries the name.
const SVG_NS = 'http://www.w3.org/2000/svg';

// Each icon has its own box (viewBox). `fill` parts are solid shapes in the current colour,
// `cutout` parts are solid shapes painted in the tab bar colour (the lines on the ID document),
// `stroke` parts are 3-unit outlines.
type Part = { d: string; kind: 'fill' | 'cutout' | 'stroke'; evenodd?: boolean };
type Def = { viewBox: string; parts: readonly Part[] };

const rect = (x: number, y: number, w: number, h: number) => `M${x} ${y}h${w}v${h}h${-w}z`;

const ICONS = {
  // Tab bar icons: 34 x 35.
  card: {
    viewBox: '0 0 34 35',
    parts: [
      { d: 'M3 3a3 3 0 0 1 3-3h21a3 3 0 0 1 3 3v27a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z', kind: 'fill' },
      { d: rect(6, 17, 21, 4) + rect(6, 24, 21, 4), kind: 'cutout' },
    ],
  },
  services: {
    viewBox: '0 0 34 35',
    parts: [
      {
        d: rect(4.5, 2.5, 9, 11) + rect(21.5, 2.5, 9, 11) + rect(4.5, 20.5, 9, 11) + rect(21.5, 20.5, 9, 11),
        kind: 'stroke',
      },
    ],
  },
  listings: {
    viewBox: '0 0 34 35',
    parts: [
      {
        d: 'M3 3a2 2 0 0 1 2-2h21a2 2 0 0 1 2 2v27a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM6 4v25h19V4z',
        kind: 'fill',
        evenodd: true,
      },
      { d: 'M16.5 8L24 17L16.5 26L9 17z', kind: 'fill' },
    ],
  },
  menu: {
    viewBox: '0 0 34 35',
    parts: [{ d: rect(3, 5, 28, 4) + rect(3, 15, 28, 4) + rect(3, 25, 28, 4), kind: 'fill' }],
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
    parts: [{ d: rect(16, 24, 25, 8) + rect(24, 16, 8, 25), kind: 'fill' }],
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

export function icon(name: IconName): SVGElement {
  const def: Def = ICONS[name];
  const svg = document.createElementNS(SVG_NS, 'svg');
  for (const [k, v] of Object.entries({
    viewBox: def.viewBox,
    class: 'icon',
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
