import { el } from '../dom';
import type { Route, RouteContext } from '../router';
import { THEMES, getTheme, setTheme, type Theme } from '../theme';

declare const __APP_VERSION__: string;

// Fixed in code on purpose: the Content file cannot remove or soften these.
const DEMO_NOTICE = 'Це демонстраційний застосунок з вигаданими даними.';
const PRIVACY_STATEMENTS = [
  'Застосунок не надсилає жодних мережевих запитів.',
  'Немає облікових записів, аналітики, файлів cookie чи трекерів.',
  'Зберігаються лише вибір теми та закриття підказки про встановлення.',
  'Усі дані вигадані.',
  'Застосунок схований від пошукових систем.',
];

function screen(ctx: RouteContext, title: string, body: Node[]): HTMLElement {
  return el('section', { class: 'screen' }, [
    el('a', { href: '#/menu', class: 'back' }, [ctx.content.menu.back]),
    el('h1', {}, [title]),
    ...body,
  ]);
}

function settings(ctx: RouteContext): HTMLElement {
  const { menu } = ctx.content;
  const labels: Record<Theme, string> = {
    light: menu.settings.light,
    dark: menu.settings.dark,
    system: menu.settings.system,
  };
  const current = getTheme();
  const group = el('fieldset', { class: 'theme-group' }, [
    el('legend', {}, [menu.settings.themeLabel]),
  ]);
  for (const theme of THEMES) {
    const input = el('input', { type: 'radio', name: 'theme', value: theme });
    input.checked = theme === current;
    input.addEventListener('change', () => setTheme(theme));
    group.append(el('label', { class: 'theme-option' }, [input, labels[theme]]));
  }
  return screen(ctx, menu.items.settings, [group]);
}

export const menuRoutes: Route[] = [
  {
    pattern: '/menu',
    tab: 'menu',
    render: (ctx) => {
      const { ui, menu } = ctx.content;
      const entries: [string, string][] = [
        ['settings', menu.items.settings],
        ['about', menu.items.about],
        ['privacy', menu.items.privacy],
        ['help', menu.items.help],
      ];
      return el('section', { class: 'screen', 'aria-label': ui.tabs.menu }, [
        el('h1', {}, [ui.tabs.menu]),
        el(
          'div',
          { class: 'menu-list' },
          entries.map(([id, label]) => el('a', { href: `#/menu/${id}`, class: 'menu-item' }, [label])),
        ),
      ]);
    },
  },
  { pattern: '/menu/settings', tab: 'menu', render: settings },
  {
    pattern: '/menu/about',
    tab: 'menu',
    render: (ctx) =>
      screen(ctx, ctx.content.menu.items.about, [
        el('p', {}, [`${ctx.content.menu.about.versionLabel} ${__APP_VERSION__}`]),
        el('p', { class: 'demo-notice', role: 'note' }, [DEMO_NOTICE]),
      ]),
  },
  {
    pattern: '/menu/privacy',
    tab: 'menu',
    render: (ctx) =>
      screen(ctx, ctx.content.menu.items.privacy, [
        el('ul', { class: 'privacy-list' }, PRIVACY_STATEMENTS.map((t) => el('li', {}, [t]))),
      ]),
  },
  {
    pattern: '/menu/help',
    tab: 'menu',
    render: (ctx) =>
      screen(
        ctx,
        ctx.content.menu.items.help,
        ctx.content.menu.help.sections.map((s) =>
          el('div', { class: 'help-section' }, [el('h2', {}, [s.title]), el('p', {}, [s.body])]),
        ),
      ),
  },
];
