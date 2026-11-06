// Reusable bottom sheet: dimmed backdrop, drag handle, closes by backdrop tap
// or swipe down (drag the sheet down past a threshold). Used by the Actions
// sheet and the Notifications sheet.
import { el } from './dom';

export interface SheetOptions {
  /** Accessible name of the dialog. */
  label: string;
  /** Sheet body. */
  body: Node;
  /** Called after the sheet is removed, however it was closed. */
  onClose?: () => void;
}

export interface Sheet {
  close(): void;
}

const SWIPE_CLOSE_PX = 80;

export function openSheet({ label, body, onClose }: SheetOptions): Sheet {
  const handle = el('div', { class: 'sheet-handle' });
  const panel = el('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': label }, [
    el('div', { class: 'sheet-grab' }, [handle]),
    body,
  ]);
  const backdrop = el('div', { class: 'sheet-backdrop' });
  const root = el('div', { class: 'sheet-root' }, [backdrop, panel]);
  let closed = false;
  const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;

  const close = () => {
    if (closed) return;
    closed = true;
    root.remove();
    removeEventListener('keydown', onKey);
    removeEventListener('hashchange', close);
    if (opener?.isConnected) opener.focus();
    onClose?.();
  };
  const focusables = () =>
    [...panel.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, [tabindex]')].filter(
      (n) => n.tabIndex >= 0 && !n.hasAttribute('disabled'),
    );
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close();
    if (e.key !== 'Tab') return;
    // Trap Tab inside the dialog.
    const items = focusables();
    const first = items[0] ?? panel;
    const last = items[items.length - 1] ?? panel;
    const active = document.activeElement;
    if (!panel.contains(active)) {
      e.preventDefault();
      first.focus();
    } else if (e.shiftKey && (active === first || active === panel)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };
  addEventListener('keydown', onKey);
  addEventListener('hashchange', close);
  backdrop.addEventListener('click', close);

  // Swipe down: drag from the grab area.
  const grab = panel.firstElementChild as HTMLElement;
  let startY: number | null = null;
  grab.addEventListener('pointerdown', (e) => {
    startY = e.clientY;
    grab.setPointerCapture(e.pointerId);
  });
  grab.addEventListener('pointermove', (e) => {
    if (startY === null) return;
    panel.style.transform = `translateY(${Math.max(0, e.clientY - startY)}px)`;
  });
  const end = (e: PointerEvent) => {
    if (startY === null) return;
    const dy = e.clientY - startY;
    startY = null;
    if (dy > SWIPE_CLOSE_PX) close();
    else panel.style.transform = '';
  };
  grab.addEventListener('pointerup', end);
  grab.addEventListener('pointercancel', end);

  document.body.append(root);
  panel.tabIndex = -1;
  (focusables()[0] ?? panel).focus();
  return { close };
}
