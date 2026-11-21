import { el } from './dom';

// Each half of the turn (face → edge-on, edge-on → other face), matching the original app.
const HALF_MS = 200;
// How dark the card gets when it is edge-on.
const MAX_SHADE = 0.5;

// Wraps a front and back face in a flipping container. A tap (or Enter/Space)
// toggles between them; taps on buttons/links inside a face are left alone so
// features like the "+" and bell buttons keep working.
//
// The turn is two half-turns: the shown face rotates to edge-on (90°) while
// darkening, the faces swap, and the other face rotates in from -90° while
// lightening. Only one face is ever rendered, so nothing relies on
// backface-visibility, which iOS Safari ignores for a face's own composited
// layers (the scrolling ribbon leaked through mirrored, and the back vanished).
export function flip(front: HTMLElement, back: HTMLElement): HTMLElement {
  const frontFace = el('div', { class: 'flip-face flip-front' }, [front]);
  const backFace = el('div', { class: 'flip-face flip-back', hidden: '' }, [back]);
  const shade = el('div', { class: 'flip-shade', 'aria-hidden': 'true' });
  const inner = el('div', { class: 'flip-inner' }, [frontFace, backFace, shade]);
  const root = el('div', { class: 'flip', tabindex: '0', 'data-testid': 'flip' }, [inner]);

  let busy = false;
  const show = (flipped: boolean) => {
    root.classList.toggle('flipped', flipped);
    frontFace.hidden = flipped;
    backFace.hidden = !flipped;
  };

  const toggle = async () => {
    if (busy) return;
    const next = !root.classList.contains('flipped');
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !inner.animate) {
      show(next);
      return;
    }
    busy = true;
    try {
      const half = (from: number, to: number, shadeFrom: number, shadeTo: number, easing: string) =>
        Promise.all([
          inner.animate([{ transform: `rotateY(${from}deg)` }, { transform: `rotateY(${to}deg)` }], {
            duration: HALF_MS,
            easing,
            fill: 'forwards',
          }).finished,
          shade.animate([{ opacity: shadeFrom }, { opacity: shadeTo }], {
            duration: HALF_MS,
            easing,
            fill: 'forwards',
          }).finished,
        ]);
      await half(0, 90, 0, MAX_SHADE, 'ease-in');
      show(next);
      await half(-90, 0, MAX_SHADE, 0, 'ease-out');
    } finally {
      inner.getAnimations().forEach((a) => a.cancel());
      shade.getAnimations().forEach((a) => a.cancel());
      busy = false;
    }
  };

  root.addEventListener('click', (e) => {
    if ((e.target as Element).closest('button, a')) return;
    void toggle();
  });
  root.addEventListener('keydown', (e) => {
    if (e.target !== root || (e.key !== 'Enter' && e.key !== ' ')) return;
    e.preventDefault();
    void toggle();
  });
  return root;
}
