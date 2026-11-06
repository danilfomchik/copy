import { el } from './dom';

// Wraps a front and back face in a flipping container. A tap (or Enter/Space)
// toggles between them; taps on buttons/links inside a face are left alone so
// features like the "+" and bell buttons keep working.
export function flip(front: HTMLElement, back: HTMLElement): HTMLElement {
  const root = el('div', { class: 'flip', tabindex: '0', 'data-testid': 'flip' }, [
    el('div', { class: 'flip-inner' }, [
      el('div', { class: 'flip-face flip-front' }, [front]),
      el('div', { class: 'flip-face flip-back' }, [back]),
    ]),
  ]);
  const toggle = () => root.classList.toggle('flipped');
  root.addEventListener('click', (e) => {
    if ((e.target as Element).closest('button, a')) return;
    toggle();
  });
  root.addEventListener('keydown', (e) => {
    if (e.target !== root || (e.key !== 'Enter' && e.key !== ' ')) return;
    e.preventDefault();
    toggle();
  });
  return root;
}
