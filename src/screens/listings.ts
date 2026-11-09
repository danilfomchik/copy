import { el } from '../dom';
import circleHelpIcon from '../assets/listings/circle-help.svg?url';
import { readStored, writeStored } from '../storage';
import type { Route } from '../router';
import { detailPage, type DetailItem } from './detail-page';

const LIST_PATH = '/listings/list';

function rowList(items: DetailItem[], label: string): HTMLElement {
  return el('section', { class: 'screen' }, [
    el('h1', {}, [label]),
    el(
      'ul',
      { class: 'row-list', 'aria-label': label },
      items.map((item) =>
        el('li', {}, [
          el('a', { class: 'row', href: `#/listings/${encodeURIComponent(item.id)}` }, [
            el('span', { class: 'row-title' }, [item.title]),
            el('span', { class: 'row-desc' }, [item.description]),
          ]),
        ]),
      ),
    ),
  ]);
}

// Intro screen per the Figma design: sizes in Figma units (1u, see --u).
function intro(content: Parameters<Route['render']>[0]['content']): HTMLElement {
  const t = content.ui.listingsIntro;
  const help = el('a', { class: 'listings-help', href: '#/menu/help', 'aria-label': t.help });
  const glyph = el('span', { class: 'listings-help-icon', 'aria-hidden': 'true' });
  glyph.style.setProperty('--icon', `url("${circleHelpIcon}")`);
  help.append(glyph);

  const checkbox = el('input', { type: 'checkbox', class: 'listings-check' });
  const start = el('a', { class: 'listings-start', href: `#${LIST_PATH}` }, [t.start]);
  // Remember "don't show again" only when the member actually continues.
  start.addEventListener('click', () => {
    if (checkbox.checked) writeStored('orbit.listingsIntroHidden', '1');
  });

  return el('section', { class: 'screen listings-screen' }, [
    help,
    el('h1', { class: 'listings-title' }, [content.ui.tabs.listings]),
    el('p', { class: 'listings-text' }, [t.lead]),
    el('p', { class: 'listings-text' }, [t.body]),
    el('div', { class: 'listings-footer' }, [
      el('label', { class: 'listings-hide' }, [checkbox, el('span', {}, [t.hide])]),
      start,
    ]),
  ]);
}

export const listingsRoutes: Route[] = [
  {
    pattern: '/listings',
    tab: 'listings',
    render: ({ content }) =>
      readStored('orbit.listingsIntroHidden') === '1'
        ? rowList(content.listings, content.ui.tabs.listings)
        : intro(content),
  },
  {
    pattern: LIST_PATH,
    tab: 'listings',
    render: ({ content }) => rowList(content.listings, content.ui.tabs.listings),
  },
  {
    pattern: '/listings/:id',
    tab: 'listings',
    render: ({ content, params }) => {
      const item = content.listings.find((i) => i.id === params.id);
      return item
        ? detailPage(item, content.ui.back, `#${LIST_PATH}`)
        : rowList(content.listings, content.ui.tabs.listings);
    },
  },
];
