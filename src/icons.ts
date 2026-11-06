// Custom SVG icon set (24x24 stroke icons, currentColor). Built with DOM calls,
// no innerHTML and no network. Icons are decorative: the parent carries the name.
const SVG_NS = 'http://www.w3.org/2000/svg';

const PATHS = {
  card: ['M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M3 10h18', 'M7 15h4'],
  services: ['M4 4h6v6H4z', 'M14 4h6v6h-6z', 'M4 14h6v6H4z', 'M14 14h6v6h-6z'],
  listings: ['M4 6h16', 'M4 12h16', 'M4 18h10'],
  menu: ['M12 12h.01', 'M5 12h.01', 'M19 12h.01'],
  bell: ['M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7', 'M10 20a2 2 0 0 0 4 0'],
  plus: ['M12 5v14', 'M5 12h14'],
} as const;

export type IconName = keyof typeof PATHS;

export function icon(name: IconName): SVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  for (const [k, v] of Object.entries({
    viewBox: '0 0 24 24',
    class: 'icon',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '2',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'aria-hidden': 'true',
    focusable: 'false',
  })) svg.setAttribute(k, v);
  for (const d of PATHS[name]) {
    const p = document.createElementNS(SVG_NS, 'path');
    p.setAttribute('d', d);
    svg.append(p);
  }
  return svg;
}
