import { el } from '../dom';
import type { Route, TabId } from '../router';

// Stand-in screen for tabs that are not built yet. Replace in the tab's own module.
export function placeholderRoute(tab: TabId): Route {
  return {
    pattern: `/${tab}`,
    tab,
    render: ({ content }) =>
      el('section', { class: 'screen', 'aria-label': content.ui.tabs[tab] }, [
        el('h1', {}, [content.ui.tabs[tab]]),
        el('p', { class: 'placeholder' }, [content.ui.placeholder]),
      ]),
  };
}
