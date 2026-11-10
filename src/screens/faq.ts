import { el } from '../dom';
import type { Route } from '../router';
import backArrow from '../assets/faq/back-arrow.svg?url';
import openCategory from '../assets/faq/open-category.svg?url';

function icon(url: string, cls: string): HTMLElement {
  const node = el('span', { class: cls, 'aria-hidden': 'true' });
  node.style.setProperty('--icon', `url("${url}")`);
  return node;
}

// Menu -> Questions and answers: the list of question categories. The demo app
// has no question pages yet, so each category is a button without a destination
// (same as the other unfinished Menu rows).
export const faqRoutes: Route[] = [
  {
    pattern: '/menu/faq',
    tab: 'menu',
    render: (ctx) => {
      const { menu } = ctx.content;
      const title = menu.items.faq;
      const back = el('a', { href: '#/menu', class: 'qa-back', 'aria-label': menu.back }, [
        icon(backArrow, 'qa-back-icon'),
      ]);
      return el('section', { class: 'screen qa-screen', 'aria-labelledby': 'qa-title' }, [
        back,
        el('h1', { class: 'qa-title', id: 'qa-title' }, [title]),
        el(
          'ul',
          { class: 'qa-list', 'aria-label': title },
          menu.faq.categories.map((name) =>
            el('li', {}, [
              el('button', { type: 'button', class: 'qa-row' }, [
                el('span', { class: 'qa-label' }, [name]),
                icon(openCategory, 'qa-chevron'),
              ]),
            ]),
          ),
        ),
      ]);
    },
  },
];
