import { el } from '../dom';
import { listDetailRoutes, type DetailItem } from './detail-page';

// Listings reuse the Services list/detail routes, but render rows, not tiles.
function rowList(items: DetailItem[], tab: string, label: string): HTMLElement {
  return el('section', { class: 'screen' }, [
    el('h1', {}, [label]),
    el(
      'ul',
      { class: 'row-list', 'aria-label': label },
      items.map((item) =>
        el('li', {}, [
          el('a', { class: 'row', href: `#/${tab}/${encodeURIComponent(item.id)}` }, [
            el('span', { class: 'row-title' }, [item.title]),
            el('span', { class: 'row-desc' }, [item.description]),
          ]),
        ]),
      ),
    ),
  ]);
}

export const listingsRoutes = listDetailRoutes('listings', (c) => c.listings, rowList);
