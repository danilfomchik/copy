// Full-screen page with every Member field from the Content file.
import { el } from '../dom';
import type { Route } from '../router';

export const cardDetailsRoute: Route = {
  pattern: '/card/details',
  tab: 'card',
  render: ({ content }) => {
    const { ui, member } = content;
    const row = (label: string, value: string) =>
      el('div', { class: 'field' }, [el('dt', {}, [label]), el('dd', {}, [value])]);
    return el('section', { class: 'screen details-screen' }, [
      el('a', { href: '#/card', class: 'back' }, [ui.details.back]),
      el('h1', {}, [ui.details.title]),
      el('dl', { class: 'details-fields' }, [
        row(ui.details.fullNameLabel, member.fullName),
        row(ui.card.birthDateLabel, member.birthDate),
        row(ui.card.tierLabel, member.tier),
        row(ui.card.numberLabel, member.membershipNumber),
      ]),
    ]);
  },
};
