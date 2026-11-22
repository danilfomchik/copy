import { el } from '../dom';
import type { Route } from '../router';
import { flip } from '../flip';
import { qrView } from '../qr-view';
import { actionsButton } from './card-actions';
import { notificationsButton } from './card-notifications';
import { cardDetailsRoute } from './card-details';
import emblem from '../assets/card/emblem.svg?url';

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
      // The marquee track moves by half its width, so each half must be at least as wide as the ribbon
      // or empty space shows before the loop restarts. Eight copies (four per half) cover it even for
      // short text such as the refreshed-at message.
      const ribbonCopies = Array.from({ length: 8 }, () => el('span', { class: 'ribbon-text' }, [member.updatedAt]));
      const setRibbon = (text: string) => ribbonCopies.forEach((c) => (c.textContent = text));
      const front = el('div', { class: 'card', role: 'region', 'aria-label': ui.card.label }, [
        el('div', { class: 'card-head' }, [
          el('p', { class: 'card-label' }, [ui.card.label]),
          el('img', { class: 'card-emblem', src: emblem, alt: '' }),
        ]),
        el('div', { class: 'card-body' }, [
          avatar(member.avatar, ui.card.avatarAlt),
          el('dl', { class: 'card-fields' }, [
            field(`${ui.card.birthDateLabel}:`, member.birthDate),
          ]),
        ]),
        el('div', { class: 'ribbon' }, [el('div', { class: 'ribbon-track' }, ribbonCopies)]),
        el('div', { class: 'card-footer' }, [
          el('div', {}, [
            el('p', { class: 'card-member-label' }, [member.label]),
            el('h1', { class: 'card-name' }, [member.fullName]),
          ]),
          actionsButton(content, setRibbon),
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
