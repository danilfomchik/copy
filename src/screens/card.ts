import { el } from '../dom';
import type { Route } from '../router';
import { flip } from '../flip';
import { qrView } from '../qr-view';
import { actionsButton } from './card-actions';
import { notificationsButton } from './card-notifications';
import { cardDetailsRoute } from './card-details';

// The Member's avatar, read from the Member record (a data URL, validated in parseMember).
function avatar(src: string, alt: string): HTMLImageElement {
  return el('img', { class: 'avatar', src, alt }) as HTMLImageElement;
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
    render: ({ content, member }) => {
      const { ui } = content;
      const ribbonEl = el('span', { class: 'ribbon-text' }, [member.updatedAt]);
      const front = el('div', { class: 'card', role: 'region', 'aria-label': ui.card.label }, [
        el('p', { class: 'card-label' }, [ui.card.label]),
        el('div', { class: 'card-body' }, [
          avatar(member.avatar, ui.card.avatarAlt),
          el('dl', { class: 'card-fields' }, [
            field(`${ui.card.birthDateLabel}:`, member.birthDate),
          ]),
        ]),
        el('div', { class: 'ribbon' }, [ribbonEl]),
        el('div', { class: 'card-footer' }, [
          el('div', {}, [
            el('p', { class: 'card-member-label' }, [member.label]),
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
