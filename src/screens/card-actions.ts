// Actions sheet on the Member card: view details, download PDF, refresh.
// Everything works offline: no network request is made.
import { el } from '../dom';
import { icon } from '../icons';
import { openSheet } from '../sheet';
import type { Content } from '../../content/schema';

export const DEMO_PDF = 'orbit-pass-card-DEMO.pdf';
const REFRESH_MS = 900;

export function actionsButton(content: Content, ribbonText: HTMLElement): HTMLElement {
  const a = content.ui.card.actions;
  const button = el('button', { type: 'button', class: 'card-plus', 'aria-label': a.openLabel }, [icon('plus')]);
  button.addEventListener('click', () => {
    const sheet = openSheet({ label: a.sheetLabel, body: actionList(), className: 'sheet-actions-panel' });

    function actionList(): HTMLElement {
      const details = el('button', { type: 'button', class: 'sheet-action' }, [icon('info'), el('span', {}, [a.viewDetails])]);
      details.addEventListener('click', () => {
        sheet.close();
        location.hash = '#/card/details';
      });

      const pdf = el('a', {
        class: 'sheet-action',
        href: `${import.meta.env.BASE_URL}${DEMO_PDF}`,
        download: DEMO_PDF,
        role: 'button',
      }, [icon('file'), el('span', {}, [a.downloadPdf])]);
      pdf.addEventListener('click', () => setTimeout(sheet.close, 0));

      const refresh = el('button', { type: 'button', class: 'sheet-action' }, [icon('refresh-cw'), el('span', {}, [a.refresh])]);
      refresh.addEventListener('click', () => {
        refresh.disabled = true;
        refresh.append(el('span', { class: 'spinner', role: 'status', 'aria-label': a.refreshing }));
        setTimeout(() => {
          ribbonText.textContent = content.ribbon.refreshedAt;
          sheet.close();
        }, REFRESH_MS);
      });

      return el('div', { class: 'sheet-actions' }, [details, pdf, refresh]);
    }
  });
  return button;
}
