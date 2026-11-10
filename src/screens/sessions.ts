import { el } from '../dom';
import type { Route } from '../router';
import backArrow from '../assets/sessions/back-arrow.svg?url';
import viewSession from '../assets/sessions/view-session.svg?url';

// Icons are CSS masks so they follow the theme's text colour.
function icon(url: string, cls: string): HTMLElement {
  const node = el('span', { class: cls, 'aria-hidden': 'true' });
  node.style.setProperty('--icon', `url("${url}")`);
  return node;
}

export const sessionsRoutes: Route[] = [
  {
    pattern: '/menu/sessions',
    tab: 'menu',
    render: (ctx) => {
      const { menu } = ctx.content;
      const { sessions } = menu;
      return el('section', { class: 'screen sessions-screen', 'aria-label': menu.items.sessions }, [
        el('a', { href: '#/menu', class: 'sessions-back', 'aria-label': menu.back }, [
          icon(backArrow, 'sessions-back-icon'),
        ]),
        el('h1', { class: 'sessions-title' }, [menu.items.sessions]),
        el('button', { type: 'button', class: 'sessions-card' }, [
          el('span', { class: 'sessions-current' }, [
            el('span', { class: 'sessions-dot', 'aria-hidden': 'true' }),
            sessions.current,
          ]),
          el('span', { class: 'sessions-device' }, [sessions.device]),
          el('span', { class: 'sessions-meta' }, [sessions.connected]),
          el('span', { class: 'sessions-meta' }, [sessions.lastActive]),
          icon(viewSession, 'sessions-chevron'),
        ]),
      ]);
    },
  },
];
