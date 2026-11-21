// The Content file schema. Later tickets extend it by adding a section here
// (and to content.json): services, listings, notifications, privacy, ...
// Keep each feature's fields in its own const to avoid merge conflicts.
import { arr, obj, str, type Infer } from './validate.ts';

// PIN gate and its companion pages (Lockout, Forgot-PIN, Offline).
const gate = obj({
  title: str(),
  digitsLabel: str(),
  keypadLabel: str(),
  deleteLabel: str(),
  forgot: str(),
  wrong: str(),
  lockout: obj({ title: str(), body: str(), retry: str() }),
  forgotPin: obj({ title: str(), body: str(), authorize: str(), cancel: str() }),
  offline: obj({ title: str(), body: str(), retry: str() }),
});

const ui = obj({
  gate,
  tabs: obj({ card: str(), services: str(), listings: str(), menu: str() }),
  tabBarLabel: str(),
  back: str(),
  card: obj({
    label: str(),
    avatarAlt: str(),
    birthDateLabel: str(),
    actions: obj({
      openLabel: str(),
      sheetLabel: str(),
      viewDetails: str(),
      downloadPdf: str(),
      refresh: str(),
      refreshing: str(),
    }),
  }),
  details: obj({ title: str(), back: str(), fullNameLabel: str(), labelFieldLabel: str() }),
  listingsIntro: obj({ help: str(), lead: str(), body: str(), hide: str(), start: str() }),
  pwa: obj({ updateAvailable: str(), reload: str(), install: str(), iosHint: str(), dismiss: str() }),
});

// The Member's personal data is not part of the Content file: it is stored in
// Firestore and only loaded after the PIN is accepted (see src/member.ts).

// updatedAt (the initial ribbon text) comes from the Member record; refreshedAt is the demo refresh text.
const ribbon = obj({ refreshedAt: str() });

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
  about: obj({ versionLabel: str() }),
  sessions: obj({ current: str(), device: str(), connected: str(), lastActive: str() }),
  help: obj({ sections: arr(obj({ title: str(), body: str() })) }),
  faq: obj({ categories: arr(str(), { nonEmpty: true }) }),
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
  items: arr(obj({ id: str(), date: str(), title: str(), body: str() })),
});

export const contentSchema = obj({ ui, ribbon, services, listings, qr, menu, notifications });
export type Content = Infer<typeof contentSchema>;
