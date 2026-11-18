// PIN gate and its companion pages (Lockout, Forgot-PIN, Offline). Each view
// replaces the contents of `root`; `onUnlock` is called with the Member once the
// PIN is accepted. Nothing here is persisted.
import backspace from './assets/gate/backspace.svg?url';
import { el } from './dom';
import { signInWithPin } from './auth';
import type { Member } from './member';
import type { Content } from '../content/schema';

const PIN_LENGTH = 4;
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

type Gate = Content['ui']['gate'];

function statusPage(title: string, body: string, action: { label: string; run: () => void }): HTMLElement {
  const button = el('button', { type: 'button', class: 'gate-link' }, [action.label]);
  button.addEventListener('click', action.run);
  return el('section', { class: 'gate gate-status' }, [
    el('h1', { class: 'gate-title' }, [title]),
    el('p', { class: 'gate-text', role: 'status' }, [body]),
    button,
  ]);
}

export function showGate(root: HTMLElement, content: Content, onUnlock: (m: Member) => void): void {
  const g: Gate = content.ui.gate;
  const show = (node: HTMLElement) => {
    root.replaceChildren(node);
    const heading = node.querySelector<HTMLElement>('h1');
    heading?.setAttribute('tabindex', '-1'); // focus the heading, not the first key
    heading?.focus({ preventScroll: true });
  };
  const gate = () => show(pinView());
  const offline = () =>
    show(
      statusPage(g.offline.title, g.offline.body, {
        label: g.offline.retry,
        run: () => (navigator.onLine ? gate() : offline()),
      }),
    );
  const lockedOut = () => show(statusPage(g.lockout.title, g.lockout.body, { label: g.lockout.retry, run: gate }));
  const forgot = () => {
    const back = el('button', { type: 'button', class: 'gate-link' }, [g.back]);
    back.addEventListener('click', gate);
    show(
      el('section', { class: 'gate gate-status' }, [
        el('h1', { class: 'gate-title' }, [g.forgotPin.title]),
        el('p', { class: 'gate-text' }, [g.forgotPin.body]),
        back,
      ]),
    );
  };

  function pinView(): HTMLElement {
    let pin = '';
    let busy = false;
    const dots = Array.from({ length: PIN_LENGTH }, () => el('span', { class: 'gate-dot' }));
    const dotRow = el('div', { class: 'gate-dots', role: 'img' }, dots);
    const message = el('p', { class: 'gate-message', role: 'alert' });

    const render = () => {
      dots.forEach((d, i) => d.classList.toggle('filled', i < pin.length));
      dotRow.setAttribute('aria-label', `${g.digitsLabel}: ${pin.length}/${PIN_LENGTH}`);
    };

    async function submit() {
      busy = true;
      message.textContent = g.checking;
      const result = await signInWithPin(pin);
      busy = false;
      if (result.ok) return onUnlock(result.member);
      pin = '';
      render();
      if (result.reason === 'locked') return lockedOut();
      if (result.reason === 'offline') return offline();
      message.textContent = g.wrong;
      dotRow.classList.remove('shake');
      void dotRow.offsetWidth; // restart the animation
      dotRow.classList.add('shake');
    }

    const press = (digit: string) => {
      if (busy || pin.length >= PIN_LENGTH) return;
      message.textContent = '';
      pin += digit;
      render();
      if (pin.length === PIN_LENGTH) void submit();
    };
    const remove = () => {
      if (busy) return;
      pin = pin.slice(0, -1);
      render();
    };

    const key = (digit: string) => {
      const b = el('button', { type: 'button', class: 'gate-key' }, [digit]);
      b.addEventListener('click', () => press(digit));
      return b;
    };
    const del = el('button', { type: 'button', class: 'gate-key gate-del', 'aria-label': g.deleteLabel }, [
      el('img', { src: backspace, alt: '', width: '38', height: '30' }),
    ]);
    del.addEventListener('click', remove);
    // The Face ID slot in the design stays empty: a web app cannot use it.
    const keypad = el('div', { class: 'gate-keypad', role: 'group', 'aria-label': g.keypadLabel }, [
      ...KEYS.map(key),
      el('span', { 'aria-hidden': 'true' }),
      key('0'),
      del,
    ]);
    const forgotLink = el('button', { type: 'button', class: 'gate-link' }, [g.forgot]);
    forgotLink.addEventListener('click', forgot);

    const view = el('section', { class: 'gate' }, [
      el('h1', { class: 'gate-title' }, [g.title]),
      dotRow,
      message,
      keypad,
      forgotLink,
    ]);
    addEventListener('keydown', function onKey(e) {
      if (!view.isConnected) return removeEventListener('keydown', onKey);
      if (/^\d$/.test(e.key)) press(e.key);
      else if (e.key === 'Backspace') remove();
    });
    render();
    return view;
  }

  if (!navigator.onLine) offline();
  else gate();
}
