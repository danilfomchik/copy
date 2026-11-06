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

  const close = () => {
    if (closed) return;
    closed = true;
    root.remove();
    removeEventListener('keydown', onKey);
    onClose?.();
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close();
  };
  addEventListener('keydown', onKey);
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
  return { close };
}
