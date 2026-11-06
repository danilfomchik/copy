import content from 'virtual:content';
import './style.css';
import { el } from './dom';
import { routes } from './routes';
import { startRouter, type TabId } from './router';

const TABS: TabId[] = ['card', 'services', 'listings', 'menu'];

const app = document.getElementById('app')!;
const main = el('main', { id: 'screen' });
const nav = el('nav', { class: 'tabbar', 'aria-label': content.ui.tabBarLabel });
const links = new Map<TabId, HTMLAnchorElement>();
for (const tab of TABS) {
  const a = el('a', { href: `#/${tab}`, class: 'tab' }, [content.ui.tabs[tab]]);
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

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL });
}
