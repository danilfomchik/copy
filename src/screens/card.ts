import { el } from '../dom';
import type { Route } from '../router';
import { actionsButton } from './card-actions';
import { cardDetailsRoute } from './card-details';

const SVG_NS = 'http://www.w3.org/2000/svg';

// Generated Avatar illustration (fictional, no photo). Built with DOM calls
// so no innerHTML is needed.
function avatar(alt: string): SVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 64 64');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', alt);
  svg.setAttribute('class', 'avatar');
  const add = (tag: string, attrs: Record<string, string>) => {
    const n = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    svg.append(n);
  };
  add('rect', { width: '64', height: '64', rx: '16', fill: '#0f766e' });
  add('circle', { cx: '32', cy: '25', r: '11', fill: '#e6fffb' });
  add('path', { d: 'M10 64c0-14 10-22 22-22s22 8 22 22z', fill: '#e6fffb' });
  return svg;
}

function field(label: string, value: string): HTMLElement {
  return el('div', { class: 'field' }, [
    el('dt', {}, [label]),
    el('dd', {}, [value]),
  ]);
}

export const cardRoutes: Route[] = [
  {
    pattern: '/card',
    tab: 'card',
    render: ({ content }) => {
      const { ui, member, ribbon } = content;
      const ribbonText = `${ui.card.ribbonUpdated} ${ribbon.updatedAt}`;
      const ribbonEl = el('span', { class: 'ribbon-text' }, [ribbonText]);
      return el('section', { class: 'screen card-screen' }, [
        el('div', { class: 'card', role: 'region', 'aria-label': ui.card.label }, [
          actionsButton(content, ribbonEl),
          el('p', { class: 'card-label' }, [ui.card.label]),
          avatar(ui.card.avatarAlt),
          el('h1', { class: 'card-name' }, [member.fullName]),
          el('dl', { class: 'card-fields' }, [
            field(ui.card.birthDateLabel, member.birthDate),
            field(ui.card.tierLabel, member.tier),
            field(ui.card.numberLabel, member.membershipNumber),
          ]),
          el('div', { class: 'ribbon' }, [ribbonEl]),
        ]),
      ]);
    },
  },
  cardDetailsRoute,
];
