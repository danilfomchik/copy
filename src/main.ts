import content from 'virtual:content';
import './style.css';
import { el } from './dom';
import { icon } from './icons';
import { routes } from './routes';
import { startPwa } from './pwa';
import { startRouter, type TabId } from './router';
import { showGate } from './gate';
import { lock } from './auth';
import type { Member } from './member';

// iOS standalone PWAs can report a layout viewport shorter than the screen, so `bottom: 0`
// stops short and a strip of page background shows under the tab bar. Measure the gap and
// publish it as --vp-gap, which the tab bar uses to sit flush with the screen bottom.
function syncViewportGap(): void {
  const standalone =
    (navigator as Navigator & { standalone?: boolean }).standalone === true ||
    matchMedia('(display-mode: standalone)').matches;
  const portrait = window.innerHeight >= window.innerWidth;
  const screenH = portrait ? Math.max(screen.width, screen.height) : Math.min(screen.width, screen.height);
  const gap = standalone ? Math.max(0, Math.round(screenH - window.innerHeight)) : 0;
  document.documentElement.style.setProperty('--vp-gap', `${gap}px`);
}
syncViewportGap();
addEventListener('resize', syncViewportGap);
addEventListener('orientationchange', () => setTimeout(syncViewportGap, 300));

const TABS: TabId[] = ['card', 'services', 'listings', 'menu'];

const RELOCK_MS = 5 * 60 * 1000;

const app = document.getElementById('app')!;
// Gate and app views live here; the PWA banners are appended to #app beside it.
const view = el('div', { class: 'view' });
app.append(view);
let stopRouter: (() => void) | undefined;

function lockApp(): void {
  stopRouter?.();
  stopRouter = undefined;
  void lock();
  location.hash = '';
  startGate();
}

function startGate(): void {
  view.replaceChildren();
  showGate(view, content, mountApp);
}

function mountApp(member: Member): void {
  const main = el('main', { id: 'screen' });
  const nav = el('nav', { class: 'tabbar', 'aria-label': content.ui.tabBarLabel });
  const links = new Map<TabId, HTMLAnchorElement>();
  for (const tab of TABS) {
    const a = el('a', { href: `#/${tab}`, class: 'tab' }, [icon(tab), el('span', {}, [content.ui.tabs[tab]])]);
    links.set(tab, a);
    nav.append(a);
  }
  view.replaceChildren(main, nav);

  stopRouter = startRouter(routes, ({ route, params }) => {
    main.replaceChildren(route.render({ content, member, params, lock: lockApp }));
    for (const [tab, a] of links) {
      if (tab === route.tab) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    }
  });
}

// Relock after about five minutes in the background. Timestamps, not timers:
// background tabs throttle timers.
let hiddenAt = 0;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) hiddenAt = Date.now();
  else if (hiddenAt && Date.now() - hiddenAt >= RELOCK_MS && !view.querySelector('.gate')) lockApp();
});

startGate();
startPwa(app, content.ui.pwa);
