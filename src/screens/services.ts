import { el } from '../dom';
import disclosureIcon from '../assets/menu/disclosure.svg?url';
import { listDetailRoutes, type DetailItem } from './detail-page';

// Services render as a plain list of rows with a chevron, per the Figma design.
// The item description is not shown here; it appears on the detail page.
function serviceList(items: DetailItem[], tab: string, label: string): HTMLElement {
  return el('section', { class: 'screen services-screen' }, [
    el('h1', { class: 'services-title' }, [label]),
    el(
      'ul',
      { class: 'services-list', 'aria-label': label },
      items.map((item) => {
        const chevron = el('span', { class: 'menu-chevron', 'aria-hidden': 'true' });
        chevron.style.setProperty('--icon', `url("${disclosureIcon}")`);
        return el('li', {}, [
          el('a', { class: 'service-row', href: `#/${tab}/${encodeURIComponent(item.id)}` }, [
            el('span', { class: 'menu-label' }, [item.title]),
            chevron,
          ]),
        ]);
      }),
    ),
  ]);
}

export const servicesRoutes = listDetailRoutes('services', (c) => c.services, serviceList);
