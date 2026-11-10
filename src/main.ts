import content from 'virtual:content';
import './style.css';
import { el } from './dom';
import { icon } from './icons';
import { routes } from './routes';
import { startPwa } from './pwa';
import { startRouter, type TabId } from './router';

const TABS: TabId[] = ['card', 'services', 'listings', 'menu'];

const app = document.getElementById('app')!;
const main = el('main', { id: 'screen' });
const nav = el('nav', { class: 'tabbar', 'aria-label': content.ui.tabBarLabel });
const links = new Map<TabId, HTMLAnchorElement>();
for (const tab of TABS) {
  const a = el('a', { href: `#/${tab}`, class: 'tab' }, [icon(tab), el('span', {}, [content.ui.tabs[tab]])]);
  links.set(tab, a);
  nav.append(a);
}
app.append(main, nav);

startRouter(routes, ({ route, params }) => {
  main.replaceChildren(route.render({ content, params }));
  for (const [tab, a] of links) {
    if (tab === route.tab) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  }
});

startPwa(app, content.ui.pwa);
