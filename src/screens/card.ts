import { el } from '../dom';
import type { Route } from '../router';
import { flip } from '../flip';
import { qrView } from '../qr-view';
import { actionsButton } from './card-actions';
import { notificationsButton } from './card-notifications';
import { cardDetailsRoute } from './card-details';

const SVG_NS = 'http://www.w3.org/2000/svg';

// Generated Avatar illustration (fictional, no photo). Built with DOM calls
// so no innerHTML is needed.
function avatar(alt: string): SVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 64 64');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', alt);
  svg.setAttribute('class', 'avatar');
  const add = (tag: string, attrs: Record<string, string>) => {
    const n = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    svg.append(n);
  };
  add('rect', { width: '64', height: '64', fill: '#ffffff' });
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
      const ribbonEl = el('span', { class: 'ribbon-text' }, [ribbon.updatedAt]);
      const front = el('div', { class: 'card', role: 'region', 'aria-label': ui.card.label }, [
        el('p', { class: 'card-label' }, [ui.card.label]),
        el('div', { class: 'card-body' }, [
          avatar(ui.card.avatarAlt),
          el('dl', { class: 'card-fields' }, [
            field(`${ui.card.birthDateLabel}:`, member.birthDate),
          ]),
        ]),
        el('div', { class: 'ribbon' }, [ribbonEl]),
        el('div', { class: 'card-footer' }, [
          el('div', {}, [
            el('p', { class: 'card-holder-label' }, [ui.card.holderLabel]),
            el('h1', { class: 'card-name' }, [member.fullName]),
          ]),
          actionsButton(content, ribbonEl),
        ]),
      ]);
      return el('section', { class: 'screen card-screen' }, [
        notificationsButton(content),
        flip(front, qrView(content)),
      ]);
    },
  },
  cardDetailsRoute,
];
