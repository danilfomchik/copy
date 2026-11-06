// Small hash router. A route is a pattern like "/services/:id" mapped to a
// render function; `tab` says which tab-bar item is highlighted for it.
import type { Content } from '../content/schema';

export type TabId = 'card' | 'services' | 'listings' | 'menu';

export interface RouteContext {
  content: Content;
  params: Record<string, string>;
}

export interface Route {
  pattern: string;
  tab: TabId;
  render(ctx: RouteContext): HTMLElement;
}

export function currentPath(): string {
  const p = location.hash.replace(/^#/, '');
  return p.startsWith('/') ? p : '/card';
}

export function matchRoute(
  routes: Route[],
  path: string,
): { route: Route; params: Record<string, string> } | undefined {
  const parts = path.split('/').filter(Boolean);
  for (const route of routes) {
    const pat = route.pattern.split('/').filter(Boolean);
    if (pat.length !== parts.length) continue;
    const params: Record<string, string> = {};
    const ok = pat.every((seg, i) => {
      if (seg.startsWith(':')) {
        try {
          params[seg.slice(1)] = decodeURIComponent(parts[i]);
        } catch {
          return false; // malformed escape such as "%": no match
        }
        return true;
      }
      return seg === parts[i];
    });
    if (ok) return { route, params };
  }
  return undefined;
}

export function startRouter(
  routes: Route[],
  onChange: (m: { route: Route; params: Record<string, string> }) => void,
): void {
  let first = true;
  const run = () => {
    const m = matchRoute(routes, currentPath()) ?? matchRoute(routes, '/card');
    if (!m) return;
    onChange(m);
    if (first) {
      first = false;
      return;
    }
    // New screen: back to the top, and keyboard/screen-reader focus on its heading.
    const screen = document.getElementById('screen');
    const target = screen?.querySelector<HTMLElement>('h1') ?? screen;
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
    scrollTo(0, 0);
  };
  addEventListener('hashchange', run);
  run();
}
