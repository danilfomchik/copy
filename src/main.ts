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

// iOS standalone PWAs can launch with a layout viewport shorter than the screen, then grow it
// to full height on the first scroll, so anything tied to the viewport bottom jumps. Publish
// the screen height as --screen-h (the tab bar hangs from it, so it never moves) and the
// current shortfall as --vp-gap (for screens that must fit without scrolling).
function syncViewportGap(): void {
  const standalone =
    (navigator as Navigator & { standalone?: boolean }).standalone === true ||
    matchMedia('(display-mode: standalone)').matches;
  const root = document.documentElement.style;
  if (!standalone) {
    root.removeProperty('--screen-h');
    root.setProperty('--vp-gap', '0px');
    return;
  }
  const portrait = window.innerHeight >= window.innerWidth;
  const screenH = portrait ? Math.max(screen.width, screen.height) : Math.min(screen.width, screen.height);
  root.setProperty('--screen-h', `${screenH}px`);
  root.setProperty('--vp-gap', `${Math.max(0, Math.round(screenH - window.innerHeight))}px`);
}
syncViewportGap();

// On launch, iOS can leave the shortened viewport in place and paint nothing below it until
// the first scroll, which cuts off the tab labels. Hiding and re-showing the full-height app
// root with a forced reflow in between makes WebKit re-measure the viewport (a reported
// workaround for the same shrink after the keyboard closes; experimental for the launch case).
function healViewport(): void {
  const gap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--vp-gap'));
  const root = document.getElementById('app');
  if (!root || !(gap > 4)) return;
  const scroller = document.scrollingElement;
  const top = scroller?.scrollTop ?? 0;
  root.style.display = 'none';
  void root.offsetHeight;
  root.style.display = '';
  if (scroller) scroller.scrollTop = top;
  syncViewportGap();
}
for (const ms of [0, 150, 500, 1500]) setTimeout(healViewport, ms);
addEventListener('pageshow', () => setTimeout(healViewport, 50));
addEventListener('hashchange', () => setTimeout(healViewport, 50));
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') setTimeout(healViewport, 50);
});
addEventListener('resize', syncViewportGap);
addEventListener('scroll', syncViewportGap, { passive: true });
window.visualViewport?.addEventListener('resize', syncViewportGap);
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
