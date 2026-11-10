// Notifications: a pill-shaped labelled bell button on the home screen that opens the
// Notifications screen (#/notifications), a list of static Notifications from the Content file.
import { el } from '../dom';
import { icon } from '../icons';
import type { Route } from '../router';
import type { Content } from '../../content/schema';
import backIcon from '../assets/notifications/back.svg?url';

export function notificationsButton(content: Content): HTMLElement {
  const button = el('button', { type: 'button', class: 'card-bell' }, [
    el('span', {}, [content.notifications.openLabel]),
    icon('bell'),
  ]);
  button.addEventListener('click', () => {
    location.hash = '#/notifications';
  });
  return button;
}

export const notificationsRoutes: Route[] = [
  {
    pattern: '/notifications',
    tab: 'card',
    render: ({ content }) => {
      const n = content.notifications;
      const back = el('a', { href: '#/card', class: 'notif-back', 'aria-label': content.ui.back }, [
        el('span', { class: 'notif-back-icon', 'aria-hidden': 'true' }),
      ]);
      back.querySelector<HTMLElement>('.notif-back-icon')!.style.setProperty('--icon', `url("${backIcon}")`);
      const items = n.items.map((item) =>
        el('li', { class: 'notif-card' }, [
          el('strong', { class: 'notif-card-title' }, [item.title]),
          el('p', { class: 'notif-card-body' }, [item.body]),
          el('hr', { class: 'notif-sep' }),
          el('p', { class: 'notif-card-date' }, [item.date]),
        ]),
      );
      return el('section', { class: 'screen notif-screen', 'aria-label': n.sheetLabel }, [
        back,
        el('h1', { class: 'notif-title' }, [n.openLabel]),
        el('ul', { class: 'notif-list' }, items),
      ]);
    },
  },
];
