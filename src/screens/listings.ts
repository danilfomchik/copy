import { el } from '../dom';
import { detailPage, type DetailItem } from './detail-page';
import type { Route } from '../router';

// Listings reuse the Services detail page, but the list is rows, not tiles.
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

export const listingsRoutes: Route[] = [
  {
    pattern: '/listings',
    tab: 'listings',
    render: ({ content }) => rowList(content.listings, content.ui.tabs.listings),
  },
  {
    pattern: '/listings/:id',
    tab: 'listings',
    render: ({ content, params }) => {
      const item = content.listings.find((i) => i.id === params.id);
      if (!item) return rowList(content.listings, content.ui.tabs.listings);
      return detailPage(item, content.ui.back, '#/listings');
    },
  },
];
