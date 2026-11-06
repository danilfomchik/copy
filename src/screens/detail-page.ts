// Reusable list/detail pattern (Services, Listings). A tab provides its items
// (shape `DetailItem`, see detailItem in content/schema.ts) and gets back the
// two routes: `/<tab>` (tile grid) and `/<tab>/:id` (static detail page).
import { el } from '../dom';
import type { Route, TabId } from '../router';

export interface DetailItem {
  id: string;
  title: string;
  description: string;
  paragraphs: string[];
}

/** Back control: a plain link to the list route, so it also works on deep links. */
export function backControl(label: string, href: string): HTMLElement {
  return el('a', { class: 'back', href }, [label]);
}

/** Detail page: back control, title, short description, then the paragraphs. */
export function detailPage(item: DetailItem, backLabel: string, backHref: string): HTMLElement {
  return el('section', { class: 'screen' }, [
    backControl(backLabel, backHref),
    el('article', { class: 'detail' }, [
      el('h1', {}, [item.title]),
      el('p', { class: 'lead' }, [item.description]),
      ...item.paragraphs.map((p) => el('p', {}, [p])),
    ]),
  ]);
}

/** Grid of tiles, each linking to the item's detail page. */
export function tileGrid(items: DetailItem[], tab: string, listLabel: string): HTMLElement {
  return el('section', { class: 'screen' }, [
    el('h1', {}, [listLabel]),
    el(
      'ul',
      { class: 'tile-grid', 'aria-label': listLabel },
      items.map((item) =>
        el('li', {}, [
          el('a', { class: 'tile', href: `#/${tab}/${encodeURIComponent(item.id)}` }, [
            el('span', { class: 'tile-title' }, [item.title]),
            el('span', { class: 'tile-desc' }, [item.description]),
          ]),
        ]),
      ),
    ),
  ]);
}

/** Builds the list + detail routes for a tab from a getter of its items. */
export function listDetailRoutes(
  tab: TabId,
  getItems: (content: Parameters<Route['render']>[0]['content']) => DetailItem[],
): Route[] {
  return [
    {
      pattern: `/${tab}`,
      tab,
      render: ({ content }) => tileGrid(getItems(content), tab, content.ui.tabs[tab]),
    },
    {
      pattern: `/${tab}/:id`,
      tab,
      render: ({ content, params }) => {
        const item = getItems(content).find((i) => i.id === params.id);
        if (!item) return tileGrid(getItems(content), tab, content.ui.tabs[tab]);
        return detailPage(item, content.ui.back, `#/${tab}`);
      },
    },
  ];
}
