// Actions sheet on the Member card: view details, download PDF, refresh.
// Everything works offline: no network request is made.
import { el } from '../dom';
import { openSheet } from '../sheet';
import type { Content } from '../../content/schema';

export const DEMO_PDF = 'orbit-pass-card-DEMO.pdf';
const REFRESH_MS = 900;

export function actionsButton(content: Content, ribbonText: HTMLElement): HTMLElement {
  const a = content.ui.card.actions;
  const button = el('button', { type: 'button', class: 'card-plus', 'aria-label': a.openLabel }, ['+']);
  button.addEventListener('click', () => {
    const sheet = openSheet({ label: a.sheetLabel, body: actionList() });

    function actionList(): HTMLElement {
      const details = el('button', { type: 'button', class: 'sheet-action' }, [a.viewDetails]);
      details.addEventListener('click', () => {
        sheet.close();
        location.hash = '#/card/details';
      });

      const pdf = el('a', {
        class: 'sheet-action',
        href: `${import.meta.env.BASE_URL}${DEMO_PDF}`,
        download: DEMO_PDF,
        role: 'button',
      }, [a.downloadPdf]);
      pdf.addEventListener('click', () => setTimeout(sheet.close, 0));

      const refresh = el('button', { type: 'button', class: 'sheet-action' }, [a.refresh]);
      refresh.addEventListener('click', () => {
        refresh.disabled = true;
        refresh.append(el('span', { class: 'spinner', role: 'status', 'aria-label': a.refreshing }));
        setTimeout(() => {
          ribbonText.textContent = `${content.ui.card.ribbonUpdated} ${content.ribbon.refreshedAt}`;
          sheet.close();
        }, REFRESH_MS);
      });

      return el('div', { class: 'sheet-actions' }, [details, pdf, refresh]);
    }
  });
  return button;
}
