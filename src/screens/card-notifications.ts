// Notifications sheet on the Member card: a pill-shaped bell button that opens
// a list of static Notifications from the Content file.
import { el } from '../dom';
import { openSheet } from '../sheet';
import type { Content } from '../../content/schema';

export function notificationsButton(content: Content): HTMLElement {
  const n = content.notifications;
  const button = el('button', { type: 'button', class: 'card-bell', 'aria-label': n.openLabel }, ['🔔']);
  button.addEventListener('click', () => {
    const items = n.items.map((item) =>
      el('li', { class: 'notification' }, [
        el('strong', { class: 'notification-title' }, [item.title]),
        el('p', { class: 'notification-body' }, [item.body]),
      ]),
    );
    openSheet({ label: n.sheetLabel, body: el('ul', { class: 'notification-list' }, items) });
  });
  return button;
}
