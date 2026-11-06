// Service worker registration, the update banner, the Android install control
// and the one-time iOS "Add to Home Screen" hint.
import { el } from './dom';
import { readStored, writeStored } from './storage';

interface PwaStrings {
  updateAvailable: string;
  reload: string;
  install: string;
  iosHint: string;
  dismiss: string;
}

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
}

function notice(text: string, buttonLabel: string, onClick: () => void, hidden: boolean) {
  const button = el('button', { type: 'button' }, [buttonLabel]);
  button.addEventListener('click', onClick);
  const box = el('div', { class: 'pwa-notice' }, [el('p', {}, [text]), button]);
  box.hidden = hidden;
  return box;
}

function isIosSafariBrowser(): boolean {
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua);
  const safari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  const standalone =
    (navigator as Navigator & { standalone?: boolean }).standalone === true ||
    matchMedia('(display-mode: standalone)').matches;
  return ios && safari && !standalone;
}

export function startPwa(app: HTMLElement, t: PwaStrings): void {
  const stack = el('div', { class: 'pwa-stack' });
  app.append(stack);

  // Android: keep the browser's install prompt and offer it from a button.
  let deferred: InstallPromptEvent | null = null;
  const install = notice(
    t.install,
    t.install,
    () => {
      const e = deferred;
      deferred = null;
      install.hidden = true;
      void e?.prompt();
    },
    true,
  );
  // the label doubles as the message, so show only the button text once
  install.querySelector('p')!.remove();
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as InstallPromptEvent;
    install.hidden = false;
  });
  stack.append(install);

  // iOS: explain Share -> Add to Home Screen once.
  if (isIosSafariBrowser() && !readStored('orbit.installHintDismissed')) {
    const hint = notice(
      t.iosHint,
      t.dismiss,
      () => {
        writeStored('orbit.installHintDismissed', '1');
        hint.remove();
      },
      false,
    );
    stack.append(hint);
  }

  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return;

  // Update banner: shown while a new worker waits; reload only on user choice.
  let waiting: ServiceWorker | null = null;
  let userChose = false;
  const update = notice(
    t.updateAvailable,
    t.reload,
    () => {
      userChose = true;
      waiting?.postMessage({ type: 'SKIP_WAITING' });
    },
    true,
  );
  update.setAttribute('role', 'status');
  stack.append(update);
  const offer = (worker: ServiceWorker | null) => {
    if (!worker || !navigator.serviceWorker.controller) return;
    waiting = worker;
    update.hidden = false;
  };

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (userChose) location.reload();
  });
  navigator.serviceWorker
    .register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL })
    .then((reg) => {
      offer(reg.waiting);
      reg.addEventListener('updatefound', () => {
        const next = reg.installing;
        next?.addEventListener('statechange', () => {
          if (next.state === 'installed') offer(next);
        });
      });
    });
}
