import { el } from '../dom';
import type { Route, RouteContext } from '../router';
import { faqRoutes } from './faq';
import copyIcon from '../assets/menu/copy.svg?url';
import disclosureIcon from '../assets/menu/disclosure.svg?url';
import messagesIcon from '../assets/menu/messages-square.svg?url';
import scanIcon from '../assets/menu/scan-qr-code.svg?url';
import backArrowIcon from '../assets/settings/back-arrow.svg?url';
import settingsIcon from '../assets/menu/settings.svg?url';
import smartphoneIcon from '../assets/menu/smartphone.svg?url';
import wrenchIcon from '../assets/menu/wrench.svg?url';

declare const __APP_VERSION__: string;

// Fixed in code on purpose: the Content file cannot remove or soften these.
const DEMO_NOTICE = 'Це демонстраційний застосунок з вигаданими даними.';
const PRIVACY_STATEMENTS = [
  'Застосунок не надсилає жодних мережевих запитів.',
  'Немає облікових записів, аналітики, файлів cookie чи трекерів.',
  'Зберігаються лише вибір теми, закриття підказки про встановлення та прапорець «Більше не показувати» на вкладці оголошень.',
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

// The switches are visual only for now: the demo app has no PIN, Face ID,
// push or offline-QR features, so they just hold local state.
function switchRow(label: string, on: boolean): HTMLElement {
  const toggle = el('button', {
    type: 'button',
    role: 'switch',
    class: 'settings-switch',
    'aria-checked': String(on),
  });
  toggle.addEventListener('click', () => {
    toggle.setAttribute('aria-checked', String(toggle.getAttribute('aria-checked') !== 'true'));
  });
  toggle.setAttribute('aria-label', label);
  return el('div', { class: 'settings-row' }, [el('span', { class: 'settings-label' }, [label]), toggle]);
}

function settings(ctx: RouteContext): HTMLElement {
  const { menu } = ctx.content;
  const back = el('a', { href: '#/menu', class: 'settings-back', 'aria-label': menu.back });
  back.append(icon(backArrowIcon, 'settings-back-icon'));
  return el('section', { class: 'screen settings-screen' }, [
    back,
    el('h1', { class: 'settings-title' }, [menu.items.settings]),
    el('div', { class: 'settings-card' }, [
      el('button', { type: 'button', class: 'settings-row settings-row-button' }, [
        el('span', { class: 'settings-label' }, ['Змінити код для входу']),
      ]),
      switchRow('Використовувати Face ID', true),
      switchRow('Отримувати сповіщення про повістки, надіслані Укрпоштою', false),
      switchRow('Перевіряти QR офлайн', false),
    ]),
  ]);
}

// Icons are CSS masks so they follow the theme's text colour.
function icon(url: string, cls = 'menu-icon'): HTMLElement {
  const node = el('span', { class: cls, 'aria-hidden': 'true' });
  node.style.setProperty('--icon', `url("${url}")`);
  return node;
}

// `href` makes a row a link; without it the row is a button with no destination
// yet (the demo app has no sessions, support chat, scanner or account).
function row(label: string, iconUrl: string, href?: string, chevron = false): HTMLElement {
  const children: Node[] = [icon(iconUrl), el('span', { class: 'menu-label' }, [label])];
  if (chevron) children.push(icon(disclosureIcon, 'menu-chevron'));
  return href
    ? el('a', { href, class: 'menu-row' }, children)
    : el('button', { type: 'button', class: 'menu-row' }, children);
}

function group(rows: HTMLElement[]): HTMLElement {
  return el('div', { class: 'menu-group' }, rows);
}

export const menuRoutes: Route[] = [
  ...faqRoutes,
  {
    pattern: '/menu',
    tab: 'menu',
    render: (ctx) => {
      const { ui, menu } = ctx.content;
      const { items } = menu;
      return el('section', { class: 'screen menu-screen', 'aria-label': ui.tabs.menu }, [
        el('h1', { class: 'menu-title' }, [ui.tabs.menu]),
        el('a', { href: '#/menu/about', class: 'menu-version' }, [
          `${menu.about.versionLabel} ${__APP_VERSION__}`,
        ]),
        group([
          row(items.sessions, smartphoneIcon, '#/menu/sessions', true),
          row(items.settings, settingsIcon, '#/menu/settings', true),
        ]),
        group([
          row(items.faq, messagesIcon, '#/menu/faq', true),
          row(items.support, wrenchIcon, undefined, true),
          row(items.copyDevice, copyIcon),
        ]),
        group([row(items.scan, scanIcon)]),
        el('button', { type: 'button', class: 'menu-signout' }, [items.signOut]),
        el('a', { href: '#/menu/privacy', class: 'menu-privacy' }, [items.privacyNotice]),
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
