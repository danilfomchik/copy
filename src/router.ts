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
        params[seg.slice(1)] = decodeURIComponent(parts[i]);
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
  const run = () => {
    const m = matchRoute(routes, currentPath()) ?? matchRoute(routes, '/card');
    if (m) onChange(m);
  };
  addEventListener('hashchange', run);
  run();
}
