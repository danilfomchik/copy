// The Content file schema. Later tickets extend it by adding a section here
// (and to content.json): services, listings, notifications, privacy, ...
// Keep each feature's fields in its own const to avoid merge conflicts.
import { arr, obj, str, type Infer } from './validate.ts';

const ui = obj({
  tabs: obj({ card: str(), services: str(), listings: str(), menu: str() }),
  tabBarLabel: str(),
  back: str(),
  card: obj({
    label: str(),
    avatarAlt: str(),
    holderLabel: str(),
    birthDateLabel: str(),
    tierLabel: str(),
    numberLabel: str(),
    actions: obj({
      openLabel: str(),
      sheetLabel: str(),
      viewDetails: str(),
      downloadPdf: str(),
      refresh: str(),
      refreshing: str(),
    }),
  }),
  details: obj({ title: str(), back: str(), fullNameLabel: str() }),
  listingsIntro: obj({ help: str(), lead: str(), body: str(), hide: str(), start: str() }),
  pwa: obj({ updateAvailable: str(), reload: str(), install: str(), iosHint: str(), dismiss: str() }),
});

const member = obj({
  fullName: str(),
  birthDate: str(),
  tier: str(),
  membershipNumber: str(),
});

const ribbon = obj({ updatedAt: str(), refreshedAt: str() });

const qr = obj({ label: str(), caption: str(), notice: str() });

// Menu tab (Settings, About, Privacy, Help). The About demo notice and the
// Privacy statements are fixed in code, deliberately not editable here.
const menu = obj({
  items: obj({
    settings: str(),
    about: str(),
    privacy: str(),
    help: str(),
    sessions: str(),
    faq: str(),
    support: str(),
    copyDevice: str(),
    scan: str(),
    signOut: str(),
    privacyNotice: str(),
  }),
  back: str(),
  settings: obj({ themeLabel: str(), light: str(), dark: str(), system: str() }),
  about: obj({ versionLabel: str() }),
  help: obj({ sections: arr(obj({ title: str(), body: str() })) }),
});

// Shared shape of an entry that opens a static detail page (Services; reused
// by Listings). `id` becomes the URL segment.
export const detailItem = obj({
  id: str(),
  title: str(),
  description: str(),
  paragraphs: arr(str(), { nonEmpty: true }),
});

const services = arr(detailItem, { uniqueBy: 'id' });
const listings = arr(detailItem, { uniqueBy: 'id' });

// Notifications sheet (bell button on the Member card): static messages.
const notifications = obj({
  openLabel: str(),
  sheetLabel: str(),
  items: arr(obj({ id: str(), title: str(), body: str() })),
});

export const contentSchema = obj({ ui, member, ribbon, services, listings, qr, menu, notifications });
export type Content = Infer<typeof contentSchema>;
